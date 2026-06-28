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
// ======================================
// PART 2
// Create Trial
// Create Subscription
// Activate Subscription
// ======================================

// ======================================
// CREATE TRIAL
// POST /api/subscription/trial
// ======================================

subscriptionController.createTrial =
async(req,res)=>{

    try{

        const clientId =
            req.user.id;

        const {

            email,

            store

        } = req.body;

        const response =

            await subscriptionService
            .createTrial(

                clientId,

                email,

                store

            );

        return res
            .status(200)
            .json(response);

    }catch(error){

        console.error(error);

        return res
            .status(500)
            .json({

                success:false,

                message:error.message

            });

    }

};

// ======================================
// CREATE SUBSCRIPTION
// POST /api/subscription/create
// ======================================

subscriptionController.createSubscription =
async(req,res)=>{

    try{

        const clientId =
            req.user.id;

        const {

            plan,

            interval,

            amount,

            stripeCustomerId,

            stripeSubscriptionId

        } = req.body;

        const response =

            await subscriptionService
            .createSubscription(

                clientId,

                plan,

                interval,

                amount,

                stripeCustomerId,

                stripeSubscriptionId

            );

        return res
            .status(200)
            .json(response);

    }catch(error){

        console.error(error);

        return res
            .status(500)
            .json({

                success:false,

                message:error.message

            });

    }

};

// ======================================
// ACTIVATE SUBSCRIPTION
// POST /api/subscription/activate
// ======================================

subscriptionController.activateSubscription =
async(req,res)=>{

    try{

        const clientId =
            req.user.id;

        const response =

            await subscriptionService
            .activateSubscription(

                clientId

            );

        return res
            .status(200)
            .json(response);

    }catch(error){

        console.error(error);

        return res
            .status(500)
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
// Part 3
//
// • renewSubscription()
// • upgradeSubscription()
// • cancelSubscription()
// • pauseSubscription()
// ======================================
// PART 3
// Renew
// Upgrade
// Cancel
// Pause
// ======================================

// ======================================
// RENEW SUBSCRIPTION
// POST /api/subscription/renew
// ======================================

subscriptionController.renewSubscription =
async(req,res)=>{

    try{

        const clientId =
            req.user.id;

        const response =

            await subscriptionService
            .renewSubscription(

                clientId

            );

        return res
            .status(200)
            .json(response);

    }catch(error){

        console.error(error);

        return res
            .status(500)
            .json({

                success:false,

                message:error.message

            });

    }

};

// ======================================
// UPGRADE SUBSCRIPTION
// POST /api/subscription/upgrade
// ======================================

subscriptionController.upgradeSubscription =
async(req,res)=>{

    try{

        const clientId =
            req.user.id;

        const {

            newPlan

        } = req.body;

        const response =

            await subscriptionService
            .upgradeSubscription(

                clientId,

                newPlan

            );

        return res
            .status(200)
            .json(response);

    }catch(error){

        console.error(error);

        return res
            .status(500)
            .json({

                success:false,

                message:error.message

            });

    }

};

// ======================================
// CANCEL SUBSCRIPTION
// POST /api/subscription/cancel
// ======================================

subscriptionController.cancelSubscription =
async(req,res)=>{

    try{

        const clientId =
            req.user.id;

        const response =

            await subscriptionService
            .cancelSubscription(

                clientId

            );

        return res
            .status(200)
            .json(response);

    }catch(error){

        console.error(error);

        return res
            .status(500)
            .json({

                success:false,

                message:error.message

            });

    }

};

// ======================================
// PAUSE SUBSCRIPTION
// POST /api/subscription/pause
// ======================================

subscriptionController.pauseSubscription =
async(req,res)=>{

    try{

        const clientId =
            req.user.id;

        const response =

            await subscriptionService
            .pauseSubscription(

                clientId

            );

        return res
            .status(200)
            .json(response);

    }catch(error){

        console.error(error);

        return res
            .status(500)
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
// Part 4
//
// • lockChatbot()
// • unlockChatbot()
// • paymentFailed()
// • expireTrial()
// ======================================
// PART 4
// Lock Chatbot
// Unlock Chatbot
// Payment Failed
// Expire Trial
// ======================================

// ======================================
// LOCK CHATBOT
// POST /api/subscription/lock
// ======================================

subscriptionController.lockChatbot =
async(req,res)=>{

    try{

        const clientId =
            req.user.id;

        const response =

            await subscriptionService
            .lockChatbot(
                clientId
            );

        return res
            .status(200)
            .json(response);

    }catch(error){

        console.error(error);

        return res
            .status(500)
            .json({

                success:false,

                message:error.message

            });

    }

};

// ======================================
// UNLOCK CHATBOT
// POST /api/subscription/unlock
// ======================================

subscriptionController.unlockChatbot =
async(req,res)=>{

    try{

        const clientId =
            req.user.id;

        const response =

            await subscriptionService
            .unlockChatbot(
                clientId
            );

        return res
            .status(200)
            .json(response);

    }catch(error){

        console.error(error);

        return res
            .status(500)
            .json({

                success:false,

                message:error.message

            });

    }

};

// ======================================
// PAYMENT FAILED
// POST /api/subscription/payment-failed
// ======================================

subscriptionController.paymentFailed =
async(req,res)=>{

    try{

        const clientId =
            req.user.id;

        const response =

            await subscriptionService
            .paymentFailed(
                clientId
            );

        return res
            .status(200)
            .json(response);

    }catch(error){

        console.error(error);

        return res
            .status(500)
            .json({

                success:false,

                message:error.message

            });

    }

};

// ======================================
// EXPIRE TRIAL
// POST /api/subscription/expire-trial
// ======================================

subscriptionController.expireTrial =
async(req,res)=>{

    try{

        const clientId =
            req.user.id;

        const response =

            await subscriptionService
            .expireTrial(
                clientId
            );

        return res
            .status(200)
            .json(response);

    }catch(error){

        console.error(error);

        return res
            .status(500)
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
// Part 5
//
// • getBillingSummary()
// • getAnalytics()
// • getUpgradeDiscount()
// • createEnterpriseRequest()
// ======================================
// PART 5
// Billing Summary
// Analytics
// Upgrade Discount
// Enterprise Request
// ======================================

// ======================================
// BILLING SUMMARY
// GET /api/subscription/billing
// ======================================

subscriptionController.getBillingSummary =
async(req,res)=>{

    try{

        const clientId =
            req.user.id;

        const response =

            await subscriptionService
            .getBillingSummary(
                clientId
            );

        return res
            .status(200)
            .json(response);

    }catch(error){

        console.error(error);

        return res
            .status(500)
            .json({

                success:false,

                message:error.message

            });

    }

};

// ======================================
// SUBSCRIPTION ANALYTICS
// GET /api/subscription/analytics
// ======================================

subscriptionController.getAnalytics =
async(req,res)=>{

    try{

        const clientId =
            req.user.id;

        const response =

            await subscriptionService
            .getAnalytics(
                clientId
            );

        return res
            .status(200)
            .json(response);

    }catch(error){

        console.error(error);

        return res
            .status(500)
            .json({

                success:false,

                message:error.message

            });

    }

};

// ======================================
// UPGRADE DISCOUNT
// GET /api/subscription/upgrade-discount
// ======================================

subscriptionController.getUpgradeDiscount =
async(req,res)=>{

    try{

        const clientId =
            req.user.id;

        const response =

            await subscriptionService
            .getUpgradeDiscount(
                clientId
            );

        return res
            .status(200)
            .json(response);

    }catch(error){

        console.error(error);

        return res
            .status(500)
            .json({

                success:false,

                message:error.message

            });

    }

};

// ======================================
// ENTERPRISE REQUEST
// POST /api/subscription/enterprise
// ======================================

subscriptionController.createEnterpriseRequest =
async(req,res)=>{

    try{

        const clientId =
            req.user.id;

        const response =

            await subscriptionService
            .createEnterpriseRequest(

                clientId,

                req.body

            );

        return res
            .status(200)
            .json(response);

    }catch(error){

        console.error(error);

        return res
            .status(500)
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
// Part 6
//
// • getBanner()
// • getRechargeData()
// • adminDashboard()
// • health()
// • status()
// • module.exports
// • Production Finish
// ======================================
// PART 6
// Banner
// Recharge
// Admin Dashboard
// Health
// Status
// Export
// ======================================

// ======================================
// GET CHATBOT BANNER
// GET /api/subscription/banner
// ======================================

subscriptionController.getBanner =
async(req,res)=>{

    try{

        const clientId =
            req.user.id;

        const response =

            await subscriptionService
            .getBanner(
                clientId
            );

        return res
            .status(200)
            .json(response);

    }catch(error){

        console.error(error);

        return res
            .status(500)
            .json({

                success:false,

                message:error.message

            });

    }

};

// ======================================
// GET RECHARGE DATA
// GET /api/subscription/recharge
// ======================================

subscriptionController.getRechargeData =
async(req,res)=>{

    try{

        const clientId =
            req.user.id;

        const response =

            await subscriptionService
            .getRechargeData(
                clientId
            );

        return res
            .status(200)
            .json(response);

    }catch(error){

        console.error(error);

        return res
            .status(500)
            .json({

                success:false,

                message:error.message

            });

    }

};

// ======================================
// ADMIN DASHBOARD
// GET /api/admin/subscriptions
// ======================================

subscriptionController.adminDashboard =
async(req,res)=>{

    try{

        const response =

            await subscriptionService
            .adminDashboard();

        return res
            .status(200)
            .json(response);

    }catch(error){

        console.error(error);

        return res
            .status(500)
            .json({

                success:false,

                message:error.message

            });

    }

};

// ======================================
// HEALTH
// GET /api/subscription/health
// ======================================

subscriptionController.health =
async(req,res)=>{

    try{

        return res
            .status(200)
            .json(

                subscriptionService
                .health()

            );

    }catch(error){

        console.error(error);

        return res
            .status(500)
            .json({

                success:false,

                message:error.message

            });

    }

};

// ======================================
// SYSTEM STATUS
// GET /api/subscription/system-status
// ======================================

subscriptionController.systemStatus =
async(req,res)=>{

    try{

        const response =

            await subscriptionService
            .status();

        return res
            .status(200)
            .json({

                success:true,

                data:response

            });

    }catch(error){

        console.error(error);

        return res
            .status(500)
            .json({

                success:false,

                message:error.message

            });

    }

};

// ======================================
// EXPORT
// ======================================

module.exports =
subscriptionController;
