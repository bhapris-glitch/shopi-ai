// ======================================
// models/Recovery.js
// Layboka AI
// Production Recovery Model
// GPT-4o-mini Optimized
// Updated 2026 - Full PART
// ======================================

const mongoose = require("mongoose");

// ======================================
// CART ITEMS
// ======================================

const CartItemSchema = new mongoose.Schema(
  {
    productId: String,

    variantId: String,

    title: String,

    sku: String,

    image: String,

    quantity: {
      type: Number,
      default: 1
    },

    price: {
      type: Number,
      default: 0
    }
  },
  {
    _id: false
  }
);

// ======================================
// RECOVERY
// ======================================

const RecoverySchema = new mongoose.Schema(
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

    name: {
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
      default: ""
    },

    country: {
      type: String,
      default: "US",
      index: true
    },

    city: {
      type: String,
      default: ""
    },

    currency: {
      type: String,
      default: "USD"
    },

    // ====================================
    // CART
    // ====================================

    cartId: {
      type: String,
      required: true,
      index: true
    },

    checkoutId: {
      type: String,
      default: ""
    },

    cart: {
      type: [CartItemSchema],
      default: []
    },

    cartValue: {
      type: Number,
      default: 0
    },

    itemCount: {
      type: Number,
      default: 0
    },

    // ====================================
    // RECOVERY LINK
    // ====================================

    recoveryToken: {
      type: String,
      default: "",
      index: true
    },

    recoveryUrl: {
      type: String,
      default: ""
    },

    // ====================================
    // RECOVERY STATUS
    // ====================================

    recovered: {
      type: Boolean,
      default: false,
      index: true
    },

    recoveredAt: Date,

    recoveredRevenue: {
      type: Number,
      default: 0
    },

    recoverySource: {
      type: String,
      default: "",
    },

    // ====================================
    // AI ATTRIBUTION
    // ====================================

    aiInfluenced: {
      type: Boolean,
      default: false
    },

    aiRevenueAttributed: {
      type: Number,
      default: 0
    },

    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation"
    },

    // ====================================
    // FIRST REMINDER
    // ====================================

    reminderSent: {
      type: Boolean,
      default: false,
      index: true
    },

    reminderSentAt: Date,

    // ====================================
    // SECOND REMINDER
    // ====================================

    secondReminderSent: {
      type: Boolean,
      default: false,
      index: true
    },

    secondReminderSentAt: Date,

    // ====================================
    // THIRD REMINDER
    // ====================================

    thirdReminderSent: {
      type: Boolean,
      default: false,
      index: true
    },

    thirdReminderSentAt: Date,

    // ====================================
    // CHANNEL ANALYTICS
    // ====================================

    emailSentCount: {
      type: Number,
      default: 0
    },

    whatsappSentCount: {
      type: Number,
      default: 0
    },

    smsSentCount: {
      type: Number,
      default: 0
    },

    emailOpened: {
      type: Boolean,
      default: false
    },

    emailClicked: {
      type: Boolean,
      default: false
    },

    whatsappClicked: {
      type: Boolean,
      default: false
    },

    // ====================================
    // RECOVERY STAGE
    // ====================================

    currentStage: {
      type: String,
      enum: [
        "none",
        "first",
        "second",
        "third",
        "recovered",
        "expired"
      ],
      default: "none"
    },

    // ====================================
    // EXTRA
    // ====================================

    notes: {
      type: String,
      default: ""
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

RecoverySchema.index({
  clientId: 1,
  cartId: 1
});

RecoverySchema.index({
  recovered: 1,
  reminderSent: 1,
  createdAt: 1
});

RecoverySchema.index({
  recovered: 1,
  secondReminderSent: 1,
  reminderSentAt: 1
});

RecoverySchema.index({
  recovered: 1,
  thirdReminderSent: 1,
  secondReminderSentAt: 1
});

RecoverySchema.index({
  email: 1
});

RecoverySchema.index({
  customerId: 1
});

RecoverySchema.index({
  recoveryToken: 1
});

RecoverySchema.index({
  clientId: 1,
  recovered: 1
});

// ======================================
// EXPORT
// ======================================

module.exports = mongoose.model(
  "Recovery",
  RecoverySchema
);
