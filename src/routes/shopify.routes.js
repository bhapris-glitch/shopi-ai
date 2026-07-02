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
// ======================================================
// STORE VALIDATION
// ======================================================

async function validateStore(req, res, next) {

    try {

        const rawStore =

            req.body.store ||

            req.query.store ||

            "";

        if (!rawStore) {

            return failure(

                res,

                400,

                "Store URL is required."

            );

        }

        const store =

            normalizeStore(rawStore);

        if (!store) {

            return failure(

                res,

                400,

                "Invalid store."

            );

        }

        req.store = store;

        next();

    }

    catch (err) {

        console.error(

            "Store Validation:",

            err.message

        );

        return failure(

            res,

            500,

            "Unable to validate store."

        );

    }

}

// ======================================================
// CHECK EXISTING INSTALLATION
// ======================================================

async function checkExistingInstallation(

    req,

    res,

    next

) {

    try {

        const existing =

            await Client.findOne({

                store: req.store

            });

        if (

            existing &&

            existing.token

        ) {

            return success(

                res,

                {

                    installed: true,

                    message:

                        "Application already installed.",

                    dashboard:

                        "/dashboard"

                }

            );

        }

        next();

    }

    catch (err) {

        console.error(

            "Installation Check:",

            err.message

        );

        return failure(

            res,

            500,

            "Installation lookup failed."

        );

    }

}

// ======================================================
// CREATE INSTALL SESSION
// ======================================================

function buildInstallSession(

    store

) {

    return {

        id: createNonce(),

        state: createNonce(),

        store,

        createdAt:

            Date.now()

    };

}

// ======================================================
// INSTALL ROUTE
// POST /api/shopify/install
// ======================================================

router.post(

    "/install",

    validateStore,

    checkExistingInstallation,

    async (

        req,

        res

    ) => {

        try {

            const session =

                buildInstallSession(

                    req.store

                );

            const authUrl =

                oauthUrl(

                    req.store,

                    session.state

                );

            return success(

                res,

                {

                    installed: false,

                    store: req.store,

                    state:

                        session.state,

                    installUrl:

                        authUrl

                }

            );

        }

        catch (err) {

            console.error(

                "Install Error:",

                err.message

            );

            return failure(

                res,

                500,

                "Unable to start installation."

            );

        }

    }

);

// ======================================================
// PART 3 CONTINUES...
// ======================================================
