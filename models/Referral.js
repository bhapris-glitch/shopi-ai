// ==========================================
// models/Referral.js
// Layboka AI Referral System
// Production Ready
// ==========================================

const mongoose = require("mongoose");

const ReferralSchema = new mongoose.Schema({

  // ==========================================
  // REFERRER
  // ==========================================

  referrerClientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true,
    index: true
  },

  referrerStore: {
    type: String,
    default: ""
  },

  referrerPlan: {
    type: String,
    enum: [
      "free",
      "starter",
      "growth",
      "premium"
    ],
    default: "free"
  },

  // ==========================================
  // REFERRED USER
  // ==========================================

  referredClientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    default: null
  },

  referredStore: {
    type: String,
    default: ""
  },

  referredEmail: {
    type: String,
    default: ""
  },

  referredPlan: {
    type: String,
    enum: [
      "free",
      "starter",
      "growth",
      "premium"
    ],
    default: "free"
  },

  // ==========================================
  // REFERRAL CODE
  // ==========================================

  referralCode: {
    type: String,
    required: true,
    index: true,
    uppercase: true,
    trim: true
  },

  campaignCode: {
    type: String,
    default: ""
  },

  /*
    Examples:

    LAY2R40
    LAY2R30
    LAY2R40P

  */

  // ==========================================
  // STATUS
  // ==========================================

  status: {
    type: String,
    enum: [
      "pending",
      "registered",
      "paid",
      "qualified",
      "rewarded",
      "rejected",
      "expired"
    ],
    default: "pending"
  },

  // ==========================================
  // PAYMENT
  // ==========================================

  paid: {
    type: Boolean,
    default: false
  },

  paidAt: {
    type: Date,
    default: null
  },

  paymentProvider: {
    type: String,
    default: ""
  },

  paymentAmount: {
    type: Number,
    default: 0
  },

  paymentCurrency: {
    type: String,
    default: "USD"
  },

  // ==========================================
  // REWARD
  // ==========================================

  rewarded: {
    type: Boolean,
    default: false
  },

  rewardType: {
    type: String,
    default: ""
  },

  rewardValue: {
    type: Number,
    default: 0
  },

  rewardUnlocked: {
    type: Boolean,
    default: false
  },

  rewardUnlockedAt: {
    type: Date,
    default: null
  },

  rewardAppliedAt: {
    type: Date,
    default: null
  },

  rewardDescription: {
    type: String,
    default: ""
  },

  /*
      Examples:

      Starter:
      2 Months Free

      Growth:
      1 Month Premium

      Premium:
      Next Month Free

  */

  // ==========================================
  // VALIDATION
  // ==========================================

  qualified: {
    type: Boolean,
    default: false
  },

  qualifiedAt: {
    type: Date,
    default: null
  },

  fraudChecked: {
    type: Boolean,
    default: false
  },

  fraudFlagged: {
    type: Boolean,
    default: false
  },

  fraudReason: {
    type: String,
    default: ""
  },

  // ==========================================
  // REFERRAL WINDOW
  // ==========================================

  referralWindowDays: {
    type: Number,
    default: 40
  },

  expiresAt: {
    type: Date,
    default: null
  },

  // ==========================================
  // TRACKING
  // ==========================================

  ipAddress: {
    type: String,
    default: ""
  },

  country: {
    type: String,
    default: ""
  },

  device: {
    type: String,
    default: ""
  },

  source: {
    type: String,
    default: "direct"
  },

  utmSource: {
    type: String,
    default: ""
  },

  utmCampaign: {
    type: String,
    default: ""
  },

  // ==========================================
  // NOTES
  // ==========================================

  notes: {
    type: String,
    default: ""
  },

  adminNotes: {
    type: String,
    default: ""
  },

  // ==========================================
  // TIMESTAMPS
  // ==========================================

  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }

});

// ==========================================
// AUTO UPDATE TIMESTAMP
// ==========================================

ReferralSchema.pre("save", function(next){

  this.updatedAt = new Date();

  next();

});

// ==========================================
// INDEXES
// ==========================================

ReferralSchema.index({
  referrerClientId: 1,
  createdAt: -1
});

ReferralSchema.index({
  referralCode: 1
});

ReferralSchema.index({
  status: 1
});

ReferralSchema.index({
  rewarded: 1
});

// ==========================================
// EXPORT
// ==========================================

module.exports = mongoose.model(
  "Referral",
  ReferralSchema
);
