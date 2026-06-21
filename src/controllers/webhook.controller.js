// ======================================
// controllers/webhook.controller.js
// Layboka AI
// Shopify Webhook Controller
// Production Ready
// ======================================

const crypto =
require("crypto");

const SyncService =
require("../services/sync.service");

// ======================================
// VERIFY SHOPIFY WEBHOOK
// ======================================

exports.verifyWebhook = (

    req,

    res,

    next

)=>{

    try{

        const hmac =

            req.get(

                "X-Shopify-Hmac-Sha256"

            );

        const digest =

            crypto

            .createHmac(

                "sha256",

                process.env

                .SHOPIFY_WEBHOOK_SECRET

            )

            .update(

                req.rawBody,

                "utf8"

            )

            .digest("base64");

        if(

            digest !== hmac

        ){

            return res

            .status(401)

            .send("Invalid Webhook");

        }

        next();

    }

    catch(error){

        return res

        .status(500)

        .send("Webhook Error");

    }

};

// ======================================
// PRODUCT CREATE
// ======================================

exports.productCreate =
async(req,res)=>{

    try{

        await SyncService

        .syncProduct(

            req.body

        );

        return res

        .status(200)

        .send("OK");

    }

    catch(error){

        console.error(error);

        return res

        .status(500)

        .send("Error");

    }

};

// ======================================
// PRODUCT UPDATE
// ======================================

exports.productUpdate =
async(req,res)=>{

    try{

        await SyncService

        .syncProduct(

            req.body

        );

        return res

        .status(200)

        .send("OK");

    }

    catch(error){

        return res

        .status(500)

        .send("Error");

    }

};

// ======================================
// PRODUCT DELETE
// ======================================

exports.productDelete =
async(req,res)=>{

    try{

        await SyncService

        .deleteProduct(

            req.body.id

        );

        return res

        .status(200)

        .send("OK");

    }

    catch(error){

        return res

        .status(500)

        .send("Error");

    }

};

// ======================================
// COLLECTION UPDATE
// ======================================

exports.collectionUpdate =
async(req,res)=>{

    try{

        await SyncService

        .syncCollection(

            req.body

        );

        return res

        .status(200)

        .send("OK");

    }

    catch(error){

        return res

        .status(500)

        .send("Error");

    }

};

// ======================================
// PAGE UPDATE
// ======================================

exports.pageUpdate =
async(req,res)=>{

    try{

        await SyncService

        .syncPage(

            req.body

        );

        return res

        .status(200)

        .send("OK");

    }

    catch(error){

        return res

        .status(500)

        .send("Error");

    }

};

// ======================================
// INVENTORY UPDATE
// ======================================

exports.inventoryUpdate =
async(req,res)=>{

    try{

        await SyncService

        .inventoryUpdate(

            req.body.inventory_item_id,

            req.body.available

        );

        return res

        .status(200)

        .send("OK");

    }

    catch(error){

        return res

        .status(500)

        .send("Error");

    }

};

// ======================================
// ORDER CREATE
// ======================================

exports.orderCreate =
async(req,res)=>{

    try{

        // Future:
        // Update Analytics
        // Update Customer
        // Update AI Revenue

        return res

        .status(200)

        .send("OK");

    }

    catch(error){

        return res

        .status(500)

        .send("Error");

    }

};

// ======================================
// CUSTOMER UPDATE
// ======================================

exports.customerUpdate =
async(req,res)=>{

    try{

        // Future:
        // Update Customer Profile

        return res

        .status(200)

        .send("OK");

    }

    catch(error){

        return res

        .status(500)

        .send("Error");

    }

};
