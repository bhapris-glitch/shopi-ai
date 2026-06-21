// ======================================
// routes/webhook.routes.js
// Layboka AI
// Shopify Webhook Routes
// Production Ready
// ======================================

const express =
require("express");

const router =
express.Router();

const WebhookController =
require("../controllers/webhook.controller");

// ======================================
// PRODUCTS
// ======================================

router.post(

    "/products/create",

    WebhookController.verifyWebhook,

    WebhookController.productCreate

);

router.post(

    "/products/update",

    WebhookController.verifyWebhook,

    WebhookController.productUpdate

);

router.post(

    "/products/delete",

    WebhookController.verifyWebhook,

    WebhookController.productDelete

);

// ======================================
// COLLECTIONS
// ======================================

router.post(

    "/collections/update",

    WebhookController.verifyWebhook,

    WebhookController.collectionUpdate

);

// ======================================
// PAGES
// ======================================

router.post(

    "/pages/update",

    WebhookController.verifyWebhook,

    WebhookController.pageUpdate

);

// ======================================
// INVENTORY
// ======================================

router.post(

    "/inventory/update",

    WebhookController.verifyWebhook,

    WebhookController.inventoryUpdate

);

// ======================================
// ORDERS
// ======================================

router.post(

    "/orders/create",

    WebhookController.verifyWebhook,

    WebhookController.orderCreate

);

// ======================================
// CUSTOMERS
// ======================================

router.post(

    "/customers/update",

    WebhookController.verifyWebhook,

    WebhookController.customerUpdate

);

// ======================================
// APP UNINSTALLED
// ======================================

router.post(

    "/app/uninstalled",

    WebhookController.verifyWebhook,

    async(req,res)=>{

        try{

            console.log(

                "[APP UNINSTALLED]",

                req.body.shop_domain

            );

            // Future:
            // Disable Store
            // Remove Tokens
            // Cancel Subscription
            // Schedule Data Cleanup

            return res.status(200).send("OK");

        }

        catch(error){

            return res.status(500).send("Error");

        }

    }

);

// ======================================
// GDPR
// ======================================

router.post(

    "/customers/redact",

    WebhookController.verifyWebhook,

    (req,res)=>{

        return res.status(200).send("OK");

    }

);

router.post(

    "/shop/redact",

    WebhookController.verifyWebhook,

    (req,res)=>{

        return res.status(200).send("OK");

    }

);

router.post(

    "/customers/data_request",

    WebhookController.verifyWebhook,

    (req,res)=>{

        return res.status(200).send("OK");

    }

);

// ======================================
// EXPORT
// ======================================

module.exports =
router;
