// Generate / rotate the client's widget API key
exports.apiKey = async (req, res) => {
  try {
    const crypto = require("crypto");
    const Client = require("../../models/Client");
    const key = "lyb_" + crypto.randomBytes(24).toString("hex");
    await Client.updateOne({ _id: req.user.sub }, { $set: { apiKey: key } });
    return res.json({ success: true, apiKey: key });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to generate key." });
  }
};

// PUT /api/client/chatbot  save merchant chatbot configuration
const CHATBOT_FIELDS = [
  "agentName", "agentAvatar", "welcomeAvatar", "logo",
  "welcomeMessage", "returningMessage", "personality",
  "poweredByHidden", "primaryColor", "memoryEnabled",
  "whatsappEnabled", "abandonedCartAI", "checkoutCloser",
  "premiumUI", "loyaltyEnabled", "vipEnabled", "orderTrackingEnabled",
  "voiceEnabled", "multiAgentEnabled", "referralEnabled"
];
exports.saveChatbotSettings = async (req, res) => {
  try {
    const update = {};
    for (const k of CHATBOT_FIELDS)
      if (req.body[k] !== undefined) update[k] = req.body[k];
    const client = await Client.findByIdAndUpdate(req.user.sub, { $set: update }, { new: true });
    return res.json({ success: true, settings: client });
  } catch (e) { return res.status(500).json({ success: false }); }
};
exports.getChatbotSettings = async (req, res) => {
  try {
    const client = await Client.findById(req.user.sub).select("+apiKey");
    if (!client) return res.status(404).json({ success: false });
    const out = {};
    CHATBOT_FIELDS.forEach(k => out[k] = client[k]);
    out.apiKey = client.apiKey || "";
    return res.json({ success: true, settings: out });
  } catch (e) { return res.status(500).json({ success: false }); }
};
exports.rotateApiKey = async (req, res) => {
  try {
    const crypto = require("crypto");
    const key = "lyb_" + crypto.randomBytes(24).toString("hex");
    await Client.findOneAndUpdate({ _id: req.user.sub }, { $set: { apiKey: key } });
    return res.json({ success: true, apiKey: key });
  } catch (e) { return res.status(500).json({ success: false }); }
};
