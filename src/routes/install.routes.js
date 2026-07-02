// ======================================================
// FILE: src/routes/install.routes.js
// PART 1 / 5
// Layboka AI
// Production Shopify Installation Router
// ======================================================

"use strict";

/* =====================================================
 * IMPORTS
 * ===================================================== */

const express = require("express");
const crypto = require("crypto");
const dns = require("dns").promises;
const { URL } = require("url");

const Client = require("../../models/Client");

const shopifyService = require("../../services/shopify");
const shopifyApiService = require("../../services/shopify.service");

/* =====================================================
 * ROUTER
 * ===================================================== */

const router = express.Router();

/* =====================================================
 * CONFIGURATION
 * ===================================================== */

const INSTALL_SESSION_TTL = 15 * 60 * 1000;

const SHOPIFY_HOST_SUFFIX = ".myshopify.com";

const SUPPORTED_PLATFORMS = Object.freeze({
    SHOPIFY: "shopify"
});

/* =====================================================
 * HELPERS
 * ===================================================== */

/**
 * Generate secure install session id
 */
function createInstallSessionId() {

    return crypto.randomBytes(32).toString("hex");

}

/**
 * Remove spaces and normalize input
 */
function sanitizeInput(value = "") {

    return String(value)
        .trim()
        .replace(/\s+/g, "");

}

/**
 * Normalize merchant URL
 *
 * Accepts:
 * store.myshopify.com
 * https://store.myshopify.com
 * http://store.myshopify.com
 * www.brand.com
 * https://brand.com
 */
function normalizeStoreUrl(input = "") {

    let value = sanitizeInput(input);

    if (!value) {

        return null;

    }

    if (!/^https?:\/\//i.test(value)) {

        value = `https://${value}`;

    }

    try {

        const parsed = new URL(value);

        return {

            protocol: parsed.protocol,

            hostname: parsed.hostname
                .toLowerCase()
                .replace(/^www\./, ""),

            origin: parsed.origin,

            href: parsed.href

        };

    } catch (error) {

        return null;

    }

}

/**
 * Validate hostname format
 */
function isValidHostname(hostname = "") {

    const regex =
        /^(?=.{1,253}$)(?!-)([a-zA-Z0-9-]{1,63}\.)+[A-Za-z]{2,63}$/;

    return regex.test(hostname);

}

/**
 * Check if hostname is myshopify domain
 */
function isMyShopifyDomain(hostname = "") {

    return hostname.endsWith(SHOPIFY_HOST_SUFFIX);

}

/**
 * DNS lookup
 */
async function resolveDomain(hostname) {

    try {

        await dns.lookup(hostname);

        return true;

    } catch {

        return false;

    }

}

/**
 * Platform detection
 * Shopify first
 * Future:
 * WooCommerce
 * Magento
 * BigCommerce
 */
function detectPlatform(hostname) {

    if (isMyShopifyDomain(hostname)) {

        return SUPPORTED_PLATFORMS.SHOPIFY;

    }

    return "unknown";

}

/**
 * Standard API response
 */
function success(res, data = {}) {

    return res.status(200).json({

        success: true,

        ...data

    });

}

function failure(res, status, message, code) {

    return res.status(status).json({

        success: false,

        error: {

            code,

            message

        }

    });

}

/* =====================================================
 * INSTALL VALIDATION MIDDLEWARE
 * ===================================================== */

async function validateInstallationRequest(req, res, next) {

    try {

        const rawStore = req.body.store || req.query.store;

        if (!rawStore) {

            return failure(

                res,

                400,

                "Store URL is required.",

                "STORE_REQUIRED"

            );

        }

        const normalized = normalizeStoreUrl(rawStore);

        if (!normalized) {

            return failure(

                res,

                400,

                "Invalid store URL.",

                "INVALID_STORE_URL"

            );

        }

        if (!isValidHostname(normalized.hostname)) {

            return failure(

                res,

                400,

                "Invalid hostname.",

                "INVALID_HOSTNAME"

            );

        }

        const exists = await resolveDomain(normalized.hostname);

        if (!exists) {

            return failure(

                res,

                404,

                "Store domain not found.",

                "DOMAIN_NOT_FOUND"

            );

        }

        req.install = {

            id: createInstallSessionId(),

            createdAt: Date.now(),

            expiresAt: Date.now() + INSTALL_SESSION_TTL,

            hostname: normalized.hostname,

            normalized,

            platform: detectPlatform(normalized.hostname)

        };

        next();

    } catch (error) {

        console.error(

            "[INSTALL VALIDATION]",

            error

        );

        return failure(

            res,

            500,

            "Unable to validate installation.",

            "INSTALL_VALIDATION_FAILED"

        );

    }

}

/* =====================================================
 * PART 2 CONTINUES...
 * ===================================================== */
/* =====================================================
 * SHOPIFY STORE DETECTION
 * ===================================================== */

/**
 * Detect Shopify storefront.
 *
 * For .myshopify.com we already know.
 * For custom domains we'll use the existing
 * Shopify service where available.
 */
async function verifyShopifyStore(hostname) {

    try {

        if (isMyShopifyDomain(hostname)) {

            return {

                valid: true,

                shop: hostname,

                customDomain: false

            };

        }

        if (
            shopifyService &&
            typeof shopifyService.detectStore === "function"
        ) {

            const detected =
                await shopifyService.detectStore(hostname);

            if (detected && detected.valid) {

                return {

                    valid: true,

                    shop: detected.shop,

                    customDomain: true

                };

            }

        }

        return {

            valid: false

        };

    } catch (error) {

        console.error(
            "[SHOPIFY DETECTION]",
            error
        );

        return {

            valid: false

        };

    }

}

/* =====================================================
 * CLIENT LOOKUP
 * ===================================================== */

async function findClient(shop) {

    return Client.findOne({

        store: shop.toLowerCase()

    });

}

async function ensureStoreAvailable(shop) {

    const client =
        await findClient(shop);

    if (!client) {

        return {

            available: true,

            client: null

        };

    }

    if (client.locked) {

        return {

            available: false,

            reason: "STORE_LOCKED"

        };

    }

    return {

        available: true,

        client

    };

}

/* =====================================================
 * BUILD OAUTH URL
 * ===================================================== */

function buildOAuthUrl(shop) {

    const apiKey =
        process.env.SHOPIFY_API_KEY;

    const scopes =
        process.env.SHOPIFY_SCOPES;

    const host =
        process.env.APP_URL;

    const redirectUri =
        `${host}/api/install/callback`;

    const state =
        crypto.randomBytes(20).toString("hex");

    const params =
        new URLSearchParams({

            client_id: apiKey,

            scope: scopes,

            redirect_uri: redirectUri,

            state,

            "grant_options[]": ""

        });

    return {

        state,

        url:
            `https://${shop}/admin/oauth/authorize?${params.toString()}`

    };

}

/* =====================================================
 * VALIDATE STORE
 * POST /api/install/validate
 * ===================================================== */

router.post(

    "/validate",

    validateInstallationRequest,

    async (req, res) => {

        try {

            const verification =
                await verifyShopifyStore(
                    req.install.hostname
                );

            if (!verification.valid) {

                return failure(

                    res,

                    400,

                    "This website is not a supported Shopify store.",

                    "SHOP_NOT_SUPPORTED"

                );

            }

            const availability =
                await ensureStoreAvailable(
                    verification.shop
                );

            return success(res, {

                installId:
                    req.install.id,

                platform:
                    SUPPORTED_PLATFORMS.SHOPIFY,

                shop:
                    verification.shop,

                customDomain:
                    verification.customDomain,

                alreadyInstalled:
                    !!availability.client,

                installationAllowed:
                    availability.available

            });

        } catch (error) {

            console.error(

                "[INSTALL VALIDATE]",

                error

            );

            return failure(

                res,

                500,

                "Unable to validate store.",

                "VALIDATION_FAILED"

            );

        }

    }

);

/* =====================================================
 * PART 3 CONTINUES...
 * ===================================================== */
