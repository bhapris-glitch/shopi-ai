// ======================================
// routes/chat.js
// Layboka AI Chat Router
// Production Ready
// Part 1 / 5 - (723 lines)
// Updated Jun 2026
// ======================================

const express = require("express");

const router = express.Router();

// ======================================
// MODELS
// ======================================

const Client =
require("../models/Client");

const Product =
require("../models/Product");

const Conversation =
require("../models/Conversation");

const Subscription =
require("../models/Subscription");

// ======================================
// SERVICES
// ======================================

const {

generateAIResponse,
analyzeCustomerIntent

} = require("../services/ai");

// ======================================
// MIDDLEWARE
// ======================================

const subscriptionMiddleware =
require("../middleware/subscription");

// ======================================
// HELPERS
// ======================================

// Active subscription
async function getSubscription(clientId){

return Subscription.findOne({

clientId,

status:{
$in:[
"trial",
"active"
]

}

});

}

// Load products
async function loadProducts(clientId){

return Product.find({

clientId,

active:true

})

.sort({

recommended:-1,

popularityScore:-1,

conversionScore:-1

})

.limit(50)

.lean();

}

// Load previous conversation
async function loadConversation(

clientId,
customerId,
email

){

if(customerId){

return Conversation.findOne({

clientId,

customerId

});

}

if(email){

return Conversation.findOne({

clientId,

email

});

}

return null;

}

// Create conversation
async function createConversation({

clientId,

customerId,

customerName,

email

}){

return Conversation.create({

clientId,

customerId,

customerName,

email,

platform:"website",

messages:[]

});

}
// ======================================
// CHAT
// POST /chat - PART - 2
// ======================================

router.post(

"/",

subscriptionMiddleware,

async (req,res)=>{

try{

const{

clientId,

message,

customerId,

customerName,

email,

cartItems=[],

viewedProducts=[]

}=req.body;

// ==============================
// VALIDATION
// ==============================

if(!clientId){

return res.status(400).json({

success:false,

reply:"Client ID is required."

});

}

if(!message){

return res.status(400).json({

success:false,

reply:"Message is required."

});

}

// ==============================
// CLIENT
// ==============================

const client=

await Client.findById(clientId);

if(!client){

return res.status(404).json({

success:false,

reply:"Store not found."

});

}

// ==============================
// SUBSCRIPTION
// ==============================

const subscription=

await getSubscription(client._id);

// Trial expired

if(

client.trialEnds &&

new Date(client.trialEnds)<new Date() &&

!subscription

){

return res.json({

success:false,

locked:true,

reply:

`🚫 Your 7-day AI Sales Agent trial has ended.

Upgrade your plan to continue using your AI Sales Agent.`

});

}

// ==============================
// CONVERSATION
// ==============================

let conversation=

await loadConversation(

client._id,

customerId,

email

);

if(!conversation){

conversation=

await createConversation({

clientId:client._id,

customerId,

customerName,

email

});

}

// ==============================
// PRODUCTS
// ==============================

const products=

await loadProducts(

client._id

);

// ==============================
// CUSTOMER INTENT
// ==============================

const intent=

await analyzeCustomerIntent(

message

);

// ==============================
// AI RESPONSE
// ==============================

const ai=

await generateAIResponse({

clientId:client._id,

conversationId:

conversation._id,

userMessage:message,

cartItems,

viewedProducts

});

let reply=

ai.reply||"I'm here to help.";

let recommendedProducts=

ai.products||[];
  // ==============================
// SAVE CUSTOMER MESSAGE - Part 3
// ==============================

conversation.messages.push({

sender:"customer",

message,

platform:"website",

createdAt:new Date()

});

// ==============================
// SAVE AI MESSAGE
// ==============================

conversation.messages.push({

sender:"ai",

message:reply,

platform:"website",

agentName:
client.agentName ||
"AI Assistant",

createdAt:new Date()

});

// ==============================
// UPDATE CONVERSATION
// ==============================

conversation.customerName =
customerName ||
conversation.customerName;

conversation.email =
email ||
conversation.email;

conversation.totalMessages =
conversation.messages.length;

conversation.lastIntent =
intent;

conversation.updatedAt =
new Date();

if(cartItems.length){

conversation.addedToCart = true;

}

await conversation.save();

// ==============================
// CLIENT ANALYTICS
// ==============================

client.messages =
(client.messages || 0) + 1;

client.lastSeenAt =
new Date();

client.lastMessage =
message;

await client.save();

// ==============================
// RESPONSE
// ==============================

return res.json({

success:true,

reply,

products:
recommendedProducts,

conversationId:
conversation._id,

agentName:
client.agentName ||
"AI Assistant",

plan:
client.plan,

trial:
subscription?.status ===
"trial"

});
  // ==============================
// ERROR HANDLER - Part 4 -
// ==============================

}catch(error){

console.error(
"CHAT ERROR:",
error
);

return res.status(500).json({

success:false,

reply:
"⚠️ AI server temporarily unavailable."

});

}

});

// ======================================
// TRACK CHAT OPEN
// POST /track-open
// ======================================

router.post(

"/track-open",

async(req,res)=>{

try{

const{

clientId

}=req.body;

if(!clientId){

return res.json({

success:false

});

}

await Client.findByIdAndUpdate(

clientId,

{

$inc:{
opens:1
},

lastSeenAt:
new Date()

}

);

return res.json({

success:true

});

}catch(error){

console.error(

"TRACK OPEN:",

error

);

return res.json({

success:false

});

}

});

// ======================================
// SAVE CART RECOVERY
// POST /cart-recovery
// ======================================

router.post(

"/cart-recovery",

async(req,res)=>{

try{

const{

clientId,

email,

cart

}=req.body;

if(!clientId){

return res.json({

success:false

});

}

await Client.findByIdAndUpdate(

clientId,

{

abandonedCart:true,

abandonedEmail:
email || "",

abandonedItems:
cart || [],

lastSeenAt:
new Date()

}

);

return res.json({

success:true

});

}catch(error){

console.error(

"CART RECOVERY:",

error

);

return res.json({

success:false

});

}

});
// ======================================
// HEALTH CHECK
// GET /ping - Part 5 -
// ======================================

router.get(

"/ping",

(req,res)=>{

return res.json({

success:true,

service:"Layboka AI Chat",

version:"2.0",

model:

process.env.OPENAI_MODEL ||

"gpt-4o-mini",

timestamp:new Date(),

status:"online"

});

});

// ======================================
// AI STATUS
// GET /status
// ======================================

router.get(

"/status",

(req,res)=>{

return res.json({

success:true,

ai:true,

chatbot:true,

subscriptions:true,

cartRecovery:true,

checkoutCloser:true,

productRecommendation:true,

trialSupport:true,

premiumSupport:true

});

});

// ======================================
// EXPORT
// ======================================

module.exports = router;
