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
// ======================================
// PART 2
// INSTALL
// Production Ready
// ======================================

// ======================================
// INSTALL APP
// ======================================

router.get(

"/install",

async(

req,

res

)=>{

try{

    let {

        shop

    } = req.query;

    // ==================================
    // REQUIRED
    // ==================================

    if(!shop){

        return failure(

            res,

            "Shop parameter missing."

        );

    }

    shop =

    shop

    .trim()

    .toLowerCase();

    // ==================================
    // CUSTOM DOMAIN SUPPORT
    // ==================================

    if(

        !shop.endsWith(

            ".myshopify.com"

        )

    ){

        return failure(

            res,

            "Please enter your Shopify store URL (your-store.myshopify.com)."

        );

    }

    // ==================================
    // VALIDATION
    // ==================================

    if(

        !isValidShop(

            shop

        )

    ){

        return failure(

            res,

            "Invalid Shopify store."

        );

    }

    // ==================================
    // EXISTING CLIENT
    // ==================================

    const existingClient =

    await Client.findOne({

        store:shop

    });

    // ==================================
    // ALREADY INSTALLED
    // ==================================

    if(

        existingClient &&

        existingClient.accessToken &&

        existingClient.installed===true

    ){

        return res.redirect(

            `${APP_URL}/dashboard?shop=${shop}`

        );

    }

    // ==================================
    // NONCE
    // ==================================

    const state =

    generateNonce();

    // ==================================
    // SAVE STATE
    // ==================================

    if(

        existingClient

    ){

        existingClient.oauthState =

        state;

        await existingClient.save();

    }else{

        await Client.create({

            store:shop,

            oauthState:state,

            installed:false

        });

    }

    // ==================================
    // SHOPIFY OAUTH
    // ==================================

    const installURL =

    buildInstallURL(

        shop,

        state

    );

    return res.redirect(

        installURL

    );

}

catch(error){

    console.error(

        "Shopify Install:",

        error

    );

    return failure(

        res,

        "Unable to start installation.",

        500

    );

}

});

// ======================================
// NEXT
// ======================================
//
// PART 3
//
// GET /callback
//
// • Verify HMAC
// • Verify State
// • Exchange Code
// • Save Access Token
// • Mark Installed
// ======================================
// PART 3
// OAUTH CALLBACK
// Production Ready
// ======================================

// ======================================
// CALLBACK
// ======================================

router.get(

"/callback",

async(

req,

res

)=>{

try{

const{

shop,

code,

state,

hmac

}=req.query;

// ======================================
// REQUIRED
// ======================================

if(

!shop ||

!code ||

!state ||

!hmac

){

return failure(

res,

"Invalid Shopify callback."

);

}

// ======================================
// VALID SHOP
// ======================================

if(

!isValidShop(

shop

)

){

return failure(

res,

"Invalid Shopify store."

);

}

// ======================================
// CLIENT
// ======================================

const client=

await Client.findOne({

store:shop

});

if(

!client

){

return failure(

res,

"Store not found."

);

}

// ======================================
// VERIFY STATE
// ======================================

if(

client.oauthState!==state

){

return failure(

res,

"OAuth state mismatch."

);

}

// ======================================
// VERIFY HMAC
// ======================================

const query=

{...req.query};

delete query.hmac;

const message=

Object.keys(query)

.sort()

.map(

key=>`${key}=${query[key]}`

)

.join("&");

const generatedHmac=

crypto

.createHmac(

"sha256",

SHOPIFY_API_SECRET

)

.update(message)

.digest("hex");

if(

generatedHmac!==hmac

){

return failure(

res,

"Invalid HMAC."

);

}

// ======================================
// ACCESS TOKEN
// ======================================

const tokenResponse=

await axios.post(

`https://${shop}/admin/oauth/access_token`,

{

client_id:

SHOPIFY_API_KEY,

client_secret:

SHOPIFY_API_SECRET,

code

}

);

// ======================================
// TOKEN
// ======================================

const accessToken=

tokenResponse.data

.access_token;

// ======================================
// SAVE
// ======================================

client.accessToken=

accessToken;

client.installed=true;

client.installedAt=

new Date();

client.oauthState="";

client.shopifyScope=

SCOPES;

await client.save();

// ======================================
// SUBSCRIPTION
// ======================================

let subscription=

await Subscription.findOne({

clientId:

client._id

});

if(

!subscription

){

subscription=

new Subscription({

clientId:

client._id,

store:shop,

email:

client.email ||

"",

plan:"free",

status:"trial",

paid:false

});

await subscription.save();
    await finishInstallation(
    shop,
    accessToken
);

}

// ======================================
// REDIRECT
// ======================================

return res.redirect(

`${APP_URL}/dashboard?shop=${shop}`

);

}

catch(error){

console.error(

"Shopify Callback:",

error.response?.data ||

error.message

);

return failure(

res,

"Shopify authorization failed.",

500

);

}

});

// ======================================
// NEXT
// ======================================
//
// PART 4
//
// • Register Webhooks
// • Register ScriptTag/App Embed
// • GDPR Webhooks
// • Shop Redact
// • Customers Redact
// ======================================
// PART 4
// REGISTER WEBHOOKS
// APP EMBED
// Production Ready
// ======================================

// ======================================
// REGISTER WEBHOOKS
// ======================================

async function registerWebhooks(

shop,

accessToken

){

const webhooks=[

{

topic:

"app/uninstalled",

address:

`${APP_URL}/api/shopify/webhooks/app-uninstalled`

},

{

topic:

"orders/create",

address:

`${APP_URL}/api/shopify/webhooks/orders-create`

},

{

topic:

"orders/updated",

address:

`${APP_URL}/api/shopify/webhooks/orders-updated`

},

{

topic:

"customers/create",

address:

`${APP_URL}/api/shopify/webhooks/customers-create`

},

{

topic:

"customers/update",

address:

`${APP_URL}/api/shopify/webhooks/customers-update`

},

{

topic:

"customers/data_request",

address:

`${APP_URL}/api/shopify/webhooks/customers-data-request`

},

{

topic:

"customers/redact",

address:

`${APP_URL}/api/shopify/webhooks/customers-redact`

},

{

topic:

"shop/redact",

address:

`${APP_URL}/api/shopify/webhooks/shop-redact`

}

];

for(const hook of webhooks){

try{

await axios.post(

`https://${shop}/admin/api/${SHOPIFY_VERSION}/webhooks.json`,

{

webhook:{

topic:

hook.topic,

address:

hook.address,

format:"json"

}

},

{

headers:{

"X-Shopify-Access-Token":

accessToken,

"Content-Type":

"application/json"

}

}

);

}catch(error){

console.error(

"Webhook:",

hook.topic,

error.response?.data ||

error.message

);

}

}

}

// ======================================
// APP EMBED / SCRIPT
// ======================================

async function registerScriptTag(

shop,

accessToken

){

try{

const existing=

await axios.get(

`https://${shop}/admin/api/${SHOPIFY_VERSION}/script_tags.json`,

{

headers:{

"X-Shopify-Access-Token":

accessToken

}

}

);

const alreadyInstalled=

existing.data.script_tags.some(

tag=>

tag.src===

`${APP_URL}/chatbot.js`

);

if(alreadyInstalled)

return;

await axios.post(

`https://${shop}/admin/api/${SHOPIFY_VERSION}/script_tags.json`,

{

script_tag:{

event:"onload",

src:

`${APP_URL}/chatbot.js`

}

},

{

headers:{

"X-Shopify-Access-Token":

accessToken,

"Content-Type":

"application/json"

}

}

);

console.log(

"Chatbot Installed:",

shop

);

}catch(error){

console.error(

"ScriptTag:",

error.response?.data ||

error.message

);

}

}

// ======================================
// AUTO REGISTER
// ======================================

async function finishInstallation(

shop,

accessToken

){

await registerWebhooks(

shop,

accessToken

);

await registerScriptTag(

shop,

accessToken

);

}

// ======================================
// NEXT
// ======================================
//
// PART 5
//
// • Uninstall Webhook
// • GDPR Webhooks
// • Order Webhooks
// • Customer Webhooks
// • Complete Installation
// • Export
// ======================================
// PART 5
// SHOPIFY WEBHOOKS
// Production Ready
// ======================================

// ======================================
// APP UNINSTALLED
// ======================================

router.post(

"/webhooks/app-uninstalled",

express.json(),

async(

req,

res

)=>{

try{

const shop=

req.headers[

"x-shopify-shop-domain"

];

if(!shop)

return res.sendStatus(200);

const client=

await Client.findOne({

store:shop

});

if(client){

client.installed=false;

client.accessToken="";

client.uninstalledAt=

new Date();

await client.save();

await Subscription.updateMany(

{

clientId:

client._id

},

{

status:"expired",

locked:true,

autoRenew:false

}

);

}

return res.sendStatus(200);

}catch(error){

console.error(

"App Uninstall:",

error

);

return res.sendStatus(200);

}

});

// ======================================
// ORDER CREATED
// ======================================

router.post(

"/webhooks/orders-create",

express.json(),

async(

req,

res

)=>{

try{

console.log(

"Order Created:",

req.body.id

);

return res.sendStatus(200);

}catch(error){

console.error(error);

return res.sendStatus(200);

}

});

// ======================================
// ORDER UPDATED
// ======================================

router.post(

"/webhooks/orders-updated",

express.json(),

async(

req,

res

)=>{

try{

console.log(

"Order Updated:",

req.body.id

);

return res.sendStatus(200);

}catch(error){

console.error(error);

return res.sendStatus(200);

}

});

// ======================================
// CUSTOMER CREATED
// ======================================

router.post(

"/webhooks/customers-create",

express.json(),

async(

req,

res

)=>{

try{

console.log(

"Customer Created:",

req.body.id

);

return res.sendStatus(200);

}catch(error){

console.error(error);

return res.sendStatus(200);

}

});

// ======================================
// CUSTOMER UPDATED
// ======================================

router.post(

"/webhooks/customers-update",

express.json(),

async(

req,

res

)=>{

try{

console.log(

"Customer Updated:",

req.body.id

);

return res.sendStatus(200);

}catch(error){

console.error(error);

return res.sendStatus(200);

}

});

// ======================================
// GDPR
// CUSTOMER DATA REQUEST
// ======================================

router.post(

"/webhooks/customers-data-request",

express.json(),

async(

req,

res

)=>{

try{

console.log(

"GDPR Data Request"

);

return res.sendStatus(200);

}catch(error){

console.error(error);

return res.sendStatus(200);

}

});

// ======================================
// GDPR
// CUSTOMER REDACT
// ======================================

router.post(

"/webhooks/customers-redact",

express.json(),

async(

req,

res

)=>{

try{

console.log(

"Customer Redact"

);

return res.sendStatus(200);

}catch(error){

console.error(error);

return res.sendStatus(200);

}

});

// ======================================
// GDPR
// SHOP REDACT
// ======================================

router.post(

"/webhooks/shop-redact",

express.json(),

async(

req,

res

)=>{

try{

console.log(

"Shop Redact"

);

return res.sendStatus(200);

}catch(error){

console.error(error);

return res.sendStatus(200);

}

});

// ======================================
// HEALTH
// ======================================

router.get(

"/health",

(req,res)=>{

return success(

res,

{

service:

"Shopify Router",

status:

"Running",

apiVersion:

SHOPIFY_VERSION

}

);

});

// ======================================
// EXPORT
// ======================================

module.exports=

router;

// =============================
// express.json()
// when hosting change this to 
// express.raw({ type: "application/json" })
