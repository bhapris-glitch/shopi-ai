// ======================================
// server.js
// Layboka AI -
// Real-Time Shopify AI SaaS Backend
// FULL PRODUCTION REAL-TIME SERVER
// US • UK • CANADA, UAE READY
// ======================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const crypto = require("crypto");
const bodyParser = require("body-parser");
const Razorpay = require("razorpay");
const fetch = require("node-fetch");

// ======================================
// ROUTES
// ======================================

const cartRoutes =
require("./routes/cart");

const pushRoutes =
require("./routes/push");

const pricingRoutes =
require("./routes/pricing");

const analyticsRoutes =
require("./routes/analytics");

const productRoutes =
require("./routes/products");

// ======================================
// CRON
// ======================================

require(
  "./cron/abandonedCartCron"
);

// ======================================
// MODELS
// ======================================

const Client =
require("./models/Client");

const Product =
require("./models/Product");

const Analytics =
require("./models/Analytics");

// ======================================
// UTILS
// ======================================

const {
  detectCountry
} = require("./utils/geo");

const {
  convertPrice,
  getCurrencyFromCountry,
  formatPrice
} = require("./utils/currency");

const {
  saveEvent,
  getAnalytics
} = require("./utils/analytics");

// ======================================
// APP
// ======================================

const app = express();

const PORT =
  process.env.PORT || 3000;

const BASE_URL =
  process.env.BASE_URL ||
  "https://shopi-ai.onrender.com";

// ======================================
// STRIPE SAFE LOAD
// ======================================

let stripe = null;

if(process.env.STRIPE_SECRET){

  stripe =
    require("stripe")(
      process.env.STRIPE_SECRET
    );

}

// ======================================
// RAZORPAY
// ======================================

let razorpay = null;

if(

  process.env.RAZORPAY_KEY &&

  process.env.RAZORPAY_SECRET

){

  razorpay = new Razorpay({

    key_id:
      process.env.RAZORPAY_KEY,

    key_secret:
      process.env.RAZORPAY_SECRET

  });

}

// ======================================
// MIDDLEWARE
// ======================================

app.use(cartRoutes);
app.use(pushRoutes);
app.use(pricingRoutes);
app.use(analyticsRoutes);
app.use(productRoutes);

// RAW BODY
app.use(
  "/webhook",
  bodyParser.raw({
    type:"*/*"
  })
);

app.use(
  "/shopify/uninstall",
  bodyParser.raw({
    type:"*/*"
  })
);

app.use(cors());

app.use(express.json({
  limit:"10mb"
}));

app.use(express.urlencoded({
  extended:true
}));

app.use(express.static("public"));

// ======================================
// DATABASE
// ======================================

mongoose.connect(

  process.env.MONGO_URI,

  {
    useNewUrlParser:true,
    useUnifiedTopology:true
  }

)

.then(()=>{

  console.log(
    "✅ MongoDB Connected"
  );

})

.catch((err)=>{

  console.log(
    "❌ MongoDB Error:",
    err.message
  );

});

// ======================================
// HOME
// ======================================

app.get("/",(req,res)=>{

  res.send(
    "🚀 Layboka AI LIVE"
  );

});

// ======================================
// HEALTH
// ======================================

app.get("/health",(req,res)=>{

  res.json({

    success:true,

    mongodb:
      mongoose.connection.readyState === 1,

    openai:
      !!process.env.OPENAI_API_KEY,

    razorpay:
      !!process.env.RAZORPAY_KEY

  });

});

// ======================================
// CLIENT PLAN
// ======================================

app.get(

  "/client-plan/:id",

  async(req,res)=>{

    try{

      const id =
        req.params.id;

      if(
        !mongoose.Types.ObjectId
        .isValid(id)
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

// ======================================
// GLOBAL PRICING API
// ======================================

app.get(

  "/pricing",

  async(req,res)=>{

    try{

      const ip =

        req.headers[
          "x-forwarded-for"
        ] ||

        req.socket.remoteAddress ||

        "";

      const geo =
        await detectCountry(ip);

      const currency =
        getCurrencyFromCountry(
          geo.countryCode
        );

      // ======================================
      // USD BASE PRICES
      // ======================================

      const starterUSD = 19;
      const growthUSD = 49;
      const premiumUSD = 99;

      const starter =
        await convertPrice({

          amount:starterUSD,
          from:"USD",
          to:currency

        });

      const growth =
        await convertPrice({

          amount:growthUSD,
          from:"USD",
          to:currency

        });

      const premium =
        await convertPrice({

          amount:premiumUSD,
          from:"USD",
          to:currency

        });

      res.json({

        success:true,

        country:
          geo.countryCode,

        currency,

        starter:{

          raw:
            starter.amount,

          formatted:
            formatPrice({

              amount:
                starter.amount,

              currency

            }),

          features:[

            "AI sales Agent",
            "1000 chats",
            "Basic analytics",
            "Product recommendations",
            "Cart recovery",
            "Currency detection"

          ]

        },

        growth:{

          raw:
            growth.amount,

          formatted:
            formatPrice({

              amount:
                growth.amount,

              currency

            }),

          features:[

            "Unlimited chats",
            "AI upsells",
            "Cart recovery",
            "Push notifications"
            "Everything in Starter",
            "Real Shopify product sync",
            "Abandoned cart AI",
            "Email reminders",
            "10,000 chats",
            "Smart upsells",
            "Multi-currency"

          ]

        },

        premium:{

          raw:
            premium.amount,

          formatted:
            formatPrice({

              amount:
                premium.amount,

              currency

            }),

          features:[

            "Everything in Growth included",
            "Advanced analytics",
            "AI product recommendations",
            "Priority support",
            "AI sales automation",
            "VIP customer targeting",
             "Unlimited chats",
             "Multi-store"

          ]

        }

      });

    }catch(err){

      console.log(err);

      res.json({

        success:false

      });

    }

  }

);

// ======================================
// SHOPIFY AUTH
// ======================================

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

    if(
      !shop.includes(
        ".myshopify.com"
      )
    ){

      return res.send(
        "❌ Use .myshopify.com URL"
      );

    }

    const installUrl =

      `https://${shop}/admin/oauth/authorize` +

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

// ======================================
// CALLBACK
// ======================================

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
        "❌ Failed to get token"
      );

    }

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
            (7*24*60*60*1000),

          messages:0,

          paid:false,

          status:"trial",

          plan:"starter"

        });

      await client.save();

    }

    // ======================================
    // INSTALL CHATBOT
    // ======================================

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

// ======================================
// CHAT API
// ======================================

app.post("/chat",async(req,res)=>{

  try{

    const {
      message,
      clientId
    } = req.body;

    let client = null;

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

    // ======================================
    // TRACK CHAT
    // ======================================

    await saveEvent({

      type:"chat",

      clientId,

      message

    });

    // ======================================
    // GEO DETECT
    // ======================================

    const ip =

      req.headers[
        "x-forwarded-for"
      ] ||

      req.socket.remoteAddress ||

      "";

    const geo =
      await detectCountry(ip);

    const currency =
      getCurrencyFromCountry(
        geo.countryCode
      );

    // ======================================
    // STORE
    // ======================================

    let storeName =
      "our Shopify store";

    if(client?.store){

      storeName =
        client.store.replace(
          ".myshopify.com",
          ""
        );

    }

    // ======================================
    // PRODUCTS
    // ======================================

    let products =
      await Product.find({
        clientId
      })

      .limit(4)

      .sort({
        sales:-1
      });

    let productText = "";

    for(const product of products){

      const converted =
        await convertPrice({

          amount:
            product.price,

          from:"USD",

          to:currency

        });

      const formattedPrice =
        formatPrice({

          amount:
            converted.amount,

          currency
        });

      productText +=

`
${product.title}
Price: ${formattedPrice}
Description: ${product.description}

`;

    }

    // ======================================
    // OPENAI
    // ======================================

    let reply = "";

    if(process.env.OPENAI_API_KEY){

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

You are a premium Shopify AI sales assistant for ${storeName}.

Customer country:
${geo.countryCode}

Currency:
${currency}

Available products:
${productText}

Rules:
- Human-like
- Persuasive
- Friendly
- Short replies
- Increase sales
- Recommend products
- Upsell naturally
- Sound premium
- Never mention AI limitations

`

                },

                {

                  role:"user",

                  content:
                    message || "Hello"

                }

              ],

              temperature:0.8,

              max_tokens:220

            })

          }

        );

      const data =
        await aiRes.json();

      reply =

        data?.choices?.[0]
        ?.message?.content;

    }

    if(!reply){

      reply =
`👋 Welcome to ${storeName}. What are you shopping for today?`;

    }

    // ======================================
    // SAVE MESSAGES
    // ======================================

    if(client){

      client.messages += 1;

      await client.save();

    }

    res.json({

      success:true,

      country:
        geo.countryCode,

      currency,

      reply,

      products

    });

  }catch(err){

    console.log(
      "CHAT ERROR:",
      err
    );

    res.json({

      reply:
`👋 Welcome. How can I help you today?`

    });

  }

});

// ======================================
// TRACK ABANDONED CART
// ======================================

app.post(

  "/track-cart",

  async(req,res)=>{

    try{

      const {
        clientId,
        email,
        products,
        total
      } = req.body;

      await saveEvent({

        type:"abandoned_cart",

        clientId,

        email,

        total,

        products

      });

      res.json({

        success:true

      });

    }catch(err){

      console.log(err);

      res.json({

        success:false

      });

    }

  }

);

// ======================================
// CREATE ORDER
// ======================================

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

      // ======================================
      // USD PRICING
      // ======================================

      let amount = 1900;

      if(plan === "growth"){

        amount = 4900;

      }

      if(plan === "premium"){

        amount = 9900;

      }

      const order =

        await razorpay.orders.create({

          amount,

          currency:"USD",

          receipt:
            "rcpt_" + Date.now(),

          notes:{
            clientId,
            plan
          }

        });

      // ======================================
      // TRACK SALES
      // ======================================

      await saveEvent({

        type:"sale",

        clientId,

        plan,

        amount

      });

      res.json({

        success:true,

        ...order

      });

    }catch(err){

      console.log(err);

      res.status(500).json({

        error:"Order failed"

      });

    }

  }

);

// ======================================
// ANALYTICS DASHBOARD API
// ======================================

app.get(

  "/dashboard-analytics/:clientId",

  async(req,res)=>{

    try{

      const analytics =
        await getAnalytics(
          req.params.clientId
        );

      res.json({

        success:true,

        analytics

      });

    }catch(err){

      console.log(err);

      res.json({

        success:false

      });

    }

  }

);

// ======================================
// SHOPIFY UNINSTALL
// ======================================

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

// ======================================
// START SERVER
// ======================================

app.listen(PORT,()=>{

  console.log(
    "🚀 Server running on port " + PORT
  );

});
