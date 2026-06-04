const mongoose = require("mongoose");

// ======================================
// MULTI AGENT SCHEMA
// ======================================

const AgentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: ""
    },

    role: {
      type: String,
      default: "sales"
    },

    avatar: {
      type: String,
      default: ""
    },

    active: {
      type: Boolean,
      default: true
    }
  },
  { _id: false }
);

// ======================================
// CLIENT SCHEMA
// ======================================

const ClientSchema = new mongoose.Schema({

  // ======================================
  // STORE
  // ======================================

  store: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  storeDisplayName: {
    type: String,
    default: ""
  },

  token: {
    type: String,
    default: ""
  },

  // ======================================
  // BRANDING
  // ======================================

  agentName: {
    type: String,
    default: "Emma"
  },

  agentAvatar: {
    type: String,
    default: ""
  },

  poweredByHidden: {
    type: Boolean,
    default: false
  },

  // ======================================
  // PLAN
  // ======================================

  plan: {
    type: String,
    enum: [
      "free",
      "starter",
      "growth",
      "premium"
    ],
    default: "free"
  },

  // ======================================
  // PAYMENT
  // ======================================

  paid: {
    type: Boolean,
    default: false
  },

  paymentProvider: {
    type: String,
    default: ""
  },

  subscriptionId: {
    type: String,
    default: ""
  },

  status: {
    type: String,
    default: "trial"
  },

  // ======================================
  // TRIAL
  // ======================================

  trialEnds: {
    type: Number,
    default: () =>
      Date.now() +
      (3 * 24 * 60 * 60 * 1000)
  },

  renewalDate: {
    type: Number,
    default: 0
  },

  // ======================================
  // REFERRAL
  // ======================================

  referralCode: {
    type: String,
    default: ""
  },

  referredBy: {
    type: String,
    default: ""
  },

  referralCount: {
    type: Number,
    default: 0
  },

  rewardUnlocked: {
    type: String,
    default: ""
  },

  // ======================================
  // DASHBOARD ANALYTICS
  // ======================================

  messages: {
    type: Number,
    default: 0
  },

  opens: {
    type: Number,
    default: 0
  },

  conversions: {
    type: Number,
    default: 0
  },

  recoveredCarts: {
    type: Number,
    default: 0
  },

  revenue: {
    type: Number,
    default: 0
  },

  recoveredRevenue: {
    type: Number,
    default: 0
  },

  aiInfluencedRevenue: {
    type: Number,
    default: 0
  },

  potentialRevenue: {
    type: Number,
    default: 347
  },

  orders: {
    type: Number,
    default: 0
  },

  addToCartCount: {
    type: Number,
    default: 0
  },

  checkoutVisits: {
    type: Number,
    default: 0
  },

  onlineVisitors: {
    type: Number,
    default: 0
  },

  // ======================================
  // FEATURES
  // ======================================

  memoryEnabled: {
    type: Boolean,
    default: false
  },

  supportAgentEnabled: {
    type: Boolean,
    default: false
  },

  referralEnabled: {
    type: Boolean,
    default: false
  },

  whatsappEnabled: {
    type: Boolean,
    default: false
  },

  abandonedCartAI: {
    type: Boolean,
    default: false
  },

  checkoutCloser: {
    type: Boolean,
    default: false
  },

  premiumUI: {
    type: Boolean,
    default: false
  },

  loyaltyEnabled: {
    type: Boolean,
    default: false
  },

  vipEnabled: {
    type: Boolean,
    default: false
  },

  orderTrackingEnabled: {
    type: Boolean,
    default: false
  },

  voiceEnabled: {
    type: Boolean,
    default: false
  },

  multiAgentEnabled: {
    type: Boolean,
    default: false
  },

  // ======================================
  // FUTURE MULTI AGENT SYSTEM
  // ======================================

  agents: {
    type: [AgentSchema],
    default: []
  },

  // ======================================
  // CONTACT
  // ======================================

  email: {
    type: String,
    default: ""
  },

  phone: {
    type: String,
    default: ""
  },

  // ======================================
  // CREATED
  // ======================================

  createdAt: {
    type: Date,
    default: Date.now
  }

});

// ======================================
// EXPORT
// ======================================

module.exports = mongoose.model(
  "Client",
  ClientSchema
);
