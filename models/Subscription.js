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

  trialReminderSent:{
  type:Boolean,
  default:false
},

  renewalReminderSent:{
  type:Boolean,
  default:false
},

  autoRenew: {
    type: Boolean,
    default: true
  },

  trialEndsAt: {
  type: Date,
  default: function () {
    return new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    );
  },
  index: true
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
// PLAN PRICING
// ====================================

planPrice:{
    type:Number,
    default:0
},

discountAmount:{
    type:Number,
    default:0
},

discountPercent:{
    type:Number,
    default:0
},

// ====================================
// REFERRAL REWARD
// ====================================

rewardApplied:{
    type:Boolean,
    default:false
},

rewardConsumed:{
    type:Boolean,
    default:false
},

rewardReason:{
    type:String,
    default:""
},

rewardType:{
    type:String,
    default:""
},

rewardReferral:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Referral",
    default:null
},

rewardAppliedAt:{
    type:Date,
    default:null
},

rewardConsumedAt:{
    type:Date,
    default:null
},

nextInvoiceAmount:{
    type:Number,
    default:0
},

// ====================================
// UPGRADE DISCOUNT
// ====================================

upgradeDiscountApplied:{
    type:Boolean,
    default:false
},

upgradeDiscountPercent:{
    type:Number,
    default:0
},

upgradeDiscountAmount:{
    type:Number,
    default:0
},

// ====================================
// AUTOPAY
// ====================================

autoPayEnabled:{
    type:Boolean,
    default:true
},

autoPayCancelledByUser:{
    type:Boolean,
    default:false
},

// ====================================
// PAYMENT FAILURE
// ====================================

paymentFailed:{
    type:Boolean,
    default:false
},

paymentFailedAt:{
    type:Date,
    default:null
},

lockedReason:{
    type:String,
    default:""
},

// ====================================
// REFERRAL SOURCE
// ====================================

referredByClient:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Client",
    default:null
},

referralCodeUsed:{
    type:String,
    default:""
}
                                               
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

// ====================================
// INSTANCE METHODS
// ====================================

SubscriptionSchema.methods.applyReward = function({

    rewardType = "",
    rewardReason = "",
    referralId = null,
    nextInvoiceAmount = 0

}){

    this.rewardApplied = true;
    this.rewardConsumed = false;

    this.rewardType = rewardType;
    this.rewardReason = rewardReason;

    this.rewardReferral = referralId;

    this.rewardAppliedAt = new Date();

    this.nextInvoiceAmount = nextInvoiceAmount;

    return this.save();

};

SubscriptionSchema.methods.consumeReward = function(){

    this.rewardApplied = false;
    this.rewardConsumed = true;

    this.rewardConsumedAt = new Date();

    this.rewardType = "";
    this.rewardReason = "";
    this.rewardReferral = null;

    this.nextInvoiceAmount =
        this.planPrice;

    return this.save();

};

SubscriptionSchema.methods.applyUpgradeDiscount = function(

    percent

){

    this.upgradeDiscountApplied = true;

    this.upgradeDiscountPercent = percent;

    this.upgradeDiscountAmount =

        Number(

            (

                this.planPrice *

                percent

            ) / 100

        ).toFixed(2);

    this.amount =

        this.planPrice -

        this.upgradeDiscountAmount;

    return this.save();

};

SubscriptionSchema.methods.lockChatbot = function(reason=""){

    this.locked = true;

    this.lockedReason = reason;

    return this.save();

};

SubscriptionSchema.methods.unlockChatbot = function(){

    this.locked = false;

    this.lockedReason = "";

    return this.save();

};

// ====================================
// VIRTUALS
// ====================================

SubscriptionSchema.virtual("isTrial").get(function(){

    return this.status === "trial";

});

SubscriptionSchema.virtual("isExpired").get(function(){

    if(!this.expiryDate)
        return false;

    return new Date() > this.expiryDate;

});

SubscriptionSchema.virtual("isActive").get(function(){

    return (

        this.status === "active" &&

        !this.locked

    );

});

// ====================================
// PRE SAVE
// ====================================

SubscriptionSchema.pre(

"save",

function(next){

    // Remove duplicate trial dates
    if(

        this.trialEndsAt &&

        this.expiryDate &&

        this.status === "trial"

    ){

        this.expiryDate = this.trialEndsAt;

    }

    // Starter
    if(

        this.plan === "starter" &&

        !this.planPrice

    ){

        this.planPrice = 25;

    }

    // Growth
    if(

        this.plan === "growth" &&

        !this.planPrice

    ){

        this.planPrice = 59;

    }

    // Premium
    if(

        this.plan === "premium" &&

        !this.planPrice

    ){

        this.planPrice = 149;

    }

    // Enterprise
    if(

        this.plan === "enterprise" &&

        !this.planPrice

    ){

        this.planPrice = 0;

    }

    if(

        !this.rewardApplied &&

        this.nextInvoiceAmount === 0

    ){

        this.nextInvoiceAmount =
            this.planPrice;

    }

    next();

}

// ====================================
// INDEXES
// ====================================

SubscriptionSchema.index({

    plan:1,

    status:1

});

SubscriptionSchema.index({

    rewardApplied:1

});

SubscriptionSchema.index({

    rewardReferral:1

});

SubscriptionSchema.index({

    renewalDate:1

});

SubscriptionSchema.index({

    expiryDate:1

});

// ====================================
// EXPORT
// ====================================

module.exports =

mongoose.model(

    "Subscription",

    SubscriptionSchema

);
