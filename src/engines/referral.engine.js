// ======================================
// src/engines/referral.engine.js
// Layboka AI
// Referral Business Engine
// Production Ready
// ======================================

"use strict";

// ======================================
// IMPORTS
// ======================================

const mongoose = require("mongoose");

const Client = require("../../models/Client");
const Referral = require("../../models/Referral");
const Subscription = require("../../models/Subscription");

// ======================================
// CONSTANTS
// ======================================

const REFERRAL_ACTIVE_DAYS = 15;

const GROWTH_PLAN = "growth";
const PREMIUM_PLAN = "premium";
const ENTERPRISE_PLAN = "enterprise";

const REWARD_TYPES = {

FREE_MONTH: "free_month",

UPGRADE: "upgrade",

CREDIT: "credit",

CASH: "cash"

};

const STATUS = {

PENDING: "pending",

QUALIFIED: "qualified",

REWARDED: "rewarded",

REJECTED: "rejected"

};

// ======================================
// GROWTH PLAN REWARD
// ======================================

const GROWTH_REWARD = {

plan: GROWTH_PLAN,

rewardType: REWARD_TYPES.FREE_MONTH,

minimumDays: 15,

nextInvoiceAmount: 0,

rewardValue: 89

};

// ======================================
// PREMIUM VIP PROGRAM
// ======================================

const PREMIUM_REWARD_TABLE = {

1:{

rewardType:"credit",

amount:50

},

2:{

rewardType:"credit",

amount:100

},

3:{

rewardType:"upgrade",

upgradeMonths:1

},

5:{

rewardType:"upgrade",

upgradeMonths:2

},

10:{

rewardType:"cash",

amount:500

}

};

// ======================================
// ENTERPRISE REWARD
// ======================================

const ENTERPRISE_REWARD = {

rewardType:"cash",

amount:1000

};

// ======================================
// DATE HELPERS
// ======================================

function now(){

return new Date();

}

function addDays(date,days){

const d = new Date(date);

d.setDate(d.getDate()+days);

return d;

}

function diffDays(start,end){

const oneDay = 1000*60*60*24;

return Math.floor(

(end-start)/oneDay

);

}

// ======================================
// OBJECT ID
// ======================================

function isValidObjectId(id){

return mongoose.Types.ObjectId.isValid(id);

}

// ======================================
// NORMALIZE STORE
// ======================================

function normalizeStore(store=""){

return store

.trim()

.toLowerCase()

.replace("https://","")

.replace("http://","")

.replace("www.","")

.split("/")[0];

}

// ======================================
// REFERRAL CODE
// ======================================

function normalizeReferralCode(code=""){

return code

.trim()

.toUpperCase();

}

// ======================================
// ELIGIBILITY
// ======================================

function hasCompletedMinimumDays(subscription){

if(!subscription)

return false;

if(!subscription.startDate)

return false;

const days = diffDays(

new Date(subscription.startDate),

now()

);

return days >= REFERRAL_ACTIVE_DAYS;

}

// ======================================
// ACTIVE SUBSCRIPTION
// ======================================

function isSubscriptionEligible(subscription){

if(!subscription)

return false;

if(subscription.status !== "active")

return false;

if(subscription.locked)

return false;

if(subscription.paymentFailed)

return false;

return true;

}

// ======================================
// GROWTH PLAN
// ======================================

function isGrowth(subscription){

return (

subscription.plan === GROWTH_PLAN

);

}

// ======================================
// PREMIUM PLAN
// ======================================

function isPremium(subscription){

return (

subscription.plan === PREMIUM_PLAN

);

}

// ======================================
// ENTERPRISE
// ======================================

function isEnterprise(subscription){

return (

subscription.plan === ENTERPRISE_PLAN

);

}

// ======================================
// DUPLICATE REFERRAL
// ======================================

async function alreadyReferred(clientId){

return await Referral.findOne({

referredClientId:clientId

});

}

// ======================================
// SAME STORE
// ======================================

async function duplicateStore(store){

return await Referral.findOne({

referredStore:

normalizeStore(store)

});

}

// ======================================
// VALID REFERRAL
// ======================================

async function getReferralByCode(code){

return await Referral.findOne({

referralCode:

normalizeReferralCode(code)

});

}

// ======================================
// SELF REFERRAL
// ======================================

function isSelfReferral(

referrer,

referred

){

return (

String(referrer)

===

String(referred)

);

}

// ======================================
// NEXT PART
// ======================================
// Part 2:
//
// • createReferral()
// • registerReferral()
// • fraud protection
// • signup tracking
// • first payment tracking
