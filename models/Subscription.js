// ======================================
// models/Subscription.js
// Layboka AI Subscription Model
// Production Ready
// USD Base Currency
// Updated 7 Jun, 2026
// ======================================

const mongoose = require("mongoose");

// ======================================
// SUBSCRIPTION SCHEMA
// ======================================

const SubscriptionSchema = new mongoose.Schema({

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
    default: "",
    index: true
  },

  // ====================================
  // PLAN
  // ====================================

  plan: {
    type: String,
    enum: [
      "free",
      "starter",
      "growth",
      "premium"
    ],
    required: true,
    default: "free"
  },

  // ====================================
  // PAYMENT PROVIDER
  // ====================================

  provider: {
    type: String,
    enum: [
      "stripe",
      "razorpay",
      "manual"
    ],
    default: "manual"
  },

  // ====================================
  // STRIPE / RAZORPAY IDS
  // ====================================

  customerId: {
    type: String,
    default: "",
    index: true
  },

  subscriptionId: {
    type: String,
    default: "",
    sparse: true,
    unique: true,
    index: true
  },

  paymentId: {
    type: String,
    default: ""
  },

  invoiceId: {
    type: String,
    default: ""
  },

  // ====================================
  // STATUS
  // ====================================

  status: {
    type: String,
    enum: [
      "trial",
      "active",
      "past_due",
      "paused",
      "cancelled",
      "expired"
    ],
    default: "trial",
    index: true
  },

  paid: {
    type: Boolean,
    default: false
  },

  autoRenew: {
    type: Boolean,
    default: true
  },

  locked: {
    type: Boolean,
    default: false
  },

  // ====================================
  // BILLING
  // ====================================

  amount: {
    type: Number,
    default: 0
  },

  currency: {
    type: String,
    default: "USD",
    uppercase: true
  },

  billingCycle: {
    type: String,
    enum: [
      "monthly",
      "yearly"
    ],
    default: "monthly"
  },

  // ====================================
  // TRIAL
  // ====================================

  trialStartedAt: {
    type: Date,
    default: Date.now
  },

  trialEndsAt: {
    type: Date,
    default: () =>
      new Date(
        Date.now() +
        3 * 24 * 60 * 60 * 1000
      )
  },

  // ====================================
  // DATES
  // ====================================

  startedAt: {
    type: Date,
    default: Date.now
  },

  renewalDate: {
    type: Date,
    default: null,
    index: true
  },

  cancelledAt: {
    type: Date,
    default: null
  },

  expiresAt: {
    type: Date,
    default: null
  },

  lastPaymentAt: {
    type: Date,
    default: null
  },

  nextBillingAt: {
    type: Date,
    default: null
  },

  // ====================================
  // FAILURES
  // ====================================

  failedPayments: {
    type: Number,
    default: 0
  },

  lastFailureReason: {
    type: String,
    default: ""
  },

  // ====================================
  // REFUND
  // ====================================

  refunded: {
    type: Boolean,
    default: false
  },

  refundAmount: {
    type: Number,
    default: 0
  },

  // ====================================
  // NOTES
  // ====================================

  notes: {
    type: String,
    default: ""
  }

}, {
  timestamps: true,
  versionKey: false
});

// ======================================
// INDEXES
// ======================================

SubscriptionSchema.index({
  clientId: 1,
  status: 1
});

SubscriptionSchema.index({
  renewalDate: 1
});

SubscriptionSchema.index({
  subscriptionId: 1
});

SubscriptionSchema.index({
  provider: 1
});

// ======================================
// EXPORT
// ======================================

module.exports = mongoose.model(
  "Subscription",
  SubscriptionSchema
);
