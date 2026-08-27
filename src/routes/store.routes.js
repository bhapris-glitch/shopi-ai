// routes/store.routes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Client = require("../../models/Client");

const JWT_SECRET = process.env.JWT_SECRET || "layboka_super_secret";
const TRIAL_DAYS = 5;

const normalizeStore = (s = "") =>
  String(s).trim().toLowerCase().replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "");

function via(store, email) {
  const normEmail = (email || "").trim().toLowerCase();
  if (store) return Client.findOne({ store: normalizeStore(store) });
  if (normEmail) return Client.findOne({ email: normEmail });
  return null;
}

// Register after install (store URL + email + password)
router.post("/register", async (req, res) => {
  try {
    const { store, email, password } = req.body;
    if (!store || !email || !password) {
      return res.status(400).json({ success: false, message: "Store, email and password are required." });
    }
    const exists = await Client.findOne({ $or: [{ store: normalizeStore(store) }, { email: (email || "").toLowerCase() }] });
    if (exists) return res.status(409).json({ success: false, message: "A client already exists for this store/email." });

    const passwordHash = await bcrypt.hash(password, 10);
    const client = await Client.create({
      store: normalizeStore(store),
      email: email.toLowerCase(),
      passwordHash,
      plan: "free",
      status: "trial",
      locked: false,
      trialEnds: Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000,
    });
    const token = jwt.sign({ sub: client._id, store: client.store, plan: client.plan, role: "client", kind: "client" }, JWT_SECRET, { expiresIn: "7d" });
    return res.status(201).json({ success: true, token, client: { _id: client._id, store: client.store, plan: client.plan, status: client.status } });
  } catch (err) {
    console.error("STORE REGISTER", err);
    return res.status(500).json({ success: false, message: "Registration failed." });
  }
});

// Login with EITHER store URL OR email + password
router.post("/login", async (req, res) => {
  try {
    const { store, email, password } = req.body;
    const client = await via(store, email);
    if (!client) return res.status(401).json({ success: false, message: "Invalid credentials." });
    const ok = client.passwordHash ? await bcrypt.compare(password || "", client.passwordHash) : false;
    if (!ok) return res.status(401).json({ success: false, message: "Invalid credentials." });

    // Enforce 5-day trial lock on login
    if (client.status === "trial" && client.trialEnds && Date.now() > client.trialEnds) {
      client.locked = true;
      client.chatbotEnabled = false;
      await client.save();
    }
    await Client.updateOne({ _id: client._id }, { $set: { lastLoginAt: new Date() } });
    const token = jwt.sign({ sub: client._id, store: client.store, plan: client.plan, role: "client", kind: "client" }, JWT_SECRET, { expiresIn: "7d" });
    return res.json({ success: true, token, client });
  } catch (err) {
    console.error("STORE LOGIN", err);
    return res.status(500).json({ success: false, message: "Login failed." });
  }
});

// Status for dashboard
router.get("/status", async (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    const t = auth.replace(/^Bearer\s+/i, "");
    const decoded = jwt.verify(t, JWT_SECRET);
    const client = await Client.findById(decoded.sub);
    if (!client) return res.status(404).json({ success: false, message: "Client not found." });

    const trialOver = client.status === "trial" && client.trialEnds && Date.now() > client.trialEnds;
    if (trialOver && !client.locked) {
      client.locked = true; client.chatbotEnabled = false; await client.save();
    }
    const daysLeft = client.trialEnds ? Math.max(0, Math.ceil((client.trialEnds - Date.now()) / 86400000)) : 0;
    return res.json({ success: true, locked: !!client.locked, chatbotEnabled: !client.locked, trialOver, daysLeft, plan: client.plan, status: client.status, trialEnds: client.trialEnds });
  } catch (err) {
    return res.status(401).json({ success: false, message: "Unauthorized." });
  }
});

module.exports = router;
