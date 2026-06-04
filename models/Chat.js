// ======================================
// models/Chat.js
// Layboka AI
// Updated 04Jun,2026
// =====================================
const mongoose = require("mongoose");

// ======================================
// CHAT MESSAGE
// ======================================

const MessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["customer", "ai", "agent"],
      required: true
    },

    content: {
      type: String,
      required: true
    },

    platform: {
      type: String,
      default: "web"
    },

    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

// ======================================
// CHAT
// ======================================

const ChatSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true
    },

    sessionId: {
      type: String,
      required: true,
      index: true
    },

    customerName: {
      type: String,
      default: ""
    },

    customerEmail: {
      type: String,
      default: "",
      lowercase: true
    },

    customerPhone: {
      type: String,
      default: ""
    },

    platform: {
      type: String,
      enum: [
        "web",
        "shopify",
        "whatsapp",
        "instagram",
        "facebook",
        "telegram",
        "tiktok"
      ],
      default: "web"
    },

    messages: {
      type: [MessageSchema],
      default: []
    },

    aiHandled: {
      type: Boolean,
      default: true
    },

    converted: {
      type: Boolean,
      default: false
    },

    conversionValue: {
      type: Number,
      default: 0
    },

    abandonedCartRecovered: {
      type: Boolean,
      default: false
    },

    sentiment: {
      type: String,
      enum: [
        "positive",
        "neutral",
        "negative"
      ],
      default: "neutral"
    },

    lastMessageAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// ======================================
// INDEXES
// ======================================

ChatSchema.index({
  clientId: 1,
  createdAt: -1
});

ChatSchema.index({
  sessionId: 1
});

ChatSchema.index({
  customerEmail: 1
});

// ======================================
// EXPORT
// ======================================

module.exports = mongoose.model(
  "Chat",
  ChatSchema
);
