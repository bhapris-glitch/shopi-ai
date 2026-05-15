require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const crypto = require("crypto");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");

const Razorpay = require("razorpay");

// =======================
// STRIPE SAFE LOAD
// =======================

let stripe = null;

if (process.env.STRIPE_SECRET) {
  stripe = require("stripe")(process.env.STRIPE_SECRET);
}

const Client = require("./models/Client");

const app = express();

const PORT = process.env.PORT || 3000;

// =======================
// MIDDLEWARE
// =======================

// Razorpay webhook raw body
app.use("/webhook", bodyParser.raw({ type: "*/*" }));

// Shopify uninstall webhook raw body
app.use(
  "/shopify/uninstall",
  bodyParser.raw({ type: "*/*" })
);

app.use(cors());

app.use(express.json());

app.use(express.static("public"));

// =======================
// DATABASE
// =======================

mongoose.connect(process.env.MONGO_URI)

.then(() => {
  console.log("✅ MongoDB Connected");
})

.catch((err) => {
  console.log("❌ DB Error:", err);
});

const BASE_URL = process.env.BASE_URL;

// =======================
// SHOPIFY AUTH
// =======================
app.get("/auth", async (req, res) => {

  let shop = req.query.shop;

  if (!shop) {
    return res.send("Missing store URL");
  }

  try {

    // CLEAN URL
    shop = shop
      .replace("https://", "")
      .replace("http://", "")
      .replace("www.", "")
      .split("/")[0]
      .trim()
      .toLowerCase();

    let finalShop = shop;

    // IF CUSTOM DOMAIN
    if (!shop.includes(".myshopify.com")) {

      // Try detecting Shopify
      const response = await fetch(`https://${shop}`, {
        method: "GET",
        redirect: "follow"
      });

      // Shopify Header Detection
      const shopifyDomain =
        response.headers.get("x-shopify-shop-domain");

      // If found
      if (shopifyDomain) {

        finalShop = shopifyDomain;

      } else {

        // Backup HTML Detection
        const html = await response.text();

        // Detect Shopify CDN/assets
        const isShopify =
          html.includes("cdn.shopify.com") ||
          html.includes("shopify.theme") ||
          html.includes("Shopify");

        if (!isShopify) {
          return res.send("❌ This is not a Shopify store");
        }

        // Still no myshopify domain found
        return res.send(
          "⚠️ Shopify detected but hidden.\nAsk store owner for their myshopify URL."
        );
      }
    }

    // FINAL VALIDATION
    if (
      !/^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(finalShop)
    ) {
      return res.send("❌ Invalid Shopify store");
    }

    // OAUTH URL
    const installUrl =
      `https://${finalShop}/admin/oauth/authorize` +
      `?client_id=${process.env.SHOPIFY_API_KEY}` +
      `&scope=read_products,write_script_tags` +
      `&redirect_uri=${process.env.BASE_URL}/callback`;

    res.redirect(installUrl);

  } catch (err) {

    console.log(err);

    res.send(
      "❌ Could not detect Shopify store"
    );

  }

});

// =======================
// CALLBACK (INSTALL)
// =======================

app.get("/callback", async (req, res) => {

  const { shop, code } = req.query;

  if (
    !shop ||
    !/^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(shop)
  ) {
    return res.send("Invalid shop");
  }

  try {

    // GET ACCESS TOKEN
    const tokenRes = await fetch(
      `https://${shop}/admin/oauth/access_token`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          client_id: process.env.SHOPIFY_API_KEY,
          client_secret: process.env.SHOPIFY_API_SECRET,
          code
        })
      }
    );

    const data = await tokenRes.json();

    if (!data.access_token) {

      console.log(data);

      return res.send(
        "❌ Failed to get Shopify access token"
      );
    }

    // CHECK EXISTING CLIENT
    let client = await Client.findOne({
      store: shop
    });

    // UPDATE EXISTING
    if (client) {

      client.token = data.access_token;
      client.status = "trial";

      await client.save();

    } else {

      // CREATE NEW CLIENT
      client = new Client({
        store: shop,
        token: data.access_token,
        trialEnds:
          Date.now() + (3 * 24 * 60 * 60 * 1000),
        messages: 0,
        paid: false,
        status: "trial",
        plan: "free"
      });

      await client.save();

    }

    // =======================
    // INSTALL SCRIPT TAG
    // =======================

    await fetch(
      `https://${shop}/admin/api/2023-10/script_tags.json`,
      {
        method: "POST",

        headers: {
          "X-Shopify-Access-Token": client.token,
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          script_tag: {
            event: "onload",
            src:
              `${BASE_URL}/widget.js?client=${client._id}`
          }
        })
      }
    );

    // =======================
    // REGISTER UNINSTALL WEBHOOK
    // =======================

    await fetch(
      `https://${shop}/admin/api/2023-10/webhooks.json`,
      {
        method: "POST",

        headers: {
          "X-Shopify-Access-Token": client.token,
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          webhook: {
            topic: "app/uninstalled",
            address:
              `${BASE_URL}/shopify/uninstall`,
            format: "json"
          }
        })
      }
    );

    // REDIRECT DASHBOARD
    res.redirect(
      `/dashboard.html?client=${client._id}`
    );

  } catch (e) {

    console.log(e);

    res.send("❌ Install failed");

  }

});

// =======================
// RAZORPAY INIT
// =======================

let razorpay = null;

if (
  process.env.RAZORPAY_KEY &&
  process.env.RAZORPAY_SECRET
) {

  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET
  });

}

// =======================
// CREATE RAZORPAY ORDER
// =======================

app.post("/create-order", async (req, res) => {

  try {

    const { plan, clientId } = req.body;

    if (!razorpay) {
      return res.status(500).json({
        error: "Razorpay not configured"
      });
    }

    const amount =
      plan === "premium"
        ? 79900
        : 39900;

    const order =
      await razorpay.orders.create({

        amount,
        currency: "INR",

        receipt:
          "rcpt_" + Date.now(),

        notes: {
          clientId,
          plan
        }

      });

    res.json({
      ...order,
      plan,
      clientId
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: "Order creation failed"
    });

  }

});

// =======================
// STRIPE CHECKOUT
// =======================

app.post("/create-stripe", async (req, res) => {

  try {

    if (!stripe) {

      return res.status(500).json({
        error: "Stripe not configured"
      });

    }

    const { plan, clientId } = req.body;

    const price =
      plan === "premium"
        ? 2000
        : 900;

    const session =
      await stripe.checkout.sessions.create({

        payment_method_types: ["card"],

        mode: "subscription",

        line_items: [{

          price_data: {

            currency: "usd",

            product_data: {
              name: "Layboka AI Plan"
            },

            unit_amount: price,

            recurring: {
              interval: "month"
            }

          },

          quantity: 1

        }],

        metadata: {
          clientId,
          plan
        },

        success_url:
          `${BASE_URL}/success.html?client=${clientId}`,

        cancel_url:
          `${BASE_URL}/pricing.html`

      });

    res.json({
      url: session.url
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: "Stripe failed"
    });

  }

});

// =======================
// RAZORPAY WEBHOOK
// =======================

app.post("/webhook", async (req, res) => {

  try {

    const sig =
      req.headers["x-razorpay-signature"];

    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
      return res.sendStatus(200);
    }

    const expected = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_WEBHOOK_SECRET
      )
      .update(req.body)
      .digest("hex");

    if (sig !== expected) {
      return res.sendStatus(400);
    }

    const event =
      JSON.parse(req.body);

    // PAYMENT SUCCESS
    if (event.event === "payment.captured") {

      const notes =
        event.payload.payment.entity.notes;

      const clientId = notes.clientId;

      const plan = notes.plan;

      await Client.findByIdAndUpdate(
        clientId,
        {
          paid: true,
          status: "active",
          plan: plan
        }
      );

    }

    res.sendStatus(200);

  } catch (err) {

    console.log(err);

    res.sendStatus(500);

  }

});

// =======================
// SHOPIFY APP UNINSTALL
// =======================

app.post(
  "/shopify/uninstall",

  async (req, res) => {

    try {

      const hmac =
        req.headers["x-shopify-hmac-sha256"];

      const digest = crypto
        .createHmac(
          "sha256",
          process.env.SHOPIFY_API_SECRET
        )
        .update(req.body, "utf8")
        .digest("base64");

      // VERIFY SHOPIFY
      if (digest !== hmac) {
        return res.sendStatus(401);
      }

      // PARSE BODY
      const data =
        JSON.parse(req.body.toString());

      const shop = data.domain;

      // UPDATE DB
      await Client.findOneAndUpdate(
        { store: shop },
        {
          status: "uninstalled",
          paid: false
        }
      );

      console.log(
        "❌ App uninstalled:",
        shop
      );

      res.sendStatus(200);

    } catch (err) {

      console.log(err);

      res.sendStatus(500);

    }

  }
);

// =======================
// CHAT API
// =======================

app.post("/chat", async (req, res) => {

  const {
    message,
    clientId
  } = req.body;

  const client =
    await Client.findById(clientId);

  if (!client) {

    return res.json({
      reply: "👋 Hello"
    });

  }

  // TRIAL LOCK
  if (
    Date.now() > client.trialEnds &&
    !client.paid
  ) {

    return res.json({

      reply:
`⚠️ Trial expired

Chats used: ${client.messages}

👉 Upgrade your plan now.`,

      locked: true

    });

  }

  try {

    const aiRes = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {

        method: "POST",

        headers: {
          "Authorization":
            `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({

          model: "gpt-4o-mini",

          messages: [

            {
              role: "system",
              content:
                "You are a Shopify AI sales assistant. Help customers and push users to checkout."
            },

            {
              role: "user",
              content: message
            }

          ]

        })

      }
    );

    const data =
      await aiRes.json();

    client.messages++;

    await client.save();

    res.json({
      reply:
        data.choices?.[0]?.message?.content
    });

  } catch (e) {

    console.log(e);

    res.json({
      reply: "AI error"
    });

  }

});

// =======================
// HEALTH CHECK
// =======================

app.get("/", (req, res) => {

  res.send("🚀 Layboka AI LIVE");

});

// =======================
// START SERVER
// =======================

app.listen(PORT, () => {

  console.log(
    "🚀 Server running on port " + PORT
  );

});
