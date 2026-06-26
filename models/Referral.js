// ======================================
// models/Referral.js
// Layboka AI Referral Model
// Production Ready
// Part 1/2
// ======================================

"use strict";

// ======================================
// IMPORTS
// ======================================

const mongoose = require("mongoose");

// ======================================
// CONSTANTS
// ======================================

const STATUS = [
    "pending",
    "qualified",
    "rewarded",
    "rejected"
];

const REWARD_TYPES = [
    "free_month",
    "credit",
    "cash",
    "upgrade",
    "manual"
];

const PLANS = [
    "starter",
    "growth",
    "premium",
    "enterprise"
];

// ======================================
// REFERRAL SCHEMA
// ======================================

const ReferralSchema = new mongoose.Schema(

{

// ======================================
// REFERRER
// ======================================

referrerClientId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Client",
    required:true,
    index:true
},

// ======================================
// REFERRED CLIENT
// ======================================

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
    trim:true,
    lowercase:true,
    index:true
},

referredEmail:{
    type:String,
    default:"",
    trim:true,
    lowercase:true
},

referredPlan:{
    type:String,
    enum:PLANS,
    default:"starter",
    index:true
},

// ======================================
// REFERRAL CODE
// ======================================

referralCode:{
    type:String,
    required:true,
    uppercase:true,
    trim:true,
    unique:true,
    index:true
},

// ======================================
// TRACKING
// ======================================

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

qualifiedAt:{
    type:Date,
    default:null
},

rewardedAt:{
    type:Date,
    default:null
},

// ======================================
// STATUS
// ======================================

status:{
    type:String,
    enum:STATUS,
    default:"pending",
    index:true
},

rejectReason:{
    type:String,
    default:""
},

// ======================================
// PAYMENT
// ======================================

paid:{
    type:Boolean,
    default:false
},

paidAt:{
    type:Date,
    default:null
},

// ======================================
// REWARD
// ======================================

rewardStatus:{
    type:String,
    enum:STATUS,
    default:"pending",
    index:true
},

rewardType:{
    type:String,
    enum:REWARD_TYPES,
    default:"credit"
},

rewardValue:{
    type:Number,
    default:0
},

rewardAmount:{
    type:Number,
    default:0
},

rewardMonths:{
    type:Number,
    default:0
},

rewardClaimed:{
    type:Boolean,
    default:false
},

rewardClaimedAt:{
    type:Date,
    default:null
},

vipLevel:{
    type:Number,
    default:0
},

manualReview:{
    type:Boolean,
    default:false
},

// ======================================
// UPGRADE DISCOUNT
// ======================================

upgradeDiscountGranted:{
    type:Boolean,
    default:true
},

upgradeDiscountUsed:{
    type:Boolean,
    default:false
},

upgradeDiscountPercent:{
    type:Number,
    default:30
},

// ======================================
// FRAUD PROTECTION
// ======================================

selfReferralBlocked:{
    type:Boolean,
    default:false
},

duplicateBlocked:{
    type:Boolean,
    default:false
},

fraudScore:{
    type:Number,
    default:0
},

fraudReason:{
    type:String,
    default:""
},

// ======================================
// INTERNAL
// ======================================

notes:{
    type:String,
    default:""
}

},

{

timestamps:true,

versionKey:false

}

);

// ======================================
// INDEXES
// ======================================

ReferralSchema.index({
    referrerClientId:1,
    status:1
});

ReferralSchema.index({
    referrerClientId:1,
    rewardStatus:1
});

ReferralSchema.index({
    referredClientId:1
});

ReferralSchema.index({
    referredStore:1
});

ReferralSchema.index({
    referralCode:1
});

ReferralSchema.index({
    rewardedAt:1
});

ReferralSchema.index({
    qualifiedAt:1
});

// ======================================
// PART 2
// Remaining:
//
// • Virtuals
// • Methods
// • Static helpers
// • Validation hooks
// • Export
// ======================================
// ======================================
// VIRTUALS - PART 2
// ======================================

ReferralSchema.virtual("isQualified").get(function(){

    return this.status === "qualified";

});

ReferralSchema.virtual("isRewarded").get(function(){

    return this.rewardStatus === "rewarded";

});

ReferralSchema.virtual("isRejected").get(function(){

    return this.status === "rejected";

});

// ======================================
// INSTANCE METHODS
// ======================================

ReferralSchema.methods.markQualified = async function(){

    this.status = "qualified";
    this.qualifiedAt = new Date();

    return this.save();

};

ReferralSchema.methods.markRewarded = async function(

    rewardType,
    rewardValue = 0,
    rewardAmount = 0,
    rewardMonths = 0

){

    this.rewardStatus = "rewarded";
    this.status = "rewarded";

    this.rewardType = rewardType;

    this.rewardValue = rewardValue;
    this.rewardAmount = rewardAmount;
    this.rewardMonths = rewardMonths;

    this.rewardedAt = new Date();

    return this.save();

};

ReferralSchema.methods.markRejected = async function(reason){

    this.status = "rejected";
    this.rewardStatus = "rejected";
    this.rejectReason = reason || "";

    return this.save();

};

ReferralSchema.methods.claimReward = async function(){

    this.rewardClaimed = true;
    this.rewardClaimedAt = new Date();

    return this.save();

};

ReferralSchema.methods.consumeUpgradeDiscount = async function(){

    this.upgradeDiscountUsed = true;

    return this.save();

};

// ======================================
// STATIC METHODS
// ======================================

ReferralSchema.statics.findByCode = function(code){

    return this.findOne({

        referralCode:String(code)
            .trim()
            .toUpperCase()

    });

};

ReferralSchema.statics.findPending = function(){

    return this.find({

        status:"pending"

    });

};

ReferralSchema.statics.findQualified = function(){

    return this.find({

        status:"qualified"

    });

};

ReferralSchema.statics.findRewarded = function(){

    return this.find({

        rewardStatus:"rewarded"

    });

};

ReferralSchema.statics.findRejected = function(){

    return this.find({

        status:"rejected"

    });

};

// ======================================
// PRE SAVE
// ======================================

ReferralSchema.pre("save",function(next){

    if(this.referralCode){

        this.referralCode =

            this.referralCode
            .trim()
            .toUpperCase();

    }

    if(this.referredStore){

        this.referredStore =

            this.referredStore
            .trim()
            .toLowerCase();

    }

    if(this.referredEmail){

        this.referredEmail =

            this.referredEmail
            .trim()
            .toLowerCase();

    }

    next();

});

// ======================================
// JSON SETTINGS
// ======================================

ReferralSchema.set("toJSON",{

    virtuals:true

});

ReferralSchema.set("toObject",{

    virtuals:true

});

// ======================================
// EXPORT
// ======================================

module.exports =

mongoose.model(

    "Referral",

    ReferralSchema

);
