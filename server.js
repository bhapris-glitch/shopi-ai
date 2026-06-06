// ======================================
// server.js
// Layboka AI
// Final Production Optimized Server
// ======================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Razorpay = require("razorpay");
const fetch = require("node-fetch");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const fs = require("fs");

// ======================================
// APP
// ======================================

const app = express();

const PORT = process.env.PORT || 3000;

const BASE_URL =
process.env.BASE_URL ||
"https://app.layboka.com";

app.set("trust proxy", 1);

// ======================================
// MIDDLEWARE
// ======================================

const auth = require("./middleware/auth");
const adminAuth = require("./middleware/adminAuth");
const rateLimiter = require("./middleware/rateLimiter");
const verifyWebhook = require("./middleware/verifyWebhook");

// ======================================
// UTILS
// ======================================

const { generateToken } = require("./utils/jwt");

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
// SIMPLE REPLIES
// REDUCE OPENAI COST
// ======================================

const simpleReplies = {
  hello: "👋 Welcome to Layboka AI.",
  hi: "👋 Hi there! How can I help you today?",
  pricing: "💰 We offer Starter, Growth and Premium plans.",
  shipping: "🚚 We provide fast shipping worldwide.",
  refund: "💳 Refunds are available based on store policy.",
  support: "📩 Our support team is available 24/7.",
  thanks: "❤️ You're welcome.",
  payment: "💳 We support secure payments worldwide.",
  cod: "📦 Cash on delivery depends on the store policy.",
  delivery: "🚚 Delivery time depends on your location."
};

// ======================================
// MODELS
// ======================================

const Client = require("./models/Client");
const Product = require("./models/Product");
const Analytics = require("./models/Analytics");
const Referral = require("./models/Referral");

const { verifySMTP } =
require("./services/email");

verifySMTP();
// ======================================
// ROUTES
// ======================================

const cartRoutes = require("./routes/cart");
const pushRoutes = require("./routes/push");
const pricingRoutes = require("./routes/pricing");
const analyticsRoutes = require("./routes/analytics");
const productRoutes = require("./routes/products");
const stripeRoutes = require("./routes/stripe");
const webhookRoutes = require("./routes/webhooks");
const adminRoutes = require("./routes/admin");
const referralRoutes = require("./routes/referral");

// ======================================
// CRONS
// ======================================

require("./cron/abandonedCartCron");

// ======================================
// SECURITY
// ======================================

app.use(helmet({
  crossOriginResourcePolicy: false
}));

app.use(compression());

app.use(morgan("tiny"));

app.use(cors({
  origin: [
  "https://layboka.com",
  "https://www.layboka.com",
  "https://app.layboka.com"
]
  credentials: true
}));

app.use(express.json({
  limit: "10mb"
}));

app.use(express.urlencoded({
  extended: true,
  limit: "10mb"
}));

app.use(express.static("public"));

app.use(rateLimiter);

// ======================================
// WEBHOOK RAW BODY
// ======================================

app.use(
  "/webhooks/stripe",
  bodyParser.raw({
    type: "application/json"
  })
);

app.use(
  "/shopify/uninstall",
  bodyParser.raw({
    type: "*/*"
  })
);

// ======================================
// FILE UPLOADS
// ======================================

const uploadPath = path.join(__dirname, "public/uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {

    const uniqueName =
      Date.now() +
      "-" +
      crypto.randomBytes(4).toString("hex") +
      path.extname(file.originalname);

    cb(null, uniqueName);
  }
});

const upload = multer({

  storage,

  limits: {
    fileSize: 2 * 1024 * 1024
  },

  fileFilter: (req, file, cb) => {

    if (
      file.mimetype.startsWith("image/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only images allowed"));
    }
  }
});

// ======================================
// STRIPE
// ======================================

let stripe = null;

if (process.env.STRIPE_SECRET) {

  stripe = require("stripe")(
    process.env.STRIPE_SECRET
  );
}

// ======================================
// RAZORPAY
// ======================================

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

// ======================================
// DATABASE
// ======================================

mongoose.connect(
  process.env.MONGO_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
)
.then(() => {
  console.log("✅ MongoDB Connected");
})
.catch((err) => {
  console.log("❌ MongoDB Error:", err.message);
});

// ======================================
// ROUTES
// ======================================

app.use(cartRoutes);
app.use(pushRoutes);
app.use(pricingRoutes);
app.use(analyticsRoutes);
app.use(productRoutes);
app.use(adminRoutes);
app.use(referralRoutes);
app.use("/stripe", stripeRoutes);
app.use("/webhooks", webhookRoutes);

// ======================================
// HOME
// ======================================

app.get("/", (req, res) => {
  res.send("🚀 Layboka AI LIVE");
});

// ======================================
// HEALTH
// ======================================

app.get("/health", (req, res) => {

  res.json({
    success: true,
    mongodb: mongoose.connection.readyState === 1,
    openai: !!process.env.OPENAI_API_KEY,
    stripe: !!process.env.STRIPE_SECRET,
    razorpay: !!process.env.RAZORPAY_KEY,
    jwt: !!process.env.JWT_SECRET,
    uptime: process.uptime()
  });
});

// ======================================
// LOGIN
// ======================================

app.post("/login", async (req, res) => {

  try {

    const { clientId } = req.body;

    if (!clientId) {

      return res.status(400).json({
        success: false,
        message: "Client ID required"
      });
    }

    const client = await Client.findById(clientId);

    if (!client) {

      return res.status(404).json({
        success: false,
        message: "Client not found"
      });
    }

    const token = generateToken({
      id: client._id,
      store: client.store,
      plan: client.plan
    });

    res.json({
      success: true,
      token,
      client
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false
    });
  }
});

// ======================================
// PROFILE
// ======================================

app.get("/profile", auth, async (req, res) => {

  try {

    const client = await Client.findById(req.user.id);

    res.json({
      success: true,
      client
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false
    });
  }
});

// ======================================
// CLIENT PUBLIC DATA
// ======================================

app.get("/client/:id", async (req, res) => {

  try {

    const client = await Client.findById(req.params.id)
    .select(
      "store plan status messages revenue orders paid trialEnds agentName agentAvatar referralCode"
    );

    if (!client) {

      return res.status(404).json({
        success: false
      });
    }

    res.json(client);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false
    });
  }
});

// ======================================
// UPDATE AGENT NAME
// ======================================

app.post(
  "/update-agent-name",
  auth,
  async (req, res) => {

    try {

      const { agentName } = req.body;

      await Client.findByIdAndUpdate(
        req.user.id,
        {
          agentName: agentName || "Emma"
        }
      );

      res.json({
        success: true
      });

    } catch (err) {

      console.log(err);

      res.status(500).json({
        success: false
      });
    }
  }
);

// ======================================
// UPLOAD AGENT AVATAR
// ======================================

app.post(
  "/upload-agent-avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {

    try {

      if (!req.file) {

        return res.status(400).json({
          success: false,
          message: "No file uploaded"
        });
      }

      const avatar =
        "/uploads/" + req.file.filename;

      await Client.findByIdAndUpdate(
        req.user.id,
        {
          agentAvatar: avatar
        }
      );

      res.json({
        success: true,
        avatar
      });

    } catch (err) {

      console.log(err);

      res.status(500).json({
        success: false
      });
    }
  }
);

// ======================================
// CHAT API
// ======================================

app.post("/chat", async (req, res) => {

  try {

    const {
      message,
      clientId
    } = req.body;

    const lowerMessage =
      (message || "")
      .toLowerCase()
      .trim();

    // ======================================
    // SIMPLE REPLIES
    // ======================================

    if (simpleReplies[lowerMessage]) {

      return res.json({
        success: true,
        reply: simpleReplies[lowerMessage],
        aiUsed: false
      });
    }

    let client = null;

    if (
      clientId &&
      mongoose.Types.ObjectId.isValid(clientId)
    ) {

      client = await Client.findById(clientId);
    }

    await saveEvent({
      type: "chat",
      clientId,
      message
    });

    const ip =
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress ||
      "";

    const geo = await detectCountry(ip);

    const currency =
      getCurrencyFromCountry(
        geo.countryCode
      );

    let storeName = "our Shopify store";

    if (client?.store) {

      storeName = client.store.replace(
        ".myshopify.com",
        ""
      );
    }

    const agentName =
      client?.agentName ||
      "Emma";

    const products = await Product.find({
      clientId
    })
    .select("title price description image sales")
    .limit(3)
    .sort({ sales: -1 })
    .lean();

    let productText = "";

    for (const product of products) {

      const converted = await convertPrice({
        amount: product.price,
        from: "USD",
        to: currency
      });

      const formattedPrice = formatPrice({
        amount: converted.amount,
        currency
      });

      productText += `
${product.title}
Price: ${formattedPrice}
Description: ${product.description}
`;
    }

    let reply =
      `👋 Welcome to ${storeName}`;

    // ======================================
    // GPT-4o-MINI ONLY
    // ======================================

    if (process.env.OPENAI_API_KEY) {

      const aiRes = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",

          headers: {
            Authorization:
            `Bearer ${process.env.OPENAI_API_KEY}`,

            "Content-Type": "application/json"
          },

          body: JSON.stringify({

            model: "gpt-4o-mini",

            messages: [
              {
                role: "system",
                content: `
You are ${agentName}, an AI sales assistant.

Store: ${storeName}
Country: ${geo.countryCode}
Currency: ${currency}
Products: ${productText}

Rules:
- Friendly
- Human tone
- Premium support
- Short answers
- Upsell naturally
- Max 80 words
- Talk like real sales expert
`
              },
              {
                role: "user",
                content: message || "Hello"
              }
            ],

            temperature: 0.5,
            max_tokens: 80
          })
        }
      );

      const data = await aiRes.json();

      reply =
        data?.choices?.[0]?.message?.content ||
        reply;
    }

    if (client) {

      client.messages += 1;

      await client.save();
    }

    res.json({
      success: true,
      reply,
      aiUsed: true,
      currency,
      country: geo.countryCode,
      products,
      agentName,
      agentAvatar:
        client?.agentAvatar || null
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false,
      reply: "⚠️ Server busy"
    });
  }
});

// ======================================
// TRACK CART
// ======================================

app.post(
  "/track-cart",
  async (req, res) => {

    try {

      const {
        clientId,
        email,
        products,
        total
      } = req.body;

      await saveEvent({
        type: "abandoned_cart",
        clientId,
        email,
        total,
        products
      });

      res.json({
        success: true
      });

    } catch (err) {

      console.log(err);

      res.status(500).json({
        success: false
      });
    }
  }
);

// ======================================
// CREATE ORDER
// ======================================

app.post("/create-order", auth, async (req, res) => {

  try {

    if (!razorpay) {

      return res.status(500).json({
        success: false,
        message: "Razorpay not configured"
      });
    }

    const {
      plan,
      clientId
    } = req.body;

    let amount = 1900;

    if (plan === "growth") {
      amount = 4900;
    }

    if (
      plan === "premium" ||
      plan === "scale"
    ) {
      amount = 9900;
    }

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: "rcpt_" + Date.now(),
      notes: {
        clientId,
        plan
      }
    });

    await saveEvent({
      type: "sale",
      clientId,
      plan,
      amount
    });

    res.json({
      success: true,
      order
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false,
      message: "Order failed"
    });
  }
});

// ======================================
// ANALYTICS
// ======================================

app.get(
  "/dashboard-analytics/:clientId",
  auth,
  async (req, res) => {

    try {

      const analytics =
        await getAnalytics(
          req.params.clientId
        );

      res.json({
        success: true,
        analytics
      });

    } catch (err) {

      console.log(err);

      res.status(500).json({
        success: false
      });
    }
  }
);

// ======================================
// SHOPIFY UNINSTALL
// ======================================

app.post(
  "/shopify/uninstall",
  verifyWebhook,
  async (req, res) => {

    try {

      const data = JSON.parse(
        req.body.toString()
      );

      await Client.findOneAndUpdate(
        {
          store: data.domain
        },
        {
          status: "uninstalled",
          paid: false
        }
      );

      console.log(
        "❌ App uninstalled:",
        data.domain
      );

      res.sendStatus(200);

    } catch (err) {

      console.log(err);

      res.sendStatus(500);
    }
  }
);

// ======================================
// UPDATE AGENT SETTINGS
// ======================================

app.post(

  "/update-agent-settings",

  auth,

  async(req,res)=>{

    try{

      const {

        agentName,
        storeDisplayName,
        agentAvatar

      } = req.body;

      const client =
        await Client.findById(
          req.user.id
        );

      if(!client){

        return res.status(404)
        .json({

          success:false

        });

      }

      client.agentName =
        agentName || "Emma";

      client.storeDisplayName =
        storeDisplayName || "";

      if(agentAvatar){

        client.agentAvatar =
          agentAvatar;

      }

      await client.save();

      res.json({

        success:true

      });

    }catch(err){

      console.log(err);

      res.status(500).json({

        success:false

      });

    }

  }

);

// ======================================
// 404
// ======================================

app.use((req, res) => {

  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// ======================================
// GLOBAL ERROR HANDLER
// ======================================

app.use((err, req, res, next) => {

  console.log(err.stack);

  res.status(500).json({
    success: false,
    message: "Internal server error"
  });
});

// ======================================
// SERVER START
// ======================================

app.listen(PORT, () => {

  console.log(
    `🚀 Server running on ${PORT}`
  );
});
