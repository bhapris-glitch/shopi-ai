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
