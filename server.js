// ======================================
// shopi-ai/server.js
// Layboka AI
// Production Ready Server
// Part 1
// ======================================

"use strict";

// ======================================
// CORE
// ======================================

require("dotenv").config();

const express =
require("express");

const path =
require("path");

const http =
require("http");

// ======================================
// DATABASE
// ======================================

const mongoose =
require("mongoose");

// ======================================
// SECURITY
// ======================================

const helmet =
require("helmet");

const cors =
require("cors");

const compression =
require("compression");

const morgan =
require("morgan");

// ======================================
// LIMITER
// ======================================

const {
    globalLimiter
} = require("./middleware/rateLimiter");

// ======================================
// APP
// ======================================

const app =
express();

const server =
http.createServer(app);

// ======================================
// PORT
// ======================================

const PORT =

process.env.PORT ||

5000;

// ======================================
// ENVIRONMENT
// ======================================

const NODE_ENV =

process.env.NODE_ENV ||

"development";

// ======================================
// GLOBALS
// ======================================

global.APP_NAME =
"Layboka AI";

global.SERVER_STARTED =
new Date();

// ======================================
// HEALTH CHECK
// ======================================

app.get(

"/",

(req,res)=>{

    res.json({

        success:true,

        application:"Layboka AI",

        environment:NODE_ENV,

        version:"1.0.0",

        status:"Running",

        uptime:

        process.uptime(),

        startedAt:

        global.SERVER_STARTED

    });

});

// ======================================
// NEXT
// ======================================
//
// Part 2
//
// • Helmet
// • CORS
// • Morgan
// • Compression
// • Rate Limiter
// • Static files
// ======================================
// PART 2
// Security Middleware
// Production Ready
// ======================================

// ======================================
// TRUST PROXY
// ======================================

app.set(

    "trust proxy",

    1

);

// ======================================
// HELMET
// ======================================

app.use(

    helmet({

        crossOriginEmbedderPolicy:false,

        contentSecurityPolicy:false

    })

);

// ======================================
// CORS
// ======================================

app.use(

    cors({

        origin:

        [

            process.env.APP_URL,

            process.env.SHOPIFY_APP_URL,

            "https://admin.shopify.com",

            "https://*.myshopify.com"

        ],

        credentials:true,

        methods:[

            "GET",

            "POST",

            "PUT",

            "PATCH",

            "DELETE",

            "OPTIONS"

        ],

        allowedHeaders:[

            "Content-Type",

            "Authorization",

            "X-Shopify-Hmac-Sha256",

            "X-Shopify-Shop-Domain",

            "Stripe-Signature"

        ]

    })

);

// ======================================
// COMPRESSION
// ======================================

app.use(

    compression()

);

// ======================================
// REQUEST LOGGER
// ======================================

app.use(

    morgan(

        NODE_ENV === "production"

        ?

        "combined"

        :

        "dev"

    )

);

// ======================================
// RATE LIMITER
// ======================================

app.use(
    "/api",
    globalLimiter
);

// ======================================
// STATIC FILES
// ======================================

app.use(

    "/public",

    express.static(

        path.join(

            __dirname,

            "public"

        )

    )

);

// ======================================
// NEXT
// ======================================
//
// Part 3
//
// • Stripe raw webhook middleware
// • express.json()
// • express.urlencoded()
// • Request parsing
// ======================================
// PART 3
// Stripe Webhook
// Body Parsers
// Production Ready
// ======================================

// ======================================
// STRIPE WEBHOOK
// MUST BE BEFORE express.json()
// ======================================

const stripeWebhook =
require("./src/webhooks/stripe.webhook");

// Stripe requires RAW body
app.post(

    "/api/webhooks/stripe",

    express.raw({

        type:"application/json"

    }),

    stripeWebhook.webhook

);

// ======================================
// BODY PARSERS
// ======================================

// JSON
app.use(

    express.json({

        limit:"20mb"

    })

);

// URL Encoded
app.use(

    express.urlencoded({

        extended:true,

        limit:"20mb"

    })

);

// ======================================
// REQUEST TIMESTAMP
// ======================================

app.use(

    (req,res,next)=>{

        req.requestTime =

            new Date();

        next();

    }

);

// ======================================
// API RESPONSE HEADERS
// ======================================

app.use(

    (req,res,next)=>{

        res.setHeader(

            "X-Powered-By",

            "Layboka AI"

        );

        res.setHeader(

            "X-App-Version",

            "1.0.0"

        );

        next();

    }

);

// ======================================
// NEXT
// ======================================
//
// Part 4
//
// • Import all routes
// • API routes
// • Subscription routes
// • Referral routes
// • AI routes
// ======================================
// PART 4
// Import Routes
// API Routes
// ======================================

// ======================================
// API ROUTES
// ======================================

// Authentication
const authRoutes =
require("./src/routes/auth.routes");

// Clients
const clientRoutes =
require("./src/routes/client.routes");

// Subscription
const subscriptionRoutes =
require("./src/routes/subscription.routes");

// Referral
const referralRoutes =
require("./src/routes/referral.routes");

// AI
const aiRoutes =
require("./src/routes/ai.routes");

// Chat
const chatRoutes =
require("./src/routes/chat.routes");

// Shopify
const shopifyRoutes =
require("./src/routes/shopify.routes");

// Webhooks
const webhookRoutes =
require("./src/routes/webhook.routes");

// ======================================
// REGISTER ROUTES
// ======================================

app.use(

    "/api/auth",

    authRoutes

);

app.use(

    "/api/client",

    clientRoutes

);

app.use(

    "/api/subscription",

    subscriptionRoutes

);

app.use(

    "/api/referral",

    referralRoutes

);

app.use(

    "/api/ai",

    aiRoutes

);

app.use(

    "/api/chat",

    chatRoutes

);

app.use(

    "/api/shopify",

    shopifyRoutes

);

app.use(

    "/api/webhooks",

    webhookRoutes

);

// ======================================
// API ROOT
// ======================================

app.get(

    "/api",

    (req,res)=>{

        res.json({

            success:true,

            message:

            "Layboka AI API",

            version:

            "1.0.0",

            environment:

            NODE_ENV

        });

    }

);

// ======================================
// NEXT
// ======================================
//
// Part 5
//
// • Chatbot widget
// • Static assets
// • Public loader
// • Health endpoints
// ======================================
// PART 5
// Chatbot Widget
// Static Assets
// Public Loader
// Health Endpoints
// ======================================

// ======================================
// CHATBOT WIDGET
// ======================================

// chatbot.js
app.get(

    "/chatbot.js",

    (req,res)=>{

        res.sendFile(

            path.join(

                __dirname,

                "public",

                "chatbot.js"

            )

        );

    }

);

// chatbot.css
app.get(

    "/chatbot.css",

    (req,res)=>{

        res.sendFile(

            path.join(

                __dirname,

                "public",

                "chatbot.css"

            )

        );

    }

);

// chatbot loader
app.get(

    "/loader.js",

    (req,res)=>{

        res.sendFile(

            path.join(

                __dirname,

                "public",

                "loader.js"

            )

        );

    }

);

// ======================================
// PUBLIC ASSETS
// ======================================

app.use(

    "/assets",

    express.static(

        path.join(

            __dirname,

            "public",

            "assets"

        )

    )

);

// ======================================
// ROBOTS
// ======================================

app.get(

    "/robots.txt",

    (req,res)=>{

        res.sendFile(

            path.join(

                __dirname,

                "public",

                "robots.txt"

            )

        );

    }

);

// ======================================
// FAVICON
// ======================================

app.get(

    "/favicon.ico",

    (req,res)=>{

        res.sendFile(

            path.join(

                __dirname,

                "public",

                "favicon.ico"

            )

        );

    }

);

// ======================================
// SERVER HEALTH
// ======================================

app.get(

    "/health",

    (req,res)=>{

        res.status(200)

        .json({

            success:true,

            server:"healthy",

            uptime:

            process.uptime(),

            environment:

            NODE_ENV,

            timestamp:

            new Date()

        });

    }

);

// ======================================
// NEXT
// ======================================
//
// Part 6
//
// • Shopify App routes
// • Embedded App support
// • SPA fallback
// • Admin frontend
// ======================================
// PART 6
// Shopify App
// Embedded App
// SPA
// Production Ready
// ======================================

// ======================================
// SHOPIFY EMBEDDED APP
// ======================================

app.use(

    "/app",

    express.static(

        path.join(

            __dirname,

            "client",

            "dist"

        )

    )

);

// ======================================
// SHOPIFY APP ENTRY
// ======================================

app.get(

    "/app/*",

    (req,res)=>{

        res.sendFile(

            path.join(

                __dirname,

                "client",

                "dist",

                "index.html"

            )

        );

    }

);

// ======================================
// SHOPIFY OAUTH CALLBACK
// ======================================

app.get(

    "/auth/callback",

    (req,res)=>{

        res.redirect(

            "/app"

        );

    }

);

// ======================================
// ADMIN DASHBOARD
// ======================================

app.get(

    "/dashboard",

    (req,res)=>{

        res.sendFile(

            path.join(

                __dirname,

                "client",

                "dist",

                "index.html"

            )

        );

    }

);

// ======================================
// SPA FALLBACK
// ======================================

app.get(

    "*",

    (req,res,next)=>{

        if(

            req.path.startsWith("/api") ||

            req.path.startsWith("/chatbot") ||

            req.path.startsWith("/loader") ||

            req.path.startsWith("/assets")

        ){

            return next();

        }

        return res.sendFile(

            path.join(

                __dirname,

                "client",

                "dist",

                "index.html"

            )

        );

    }

);

// ======================================
// NEXT
// ======================================
//
// Part 7
//
// • Renewal Cron
// • Referral Jobs
// • Background Workers
// • Scheduler Startup
// ======================================
// PART 7
// Background Jobs
// Cron Scheduler
// Production Ready
// ======================================

// ======================================
// RENEWAL CRON
// ======================================

const renewalCron =
require("./cron/renewalCron");

// ======================================
// REFERRAL JOBS
// ======================================

const referralRewardJob =
require("./src/jobs/referralReward.job");

const referralReminderJob =
require("./src/jobs/referralReminder.job");

// ======================================
// START ALL BACKGROUND SERVICES
// ======================================

async function startBackgroundServices(){

    try{

        console.log(
            "====================================="
        );

        console.log(
            "Starting Background Services..."
        );

        // ------------------------------
        // Renewal Cron
        // ------------------------------

        if(

            renewalCron &&
            renewalCron.start

        ){

            renewalCron.start();

            console.log(
                "✓ Renewal Cron Started"
            );

        }

        // ------------------------------
        // Referral Reward Job
        // ------------------------------

        if(

            referralRewardJob &&
            referralRewardJob.start

        ){

            referralRewardJob.start();

            console.log(
                "✓ Referral Reward Job Started"
            );

        }

        // ------------------------------
        // Referral Reminder Job
        // ------------------------------

        if(

            referralReminderJob &&
            referralReminderJob.start

        ){

            referralReminderJob.start();

            console.log(
                "✓ Referral Reminder Job Started"
            );

        }

        console.log(
            "✓ Background Services Ready"
        );

        console.log(
            "====================================="
        );

    }catch(error){

        console.error(

            "Background Service Error",

            error

        );

    }

}

// ======================================
// STOP ALL BACKGROUND SERVICES
// ======================================

async function stopBackgroundServices(){

    try{

        if(

            renewalCron &&
            renewalCron.stop

        ){

            await renewalCron.stop();

        }

        if(

            referralRewardJob &&
            referralRewardJob.stop

        ){

            await referralRewardJob.stop();

        }

        if(

            referralReminderJob &&
            referralReminderJob.stop

        ){

            await referralReminderJob.stop();

        }

        console.log(

            "Background Services Stopped"

        );

    }catch(error){

        console.error(error);

    }

}

// ======================================
// NEXT
// ======================================
//
// Part 8
//
// • MongoDB Connection
// • Database Events
// • Server Startup
// ======================================
// PART 8
// MongoDB
// Server Startup
// Production Ready
// ======================================

// ======================================
// DATABASE CONNECTION
// ======================================

async function connectDatabase(){

    try{

        await mongoose.connect(

            process.env.MONGODB_URI,

            {

                autoIndex:true,

                maxPoolSize:20,

                minPoolSize:5,

                serverSelectionTimeoutMS:10000,

                socketTimeoutMS:45000

            }

        );

        console.log(

            "✓ MongoDB Connected"

        );

    }catch(error){

        console.error(

            "MongoDB Connection Failed",

            error

        );

        process.exit(1);

    }

}

// ======================================
// DATABASE EVENTS
// ======================================

mongoose.connection.on(

    "connected",

    ()=>{

        console.log(

            "MongoDB Ready"

        );

    }

);

mongoose.connection.on(

    "error",

    (error)=>{

        console.error(

            "MongoDB Error",

            error

        );

    }

);

mongoose.connection.on(

    "disconnected",

    ()=>{

        console.log(

            "MongoDB Disconnected"

        );

    }

);

// ======================================
// SERVER START
// ======================================

async function startServer(){

    try{

        // ------------------------------
        // Database
        // ------------------------------

        await connectDatabase();

        // ------------------------------
        // Background Jobs
        // ------------------------------

        await startBackgroundServices();

        // ------------------------------
        // HTTP Server
        // ------------------------------

        server.listen(

            PORT,

            ()=>{

                console.log(

"======================================"

                );

                console.log(

" Layboka AI Started Successfully"

                );

                console.log(

` Environment : ${NODE_ENV}`

                );

                console.log(

` Port : ${PORT}`

                );

                console.log(

` Time : ${new Date()}`

                );

                console.log(

"======================================"

                );

            }

        );

    }catch(error){

        console.error(

            error

        );

        process.exit(1);

    }

}

// ======================================
// START APPLICATION
// ======================================

startServer();

// ======================================
// NEXT
// ======================================
//
// Part 9
//
// • 404 Handler
// • Global Error Handler
// • Express Error Middleware
// ======================================
// PART 9
// 404 Handler
// Global Error Handler
// Production Ready
// ======================================

// ======================================
// 404 NOT FOUND
// ======================================

app.use(

(req,res,next)=>{

    return res.status(404)

    .json({

        success:false,

        error:"NOT_FOUND",

        message:

        "Requested resource not found.",

        path:req.originalUrl,

        method:req.method,

        timestamp:new Date()

    });

});

// ======================================
// GLOBAL ERROR HANDLER
// ======================================

app.use(

(err,req,res,next)=>{

    console.error(

        "====================================="

    );

    console.error(

        "GLOBAL ERROR"

    );

    console.error(

        err.stack || err

    );

    console.error(

        "====================================="

    );

    const status =

        err.status ||

        err.statusCode ||

        500;

    return res.status(status)

    .json({

        success:false,

        error:

        err.name ||

        "SERVER_ERROR",

        message:

        NODE_ENV==="production"

        ?

        "Internal Server Error"

        :

        err.message,

        timestamp:

        new Date(),

        ...(NODE_ENV!=="production"

        &&{

            stack:

            err.stack

        })

    });

});

// ======================================
// UNCAUGHT EXCEPTION
// ======================================

process.on(

"uncaughtException",

(error)=>{

    console.error(

        "UNCAUGHT EXCEPTION"

    );

    console.error(error);

});

// ======================================
// UNHANDLED PROMISE
// ======================================

process.on(

"unhandledRejection",

(error)=>{

    console.error(

        "UNHANDLED PROMISE"

    );

    console.error(error);

});

// ======================================
// NEXT
// ======================================
// Part 10
// • Graceful shutdown
// • SIGINT
// • SIGTERM
// • Close MongoDB
// • Close HTTP server
// • Production Finish
// ======================================
// PART 10
// Graceful Shutdown
// Production Finish
// ======================================

// ======================================
// GRACEFUL SHUTDOWN
// ======================================

async function gracefulShutdown(signal){

    console.log(

        "====================================="

    );

    console.log(

        `Received ${signal}`

    );

    console.log(

        "Shutting down server..."

    );

    try{

        // ------------------------------
        // Stop Background Jobs
        // ------------------------------

        await stopBackgroundServices();

        // ------------------------------
        // Close HTTP Server
        // ------------------------------

        await new Promise(

            (resolve)=>{

                server.close(

                    ()=>{

                        console.log(

                            "HTTP Server Closed"

                        );

                        resolve();

                    }

                );

            }

        );

        // ------------------------------
        // Close MongoDB
        // ------------------------------

        await mongoose.connection.close();

        console.log(

            "MongoDB Closed"

        );

        console.log(

            "Graceful Shutdown Complete"

        );

        console.log(

        "====================================="

        );

        process.exit(0);

    }catch(error){

        console.error(

            "Shutdown Error",

            error

        );

        process.exit(1);

    }

}

// ======================================
// SIGNALS
// ======================================

process.on(

    "SIGINT",

    ()=>{

        gracefulShutdown(

            "SIGINT"

        );

    }

);

process.on(

    "SIGTERM",

    ()=>{

        gracefulShutdown(

            "SIGTERM"

        );

    }

);

// ======================================
// EXPORT
// ======================================

module.exports = {

    app,

    server

};

// ======================================
// server.js
// PRODUCTION COMPLETE
// ======================================
