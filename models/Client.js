// Models/Client.js
//Layboka 
// Updated 04Jun 2026//

const mongoose = require("mongoose");

// ======================================
// AGENT SCHEMA
// ======================================

const AgentSchema = new mongoose.Schema(
{
name:{
type:String,
default:"Emma"
},

role:{
type:String,
default:"sales"
},

avatar:{
type:String,
default:""
},

active:{
type:Boolean,
default:true
}

},
{
_id:false
}
);

// ======================================
// CLIENT SCHEMA
// ======================================

const ClientSchema =
new mongoose.Schema({
  
// ====================================
// REGION
// ====================================

country: {
  type: String,
  default: "US"
},

primaryMarket: {
  type: String,
  enum: [
    "US",
    "UK",
    "CA",
    "AU"
  ],
  default: "US"
},

// ====================================
// SHOPIFY
// ====================================

shopifyAccessToken: {
  type: String,
  default: ""
},

shopifyGraphqlEnabled: {
  type: Boolean,
  default: true
},

// ====================================
// ENTERPRISE
// ====================================

whiteLabel: {
  type: Boolean,
  default: false
},

customDomain: {
  type: String,
  default: ""
},

// ====================================
// STRIPE
// ====================================

stripeCustomerId: {
  type: String,
  default: ""
},

stripeSubscriptionId: {
  type: String,
  default: ""
},

// ====================================
// RAZORPAY
// ====================================

razorpayCustomerId: {
  type: String,
  default: ""
},

razorpaySubscriptionId: {
  type: String,
  default: ""
},

// ====================================
// AI USAGE
// ====================================

aiMessagesThisMonth: {
  type: Number,
  default: 0
},

aiTokensUsed: {
  type: Number,
  default: 0
},

lastResetAt: {
  type: Date,
  default: Date.now
},

// ====================================
// LIMITS
// ====================================

monthlyMessageLimit: {
  type: Number,
  default: 1000
},

// ====================================
// REVENUE
// ====================================

upsellRevenue: {
  type: Number,
  default: 0
},

crossSellRevenue: {
  type: Number,
  default: 0
},

checkoutRecoveredRevenue: {
  type: Number,
  default: 0
},

// ====================================
// SECURITY
// ====================================

apiKey: {
  type: String,
  default: ""
},

webhookSecret: {
  type: String,
  default: ""
},

// ====================================
// AI
// ====================================

defaultAgent: {
  type: String,
  default: "Emma"
},

aiModel: {
  type: String,
  default: "gpt-4o-mini"
},

// ====================================
// SUBSCRIPTION
// ====================================

nextBillingDate: {
  type: Date
},

cancelAtPeriodEnd: {
  type: Boolean,
  default: false
}
// ====================================
// STORE
// ====================================

store:{
type:String,
required:true,
unique:true,
trim:true,
lowercase:true,
index:true
},

storeDisplayName:{
type:String,
default:""
},

shopifyStoreId:{
type:String,
default:""
},

shopifyConnected:{
type:Boolean,
default:false
},

token:{
type:String,
default:""
},

// ====================================
// OWNER
// ====================================

ownerName:{
type:String,
default:""
},

email:{
type:String,
default:"",
lowercase:true,
index:true
},

phone:{
type:String,
default:""
},

// ====================================
// BRANDING
// ====================================

agentName:{
type:String,
default:"Emma"
},

agentAvatar:{
type:String,
default:""
},

poweredByHidden:{
type:Boolean,
default:false
},

// ====================================
// PLAN
// ====================================

plan:{
type:String,
enum:[
plan:{
  type:String,
  enum:[
    "free",
    "starter",
    "growth",
    "premium",
    "enterprise"
  ],
  default:"free",
  index:true
}

// ====================================
// BILLING
// ====================================

paid:{
type:Boolean,
default:false
},

locked:{
type:Boolean,
default:false
},

status:{
type:String,
enum:[
"trial",
"active",
"paused",
"cancelled",
"payment_failed",
"expired"
],
default:"trial"
},

paymentProvider:{
type:String,
default:""
},

customerId:{
type:String,
default:""
},

subscriptionId:{
type:String,
default:"",
index:true
},

paymentId:{
type:String,
default:""
},

renewalDate:{
type:Number,
default:0
},

// ====================================
// TRIAL
// ====================================

trialStarted:{
type:Date,
default:Date.now
},

trialEnds:{
type:Number,
default:()=>
Date.now() +
(3 * 24 * 60 * 60 * 1000)
},

// ====================================
// REFERRAL
// ====================================

referralCode:{
type:String,
default:"",
index:true
},

referredBy:{
type:String,
default:""
},

referralCount:{
type:Number,
default:0
},

rewardUnlocked:{
type:String,
default:""
},

// ====================================
// ANALYTICS
// ====================================

messages:{
type:Number,
default:0
},

opens:{
type:Number,
default:0
},

conversions:{
type:Number,
default:0
},

recoveredCarts:{
type:Number,
default:0
},

revenue:{
type:Number,
default:0
},

recoveredRevenue:{
type:Number,
default:0
},

aiInfluencedRevenue:{
type:Number,
default:0
},

orders:{
type:Number,
default:0
},

addToCartCount:{
type:Number,
default:0
},

checkoutVisits:{
type:Number,
default:0
},

onlineVisitors:{
type:Number,
default:0
},

// ====================================
// STORE SETTINGS
// ====================================

currency:{
type:String,
default:"USD"
},

timezone:{
type:String,
default:"UTC"
},

onboardingCompleted:{
type:Boolean,
default:false
},

// ====================================
// FEATURES
// ====================================

memoryEnabled:{
type:Boolean,
default:false
},

supportAgentEnabled:{
type:Boolean,
default:false
},

referralEnabled:{
type:Boolean,
default:false
},

whatsappEnabled:{
type:Boolean,
default:false
},

abandonedCartAI:{
type:Boolean,
default:false
},

checkoutCloser:{
type:Boolean,
default:false
},

premiumUI:{
type:Boolean,
default:false
},

loyaltyEnabled:{
type:Boolean,
default:false
},

vipEnabled:{
type:Boolean,
default:false
},

orderTrackingEnabled:{
type:Boolean,
default:false
},

voiceEnabled:{
type:Boolean,
default:false
},

multiAgentEnabled:{
type:Boolean,
default:false
},

// ====================================
// AGENTS
// ====================================

agents:{
type:[AgentSchema],
default:[]
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

ClientSchema.index({
store:1
});

ClientSchema.index({
email:1
});

ClientSchema.index({
referralCode:1
});

ClientSchema.index({
subscriptionId:1
});
ClientSchema.index({
  stripeCustomerId:1
});

ClientSchema.index({
  stripeSubscriptionId:1
});

ClientSchema.index({
  razorpaySubscriptionId:1
});

ClientSchema.index({
  status:1
});

ClientSchema.index({
  plan:1
});

ClientSchema.index({
  nextBillingDate:1
});
// ======================================
// EXPORT
// ======================================

module.exports =
mongoose.model(
"Client",
ClientSchema
);
