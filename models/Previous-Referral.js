// ======================================
// models/Referral.js
// Layboka AI Referral Model
// Updated 04 Jun 2026
// ======================================
const mongoose =
require("mongoose");

// ======================================
// REFERRAL SCHEMA
// ======================================

const ReferralSchema =
new mongoose.Schema({

  // ====================================
  // REFERRER
  // ====================================

  referrerClientId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Client",
    required:true,
    index:true
  },

  // ====================================
  // REFERRED CLIENT
  // ====================================

  referredClientId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Client",
    default:null,
    unique:true,
    sparse:true,
    index:true
  },

  referredStore:{
    type:String,
    default:"",
    index:true
  },

  referredPlan:{
    type:String,
    default:"starter"
  },

  // ====================================
// TRACKING
// ====================================

signupDate:{
  type:Date,
  default:null
},

firstPaymentDate:{
  type:Date,
  default:null
},

firstPaymentAmount:{
  type:Number,
  default:0
},

  // ====================================
  // REFERRAL CODE
  // ====================================

  referralCode:{
    type:String,
    required:true,
    index:true
  },

  // ====================================
  // REWARD
  // ====================================

  amount:{
    type:Number,
    default:0
  },

  rewardType:{
    type:String,
    enum:[
      "cash",
      "credit",
      "free_month",
      "upgrade"
    ],
    default:"credit"
  },

  rewarded:{
    type:Boolean,
    default:false
  },

  rewardClaimed:{
    type:Boolean,
    default:false
  },

  rewardClaimedAt:{
    type:Date,
    default:null
  },

  // ====================================
  // PAYMENT
  // ====================================

  paid:{
    type:Boolean,
    default:false
  },

  paidAt:{
    type:Date,
    default:null
  },

  // ====================================
  // STATUS
  // ====================================

  status:{
    type:String,
    enum:[
      "pending",
      "qualified",
      "rewarded",
      "rejected"
    ],
    default:"pending",
    index:true
  },

  // ====================================
  // FRAUD PROTECTION
  // ====================================

  selfReferralBlocked:{
    type:Boolean,
    default:false
  },

  duplicateBlocked:{
    type:Boolean,
    default:false
  }

},
{
  timestamps:true,
  versionKey:false
});

// ======================================
// INDEXES
// ======================================

ReferralSchema.index({
  referrerClientId:1
});

ReferralSchema.index({
  referrerClientId:1,
  status:1
});

ReferralSchema.index({
  referralCode:1
});

ReferralSchema.index({
  referredStore:1
});

ReferralSchema.index({
  status:1
});

// ======================================
// EXPORT
// ======================================

module.exports =
mongoose.model(
  "Referral",
  ReferralSchema
);
