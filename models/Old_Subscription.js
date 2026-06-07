// ======================================
// models/Subscription.js
// Layboka AI Subscription Model
// billing, Stripe, Razorpay, renewals, 
// cancel-anytime, and lock/unlock system.
// Updated 04 Jun 2026
// ======================================
const mongoose = require("mongoose");

// ======================================
// SUBSCRIPTION SCHEMA
// ======================================

const SubscriptionSchema =
new mongoose.Schema({

  // ====================================
  // CLIENT
  // ====================================

  clientId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Client",
    required:true,
    index:true
  },

  // ====================================
  // PLAN
  // ====================================

  plan:{
    type:String,
    enum:[
      "free",
      "starter",
      "growth",
      "premium"
    ],
    required:true
  },

  // ====================================
  // PROVIDER
  // ====================================

  provider:{
    type:String,
    enum:[
      "stripe",
      "razorpay",
      "manual"
    ],
    default:"manual"
  },

  // ====================================
  // STRIPE
  // ====================================

  customerId:{
    type:String,
    default:"",
    index:true
  },

  subscriptionId:{
    type:String,
    default:"",
    unique:true,
    sparse:true,
    index:true
  },

  paymentId:{
    type:String,
    default:""
  },

  // ====================================
  // STATUS
  // ====================================

  status:{
    type:String,
    enum:[
      "trial",
      "active",
      "past_due",
      "paused",
      "cancelled",
      "expired"
    ],
    default:"trial",
    index:true
  },

  paid:{
    type:Boolean,
    default:false
  },

  autoRenew:{
    type:Boolean,
    default:true
  },

  locked:{
    type:Boolean,
    default:false
  },

  // ====================================
  // BILLING
  // ====================================

  amount:{
    type:Number,
    default:0
  },

  currency:{
    type:String,
    default:"USD"
  },

  billingCycle:{
    type:String,
    enum:[
      "monthly",
      "yearly"
    ],
    default:"monthly"
  },

  // ====================================
  // DATES
  // ====================================

  startedAt:{
    type:Date,
    default:Date.now
  },

  renewalDate:{
    type:Date,
    default:null,
    index:true
  },

  cancelledAt:{
    type:Date,
    default:null
  },

  expiresAt:{
    type:Date,
    default:null
  },

  // ====================================
  // METADATA
  // ====================================

  notes:{
    type:String,
    default:""
  }

},
{
  timestamps:true,
  versionKey:false
});

// ======================================
// INDEXES
// ======================================

SubscriptionSchema.index({
  clientId:1,
  status:1
});

SubscriptionSchema.index({
  renewalDate:1
});

// ======================================
// EXPORT
// ======================================

module.exports =
mongoose.model(
  "Subscription",
  SubscriptionSchema
);
