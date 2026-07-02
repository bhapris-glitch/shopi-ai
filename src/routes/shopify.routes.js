// ======================================================
// FILE: shopi-ai/src/routes/shopify.routes.js
// PART 1 / 8
// Layboka AI Shopify Installation Router
// ======================================================

"use strict";

const express = require("express");
const crypto = require("crypto");

const router = express.Router();

const Client = require("../../models/Client");
const shopifyService = require("../../services/shopify");

// ======================================================
// CONFIG
// ======================================================

const SHOPIFY_SCOPES =
    process.env.SHOPIFY_SCOPES;

const SHOPIFY_API_KEY =
    process.env.SHOPIFY_API_KEY;

const SHOPIFY_API_SECRET =
    process.env.SHOPIFY_API_SECRET;

const APP_URL =
    process.env.APP_URL;

const API_VERSION =
    process.env.SHOPIFY_API_VERSION ||
    "2025-10";

// ======================================================
// ENV CHECK
// ======================================================

const REQUIRED_ENV = [

    "SHOPIFY_API_KEY",

    "SHOPIFY_API_SECRET",

    "SHOPIFY_SCOPES",

    "APP_URL"

];

for (const key of REQUIRED_ENV) {

    if (!process.env[key]) {

        console.warn(

            `[Layboka] Missing ENV: ${key}`

        );

    }

}

// ======================================================
// HELPERS
// ======================================================

function normalizeStore(store = "") {

    return String(store)

        .trim()

        .toLowerCase()

        .replace(/^https?:\/\//i, "")

        .replace(/^www\./i, "")

        .replace(/\/$/, "");

}

function isMyShopify(store) {

    return store.endsWith(".myshopify.com");

}

function createNonce() {

    return crypto

        .randomBytes(32)

        .toString("hex");

}

function oauthUrl(store, state) {

    return `https://${store}/admin/oauth/authorize?client_id=${SHOPIFY_API_KEY}&scope=${SHOPIFY_SCOPES}&redirect_uri=${encodeURIComponent(`${APP_URL}/api/shopify/callback`)}&state=${state}`;

}

function success(res, data = {}) {

    return res.status(200).json({

        success: true,

        ...data

    });

}

function failure(

    res,

    status,

    message

) {

    return res.status(status).json({

        success: false,

        message

    });

}

// ======================================================
// PART 2 CONTINUES
// ======================================================
