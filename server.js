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

const rateLimiter =
require("./middleware/rateLimiter");

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
