// ======================================
// models/Referral.js
// Layboka AI
// Referral Model
// Production Ready
// ======================================

"use strict";

const mongoose =
require("mongoose");

// ======================================
// REWARD TYPES
// ======================================

const RewardTypes = [

    "free_month",

    "credit",

    "cash",

    "upgrade",

    "manual"

];

// ======================================
// STATUS
// ======================================

const Status = [

    "pending",

    "qualified",

    "rewarded",

    "rejected"

];

// ======================================
// SCHEMA
// ======================================

const ReferralSchema =
new mongoose.Schema(

{

// ======================================
// REFERRER
// ======================================

referrerClientId:{

    type:
        mongoose.Schema.Types.ObjectId,

    ref:"Client",

    required:true,

    index:true

},

// ======================================
// REFERRED CLIENT
// ======================================

referredClientId:{

    type:
        mongoose.Schema.Types.ObjectId,

    ref:"Client",

    default:null,

    sparse:true,

    unique:true,

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
// STORE
// ======================================

referredStore:{

    type:String,

    default:"",

    lowercase:true,

    trim:true,

    index:true

},

// ======================================
// PLAN
// ======================================

referredPlan:{

    type:String,

    enum:[

        "starter",

        "growth",

        "premium",

        "enterprise"

    ],

    default:"starter"

},
