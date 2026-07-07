// ======================================
// routes/payment.js
// Layboka AI
// Stripe Payment Router
// Production Ready
// PART 1
// ======================================

"use strict";

// ======================================
// CORE
// ======================================

const express =
require("express");

const router =
express.Router();

// ======================================
// STRIPE
// ======================================

const Stripe =
require("stripe");

const stripe =
Stripe(

process.env.STRIPE_SECRET_KEY

);

// ======================================
// MODELS
// ======================================

const Client =
require("../models/Client");

const Subscription =
require("../models/Subscription");

const Referral =
require("../models/Referral");

// ======================================
// MIDDLEWARE
// ======================================

const auth =
require("../middleware/auth");

// ======================================
// CONFIG
// ======================================

const CURRENCY =
"usd";

// ======================================
// PLANS
// ======================================

const PLANS = {

starter:{

name:"Starter",

price:2500,

interval:"month"

},

growth:{

name:"Growth",

price:5900,

interval:"month"

},

premium:{

name:"Premium",

price:14900,

interval:"month"

}

};

// ======================================
// HELPERS
// ======================================

function getPlan(

plan

){

return PLANS[plan] || null;

}

// ======================================
// VALID PLAN
// ======================================

function validatePlan(

plan

){

return Object.keys(

PLANS

).includes(

plan

);

}

// ======================================
// RESPONSE
// ======================================

function success(

res,

data

){

return res.status(200)

.json({

success:true,

...data

});

}

function failure(

res,

message,

status=400

){

return res.status(status)

.json({

success:false,

message

});

}

// ======================================
// NEXT
// ======================================
//
// PART 2
//
// POST /api/payment/create-checkout
//
// • Validate User
// • Validate Plan
// • Validate Referral
// • Calculate Amount
// • Create Stripe Payment Intent
// • Return clientSecret
//
