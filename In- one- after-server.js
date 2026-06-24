// ======================================
// server.js
// Layboka AI
// Production Server v4
// Shopify AI Platform
// ======================================

require("dotenv").config();

// ======================================
// NODE MODULES
// ======================================

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");

// ======================================
// APP
// ======================================

const app = express();

const PORT =
process.env.PORT || 3000;

const BASE_URL =
process.env.BASE_URL ||
"https://app.layboka.com";

app.set("trust proxy", 1);

// ======================================
// SECURITY MIDDLEWARE
// ======================================

app.use(

helmet({

crossOriginResourcePolicy:false

})

);

app.use(compression());

app.use(morgan("tiny"));

app.use(cors({

origin:[

"https://layboka.com",

"https://www.layboka.com",

"https://app.layboka.com"

],

credentials:true

}));

// ======================================
// BODY PARSER
// ======================================

app.use(

express.json({

limit:"10mb"

})

);

app.use(

express.urlencoded({

extended:true,

limit:"10mb"

})

);

// ======================================
// STATIC FILES
// ======================================

app.use(

express.static(

path.join(__dirname,"public")

)

);

// ======================================
// RAW WEBHOOK BODY
// ======================================

app.use(

"/webhooks/stripe",

bodyParser.raw({

type:"application/json"

})

);

app.use(

"/shopify/uninstall",

bodyParser.raw({

type:"*/*"

})

);

// ======================================
// UPLOAD DIRECTORY
// ======================================

const uploadDirectory =

path.join(

__dirname,

"public",

"uploads"

);

if(

!fs.existsSync(uploadDirectory)

){

fs.mkdirSync(

uploadDirectory,

{

recursive:true

}

);

}

// ======================================
// MIDDLEWARE
// ======================================

const auth =
require("./middleware/auth");

const adminAuth =
require("./middleware/adminAuth");

const {

globalLimiter

} = require(

"./middleware/rateLimiter"

);

const verifyWebhook =
require(

"./middleware/verifyWebhook"

);

// ======================================
// GLOBAL LIMITER
// ======================================

app.use(globalLimiter);

// ======================================
// DATABASE
// ======================================

mongoose

.connect(

process.env.MONGO_URI,

{

autoIndex:true

}

)

.then(()=>{

console.log(

"✅ MongoDB Connected"

);

})

.catch(error=>{

console.error(

"❌ MongoDB Connection Failed"

);

console.error(

error.message

);

process.exit(1);

});

// ======================================
// MODELS
// ======================================

const Client =
require("./models/Client");

const Product =
require("./models/Product");

const Analytics =
require("./models/Analytics");

const Referral =
require("./models/Referral");

// ======================================
// EMAIL SERVICE
// ======================================

const {

verifySMTP

} = require(

"./services/email"

);

verifySMTP();
// ======================================
// AI ENGINE SERVICES PART 2
// ======================================

const OpenAIService =
require("./src/services/openai.service");

const VectorService =
require("./src/services/vector.service");

const SyncService =
require("./src/services/sync.service");

// ======================================
// AI CONTROLLERS
// ======================================

const ChatController =
require("./src/controllers/chat.controller");

// ======================================
// AI ROUTES
// ======================================

const chatRoutes =
require("./src/routes/chat.routes");

const dashboardRoutes =
require("./src/routes/dashboard.routes");

const knowledgeRoutes =
require("./src/routes/knowledge.routes");

const recommendationRoutes =
require("./src/routes/recommendation.routes");

// ======================================
// EXISTING ROUTES
// ======================================

const cartRoutes =
require("./routes/cart");

const pushRoutes =
require("./routes/push");

const pricingRoutes =
require("./routes/pricing");

const analyticsRoutes =
require("./routes/analytics");

const productRoutes =
require("./routes/products");

const stripeRoutes =
require("./routes/stripeBilling");

const webhookRoutes =
require("./routes/webhooks");

const adminRoutes =
require("./routes/admin");

const referralRoutes =
require("./routes/referral");

// ======================================
// CRON JOBS
// ======================================

require("./cron/abandonedCartCron");

// Future Production Jobs
// require("./cron/renewalCron");
// require("./cron/vectorSyncCron");
// require("./cron/emailReminderCron");

// ======================================
// AI INITIALIZATION
// ======================================

async function initializeAI(){

    try{

        console.log("");
        console.log(
        "======================================"
        );
        console.log(
        "🧠 Initializing Layboka AI Engine"
        );
        console.log(
        "======================================"
        );

        // ==============================
        // OPENAI
        // ==============================

        if(process.env.OPENAI_API_KEY){

            console.log(
            "✅ OpenAI Connected"
            );

        }else{

            console.warn(
            "⚠ OPENAI_API_KEY Missing"
            );

        }

        // ==============================
        // VECTOR DATABASE
        // ==============================

        if(

            typeof VectorService.initialize
            === "function"

        ){

            await VectorService.initialize();

            console.log(
            "✅ Vector Database Ready"
            );

        }

        // ==============================
        // PRODUCT SYNC
        // ==============================

        if(

            typeof SyncService.initialize
            === "function"

        ){

            await SyncService.initialize();

            console.log(
            "✅ Product Sync Ready"
            );

        }

        console.log(
        "🚀 AI Engine Loaded Successfully"
        );

        console.log(
        "======================================"
        );

    }

    catch(error){

        console.error("");

        console.error(
        "❌ AI Initialization Failed"
        );

        console.error(
        error.message
        );

        console.error("");

    }

}

// ======================================
// START AI AFTER DATABASE
// ======================================

mongoose.connection.once(

"open",

async()=>{

    await initializeAI();

}

);
// ======================================
// ROUTE REGISTRATION PART 3
// ======================================

// Legacy Routes

app.use(cartRoutes);

app.use(pushRoutes);

app.use(pricingRoutes);

app.use(analyticsRoutes);

app.use(productRoutes);

app.use(adminRoutes);

app.use(referralRoutes);

// ======================================
// PAYMENT ROUTES
// ======================================

app.use(

"/stripe",

stripeRoutes

);

app.use(

"/webhooks",

webhookRoutes

);

// ======================================
// AI ENGINE ROUTES
// ======================================

app.use(

"/api/chat",

chatRoutes

);

app.use(

"/api/dashboard",

dashboardRoutes

);

app.use(

"/api/knowledge",

knowledgeRoutes

);

app.use(

"/api/recommendations",

recommendationRoutes

);

// ======================================
// ROOT
// ======================================

app.get(

"/",

(req,res)=>{

res.json({

success:true,

application:"Layboka AI",

version:"4.0",

status:"Running",

environment:

process.env.NODE_ENV ||

"development"

});

}

);

// ======================================
// HEALTH CHECK
// ======================================

app.get(

"/health",

async(req,res)=>{

try{

const mongoReady =

mongoose.connection.readyState === 1;

const memory =

process.memoryUsage();

res.json({

success:true,

application:"Layboka AI",

version:"4.0",

status:"Healthy",

services:{

mongodb:mongoReady,

openai:

!!process.env.OPENAI_API_KEY,

vector:

typeof VectorService === "object",

sync:

typeof SyncService === "object",

stripe:

!!process.env.STRIPE_SECRET,

smtp:

!!process.env.SMTP_HOST,

jwt:

!!process.env.JWT_SECRET

},

uptime:

process.uptime(),

memory:{

rss:memory.rss,

heapTotal:memory.heapTotal,

heapUsed:memory.heapUsed

},

timestamp:

new Date()

});

}

catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

}

);

// ======================================
// 404 HANDLER
// ======================================

app.use(

(req,res)=>{

res.status(404).json({

success:false,

message:"API Route Not Found"

});

}

);

// ======================================
// GLOBAL ERROR HANDLER
// ======================================

app.use(

(err,req,res,next)=>{

console.error(err);

res.status(500).json({

success:false,

message:"Internal Server Error"

});

}

);
// ======================================
// LOGIN PART 4
// ======================================

app.post(

"/login",

async(req,res)=>{

try{

const {

clientId

}=req.body;

if(!clientId){

return res.status(400).json({

success:false,

message:"Client ID required"

});

}

const client=

await Client.findById(clientId);

if(!client){

return res.status(404).json({

success:false,

message:"Client not found"

});

}

const token=

createToken({

id:client._id,

store:client.store,

plan:client.plan,

email:client.email

});

res.json({

success:true,

token,

client

});

}

catch(error){

console.error(error);

res.status(500).json({

success:false,

message:"Login Failed"

});

}

}

);

// ======================================
// PROFILE
// ======================================

app.get(

"/
  // ======================================
// PUBLIC CLIENT INFO PART 5
// ======================================

app.get(

"/client/:id",

async(req,res)=>{

try{

const client=

await Client.findById(

req.params.id

).select(

`
store
storeDisplayName
plan
status
paid
messages
orders
revenue
trialEnds
agentName
agentAvatar
referralCode
`

);

if(!client){

return res.status(404).json({

success:false,

message:"Client not found"

});

}

res.json({

success:true,

client

});

}

catch(error){

console.error(error);

res.status(500).json({

success:false,

message:"Unable to fetch client"

});

}

}

);

// ======================================
// UPDATE AGENT NAME
// ======================================

app.post(

"/update-agent-name",

auth,

async(req,res)=>{

try{

const{

agentName

}=req.body;

await Client.findByIdAndUpdate(

req.user.id,

{

agentName:

agentName || "Emma"

}

);

res.json({

success:true,

message:"Agent updated"

});

}

catch(error){

console.error(error);

res.status(500).json({

success:false

});

}

}

);

// ======================================
// UPLOAD AGENT AVATAR
// ======================================

app.post(

"/upload-agent-avatar",

auth,

upload.single("avatar"),

async(req,res)=>{

try{

if(!req.file){

return res.status(400).json({


// ======================================
// UPLOAD AGENT AVATAR PART 6
// ======================================

app.post(

"/upload-agent-avatar",

auth,

upload.single("avatar"),

async(req,res)=>{

try{

if(!req.file){

return res.status(400).json({

success:false,

message:"No image uploaded"

});

}

const avatar=

"/uploads/"+

req.file.filename;

await Client.findByIdAndUpdate(

req.user.id,

{

agentAvatar:avatar

}

);

res.json({

success:true,

avatar

});

}

catch(error){

console.error(error);

res.status(500).json({

success:false,

message:"Avatar upload failed"

});

}

}

);

// ======================================
// UPDATE AGENT SETTINGS
// ======================================

app.post(

"/update-agent-settings",

auth,

async(req,res)=>{

try{

const{

agentName,

storeDisplayName,

agentAvatar

}=req.body;

const client=

await Client.findById(

req.user.id

);

if(!client){

return res.status(404).json({

success:false,

message:"Client not found"

});

}

client.agentName=

agentName ||

client.agentName ||

"Emma";

client.storeDisplayName=

storeDisplayName ||

client.storeDisplayName ||

"";

if(agentAvatar){

client.agentAvatar=

agentAvatar;

}

await client.save();

res.json({

success:true,

message:"Settings Updated",

client

});

}

catch(error){

console.error(error);

res.status(500).json({

success:false,

message:"Unable to update settings"

});

}

}

);

// ======================================
// TRACK CART
// ======================================

app.post(

"/track-cart",

async(req,res)=>{

try{

const{

clientId,

email,

products,

total

}=req.body;

await saveEvent({

type:"abandoned_cart",

clientId,

email,

products,

total

});

res.json({

success:true

});

}

catch(error){

console.error(error);

res.status(500).json({

success:false,

message:"Unable to track cart"

});

}

}

);

// ======================================
// DASHBOARD ANALYTICS
// ======================================

app.get(

"/dashboard-analytics/:clientId",

auth,

async(req,res)=>{

try{

const analytics=

await getAnalytics(

req.params.clientId

);

res.json({

success:true,

analytics

});

}

catch(error){

console.error(error);

res.status(500).json({

success:false,

message:"Analytics unavailable"

});

}

}

);         
// ======================================
// CHAT API PART 7
// AI ENGINE + LEGACY FALLBACK
// ======================================

app.post(

"/chat",

async(req,res,next)=>{

try{

// ======================================
// USE NEW AI ENGINE
// ======================================

if(

process.env.USE_NEW_AI === "true"

){

return ChatController.chat(

req,

res,

next

);

}

// ======================================
// LEGACY CHAT
// ======================================

const{

message,

clientId

}=req.body;

const userMessage=

(message || "").trim();

const lowerMessage=

userMessage.toLowerCase();

// ======================================
// SIMPLE REPLIES
// ======================================

if(

simpleReplies[lowerMessage]

){

return res.json({

success:true,

reply:

simpleReplies[lowerMessage],

aiUsed:false

});

}

// ======================================
// LOAD CLIENT
// ======================================

let client=null;

if(

clientId &&

mongoose.Types.ObjectId.isValid(clientId)

){

client=

await Client.findById(clientId);

}

// ======================================
// ANALYTICS
// ======================================

await saveEvent({

type:"chat",

clientId,

message:userMessage

});

// ======================================
// LOCATION
// ======================================

const ip=

req.headers["x-forwarded-for"] ||

req.socket.remoteAddress ||

"";

const geo=

await detectCountry(ip);

const currency=

getCurrencyFromCountry(

geo.countryCode

);

// ======================================
// STORE INFO
// ======================================

let storeName="our Shopify store";

if(client?.store){

storeName=

client.store.replace(

".myshopify.com",

""

);

}

const agentName=

client?.agentName ||

"Emma";

// ======================================
// PRODUCTS
// ======================================

const products=

await Product.find({

clientId

})

.select(

"title description price image sales"

)

.sort({

sales:-1

})

.limit(5)

.lean();

let productText="";

for(

const product of products

){

const converted=

await convertPrice({

amount:product.price,

from:"USD",

to:currency

});

const formatted=

formatPrice({

amount:converted.amount,

currency

});

productText+=`

Product: ${product.title}

Price: ${formatted}

Description: ${product.description}

`;

}

// ======================================
// DEFAULT REPLY
// ======================================

let reply=

`👋 Welcome to ${storeName}`;
  
