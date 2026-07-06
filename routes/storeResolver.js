// ======================================
// routes/storeResolver.js
// Layboka AI
// Phase 1 - Part 15
// Store Resolver API
// ======================================

"use strict";

const express =
require("express");

const router =
express.Router();

// ======================================
// RESOLVE STORE
// ======================================

router.post(

"/resolve",

async(req,res)=>{

try{

let {

domain

}=req.body;

if(!domain){

return res.status(400).json({

success:false,

message:"Store domain is required."

});

}

domain=

domain

.trim()

.toLowerCase()

.replace(/^https?:\/\//,"")

.replace(/^www\./,"")

.replace(/\/$/,"")

.replace(/\/admin.*$/,"");

// ======================================
// Already Shopify Domain
// ======================================

if(

domain.endsWith(

".myshopify.com"

)

){

return res.json({

success:true,

shop:domain

});

}

// ======================================
// TODO:
//
// Production:
//
// Lookup custom domain
// from database or
// Shopify Admin API.
//
// Example:
//
// www.store.com
// ->
// store.myshopify.com
//
// ======================================

// Temporary Demo

return res.status(404).json({

success:false,

message:

"Custom domain not linked with Shopify yet."

});

}

catch(err){

console.error(err);

return res.status(500).json({

success:false,

message:

"Internal server error."

});

}

}

);

module.exports=
router;
