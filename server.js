// ======================================
// server.js
// Layboka AI
// Production Server Bootstrap
// Part 1
// ======================================

"use strict";

require("dotenv").config();

// ======================================
// CORE
// ======================================

const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const morgan = require("morgan");

// ======================================
// APP
// ======================================

const app = express();

// ======================================
// DATABASE
// ======================================

async function connectDB(){

    try{

        await mongoose.connect(

            process.env.MONGO_URI

        );

        console.log("✅ MongoDB Connected");

    }catch(err){

        console.error(

            "MongoDB Error:",

            err.message

        );

        process.exit(1);

    }

}

// ======================================
// SECURITY
// ======================================

app.use(

    helmet({

        crossOriginResourcePolicy:false

    })

);

app.use(

    cors({

        origin:true,

        credentials:true

    })

);

app.use(compression());

app.use(morgan("dev"));

app.use(

    express.json({

        limit:"20mb"

    })

);

app.use(

    express.urlencoded({

        extended:true,

        limit:"20mb"

    })

);

// ======================================
// HEALTH
// ======================================

app.get("/health",(req,res)=>{

    res.json({

        success:true,

        status:"OK",

        service:"Layboka AI",

        version:"2.0.0",

        uptime:process.uptime(),

        timestamp:new Date()

    });

});

// ======================================
// ROOT
// ======================================

app.get("/",(req,res)=>{

    res.json({

        success:true,

        message:"Layboka AI API Running"

    });

});

// ======================================
// PART 2
// Route imports
// Middleware imports
// API registration
// Error handling
// Server startup
// ======================================
// ======================================
// ROUTES
// ======================================

const authRoutes =
require("./src/routes/auth.routes");

const chatRoutes =
require("./src/routes/chat.routes");

const billingRoutes =
require("./src/routes/billing.routes");

const referralRoutes =
require("./src/routes/referral.routes");

const shopifyRoutes =
require("./src/routes/shopify.routes");

// ======================================
// MIDDLEWARE
// ======================================

const planGuard =
require("./src/middleware/planGuard");

// ======================================
// API
// ======================================

app.use(

    "/api/auth",

    authRoutes

);

app.use(

    "/api/chat",

    planGuard,

    chatRoutes

);

app.use(

    "/api/billing",

    billingRoutes

);

app.use(

    "/api/referral",

    referralRoutes

);

app.use(

    "/api/shopify",

    shopifyRoutes

);

// ======================================
// 404
// ======================================

app.use((req,res)=>{

    return res.status(404).json({

        success:false,

        message:"API Route Not Found"

    });

});

// ======================================
// ERROR HANDLER
// ======================================

app.use(

(err,req,res,next)=>{

    console.error(err);

    return res.status(

        err.status || 500

    ).json({

        success:false,

        message:

            err.message ||

            "Internal Server Error"

    });

}

);

// ======================================
// SERVER
// ======================================

const PORT =

process.env.PORT ||

5000;

async function startServer(){

    await connectDB();

    app.listen(

        PORT,

        ()=>{

            console.log(

                `🚀 Layboka AI running on ${PORT}`

            );

        }

    );

}

startServer();

module.exports = app;
