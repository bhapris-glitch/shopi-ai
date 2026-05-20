require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const crypto = require("crypto");
const bodyParser = require("body-parser");
const Razorpay = require("razorpay");

const Client = require("./models/Client");

const app = express();

const PORT = process.env.PORT || 3000;

const BASE_URL =
  process.env.BASE_URL ||
  "https://shopi-ai.render.com";

// =======================
// STRIPE SAFE LOAD
// =======================

let stripe = null;

if (process.env.STRIPE_SECRET) {

  stripe =
    require("stripe")(
      process.env.STRIPE_SECRET
    );

}

// =======================
// RAZORPAY
// =======================

let razorpay = null;

if (
  process.env.RAZORPAY_KEY &&
  process.env.RAZORPAY_SECRET
) {

  razorpay = new Razorpay({

    key_id:
      process.env.RAZORPAY_KEY,

    key_secret:
      process.env.RAZORPAY_SECRET

  });

}

// =======================
// MIDDLEWARE
// =======================

// Razorpay webhook raw
app.use(
  "/webhook",
  bodyParser.raw({ type: "*/*" })
);

// Shopify uninstall raw
app.use(
  "/shopify/uninstall",
  bodyParser.raw({ type: "*/*" })
);

app.use(cors());

app.use(express.json({
  limit:"10mb"
}));

app.use(express.urlencoded({
  extended:true
}));

app.use(express.static("public"));

// =======================
// DATABASE
// =======================

mongoose.connect(process.env.MONGO_URI)

.then(()=>{

  console.log(
    "✅ MongoDB Connected"
  );

})

.catch((err)=>{

  console.log(
    "❌ MongoDB Error:",
    err
  );

});

// =======================
// HOME
// =======================

app.get("/",(req,res)=>{

  res.send(
    "🚀 Layboka AI LIVE"
  );

});

// =======================
// CLIENT PLAN
// =======================

app.get(
  "/client-plan/:id",

  async(req,res)=>{

    try{

      const id =
        req.params.id;

      if(
        !mongoose.Types.ObjectId.isValid(id)
      ){

        return res.json({

          plan:"starter",
          locked:false

        });

      }

      const client =
        await Client.findById(id);

      if(!client){

        return res.json({

          plan:"starter",
          locked:false

        });

      }

      const locked =

        Date.now() >
        client.trialEnds &&

        !client.paid;

      res.json({

        plan:
          client.plan || "starter",

        locked

      });

    }catch(err){

      console.log(err);

      res.json({

        plan:"starter",
        locked:false

      });

    }

  }
);

// =======================
// SHOPIFY AUTH
// =======================

app.get("/auth",async(req,res)=>{

  let shop =
    req.query.shop;

  if(!shop){

    return res.send(
      "❌ Missing Shopify URL"
    );

  }

  try{

    shop = shop

      .replace("https://","")
      .replace("http://","")
      .replace("www.","")
      .split("/")[0]
      .trim()
      .toLowerCase();

    let finalShop = shop;

    // ===================
    // CUSTOM DOMAIN
    // ===================

    if(
      !shop.includes(
        ".myshopify.com"
      )
    ){

      const response =
        await fetch(
          `https://${shop}`,
          {
            redirect:"follow"
          }
        );

      const shopifyDomain =

        response.headers.get(
          "x-shopify-shop-domain"
        );

      if(shopifyDomain){

        finalShop =
          shopifyDomain;

      }else{

        const html =
          await response.text();

        const hiddenMatch =
          html.match(
            /Shopify\.shop\s*=\s*"([^"]+)"/i
          );

        if(hiddenMatch?.[1]){

          finalShop =
            hiddenMatch[1];

        }else{

          return res.send(`
          <h2 style="
          font-family:sans-serif;
          padding:30px;
          ">
          ❌ Could not detect Shopify store.<br><br>
          Please use your
          <b>.myshopify.com</b>
          URL.
          </h2>
          `);

        }

      }

    }

    // ===================
    // VALIDATE
    // ===================

    if(
      !/^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/
      .test(finalShop)
    ){

      return res.send(
        "❌ Invalid Shopify store"
      );

    }

    // ===================
    // INSTALL URL
    // ===================

    const installUrl =

      `https://${finalShop}/admin/oauth/authorize` +

      `?client_id=${process.env.SHOPIFY_API_KEY}` +

      `&scope=read_products,write_products,read_orders,write_script_tags` +

      `&redirect_uri=${BASE_URL}/callback`;

    res.redirect(installUrl);

  }catch(err){

    console.log(err);

    res.send(
      "❌ Shopify install failed"
    );

  }

});

// =======================
// CALLBACK
// =======================

app.get("/callback",async(req,res)=>{

  try{

    const {
      shop,
      code
    } = req.query;

    if(!shop || !code){

      return res.send(
        "❌ Missing shop/code"
      );

    }

    // ===================
    // TOKEN
    // ===================

    const tokenRes =
      await fetch(

        `https://${shop}/admin/oauth/access_token`,

        {
          method:"POST",

          headers:{
            "Content-Type":
              "application/json"
          },

          body:JSON.stringify({

            client_id:
              process.env.SHOPIFY_API_KEY,

            client_secret:
              process.env.SHOPIFY_API_SECRET,

            code

          })

        }
      );

    const tokenData =
      await tokenRes.json();

    if(
      !tokenData.access_token
    ){

      console.log(tokenData);

      return res.send(
        "❌ Failed to get access token"
      );

    }

    // ===================
    // SAVE CLIENT
    // ===================

    let client =
      await Client.findOne({
        store:shop
      });

    if(client){

      client.token =
        tokenData.access_token;

      client.status =
        "active";

      await client.save();

    }else{

      client =
        new Client({

          store:shop,

          token:
            tokenData.access_token,

          trialEnds:
            Date.now() +
            (3*24*60*60*1000),

          messages:0,

          paid:false,

          status:"trial",

          plan:"starter"

        });

      await client.save();

    }

    // ===================
    // INSTALL CHATBOT
    // ===================

    await fetch(

      `https://${shop}/admin/api/2023-10/script_tags.json`,

      {
        method:"POST",

        headers:{

          "X-Shopify-Access-Token":
            client.token,

          "Content-Type":
            "application/json"

        },

        body:JSON.stringify({

          script_tag:{

            event:"onload",

            src:
              `${BASE_URL}/chatbot.js?client=${client._id}`

          }

        })

      }
    );

    // ===================
    // WEBHOOK
    // ===================

    await fetch(

      `https://${shop}/admin/api/2023-10/webhooks.json`,

      {
        method:"POST",

        headers:{

          "X-Shopify-Access-Token":
            client.token,

          "Content-Type":
            "application/json"

        },

        body:JSON.stringify({

          webhook:{

            topic:"app/uninstalled",

            address:
              `${BASE_URL}/shopify/uninstall`,

            format:"json"

          }

        })

      }
    );

    res.redirect(
      `/dashboard.html?client=${client._id}`
    );

  }catch(err){

    console.log(err);

    res.send(
      "❌ Install failed"
    );

  }

});

// =======================
// CHAT API
// =======================
const {
  detectCountry
} = require("./utils/geo");

const {
  convertPrice,
  getCurrencyFromCountry,
  formatPrice
} = require("./utils/currency");

app.post("/chat",async(req,res)=>{

  try{

    const {
      message,
      clientId
    } = req.body;

    let client = null;

    // ===================
    // SAFE CLIENT FIND
    // ===================

    if(

      clientId &&

      mongoose.Types.ObjectId
      .isValid(clientId)

    ){

      client =
        await Client.findById(
          clientId
        );

    }

    // ===================
    // STORE NAME
    // ===================

    let storeName =
      "our Shopify store";

    if(client?.store){

      storeName =
        client.store.replace(
          ".myshopify.com",
          ""
        );

    }

    // ===================
    // TRIAL LOCK
    // ===================

    if(client){

      if(

        Date.now() >
        client.trialEnds &&

        !client.paid

      ){

        return res.json({

          reply:
`⚠️ Your free trial expired.

Upgrade now to continue using Layboka AI.`,

          locked:true

        });

      }

    }

    // ===================
    // NO OPENAI KEY
    // ===================

    if(
      !process.env.OPENAI_API_KEY
    ){

      console.log(
        "❌ OPENAI_API_KEY missing"
      );

      return res.json({

        reply:
`👋 Welcome to ${storeName}.

How can I help you today?`

      });

    }

    // ===================
    // OPENAI REQUEST
    // ===================

    const aiRes =
      await fetch(

        "https://api.openai.com/v1/chat/completions",

        {
          method:"POST",

          headers:{

            Authorization:
              `Bearer ${process.env.OPENAI_API_KEY}`,

            "Content-Type":
              "application/json"

          },

          body:JSON.stringify({

            model:"gpt-4o-mini",

            messages:[

              {

                role:"system",

                content:`

You are Layboka AI.

You are a premium Shopify sales assistant for ${storeName}.

Rules:
- Sound human
- Friendly tone
- Short replies
- Help customers buy
- Recommend products
- Increase conversions
- Never say AI unavailable
- Never say server error
- Be persuasive naturally

`

              },

              {

                role:"user",

                content:
                  message || "Hello"

              }

            ],

            temperature:0.8,

            max_tokens:180

          })

        }
      );

    const data =
      await aiRes.json();

    console.log(
      "OPENAI RESPONSE:",
      data
    );

    // ===================
    // OPENAI ERROR
    // ===================

    if(!aiRes.ok){

      console.log(
        "❌ OPENAI FAILED"
      );

      return res.json({

        reply:
`😊 I'm here to help.

Please try again in a moment.`

      });

    }

    let reply =

      data?.choices?.[0]
      ?.message?.content;

    // ===================
    // FALLBACK
    // ===================

    if(!reply){

      reply =
`😊 I'd love to help.

What product are you looking for today?`;

    }

    // ===================
    // SAVE MESSAGE COUNT
    // ===================

    if(client){

      client.messages += 1;

      await client.save();

    }

    res.json({ reply });

  }catch(err){

    console.log(
      "CHAT ERROR:",
      err
    );

    res.json({

      reply:
`👋 Welcome.

How can I help you today?`

    });

  }

});

// =======================
// CREATE ORDER
// =======================

app.post(
  "/create-order",

  async(req,res)=>{

    try{

      const {
        plan,
        clientId
      } = req.body;

      if(!razorpay){

        return res.status(500)
        .json({
          error:
            "Razorpay not configured"
        });

      }

      const amount =

        plan === "premium"
        ? 79900
        : 39900;

      const order =

        await razorpay.orders.create({

          amount,

          currency:"INR",

          receipt:
            "rcpt_" + Date.now(),

          notes:{
            clientId,
            plan
          }

        });

      res.json({
        ...order,
        plan,
        clientId
      });

    }catch(err){

      console.log(err);

      res.status(500).json({
        error:"Order failed"
      });

    }

  }
);

// =======================
// SHOPIFY UNINSTALL
// =======================

app.post(
  "/shopify/uninstall",

  async(req,res)=>{

    try{

      const hmac =
        req.headers[
          "x-shopify-hmac-sha256"
        ];

      const digest = crypto

        .createHmac(
          "sha256",
          process.env
          .SHOPIFY_API_SECRET
        )

        .update(
          req.body,
          "utf8"
        )

        .digest("base64");

      if(digest !== hmac){

        return res.sendStatus(401);

      }

      const data =
        JSON.parse(
          req.body.toString()
        );

      await Client.findOneAndUpdate(

        {
          store:data.domain
        },

        {
          status:"uninstalled",
          paid:false
        }

      );

      console.log(
        "❌ App uninstalled:",
        data.domain
      );

      res.sendStatus(200);

    }catch(err){

      console.log(err);

      res.sendStatus(500);

    }

  }
);

// =======================
// START SERVER
// =======================

app.listen(PORT,()=>{

  console.log(
    "🚀 Server running on port " + PORT
  );

});
