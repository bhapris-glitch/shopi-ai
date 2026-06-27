// ======================================
// src/services/referral.service.js
// Layboka AI
// Referral Service Layer
// Production Ready
// Part 1
// ======================================

"use strict";

// ======================================
// IMPORTS
// ======================================

const mongoose = require("mongoose");

const Client =
require("../../models/Client");

const Referral =
require("../../models/Referral");

const Subscription =
require("../../models/Subscription");

// ======================================
// REFERRAL ENGINE
// ======================================

const referralEngine =
require("../engines/referral.engine");

// ======================================
// CONSTANTS
// ======================================

const SUCCESS = true;
const FAILED = false;

// ======================================
// SERVICE OBJECT
// ======================================

const referralService = {};

// ======================================
// DATABASE TRANSACTION
// ======================================

async function withTransaction(callback){

    const session =
        await mongoose.startSession();

    session.startTransaction();

    try{

        const result =
            await callback(session);

        await session.commitTransaction();

        session.endSession();

        return result;

    }catch(error){

        await session.abortTransaction();

        session.endSession();

        throw error;

    }

}

// ======================================
// AUDIT LOG
// ======================================

async function auditLog(

    action,

    clientId,

    data={}

){

    console.log({

        module:"Referral",

        action,

        clientId,

        timestamp:new Date(),

        data

    });

}

// ======================================
// RESPONSE
// ======================================

function buildResponse(

    success,

    message,

    data={}

){

    return{

        success,

        message,

        ...data

    };

}

// ======================================
// NEXT
// ======================================
//
// Part 2
//
// • generateReferral()
// • validateReferral()
// • registerReferral()
// • transaction support
// ======================================
// PART 2
// Generate
// Validate
// Register Referral
// ======================================

// ======================================
// GENERATE REFERRAL
// ======================================

referralService.generateReferral =
async(clientId)=>{

    return await withTransaction(

    async()=>{

        const client =

            await Client.findById(

                clientId

            );

        if(!client){

            return buildResponse(

                FAILED,

                "Client not found"

            );

        }

        const referral =

            await referralEngine

            .createReferralOwner(

                client

            );

        await auditLog(

            "GENERATE_REFERRAL",

            clientId,

            {

                referralCode:

                    referral.referralCode

            }

        );

        return buildResponse(

            SUCCESS,

            "Referral generated",

            {

                referral

            }

        );

    });

};

// ======================================
// VALIDATE REFERRAL
// ======================================

referralService.validateReferral =
async(

    referralCode,

    referredClient

)=>{

    const validation =

        await referralEngine

        .validateReferralCode(

            referralCode,

            referredClient

        );

    if(!validation.success){

        return buildResponse(

            FAILED,

            validation.message

        );

    }

    return buildResponse(

        SUCCESS,

        "Referral valid",

        validation

    );

};

// ======================================
// REGISTER REFERRAL
// ======================================

referralService.registerReferral =
async(

    referralCode,

    referredClient,

    selectedPlan

)=>{

    return await withTransaction(

    async()=>{

        const result =

            await referralEngine

            .registerReferral(

                referralCode,

                referredClient,

                selectedPlan

            );

        if(!result.success){

            return buildResponse(

                FAILED,

                result.message

            );

        }

        await auditLog(

            "REGISTER_REFERRAL",

            referredClient._id,

            {

                referralCode,

                selectedPlan

            }

        );

        return buildResponse(

            SUCCESS,

            "Referral registered",

            {

                referral:

                    result.referral

            }

        );

    });

};

// ======================================
// NEXT
// ======================================
//
// Part 3
//
// • saveFirstPayment()
// • qualifyGrowthReferral()
// • qualifyPremiumReferral()
// • automatic audit logging
// ======================================
// PART 3
// First Payment
// Qualification
// Audit
// ======================================

// ======================================
// SAVE FIRST PAYMENT
// ======================================

referralService.saveFirstPayment =
async(

    clientId,

    amount

)=>{

    return await withTransaction(

    async()=>{

        const referral =

            await referralEngine

            .saveFirstPayment(

                clientId,

                amount

            );

        if(!referral){

            return buildResponse(

                FAILED,

                "Referral not found"

            );

        }

        await auditLog(

            "FIRST_PAYMENT",

            clientId,

            {

                amount

            }

        );

        return buildResponse(

            SUCCESS,

            "First payment recorded",

            {

                referral

            }

        );

    });

};

// ======================================
// QUALIFY GROWTH REFERRAL
// ======================================

referralService.qualifyGrowthReferral =
async(clientId)=>{

    return await withTransaction(

    async()=>{

        const referral =

            await referralEngine

            .qualifyGrowthReferral(

                clientId

            );

        if(!referral){

            return buildResponse(

                FAILED,

                "Referral not found"

            );

        }

        await auditLog(

            "GROWTH_QUALIFICATION",

            clientId,

            {

                status:

                    referral.status

            }

        );

        return buildResponse(

            SUCCESS,

            "Growth qualification checked",

            {

                referral

            }

        );

    });

};

// ======================================
// QUALIFY PREMIUM REFERRAL
// ======================================

referralService.qualifyPremiumReferral =
async(clientId)=>{

    return await withTransaction(

    async()=>{

        const referral =

            await referralEngine

            .qualifyPremiumReferral(

                clientId

            );

        if(!referral){

            return buildResponse(

                FAILED,

                "Referral not found"

            );

        }

        await auditLog(

            "PREMIUM_QUALIFICATION",

            clientId,

            {

                status:

                    referral.status

            }

        );

        return buildResponse(

            SUCCESS,

            "Premium qualification checked",

            {

                referral

            }

        );

    });

};

// ======================================
// NEXT
// ======================================
//
// Part 4
//
// • applyGrowthReward()
// • processPremiumVIPReward()
// • processEnterpriseReward()
// • updateVIPBadge()
// ======================================
// PART 4
// Reward Processing
// VIP Badge
// ======================================

// ======================================
// APPLY GROWTH REWARD
// ======================================

referralService.applyGrowthReward =
async(clientId)=>{

    return await withTransaction(

    async()=>{

        const referral =

            await Referral.findOne({

                referredClientId:

                    clientId

            });

        if(!referral){

            return buildResponse(

                FAILED,

                "Referral not found"

            );

        }

        const reward =

            await referralEngine

            .applyGrowthReward(

                referral

            );

        await auditLog(

            "GROWTH_REWARD",

            clientId,

            {

                rewardType:

                    reward.rewardType,

                rewardValue:

                    reward.rewardValue

            }

        );

        return buildResponse(

            SUCCESS,

            "Growth reward applied",

            {

                reward

            }

        );

    });

};

// ======================================
// PREMIUM VIP REWARD
// ======================================

referralService.applyPremiumReward =
async(clientId)=>{

    return await withTransaction(

    async()=>{

        const referral =

            await Referral.findOne({

                referredClientId:

                    clientId

            });

        if(!referral){

            return buildResponse(

                FAILED,

                "Referral not found"

            );

        }

        const reward =

            await referralEngine

            .processPremiumVIPReward(

                referral

            );

        await auditLog(

            "PREMIUM_REWARD",

            clientId,

            {

                rewardType:

                    reward.rewardType,

                rewardAmount:

                    reward.rewardAmount || 0

            }

        );

        return buildResponse(

            SUCCESS,

            "Premium reward processed",

            {

                reward

            }

        );

    });

};

// ======================================
// ENTERPRISE REWARD
// ======================================

referralService.applyEnterpriseReward =
async(clientId)=>{

    return await withTransaction(

    async()=>{

        const referral =

            await Referral.findOne({

                referredClientId:

                    clientId

            });

        if(!referral){

            return buildResponse(

                FAILED,

                "Referral not found"

            );

        }

        const reward =

            await referralEngine

            .processEnterpriseReward(

                referral

            );

        await auditLog(

            "ENTERPRISE_REWARD",

            clientId,

            {

                rewardAmount:

                    reward.rewardAmount || 0

            }

        );

        return buildResponse(

            SUCCESS,

            "Enterprise reward processed",

            {

                reward

            }

        );

    });

};

// ======================================
// UPDATE VIP BADGE
// ======================================

referralService.updateVIPBadge =
async(clientId)=>{

    await referralEngine

        .updateVIPBadge(

            clientId

        );

    const client =

        await Client.findById(

            clientId

        );

    await auditLog(

        "VIP_BADGE_UPDATED",

        clientId,

        {

            badge:

                client.vipBadge,

            vipMonths:

                client.vipMonths || 0

        }

    );

    return buildResponse(

        SUCCESS,

        "VIP badge updated",

        {

            vipBadge:

                client.vipBadge,

            vipMonths:

                client.vipMonths || 0

        }

    );

};

// ======================================
// NEXT
// ======================================
//
// Part 5
//
// • Wallet Service
// • Referral Statistics
// • Referral History
// • Leaderboard
// ======================================
// PART 5
// Wallet
// Statistics
// History
// Leaderboard
// ======================================

// ======================================
// WALLET
// ======================================

referralService.getWallet =
async(clientId)=>{

    const client =
        await Client.findById(
            clientId
        );

    if(!client){

        return buildResponse(
            FAILED,
            "Client not found"
        );

    }

    return buildResponse(

        SUCCESS,

        "Wallet fetched",

        {

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

        }

    );

};

// ======================================
// REFERRAL STATISTICS
// ======================================

referralService.getStatistics =
async(clientId)=>{

    const referrals =
        await referralEngine
        .getClientReferrals(
            clientId
        );

    const stats={

        total:
            referrals.length,

        pending:
            referrals.filter(
                r=>r.status==="pending"
            ).length,

        qualified:
            referrals.filter(
                r=>r.status==="qualified"
            ).length,

        rewarded:
            referrals.filter(
                r=>r.status==="rewarded"
            ).length,

        rejected:
            referrals.filter(
                r=>r.status==="rejected"
            ).length,

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

    return buildResponse(

        SUCCESS,

        "Statistics loaded",

        {

            stats

        }

    );

};

// ======================================
// REFERRAL HISTORY
// ======================================

referralService.getHistory =
async(clientId)=>{

    const history =
        await referralEngine
        .getClientReferrals(
            clientId
        );

    return buildResponse(

        SUCCESS,

        "History loaded",

        {

            total:
                history.length,

            history

        }

    );

};

// ======================================
// LEADERBOARD
// ======================================

referralService.getLeaderboard =
async()=>{

    const leaderboard =
        await Referral.aggregate([

        {

            $group:{

                _id:"$referrerClientId",

                referrals:{
                    $sum:1
                },

                rewarded:{
                    $sum:{
                        $cond:[
                            {
                                $eq:[
                                    "$status",
                                    "rewarded"
                                ]
                            },
                            1,
                            0
                        ]
                    }

                }

            }

        },

        {

            $sort:{
                referrals:-1
            }

        },

        {

            $limit:20

        }

    ]);

    return buildResponse(

        SUCCESS,

        "Leaderboard loaded",

        {

            leaderboard

        }

    );

};

// ======================================
// NEXT
// ======================================
//
// Part 6
//
// • Analytics
// • Export referrals
// • Upgrade discount
// • Billing summary
// ======================================
// PART 6
// Analytics
// Export
// Upgrade Discount
// Billing Summary
// ======================================

// ======================================
// ANALYTICS
// ======================================

referralService.getAnalytics =
async(clientId)=>{

    const referrals =
        await referralEngine
        .getClientReferrals(
            clientId
        );

    let rewardValue = 0;

    referrals.forEach(r=>{

        rewardValue += Number(

            r.rewardAmount || 0

        );

    });

    const rewarded =

        referrals.filter(

            r=>r.status==="rewarded"

        ).length;

    const conversionRate =

        referrals.length === 0

        ? 0

        :

        Number(

            (

                rewarded /

                referrals.length

            ) * 100

        ).toFixed(2);

    return buildResponse(

        SUCCESS,

        "Analytics loaded",

        {

            analytics:{

                totalReferrals:
                    referrals.length,

                rewarded,

                rewardValue,

                conversionRate

            }

        }

    );

};

// ======================================
// EXPORT REFERRALS
// ======================================

referralService.exportReferrals =
async(clientId)=>{

    const referrals =

        await referralEngine
        .getClientReferrals(
            clientId
        );

    return buildResponse(

        SUCCESS,

        "Export ready",

        {

            exportedAt:
                new Date(),

            total:
                referrals.length,

            referrals

        }

    );

};

// ======================================
// UPGRADE DISCOUNT
// ======================================

referralService.getUpgradeDiscount =
async(clientId)=>{

    const client =

        await Client.findById(
            clientId
        );

    if(!client){

        return buildResponse(

            FAILED,

            "Client not found"

        );

    }

    const eligible =

        !!client.referredBy;

    return buildResponse(

        SUCCESS,

        "Upgrade discount",

        {

            eligible,

            discount:

                eligible ? 30 : 0

        }

    );

};

// ======================================
// BILLING SUMMARY
// ======================================

referralService.getBillingSummary =
async(clientId)=>{

    const subscription =

        await Subscription.findOne({

            clientId

        });

    if(!subscription){

        return buildResponse(

            FAILED,

            "Subscription not found"

        );

    }

    const billing =

        referralEngine
        .buildBillingSummary(
            subscription
        );

    return buildResponse(

        SUCCESS,

        "Billing summary",

        {

            billing

        }

    );

};

// ======================================
// NEXT
// ======================================
//
// Part 7
//
// • Admin Dashboard
// • Fraud Detection
// • Manual Reward Approval
// • Health Check
// • module.exports
// ======================================
// PART 7
// Admin
// Fraud
// Health
// Production Finish
// ======================================

// ======================================
// ADMIN DASHBOARD
// ======================================

referralService.adminDashboard =
async()=>{

    const referrals =
        await Referral.find();

    return buildResponse(

        SUCCESS,

        "Admin dashboard",

        {

            dashboard:{

                total:
                    referrals.length,

                pending:
                    referrals.filter(
                        r=>r.status==="pending"
                    ).length,

                qualified:
                    referrals.filter(
                        r=>r.status==="qualified"
                    ).length,

                rewarded:
                    referrals.filter(
                        r=>r.status==="rewarded"
                    ).length,

                rejected:
                    referrals.filter(
                        r=>r.status==="rejected"
                    ).length

            }

        }

    );

};

// ======================================
// FRAUD CASES
// ======================================

referralService.getFraudCases =
async()=>{

    const fraud =

        await Referral.find({

            $or:[

                {

                    selfReferralBlocked:true

                },

                {

                    duplicateBlocked:true

                }

            ]

        });

    return buildResponse(

        SUCCESS,

        "Fraud report",

        {

            total:
                fraud.length,

            fraud

        }

    );

};

// ======================================
// MANUAL APPROVAL
// ======================================

referralService.manualApproveReward =
async(referralId)=>{

    const referral =

        await Referral.findById(

            referralId

        );

    if(!referral){

        return buildResponse(

            FAILED,

            "Referral not found"

        );

    }

    referral.status = "rewarded";

    referral.rewardedAt =
        new Date();

    referral.manualApproved = true;

    await referral.save();

    await auditLog(

        "MANUAL_APPROVAL",

        referral.referrerClientId,

        {

            referralId

        }

    );

    return buildResponse(

        SUCCESS,

        "Reward approved",

        {

            referral

        }

    );

};

// ======================================
// HEALTH
// ======================================

referralService.health =
async()=>{

    return buildResponse(

        SUCCESS,

        "Referral service healthy",

        {

            service:
                "Referral Service",

            timestamp:
                new Date()

        }

    );

};

// ======================================
// EXPORT
// ======================================

module.exports =
referralService;
