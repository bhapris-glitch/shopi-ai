// controllers/contact.controller.js
const Contact = require("../../models/Contact");

exports.submit = async (req, res) => {
  try {
    const { name, email, store = "", mobile = "", query = "General", message = "" } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: "Name and email are required." });
    }
    const contact = await Contact.create({ name, email, store, mobile, query, message });
    return res.status(201).json({ success: true, ticket: contact._id, message: "Message received. We'll reply within 24h." });
  } catch (err) {
    console.error("CONTACT ERROR", err);
    return res.status(500).json({ success: false, message: "Could not submit form." });
  }
};

exports.list = async (req, res) => {
  try {
    const items = await Contact.find().sort({ createdAt: -1 }).limit(200);
    return res.json({ success: true, items });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to load." });
  }
};

exports.health = (req, res) => res.json({ success: true, service: "contact", status: "running" });
