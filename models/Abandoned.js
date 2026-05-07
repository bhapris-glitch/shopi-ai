const mongoose = require("mongoose");

const abandonedSchema = new mongoose.Schema({
  clientId: String,
  email: String,
  phone: String,
  product: Object,
  createdAt: { type: Date, default: Date.now },
  recovered: { type: Boolean, default: false }
});

module.exports = mongoose.model("Abandoned", abandonedSchema);
