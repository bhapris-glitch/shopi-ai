// ======================================
// routes/shopify.js
// Layboka AI
// Shopify Installation Router
// Production Ready
// PART 1
// ======================================

"use strict";

// ======================================
// CORE
// ======================================

const express =
require("express");

const crypto =
require("crypto");

const axios =
require("axios");

const router =
express.Router();

// ======================================
// MODELS
// ======================================

const Client =
require("../models/Client");

const Subscription =
require("../models/Subscription");

// ======================================
// CONFIG
// ======================================

const SHOPIFY_API_KEY =
process.env.SHOPIFY_API_KEY;

const SHOPIFY_API_SECRET =
process.env.SHOPIFY_API_SECRET;

const SCOPES =
process.env.SHOPIFY_SCOPES;

const APP_URL =
process.env.APP_URL;

// ======================================
// SHOPIFY
// ======================================

const SHOPIFY_VERSION =
"2025-01";

// ======================================
// HELPERS
// ======================================

function generateNonce(){

    return crypto

    .randomBytes(16)

    .toString("hex");

}

// ======================================
// VALID SHOP
// ======================================

function isValidShop(

shop

){

    if(!shop)
        return false;

    return /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/

    .test(shop);

}

// ======================================
// OAUTH URL
// ======================================

function buildInstallURL(

shop,

state

){

    return

    `https://${shop}/admin/oauth/authorize`

    +

    `?client_id=${SHOPIFY_API_KEY}`

    +

    `&scope=${encodeURIComponent(SCOPES)}`

    +

    `&redirect_uri=${encodeURIComponent(APP_URL+"/api/shopify/callback")}`

    +

    `&state=${state}`;

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

status=400

){

    return res.status(status).json({

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
// GET /install
//
// • Validate shop
// • Existing installation
// • Generate nonce
// • Redirect to Shopify OAuth
//
