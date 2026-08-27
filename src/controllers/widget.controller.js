// controllers/widget.controller.js
// API-key + signed-token gated chatbot bootstrap.
// Additive. Does not modify chatbot.js or any existing route.
require("dotenv").config();

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Client = require("../../models/Client");

const WIDGET_SECRET =
  process.env.WIDGET_SECRET ||
  process.env.JWT_SECRET ||
  "layboka_widget_secret";

const TOKEN_TTL = 300; // seconds (5m)

function normalizeStore(input = "") {
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/$/, "");
}

function hmacToken(store) {
  return crypto
    .createHmac("sha256", WIDGET_SECRET)
    .update(store)
    .digest("hex");
}

exports.bootstrap = async (req, res) => {
  try {
    const { shop } = req.query;
    if (!shop) {
      return res.status(400).json({ success: false, code: "SHOP_REQUIRED" });
    }

    const storeName = normalizeStore(shop);
    const client = await Client.findOne({ store: storeName }).select("+apiKey");

    // 1) Store must be registered.
    if (!client) {
      return res.status(404).json({ success: false, code: "SHOP_UNREGISTERED" });
    }

    // 2) Trial lock (same policy as renewal cron).
    if (client.status === "trial" && client.trialEnds && Date.now() > client.trialEnds) {
      client.locked = true;
      client.chatbotEnabled = false;
      await client.save();
      return res.status(402).json({ success: false, code: "TRIAL_EXPIRED" });
    }
    if (client.locked) {
      return res.status(402).json({ success: false, code: "LOCKED" });
    }

    // 3) API-key gate. Only enforced when a key has been assigned.
    const suppliedKey = req.query.key || req.headers["x-api-key"] || "";
    if (client.apiKey) {
      const ok =
        suppliedKey === client.apiKey ||
        crypto.timingSafeEqual(
          Buffer.from(String(suppliedKey)),
          Buffer.from(client.apiKey)
        );
      if (!ok || !suppliedKey) {
        return res.status(403).json({ success: false, code: "BAD_KEY" });
      }
    }

    // 4) Optional referer/domain gate (defense in depth).
    const referer = req.headers.referer || req.headers.origin;
    if (referer) {
      try {
        const host = new URL(referer).hostname.toLowerCase();
        if (host !== storeName) {
          return res.status(403).json({ success: false, code: "FORBIDDEN_DOMAIN" });
        }
      } catch {
        // ignore invalid referer
      }
    }

    // 5) Short-lived signed token + HMAC leg for the widget.
    const token = jwt.sign(
      { shop: storeName, purpose: "widget" },
      WIDGET_SECRET,
      { expiresIn: TOKEN_TTL }
    );

    return res.json({
      success: true,
      token,
      store: storeName,
      hmac: compareToToken ? undefined : undefined, // placeholder; see below
      widget: {
        agentName: client.agentName || "Emily",
        agentAvatar: client.agentAvatar || "",
        plan: client.plan,
        status: client.status,
        locked: !!client.locked,
        poweredByHidden: !!client.poweredByHidden
      },
      expiresIn: 300
    });
  } catch (err) {
    console.error("[WIDGET BOOTSTRAP]", err);
    return res.status(500).json({ success: false, message: "Widget bootstrap failed." });
  }
};
