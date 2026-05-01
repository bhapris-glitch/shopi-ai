const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  store: String,
  token: String,

  plan: { type: String, default: "basic" },

  trialEnds: Number,
  paid: { type: Boolean, default: false },

  subscriptionId: String,   // Razorpay / Stripe
  customerId: String,

  status: { type: String, default: "trial" }, 
  // trial / active / cancelled / failed

  messages: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Client", clientSchema);
