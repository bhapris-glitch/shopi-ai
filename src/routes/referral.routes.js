// ======================================
// src/routes/referral.routes.js
// Layboka AI
// Referral Routes
// Production Ready
// Part 1
// ======================================

"use strict";

// ======================================
// IMPORTS
// ======================================

const express = require("express");

const router = express.Router();

// ======================================
// MIDDLEWARE
// ======================================

const authMiddleware =
require("../middleware/authMiddleware");

const rateLimiter =
require("../middleware/rateLimiter");

// ======================================
// REFERRAL ENGINE
// ======================================

const {

    createReferralOwner,

    registerReferral,

    validateReferralCode,

    saveFirstPayment,

    qualifyGrowthReferral,

    qualifyPremiumReferral,

    applyGrowthReward,

    processPremiumVIPReward,

    processEnterpriseReward,

    updateVIPBadge,

    getClientReferrals

} = require("../engines/referral.engine");

// ======================================
// MODELS
// ======================================

const Client =
require("../../models/Client");

const Referral =
require("../../models/Referral");

const Subscription =
require("../../models/Subscription");

// ======================================
// CONSTANTS
// ======================================

const SUCCESS = true;

const FAILED = false;

// ======================================
// PART 2
// • Generate referral code
// • Get referral profile
// • Referral dashboard
// ======================================
// ======================================
// PART 2
// Generate Referral
// Dashboard
// Referral Profile
// ======================================

// ======================================
// CREATE REFERRAL OWNER
// ======================================

router.post(

"/generate",

authMiddleware,

rateLimiter,

async(req,res)=>{

try{

    const client =
        await Client.findById(
            req.user.id
        );

    if(!client){

        return res.status(404).json({

            success:FAILED,

            message:"Client not found"

        });

    }

    const referral =

        await createReferralOwner(client);

    return res.json({

        success:SUCCESS,

        referralCode:

            referral.referralCode,

        referralId:

            referral._id

    });

}catch(err){

    console.error(err);

    return res.status(500).json({

        success:FAILED,

        message:err.message

    });

}

}

);

// ======================================
// REFERRAL PROFILE
// ======================================

router.get(

"/profile",

authMiddleware,

async(req,res)=>{

try{

    const client =

        await Client.findById(

            req.user.id

        );

    if(!client){

        return res.status(404).json({

            success:FAILED,

            message:"Client not found"

        });

    }

    const referral =

        await Referral.findOne({

            referrerClientId:

                client._id

        });

    return res.json({

        success:SUCCESS,

        client:{

            id:client._id,

            store:client.store,

            referralCode:

                client.referralCode ||

                referral?.referralCode ||

                ""

        }

    });

}catch(err){

    console.error(err);

    return res.status(500).json({

        success:FAILED,

        message:err.message

    });

}

}

);

// ======================================
// DASHBOARD
// ======================================

router.get(

"/dashboard",

authMiddleware,

async(req,res)=>{

try{

    const referrals =

        await getClientReferrals(

            req.user.id

        );

    const total =

        referrals.length;

    const qualified =

        referrals.filter(

            r=>r.status==="qualified"

        ).length;

    const rewarded =

        referrals.filter(

            r=>r.status==="rewarded"

        ).length;

    return res.json({

        success:SUCCESS,

        total,

        qualified,

        rewarded,

        referrals

    });

}catch(err){

    console.error(err);

    return res.status(500).json({

        success:FAILED,

        message:err.message

    });

}

}

);

// ======================================
// NEXT
// ======================================
//
// Part 3
//
// • Validate referral code
// • Register referral
// • Signup integration
// ======================================
// PART 3
// Validate Referral
// Register Referral
// ======================================

// ======================================
// VALIDATE REFERRAL CODE
// ======================================

router.post(

"/validate",

rateLimiter,

async(req,res)=>{

try{

    const{

        referralCode

    } = req.body;

    if(!referralCode){

        return res.status(400).json({

            success:FAILED,

            message:"Referral code required"

        });

    }

    const referral =

        await Referral.findOne({

            referralCode:

                referralCode

                .trim()

                .toUpperCase()

        });

    if(!referral){

        return res.json({

            success:FAILED,

            valid:false,

            message:"Invalid referral code"

        });

    }

    return res.json({

        success:SUCCESS,

        valid:true,

        referralCode:

            referral.referralCode

    });

}catch(err){

    console.error(err);

    return res.status(500).json({

        success:FAILED,

        message:err.message

    });

}

}

);

// ======================================
// REGISTER REFERRAL
// ======================================

router.post(

"/register",

rateLimiter,

async(req,res)=>{

try{

    const{

        referralCode,

        clientId,

        selectedPlan

    } = req.body;

    const client =

        await Client.findById(

            clientId

        );

    if(!client){

        return res.status(404).json({

            success:FAILED,

            message:"Client not found"

        });

    }

    const result =

        await registerReferral(

            referralCode,

            client,

            selectedPlan

        );

    if(!result.success){

        return res.status(400).json(

            result

        );

    }

    return res.json({

        success:SUCCESS,

        referral:

            result.referral

    });

}catch(err){

    console.error(err);

    return res.status(500).json({

        success:FAILED,

        message:err.message

    });

}

}

);

// ======================================
// FIRST PAYMENT
// ======================================

router.post(

"/first-payment",

authMiddleware,

async(req,res)=>{

try{

    const{

        amount

    } = req.body;

    if(!amount){

        return res.status(400).json({

            success:FAILED,

            message:"Payment amount required"

        });

    }

    const referral =

        await saveFirstPayment(

            req.user.id,

            amount

        );

    if(!referral){

        return res.status(404).json({

            success:FAILED,

            message:"Referral not found"

        });

    }

    return res.json({

        success:SUCCESS,

        referral

    });

}catch(err){

    console.error(err);

    return res.status(500).json({

        success:FAILED,

        message:err.message

    });

}

}

);

// ======================================
// GROWTH QUALIFICATION
// ======================================

router.post(

"/qualify-growth",

authMiddleware,

async(req,res)=>{

try{

    const referral =

        await qualifyGrowthReferral(

            req.user.id

        );

    return res.json({

        success:SUCCESS,

        referral

    });

}catch(err){

    console.error(err);

    return res.status(500).json({

        success:FAILED,

        message:err.message

    });

}

}

);

// ======================================
// PREMIUM QUALIFICATION
// ======================================

router.post(

"/qualify-premium",

authMiddleware,

async(req,res)=>{

try{

    const referral =

        await qualifyPremiumReferral(

            req.user.id

        );

    return res.json({

        success:SUCCESS,

        referral

    });

}catch(err){

    console.error(err);

    return res.status(500).json({

        success:FAILED,

        message:err.message

    });

}

}

);

// ======================================
// NEXT
// ======================================
//
// Part 5
//
// • Apply Growth Reward
// • Premium VIP Reward
// • Enterprise Reward
// ======================================
// PART 5
// Reward Processing
// ======================================

// ======================================
// APPLY GROWTH REWARD
// ======================================

router.post(

"/reward/growth",

authMiddleware,

async(req,res)=>{

try{

    const referral =

        await Referral.findOne({

            referredClientId:

                req.user.id

        });

    if(!referral){

        return res.status(404).json({

            success:FAILED,

            message:"Referral not found"

        });

    }

    const result =

        await applyGrowthReward(

            referral

        );

    return res.json({

        success:SUCCESS,

        reward:result

    });

}catch(err){

    console.error(err);

    return res.status(500).json({

        success:FAILED,

        message:err.message

    });

}

}

);

// ======================================
// PREMIUM VIP REWARD
// ======================================

router.post(

"/reward/premium",

authMiddleware,

async(req,res)=>{

try{

    const referral =

        await Referral.findOne({

            referredClientId:

                req.user.id

        });

    if(!referral){

        return res.status(404).json({

            success:FAILED,

            message:"Referral not found"

        });

    }

    const result =

        await processPremiumVIPReward(

            referral

        );

    return res.json({

        success:SUCCESS,

        reward:result

    });

}catch(err){

    console.error(err);

    return res.status(500).json({

        success:FAILED,

        message:err.message

    });

}

}

);

// ======================================
// ENTERPRISE REWARD
// ======================================

router.post(

"/reward/enterprise",

authMiddleware,

async(req,res)=>{

try{

    const referral =

        await Referral.findOne({

            referredClientId:

                req.user.id

        });

    if(!referral){

        return res.status(404).json({

            success:FAILED,

            message:"Referral not found"

        });

    }

    const result =

        await processEnterpriseReward(

            referral

        );

    return res.json({

        success:SUCCESS,

        reward:result

    });

}catch(err){

    console.error(err);

    return res.status(500).json({

        success:FAILED,

        message:err.message

    });

}

}

);

// ======================================
// UPDATE VIP BADGE
// ======================================

router.post(

"/vip/update",

authMiddleware,

async(req,res)=>{

try{

    await updateVIPBadge(

        req.user.id

    );

    return res.json({

        success:SUCCESS,

        message:"VIP badge updated"

    });

}catch(err){

    console.error(err);

    return res.status(500).json({

        success:FAILED,

        message:err.message

    });

}

}

);

// ======================================
// NEXT
// ======================================
//
// Part 6
//
// • Wallet
// • Referral statistics
// • Referral history
// • Upgrade discount
// ======================================
// PART 6
// Wallet
// Statistics
// Referral History
// Upgrade Discount
// ======================================

// ======================================
// REFERRAL STATISTICS
// ======================================

router.get(

"/stats",

authMiddleware,

async(req,res)=>{

try{

    const referrals =

        await Referral.find({

            referrerClientId:

                req.user.id

        });

    const total =
        referrals.length;

    const pending =
        referrals.filter(

            r=>r.status==="pending"

        ).length;

    const qualified =
        referrals.filter(

            r=>r.status==="qualified"

        ).length;

    const rewarded =
        referrals.filter(

            r=>r.status==="rewarded"

        ).length;

    const rejected =
        referrals.filter(

            r=>r.status==="rejected"

        ).length;

    return res.json({

        success:SUCCESS,

        stats:{

            total,

            pending,

            qualified,

            rewarded,

            rejected

        }

    });

}catch(err){

    console.error(err);

    return res.status(500).json({

        success:FAILED,

        message:err.message

    });

}

}

);

// ======================================
// REFERRAL HISTORY
// ======================================

router.get(

"/history",

authMiddleware,

async(req,res)=>{

try{

    const history =

        await Referral.find({

            referrerClientId:

                req.user.id

        })

        .sort({

            createdAt:-1

        });

    return res.json({

        success:SUCCESS,

        history

    });

}catch(err){

    console.error(err);

    return res.status(500).json({

        success:FAILED,

        message:err.message

    });

}

}

);

// ======================================
// WALLET
// ======================================

router.get(

"/wallet",

authMiddleware,

async(req,res)=>{

try{

    const client =

        await Client.findById(

            req.user.id

        );

    return res.json({

        success:SUCCESS,

        wallet:{

            credit:

                client.walletCredit || 0,

            cashReward:

                client.cashReward || 0,

            vipMonths:

                client.vipMonths || 0,

            vipBadge:

                client.vipBadge || null

        }

    });

}catch(err){

    console.error(err);

    return res.status(500).json({

        success:FAILED,

        message:err.message

    });

}

}

);

// ======================================
// UPGRADE DISCOUNT
// ======================================

router.get(

"/upgrade-discount",

authMiddleware,

async(req,res)=>{

try{

    const client =

        await Client.findById(

            req.user.id

        );

    const eligible =

        client.referredBy

        ? true

        : false;

    return res.json({

        success:SUCCESS,

        eligible,

        discount:

            eligible ? 30 : 0

    });

}catch(err){

    console.error(err);

    return res.status(500).json({

        success:FAILED,

        message:err.message

    });

}

}

);

// ======================================
// NEXT
// ======================================
//
// Part 7
//
// • VIP dashboard
// • Referral leaderboard
// • Referral analytics
// • Referral export
// ======================================
// PART 7
// VIP Dashboard
// Leaderboard
// Analytics
// Export
// ======================================

// ======================================
// VIP DASHBOARD
// ======================================

router.get(

"/vip-dashboard",

authMiddleware,

async(req,res)=>{

try{

    const client =

        await Client.findById(

            req.user.id

        );

    const referrals =

        await Referral.find({

            referrerClientId:

                req.user.id

        });

    return res.json({

        success:SUCCESS,

        vip:{

            badge:

                client.vipBadge || null,

            walletCredit:

                client.walletCredit || 0,

            cashReward:

                client.cashReward || 0,

            vipMonths:

                client.vipMonths || 0,

            totalReferrals:

                referrals.length

        }

    });

}catch(err){

    console.error(err);

    return res.status(500).json({

        success:FAILED,

        message:err.message

    });

}

}

);

// ======================================
// LEADERBOARD
// ======================================

router.get(

"/leaderboard",

authMiddleware,

async(req,res)=>{

try{

    const leaderboard =

        await Referral.aggregate([

        {

            $group:{

                _id:"$referrerClientId",

                total:{

                    $sum:1

                }

            }

        },

        {

            $sort:{

                total:-1

            }

        },

        {

            $limit:20

        }

    ]);

    return res.json({

        success:SUCCESS,

        leaderboard

    });

}catch(err){

    console.error(err);

    return res.status(500).json({

        success:FAILED,

        message:err.message

    });

}

}

);

// ======================================
// ANALYTICS
// ======================================

router.get(

"/analytics",

authMiddleware,

async(req,res)=>{

try{

    const referrals =

        await Referral.find({

            referrerClientId:

                req.user.id

        });

    const analytics={

        starter:

            referrals.filter(

                r=>r.referredPlan==="starter"

            ).length,

        growth:

            referrals.filter(

                r=>r.referredPlan==="growth"

            ).length,

        premium:

            referrals.filter(

                r=>r.referredPlan==="premium"

            ).length,

        enterprise:

            referrals.filter(

                r=>r.referredPlan==="enterprise"

            ).length

    };

    return res.json({

        success:SUCCESS,

        analytics

    });

}catch(err){

    console.error(err);

    return res.status(500).json({

        success:FAILED,

        message:err.message

    });

}

}

);

// ======================================
// EXPORT
// ======================================

router.get(

"/export",

authMiddleware,

async(req,res)=>{

try{

    const referrals =

        await Referral.find({

            referrerClientId:

                req.user.id

        }).lean();

    return res.json({

        success:SUCCESS,

        exportedAt:

            new Date(),

        total:

            referrals.length,

        referrals

    });

}catch(err){

    console.error(err);

    return res.status(500).json({

        success:FAILED,

        message:err.message

    });

}

}

);

// ======================================
// NEXT
// ======================================
//
// Part 8
//
// • Admin routes
// • Fraud detection
// • Manual reward approval
// • Health route
// • Module export
// • Production finish
// ======================================
// PART 8
// Admin
// Fraud
// Health
// Export
// ======================================

// ======================================
// ADMIN REFERRALS
// ======================================

router.get(

"/admin/all",

authMiddleware,

async(req,res)=>{

try{

    const client =
        await Client.findById(
            req.user.id
        );

    if(
        !client ||
        client.role !== "admin"
    ){

        return res.status(403).json({

            success:FAILED,

            message:"Access denied"

        });

    }

    const referrals =
        await Referral.find()
        .sort({
            createdAt:-1
        });

    return res.json({

        success:SUCCESS,

        total:referrals.length,

        referrals

    });

}catch(err){

    console.error(err);

    return res.status(500).json({

        success:FAILED,

        message:err.message

    });

}

}

);

// ======================================
// MANUAL REWARD APPROVAL
// ======================================

router.post(

"/admin/approve/:id",

authMiddleware,

async(req,res)=>{

try{

    const client =
        await Client.findById(
            req.user.id
        );

    if(
        !client ||
        client.role !== "admin"
    ){

        return res.status(403).json({

            success:FAILED,

            message:"Access denied"

        });

    }

    const referral =
        await Referral.findById(
            req.params.id
        );

    if(!referral){

        return res.status(404).json({

            success:FAILED,

            message:"Referral not found"

        });

    }

    referral.status =
        STATUS.REWARDED;

    referral.rewardedAt =
        new Date();

    referral.manualApproved =
        true;

    await referral.save();

    return res.json({

        success:SUCCESS,

        referral

    });

}catch(err){

    console.error(err);

    return res.status(500).json({

        success:FAILED,

        message:err.message

    });

}

}

);

// ======================================
// FRAUD CHECK
// ======================================

router.get(

"/admin/fraud",

authMiddleware,

async(req,res)=>{

try{

    const client =
        await Client.findById(
            req.user.id
        );

    if(
        !client ||
        client.role !== "admin"
    ){

        return res.status(403).json({

            success:FAILED,

            message:"Access denied"

        });

    }

    const suspicious =
        await Referral.find({

            $or:[

                {selfReferralBlocked:true},

                {duplicateBlocked:true}

            ]

        });

    return res.json({

        success:SUCCESS,

        total:suspicious.length,

        suspicious

    });

}catch(err){

    console.error(err);

    return res.status(500).json({

        success:FAILED,

        message:err.message

    });

}

}

);

// ======================================
// HEALTH
// ======================================

router.get(

"/health",

(req,res)=>{

    return res.json({

        success:true,

        service:"Referral Routes",

        status:"OK",

        timestamp:new Date()

    });

}

);

// ======================================
// EXPORT
// ======================================

module.exports = router;
