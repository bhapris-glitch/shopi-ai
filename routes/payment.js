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
// ======================================
// PART 2
// CREATE CHECKOUT
// ======================================

router.post(

"/create-checkout",

auth,

async(

req,

res

)=>{

try{

const{

plan,

billing,

referralCode

}=req.body;

// ======================================
// VALIDATE PLAN
// ======================================

if(

!validatePlan(plan)

){

return failure(

res,

"Invalid subscription plan."

);

}

const selectedPlan=

getPlan(plan);

let amount=

selectedPlan.price;

// ======================================
// VALIDATE CLIENT
// ======================================

const client=

await Client.findById(

req.user.id

);

if(

!client

){

return failure(

res,

"Client not found.",

404

);

}

// ======================================
// VALIDATE REFERRAL
// ======================================

let referral=null;

if(

referralCode &&

referralCode.trim()!==""


){

referral=

await Referral.findOne({

code:

referralCode

.trim()

.toUpperCase(),

status:{

$ne:"REJECTED"

}

});

if(

!referral

){

return failure(

res,

"Referral code is invalid."

);

}

if(

String(

referral.referrerClientId

)

===

String(

client._id

)

){

return failure(

res,

"You cannot use your own referral code."

);

}

}

// ======================================
// YEARLY DISCOUNT
// ======================================

if(

billing==="yearly"

){

amount=

Math.round(

amount*12*0.80

);

}

// ======================================
// CREATE PAYMENT INTENT
// ======================================

const paymentIntent=

await stripe.paymentIntents.create({

amount,

currency:CURRENCY,

automatic_payment_methods:{

enabled:true

},

metadata:{

clientId:

String(

client._id

),

plan,

billing,

referralCode:

referralCode || ""

}

});

// ======================================
// RESPONSE
// ======================================

return success(

res,

{

clientSecret:

paymentIntent.client_secret,

paymentIntentId:

paymentIntent.id,

amount,

currency:CURRENCY,

plan,

billing

}

);

}

catch(error){

console.error(

"Stripe Checkout Error:",

error

);

return failure(

res,

"Unable to create payment."

);

}

});

// ======================================
// NEXT
// ======================================
//
// PART 3
//
// POST /confirm-payment
//
// • Verify PaymentIntent
// • Create Subscription
// • Create Pending Referral
// • Save Customer
// • Start 15-Day Qualification
// ======================================
// PART 3
// CONFIRM PAYMENT
// ======================================

router.post(

"/confirm-payment",

auth,

async(

req,

res

)=>{

try{

const{

paymentIntentId

}=req.body;

// ======================================
// REQUIRED
// ======================================

if(

!paymentIntentId

){

return failure(

res,

"Payment Intent ID missing."

);

}

// ======================================
// VERIFY STRIPE
// ======================================

const paymentIntent=

await stripe.paymentIntents.retrieve(

paymentIntentId

);

if(

paymentIntent.status!==

"succeeded"

){

return failure(

res,

"Payment has not completed."

);

}

// ======================================
// METADATA
// ======================================

const{

plan,

billing,

referralCode

}=

paymentIntent.metadata;

// ======================================
// CLIENT
// ======================================

const client=

await Client.findById(

req.user.id

);

if(

!client

){

return failure(

res,

"Client not found.",

404

);

}

// ======================================
// CREATE / UPDATE SUBSCRIPTION
// ======================================

let subscription=

await Subscription.findOne({

clientId:

client._id

});

if(

!subscription

){

subscription=

new Subscription({

clientId:

client._id,

store:

client.store ||

"",

email:

client.email ||

""

});

}

subscription.plan=

plan;

subscription.provider=

"stripe";

subscription.customerId=

paymentIntent.customer ||

"";

subscription.paymentId=

paymentIntent.id;

subscription.amount=

paymentIntent.amount/100;

subscription.currency=

paymentIntent.currency.toUpperCase();

subscription.interval=

billing;

subscription.status=

"active";

subscription.paid=true;

subscription.autoRenew=true;

subscription.startDate=

new Date();

subscription.lastPaymentDate=

new Date();

subscription.renewalDate=

new Date(

Date.now()+

30*

24*

60*

60*

1000

);

subscription.expiryDate=

subscription.renewalDate;

await subscription.save();

// ======================================
// REFERRAL
// ======================================

if(

referralCode &&

referralCode!==""


){

const referral=

await Referral.findOne({

code:

referralCode

});

if(

referral

){

referral.referredClientId=

client._id;

referral.subscriptionId=

subscription._id;

referral.status=

"PENDING";

referral.paymentCompleted=true;

referral.paymentCompletedAt=

new Date();

referral.qualificationDate=

new Date(

Date.now()+

15*

24*

60*

60*

1000

);

await referral.save();

}

}

// ======================================
// RESPONSE
// ======================================

return success(

res,

{

message:

"Payment confirmed.",

subscriptionId:

subscription._id,

plan,

status:

subscription.status

}

);

}

catch(error){

console.error(

"Confirm Payment:",

error

);

return failure(

res,

"Payment confirmation failed."

);

}

});

// ======================================
// NEXT
// ======================================
//
// PART 4
//
// • Stripe Webhook
// • payment_intent.succeeded
// • invoice.paid
// • invoice.payment_failed
// • customer.subscription.updated
// • customer.subscription.deleted
// ======================================
// PART 4
// STRIPE WEBHOOK
// Production Ready
// ======================================

// ======================================
// WEBHOOK
// ======================================

router.post(

"/webhook",

express.raw({

type:"application/json"

}),

async(

req,

res

)=>{

let event;

try{

const signature =

req.headers[

"stripe-signature"

];

event =

stripe.webhooks.constructEvent(

req.body,

signature,

process.env

.STRIPE_WEBHOOK_SECRET

);

}catch(error){

console.error(

"Webhook Signature Error:",

error.message

);

return res

.status(400)

.send(

`Webhook Error: ${error.message}`

);

}

// ======================================
// PAYMENT SUCCESS
// ======================================

if(

event.type===

"payment_intent.succeeded"

){

const paymentIntent =

event.data.object;

console.log(

"Payment Success:",

paymentIntent.id

);

}

// ======================================
// INVOICE PAID
// ======================================

if(

event.type===

"invoice.paid"

){

const invoice=

event.data.object;

const subscription=

await Subscription.findOne({

customerId:

invoice.customer

});

if(subscription){

subscription.status=

"active";

subscription.paid=true;

subscription.lastPaymentDate=

new Date();

subscription.renewalsCount+=1;

subscription.renewalReminderSent=false;

subscription.nextReminderSent=false;

subscription.renewalDate=

new Date(

invoice.lines.data[0]

.period.end*1000

);

subscription.expiryDate=

subscription.renewalDate;

await subscription.save();

}

}

// ======================================
// PAYMENT FAILED
// ======================================

if(

event.type===

"invoice.payment_failed"

){

const invoice=

event.data.object;

const subscription=

await Subscription.findOne({

customerId:

invoice.customer

});

if(subscription){

subscription.status=

"payment_failed";

subscription.paid=false;

subscription.locked=true;

await subscription.save();

}

}

// ======================================
// SUBSCRIPTION UPDATED
// ======================================

if(

event.type===

"customer.subscription.updated"

){

const stripeSubscription=

event.data.object;

const subscription=

await Subscription.findOne({

subscriptionId:

stripeSubscription.id

});

if(subscription){

subscription.status=

stripeSubscription.status==="active"

?

"active"

:

subscription.status;

subscription.autoRenew=

!stripeSubscription.cancel_at_period_end;

subscription.renewalDate=

new Date(

stripeSubscription.current_period_end

*1000

);

subscription.expiryDate=

subscription.renewalDate;

await subscription.save();

}

}

// ======================================
// SUBSCRIPTION DELETED
// ======================================

if(

event.type===

"customer.subscription.deleted"

){

const stripeSubscription=

event.data.object;

const subscription=

await Subscription.findOne({

subscriptionId:

stripeSubscription.id

});

if(subscription){

subscription.status=

"cancelled";

subscription.autoRenew=false;

subscription.cancelledAt=

new Date();

subscription.locked=true;

await subscription.save();

}

}

// ======================================
// SEND RESPONSE
// ======================================

return res.json({

received:true

});

});

// ======================================
// NEXT
// ======================================
//
// PART 5
//
// • Billing Portal
// • Cancel Subscription
// • Resume Subscription
// • Get Subscription
// • Security
// • Export Router
// ======================================
// PART 5
// Billing Portal
// Subscription APIs
// Production Ready
// ======================================

// ======================================
// GET SUBSCRIPTION
// ======================================

router.get(

"/subscription",

auth,

async(

req,

res

)=>{

try{

const subscription=

await Subscription.findOne({

clientId:req.user.id

});

if(!subscription){

return failure(

res,

"Subscription not found.",

404

);

}

return success(

res,

{

subscription

}

);

}catch(error){

console.error(

error

);

return failure(

res,

"Unable to fetch subscription."

);

}

});

// ======================================
// CANCEL SUBSCRIPTION
// ======================================

router.post(

"/cancel",

auth,

async(

req,

res

)=>{

try{

const subscription=

await Subscription.findOne({

clientId:req.user.id

});

if(!subscription){

return failure(

res,

"Subscription not found."

);

}

if(

subscription.subscriptionId

){

await stripe.subscriptions.update(

subscription.subscriptionId,

{

cancel_at_period_end:true

}

);

}

subscription.autoRenew=false;

subscription.status="cancelled";

subscription.cancelledAt=new Date();

await subscription.save();

return success(

res,

{

message:

"Subscription cancelled successfully."

}

);

}catch(error){

console.error(

error

);

return failure(

res,

"Unable to cancel subscription."

);

}

});

// ======================================
// RESUME SUBSCRIPTION
// ======================================

router.post(

"/resume",

auth,

async(

req,

res

)=>{

try{

const subscription=

await Subscription.findOne({

clientId:req.user.id

});

if(!subscription){

return failure(

res,

"Subscription not found."

);

}

if(

subscription.subscriptionId

){

await stripe.subscriptions.update(

subscription.subscriptionId,

{

cancel_at_period_end:false

}

);

}

subscription.autoRenew=true;

subscription.status="active";

subscription.cancelledAt=null;

await subscription.save();

return success(

res,{

message:

"Subscription resumed."

}

);

}catch(error){

console.error(

error

);

return failure(

res,

"Unable to resume subscription."

);

}

});

// ======================================
// BILLING PORTAL
// ======================================

router.post(

"/billing-portal",

auth,

async(

req,

res

)=>{

try{

const subscription=

await Subscription.findOne({

clientId:req.user.id

});

if(

!subscription ||

!subscription.customerId

){

return failure(

res,

"Customer not found."

);

}

const session=

await stripe.billingPortal.sessions.create({

customer:

subscription.customerId,

return_url:

process.env.APP_URL+

"/dashboard"

});

return success(

res,

{

url:

session.url

}

);

}catch(error){

console.error(

error

);

return failure(

res,

"Unable to create billing portal."

);

}

});

// ======================================
// HEALTH
// ======================================

router.get(

"/health",

(req,res)=>{

return success(

res,

{

service:

"Stripe Payment API",

status:

"Running"

}

);

});

// ======================================
// EXPORT
// ======================================

module.exports=

router;


