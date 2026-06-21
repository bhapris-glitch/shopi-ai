// ======================================
// controllers/chat.controller.js
// Layboka AI
// Production Ready
// PART 1
// ======================================

const crypto =
require("crypto");

const AIService =
require("../services/ai.service");

const PromptService =
require("../services/prompt.service");

const OpenAIService =
require("../services/openai.service");

const IntentService =
require("../services/intent.service");

const MemoryService =
require("../services/memory.service");

const KnowledgeService =
require("../services/knowledge.service");

const RecommendationService =
require("../services/recommendation.service");

const ShopifyService =
require("../services/shopify.service");

const VectorService =
require("../services/vector.service");

const Conversation =
require("../models/Conversation");

const Customer =
require("../models/Customer");

const Store =
require("../models/Store");

const Analytics =
require("../models/Analytics");

const Product =
require("../models/Product");

const Recommendation =
require("../models/Recommendation");

// ======================================
// CONFIG
// ======================================

const MAX_HISTORY = 12;

const MAX_KNOWLEDGE = 10;

const MAX_PRODUCTS = 6;

const MAX_RESPONSE_TIME = 20000;

// ======================================
// CREATE SESSION
// ======================================

function createSession(){

    return crypto

        .randomBytes(16)

        .toString("hex");

}

// ======================================
// SAFE STRING
// ======================================

function cleanText(text){

    if(!text){

        return "";

    }

    return String(text)

        .replace(/\s+/g," ")

        .trim();

}

// ======================================
// SHOP
// ======================================

function getShop(req){

    return (

        req.headers["x-shop-domain"]

        ||

        req.body.shop

        ||

        req.query.shop

        ||

        ""

    ).toLowerCase();

}

// ======================================
// CLIENT ID
// ======================================

function getClientId(req){

    return (

        req.body.clientId

        ||

        req.body.customerId

        ||

        req.headers["x-client-id"]

        ||

        ""

    );

}

// ======================================
// SESSION
// ======================================

function getSessionId(req){

    return (

        req.body.sessionId

        ||

        createSession()

    );

}

// ======================================
// REQUEST IP
// ======================================

function getIP(req){

    return (

        req.headers["x-forwarded-for"]

        ||

        req.socket.remoteAddress

        ||

        ""

    );

}

// ======================================
// USER AGENT
// ======================================

function getUserAgent(req){

    return (

        req.headers["user-agent"]

        ||

        ""

    );

}

// ======================================
// RESPONSE
// ======================================

function success(

    res,

    data

){

    return res.status(200).json({

        success:true,

        ...data

    });

}

function failure(

    res,

    message,

    code=500

){

    return res.status(code).json({

        success:false,

        error:message

    });

}
// ======================================
// MAIN CHAT
// Main Chat Endpoint (Validation + Store + Customer + Session)
// PART 2
// ======================================

exports.chat =
async(

    req,

    res

)=>{

    try{

        // ==============================
        // REQUEST
        // ==============================

        const shop =

            getShop(req);

        const message =

            cleanText(

                req.body.message

            );

        const clientId =

            getClientId(req);

        const sessionId =

            getSessionId(req);

        const ip =

            getIP(req);

        const userAgent =

            getUserAgent(req);

        // ==============================
        // VALIDATION
        // ==============================

        if(

            !shop

        ){

            return failure(

                res,

                "Missing shop.",

                400

            );

        }

        if(

            !message

        ){

            return failure(

                res,

                "Empty message.",

                400

            );

        }

        // ==============================
        // STORE
        // ==============================

        const store =

            await Store.findOne({

                shop

            });

        if(

            !store

        ){

            return failure(

                res,

                "Store not found.",

                404

            );

        }

        if(

            store.active===false

        ){

            return failure(

                res,

                "Store inactive.",

                403

            );

        }

        // ==============================
        // CUSTOMER
        // ==============================

        let customer = null;

        if(clientId){

            customer =

                await Customer.findOne({

                    clientId

                });

        }

        // ==============================
        // ANALYTICS
        // ==============================

        Analytics.create({

            shop,

            clientId,

            sessionId,

            event:"chat_open",

            ip,

            userAgent,

            createdAt:new Date()

        }).catch(()=>{});

        // ==============================
        // PLACEHOLDERS
        // (Filled in Part 3)
        // ==============================

        let memory = [];

        let knowledge = [];

        let recommendations = [];

        let products = [];

        let intent = {

            name:"general",

            confidence:1

        };

        let aiReply = "";
              // ==============================
        // LOAD MEMORY
        // ==============================

        try{

            memory =

                await MemoryService.getMemory({

                    shop,

                    sessionId,

                    clientId

                });

        }

        catch(error){

            console.error(

                "[MEMORY
      
