// ======================================
// models/Conversation.js
// Layboka AI Conversation Engine
// GPT-4o-mini Optimized
// Production Ready 2026 - Full version
// ======================================

const mongoose = require("mongoose");

// ======================================
// MESSAGE
// ======================================

const MessageSchema = new mongoose.Schema(
{
  sender: {
    type: String,
    enum: [
      "customer",
      "ai",
      "agent",
      "system"
    ],
    required: true
  },

  message: {
    type: String,
    required: true
  },

  platform: {
    type: String,
    enum: [
      "website",
      "shopify",
      "whatsapp",
      "telegram",
      "instagram",
      "facebook",
      "tiktok"
    ],
    default: "website"
  },

  agentName: {
    type: String,
    default: "Emma"
  },

  intent: {
    type: String,
    default: ""
  },

  sentiment: {
    type: String,
    default: "neutral"
  },

  metadata: {
    type: Object,
    default: {}
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
},
{
  _id: false
}
);

// ======================================
// CONVERSATION
// ======================================

const ConversationSchema = new mongoose.Schema(
{
  // ====================================
  // CLIENT
  // ====================================

  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true,
    index: true
  },

  store: {
    type: String,
    default: ""
  },

  // ====================================
  // CUSTOMER
  // ====================================

  customerId: {
    type: String,
    default: "",
    index: true
  },

  customerName: {
    type: String,
    default: ""
  },

  email: {
    type: String,
    default: "",
    lowercase: true,
    index: true
  },

  phone: {
    type: String,
    default: "",
    index: true
  },

  country: {
    type: String,
    default: "US"
  },

  city: {
    type: String,
    default: ""
  },

  timezone: {
    type: String,
    default: ""
  },

  // ====================================
  // CHANNEL
  // ====================================

  platform: {
    type: String,
    default: "website",
    index: true
  },

  // ====================================
  // MEMORY
  // ====================================

  memoryEnabled: {
    type: Boolean,
    default: true
  },

  summary: {
    type: String,
    default: ""
  },

  customerProfile: {
    type: String,
    default: ""
  },

  tags: {
    type: [String],
    default: []
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

  // ====================================
  // CHAT
  // ====================================

  messages: {
    type: [MessageSchema],
    default: []
  },

  totalMessages: {
    type: Number,
    default: 0
  },

  firstMessageAt: Date,

  lastMessageAt: Date,

  // ====================================
  // SALES INTELLIGENCE
  // ====================================

  interestedProduct: {
    type: String,
    default: ""
  },

  recommendedProducts: {
    type: [String],
    default: []
  },

  addedToCart: {
    type: Boolean,
    default: false
  },

  cartValue: {
    type: Number,
    default: 0
  },

  checkoutStarted: {
    type: Boolean,
    default: false
  },

  converted: {
    type: Boolean,
    default: false
  },

  orderId: {
    type: String,
    default: ""
  },

  orderValue: {
    type: Number,
    default: 0
  },

  // ====================================
  // AI ATTRIBUTION
  // ====================================

  aiHandled: {
    type: Boolean,
    default: true
  },

  aiRevenueAttributed: {
    type: Number,
    default: 0
  },

  upsellRevenue: {
    type: Number,
    default: 0
  },

  crossSellRevenue: {
    type: Number,
    default: 0
  },

  cartRecovered: {
    type: Boolean,
    default: false
  },

  // ====================================
  // HUMAN ESCALATION
  // ====================================

  escalatedToHuman: {
    type: Boolean,
    default: false
  },

  escalatedAt: Date,

  humanAgent: {
    type: String,
    default: ""
  },

  // ====================================
  // GPT-4o-mini
  // ====================================

  lastIntent: {
    type: String,
    default: ""
  },

  confidenceScore: {
    type: Number,
    default: 0
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

ConversationSchema.index({
  clientId: 1,
  createdAt: -1
});

ConversationSchema.index({
  email: 1
});

ConversationSchema.index({
  phone: 1
});

ConversationSchema.index({
  customerId: 1
});

ConversationSchema.index({
  converted: 1
});

ConversationSchema.index({
  addedToCart: 1
});

ConversationSchema.index({
  escalatedToHuman: 1
});

ConversationSchema.index({
  clientId: 1,
  converted: 1
});

// ======================================
// EXPORT
// ======================================

module.exports =
mongoose.model(
  "Conversation",
  ConversationSchema
);
