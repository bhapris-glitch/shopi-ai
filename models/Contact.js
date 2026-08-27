// models/Contact.js
const mongoose = require("mongoose");

const ContactSchema = new mongoose.Schema(
  {
    name:   { type: String, required: true, trim: true },
    email:  { type: String, required: true, lowercase: true, trim: true },
    store:  { type: String, default: "" },
    mobile: { type: String, default: "" },
    query:  {
      type: String,
      enum: ["General", "Sales", "Enterprise", "Payment", "Other"],
      default: "General",
      index: true,
    },
    message: { type: String, default: "", maxlength: 4000 },
    status:  { type: String, enum: ["new", "read", "replied"], default: "new" },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Contact", ContactSchema);
