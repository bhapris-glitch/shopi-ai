// ======================================
// shopi-ai/src/controllers/subscription.controller.js
// Layboka AI
// Subscription Controller
// Production Ready
// Part 1
// ======================================

"use strict";

// ======================================
// IMPORTS
// ======================================

const subscriptionService =
require("../services/subscription.service");

// ======================================
// CONTROLLER
// ======================================

const subscriptionController = {};

// ======================================
// HEALTH
// GET /api/subscription/health
// ======================================

subscriptionController.health =
async(req,res)=>{

    try{

        const response =

            subscriptionService.health();

        return res.status(200)

        .json(response);

    }catch(error){

        console.error(error);

        return res.status(500)

        .json({

            success:false,

            message:error.message

        });

    }

};

// ======================================
// SYSTEM STATUS
// GET /api/subscription/status
// ======================================

subscriptionController.status =
async(req,res)=>{

    try{

        const response =

            await subscriptionService

            .status();

        return res.status(200)

        .json({

            success:true,

            data:response

        });

    }catch(error){

        console.error(error);

        return res.status(500)

        .json({

            success:false,

            message:error.message

        });

    }

};

// ======================================
// CLIENT SUBSCRIPTION STATUS
// GET /api/subscription/me
// ======================================

subscriptionController.mySubscription =
async(req,res)=>{

    try{

        const clientId =

            req.user.id;

        const response =

            await subscriptionService

            .getSubscriptionStatus(

                clientId

            );

        return res.status(200)

        .json(response);

    }catch(error){

        console.error(error);

        return res.status(500)

        .json({

            success:false,

            message:error.message

        });

    }

};

// ======================================
// NEXT
// ======================================
//
// Part 2
//
// • createTrial()
// • createSubscription()
// • activateSubscription()
