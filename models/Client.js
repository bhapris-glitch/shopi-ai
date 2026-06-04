const mongoose = require("mongoose");

// ======================================
// AGENT SCHEMA
// ======================================

const AgentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: ""
    },

    role: {
      type: String,
      enum: [
        "sales",
        "support",
        "checkout",
        "recovery",
        "upsell"
      ],
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

const ClientSchema = new mongoose.Schema(
  {
    // ======================================
    // STORE
    // ======================================

    store: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },

    storeDisplayName: {
      type: String,
      trim: true,
      default: ""
    },

    token: {
      type: String,
      default: "",
      select: false
    },

    shopifyShopId: {
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
    // ACCOUNT
    // ======================================

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
      index: true
    },

    phone: {
      type: String,
      default: ""
    },

    passwordHash: {
      type: String,
      select: false
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
        "premium",
        "enterprise"
      ],
      default: "free",
      index: true
    },

    paid: {
      type: Boolean,
      default: false
    },

    locked: {
      type: Boolean,
      default: false
    },

    status: {
      type: String,
      enum: [
        "trial",
        "active",
        "paused",
        "cancelled",
        "halted",
        "payment_failed"
      ],
      default: "trial"
    },

    paymentProvider: {
      type: String,
      default: ""
    },

    paymentId: {
      type: String,
      default: ""
    },

    customerId: {
      type: String,
      default: ""
    },

    subscriptionId: {
      type: String,
      default: "",
      index: true
    },

    // ======================================
    // DATES
    // ======================================

    trialEnds: {
      type: Number,
      default: () =>
        Date.now() +
        3 * 24 * 60 * 60 * 1000
    },

    renewalDate: {
      type: Number,
      default: 0
    },

    lastLoginAt: {
      type: Date
    },

    // ======================================
    // REFERRALS
    // ======================================

    referralCode: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true
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
    // ANALYTICS
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
      default: 0
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
    // MULTI AGENT
    // ======================================

    agents: {
      type: [AgentSchema],
      default: []
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

ClientSchema.index({
  plan: 1,
  status: 1
});

ClientSchema.index({
  renewalDate: 1
});

ClientSchema.index({
  email: 1
});

// ======================================
// EXPORT
// ======================================

module.exports = mongoose.model(
  "Client",
  ClientSchema
);
