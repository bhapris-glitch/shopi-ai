// ======================================
// server.js
// Layboka AI - Production Server Entry
// CLEAN ARCHITECTURE BOOTSTRAP
// ======================================

require("dotenv").config();

// ======================================
// CORE DEPENDENCIES
// ======================================

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const compression = require("compression");

// ======================================
// APP INIT
// ======================================

const app = express();

// ======================================
// SECURITY MIDDLEWARE
// ======================================

app.use(helmet());

app.use(
  cors({
    origin: "*",
    credentials: true
  })
);

app.use(compression());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ======================================
// DATABASE CONNECTION
// ======================================

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log("✅ MongoDB Connected Successfully");

  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  }
}

// ======================================
// HEALTH CHECK ROUTE
// ======================================

app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "OK",
    service: "Layboka AI Server",
    timestamp: new Date().toISOString()
  });
});

// ======================================
// BASIC ROOT
// ======================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Layboka AI API Running",
    version: "1.0.0"
  });
});

// ======================================
// MODULE ROUTES (PLACEHOLDER IMPORTS)
// ======================================

// We will connect full routes in Part 2

module.exports = { app, connectDB };
const path = require("path");

// ======================================
// ROUTE IMPORTS
// ======================================

const chatRoutes = require("./src/routes/chat.routes");
const billingRoutes = require("./src/routes/billing.routes");
const referralRoutes = require("./src/routes/referral.routes");
const authRoutes = require("./src/routes/auth.routes");
const shopifyRoutes = require("./src/routes/shopify.routes");

// ======================================
// API ROUTES REGISTRATION
// ======================================

app.use("/api/chat", chatRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/referral", referralRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/shopify", shopifyRoutes);
// ======================================
// middleware/planGuard.js
// Controls AI model access
// ======================================

module.exports = function planGuard(req, res, next) {
  const client = req.client;

  if (!client) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    });
  }

  const plan = client.plan || "free";

  req.aiModel =
    plan === "premium" || plan === "enterprise"
      ? "gpt-5"
      : "gpt-4o-mini";

  next();
};
const express = require("express");
const router = express.Router();

const planGuard = require("../middleware/planGuard");
const { generateAIReply } = require("../services/ai.service");

// ======================================
// CHAT ENDPOINT
// ======================================

router.post("/", planGuard, async (req, res) => {
  try {
    const {
      message,
      storeName,
      products,
      geo,
      currency,
      client
    } = req.body;

    const aiModel = req.aiModel;

    const reply = await generateAIReply({
      message,
      storeName,
      products,
      geo,
      currency,
      model: aiModel,
      client
    });

    return res.json({
      success: true,
      reply,
      model: aiModel
    });

  } catch (err) {
    console.error("CHAT ERROR:", err);

    return res.status(500).json({
      success: false,
      reply: "⚠️ AI temporarily unavailable"
    });
  }
});

module.exports = router;

//======================================
// 4. BILLING ROUTE (AUTO PAY READY)
// =====================================
const express = require("express");
const router = express.Router();

const billingService = require("../services/billing.service");

// ======================================
// CREATE SUBSCRIPTION
// ======================================

router.post("/subscribe", async (req, res) => {
  try {
    const { clientId, plan, paymentMethod } = req.body;

    const result = await billingService.createSubscription({
      clientId,
      plan,
      paymentMethod
    });

    return res.json(result);

  } catch (err) {
    console.error("BILLING ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Billing failed"
    });
  }
});

module.exports = router;
// =======================================
// 5. REFERRAL ROUTE (ENGINE CONNECTED)
// =======================================
const express = require("express");
const router = express.Router();

const referralEngine = require("../engines/referral.engine");

// ======================================
// APPLY REFERRAL
// ======================================

router.post("/apply", async (req, res) => {
  try {
    const { clientId, referralCode } = req.body;

    const result = await referralEngine.applyReferral({
      clientId,
      referralCode
    });

    return res.json(result);

  } catch (err) {
    console.error("REFERRAL ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Referral failed"
    });
  }
});

module.exports = router;
// ==============================
// 6. SHOPIFY INSTALL ROUTE
// ==============================
const express = require("express");
const router = express.Router();

// ======================================
// SHOPIFY INSTALL FLOW
// ======================================

router.get("/install", async (req, res) => {
  try {
    const { shop } = req.query;

    if (!shop) {
      return res.status(400).send("Missing shop parameter");
    }

    const installUrl =
      `https://${shop}/admin/oauth/authorize`;

    return res.redirect(installUrl);

  } catch (err) {
    console.error("SHOPIFY INSTALL ERROR:", err);

    return res.status(500).send("Installation failed");
  }
});

module.exports = router;
// ====================================
// 
