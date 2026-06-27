// ======================================
// src/controllers/referral.controller.js
// Layboka AI
// Referral Controller
// Production Ready
// Part 1
// ======================================

"use strict";

// ======================================
// IMPORTS
// ======================================

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
// HELPERS
// ======================================

const SUCCESS = true;

const FAILED = false;

// ======================================
// RESPONSE HELPERS
// ======================================

function ok(

res,

data = {},

message = "Success"

){

    return res.status(200).json({

        success:SUCCESS,

        message,

        ...data

    });

}

function badRequest(

res,

message = "Bad Request"

){

    return res.status(400).json({

        success:FAILED,

        message

    });

}

function unauthorized(

res,

message = "Unauthorized"

){

    return res.status(401).json({

        success:FAILED,

        message

    });

}

function forbidden(

res,

message = "Forbidden"

){

    return res.status(403).json({

        success:FAILED,

        message

    });

}

function notFound(

res,

message = "Not Found"

){

    return res.status(404).json({

        success:FAILED,

        message

    });

}

function serverError(

res,

error

){

    console.error(error);

    return res.status(500).json({

        success:FAILED,

        message:

            error.message ||

            "Internal Server Error"

    });

}

// ======================================
// CONTROLLER OBJECT
// ======================================

const referralController = {};

// ======================================
// PART 2
//
// • generateReferral()
// • getReferralProfile()
// • getDashboard()
//
// ======================================
// ======================================
// PART 2
// Generate Referral
// Referral Profile
// Dashboard
// ======================================

// ======================================
// GENERATE REFERRAL
// ======================================

referralController.generateReferral =
async(req,res)=>{

try{

    const client =

        await Client.findById(

            req.user.id

        );

    if(!client){

        return notFound(

            res,

            "Client not found"

        );

    }

    const referral =

        await referralEngine

        .createReferralOwner(

            client

        );

    return ok(

        res,

        {

            referralCode:

                referral.referralCode,

            referralId:

                referral._id

        },

        "Referral code generated"

    );

}catch(error){

    return serverError(

        res,

        error

    );

}

};

// ======================================
// REFERRAL PROFILE
// ======================================

referralController.getReferralProfile =
async(req,res)=>{

try{

    const client =

        await Client.findById(

            req.user.id

        );

    if(!client){

        return notFound(

            res,

            "Client not found"

        );

    }

    const referral =

        await Referral.findOne({

            referrerClientId:

                client._id

        });

    return ok(

        res,

        {

            profile:{

                clientId:

                    client._id,

                store:

                    client.store,

                company:

                    client.company,

                referralCode:

                    referral

                    ? referral.referralCode

                    : "",

                walletCredit:

                    client.walletCredit || 0,

                cashReward:

                    client.cashReward || 0,

                vipBadge:

                    client.vipBadge || null

            }

        }

    );

}catch(error){

    return serverError(

        res,

        error

    );

}

};

// ======================================
// REFERRAL DASHBOARD
// ======================================

referralController.getDashboard =
async(req,res)=>{

try{

    const referrals =

        await referralEngine

        .getClientReferrals(

            req.user.id

        );

    const summary={

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

    };

    return ok(

        res,

        {

            summary,

            referrals

        }

    );

}catch(error){

    return serverError(

        res,

        error

    );

}

};

// ======================================
// NEXT
// ======================================
//
// Part 3
//
// • validateReferral()
// • registerReferral()
// • saveFirstPayment()
// ======================================
// PART 3
// Validate Referral
// Register Referral
// First Payment
// ======================================

// ======================================
// VALIDATE REFERRAL
// ======================================

referralController.validateReferral =
async(req,res)=>{

try{

    const{

        referralCode

    } = req.body;

    if(!referralCode){

        return badRequest(

            res,

            "Referral code required"

        );

    }

    const referral =

        await Referral.findOne({

            referralCode:

                referralCode

                .trim()

                .toUpperCase()

        });

    if(!referral){

        return ok(

            res,

            {

                valid:false

            },

            "Invalid referral code"

        );

    }

    return ok(

        res,

        {

            valid:true,

            referralCode:

                referral.referralCode

        },

        "Referral code verified"

    );

}catch(error){

    return serverError(

        res,

        error

    );

}

};

// ======================================
// REGISTER REFERRAL
// ======================================

referralController.registerReferral =
async(req,res)=>{

try{

    const{

        referralCode,

        clientId,

        selectedPlan

    } = req.body;

    if(

        !referralCode ||

        !clientId ||

        !selectedPlan

    ){

        return badRequest(

            res,

            "Missing required fields"

        );

    }

    const client =

        await Client.findById(

            clientId

        );

    if(!client){

        return notFound(

            res,

            "Client not found"

        );

    }

    const result =

        await referralEngine

        .registerReferral(

            referralCode,

            client,

            selectedPlan

        );

    if(!result.success){

        return badRequest(

            res,

            result.message

        );

    }

    return ok(

        res,

        {

            referral:

                result.referral

        },

        "Referral registered"

    );

}catch(error){

    return serverError(

        res,

        error

    );

}

};

// ======================================
// SAVE FIRST PAYMENT
// ======================================

referralController.saveFirstPayment =
async(req,res)=>{

try{

    const{

        amount

    } = req.body;

    if(!amount){

        return badRequest(

            res,

            "Payment amount required"

        );

    }

    const referral =

        await referralEngine

        .saveFirstPayment(

            req.user.id,

            amount

        );

    if(!referral){

        return notFound(

            res,

            "Referral not found"

        );

    }

    return ok(

        res,

        {

            referral

        },

        "First payment recorded"

    );

}catch(error){

    return serverError(

        res,

        error

    );

}

};

// ======================================
// NEXT
// ======================================
//
// Part 4
//
// • qualifyGrowthReferral()
// • qualifyPremiumReferral()
// • applyGrowthReward()
// ======================================
// PART 4
// Qualification Engine
// Reward Engine
// ======================================

// ======================================
// QUALIFY GROWTH
// ======================================

referralController.qualifyGrowthReferral =
async(req,res)=>{

try{

    const referral =

        await referralEngine

        .qualifyGrowthReferral(

            req.user.id

        );

    if(!referral){

        return notFound(

            res,

            "Referral not found"

        );

    }

    return ok(

        res,

        {

            referral

        },

        "Growth qualification checked"

    );

}catch(error){

    return serverError(

        res,

        error

    );

}

};

// ======================================
// QUALIFY PREMIUM
// ======================================

referralController.qualifyPremiumReferral =
async(req,res)=>{

try{

    const referral =

        await referralEngine

        .qualifyPremiumReferral(

            req.user.id

        );

    if(!referral){

        return notFound(

            res,

            "Referral not found"

        );

    }

    return ok(

        res,

        {

            referral

        },

        "Premium qualification checked"

    );

}catch(error){

    return serverError(

        res,

        error

    );

}

};

// ======================================
// APPLY GROWTH REWARD
// ======================================

referralController.applyGrowthReward =
async(req,res)=>{

try{

    const referral =

        await Referral.findOne({

            referredClientId:

                req.user.id

        });

    if(!referral){

        return notFound(

            res,

            "Referral not found"

        );

    }

    const reward =

        await referralEngine

        .applyGrowthReward(

            referral

        );

    return ok(

        res,

        {

            reward

        },

        "Growth reward processed"

    );

}catch(error){

    return serverError(

        res,

        error

    );

}

};

// ======================================
// APPLY PREMIUM VIP REWARD
// ======================================

referralController.applyPremiumReward =
async(req,res)=>{

try{

    const referral =

        await Referral.findOne({

            referredClientId:

                req.user.id

        });

    if(!referral){

        return notFound(

            res,

            "Referral not found"

        );

    }

    const reward =

        await referralEngine

        .processPremiumVIPReward(

            referral

        );

    return ok(

        res,

        {

            reward

        },

        "Premium reward processed"

    );

}catch(error){

    return serverError(

        res,

        error

    );

}

};

// ======================================
// APPLY ENTERPRISE REWARD
// ======================================

referralController.applyEnterpriseReward =
async(req,res)=>{

try{

    const referral =

        await Referral.findOne({

            referredClientId:

                req.user.id

        });

    if(!referral){

        return notFound(

            res,

            "Referral not found"

        );

    }

    const reward =

        await referralEngine

        .processEnterpriseReward(

            referral

        );

    return ok(

        res,

        {

            reward

        },

        "Enterprise reward processed"

    );

}catch(error){

    return serverError(

        res,

        error

    );

}

};

// ======================================
// NEXT
// ======================================
//
// Part 5
//
// • updateVIPBadge()
// • getWallet()
// • getStatistics()
// • getHistory()
// ======================================
// PART 5
// VIP Badge
// Wallet
// Statistics
// History
// ======================================

// ======================================
// UPDATE VIP BADGE
// ======================================

referralController.updateVIPBadge =
async(req,res)=>{

try{

    await referralEngine

        .updateVIPBadge(

            req.user.id

        );

    const client =

        await Client.findById(

            req.user.id

        );

    return ok(

        res,

        {

            vipBadge:

                client.vipBadge,

            vipMonths:

                client.vipMonths || 0

        },

        "VIP badge updated"

    );

}catch(error){

    return serverError(

        res,

        error

    );

}

};

// ======================================
// WALLET
// ======================================

referralController.getWallet =
async(req,res)=>{

try{

    const client =

        await Client.findById(

            req.user.id

        );

    if(!client){

        return notFound(

            res,

            "Client not found"

        );

    }

    return ok(

        res,

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

}catch(error){

    return serverError(

        res,

        error

    );

}

};

// ======================================
// REFERRAL STATISTICS
// ======================================

referralController.getStatistics =
async(req,res)=>{

try{

    const referrals =

        await referralEngine

        .getClientReferrals(

            req.user.id

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

    return ok(

        res,

        {

            stats

        }

    );

}catch(error){

    return serverError(

        res,

        error

    );

}

};

// ======================================
// REFERRAL HISTORY
// ======================================

referralController.getHistory =
async(req,res)=>{

try{

    const history =

        await referralEngine

        .getClientReferrals(

            req.user.id

        );

    return ok(

        res,

        {

            total:

                history.length,

            history

        }

    );

}catch(error){

    return serverError(

        res,

        error

    );

}

};

// ======================================
// NEXT
// ======================================
//
// Part 6
//
// • Leaderboard
// • Analytics
// • Export
// • Upgrade Discount
// ======================================
// PART 6
// Leaderboard
// Analytics
// Export
// Upgrade Discount
// ======================================

// ======================================
// LEADERBOARD
// ======================================

referralController.getLeaderboard =
async(req,res)=>{

try{

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

    return ok(

        res,

        {

            leaderboard

        }

    );

}catch(error){

    return serverError(

        res,

        error

    );

}

};

// ======================================
// ANALYTICS
// ======================================

referralController.getAnalytics =
async(req,res)=>{

try{

    const referrals =
        await referralEngine
        .getClientReferrals(
            req.user.id
        );

    let totalReward = 0;

    referrals.forEach(r=>{

        totalReward +=
            Number(
                r.rewardAmount || 0
            );

    });

    return ok(

        res,

        {

            analytics:{

                totalReferrals:
                    referrals.length,

                rewardedValue:
                    totalReward,

                conversionRate:
                    referrals.length === 0

                    ? 0

                    :

                    Number(

                        (

                            referrals.filter(

                                r=>r.status==="rewarded"

                            ).length

                            /

                            referrals.length

                        )

                        *100

                    ).toFixed(2)

            }

        }

    );

}catch(error){

    return serverError(

        res,

        error

    );

}

};

// ======================================
// EXPORT REFERRALS
// ======================================

referralController.exportReferrals =
async(req,res)=>{

try{

    const referrals =
        await referralEngine
        .getClientReferrals(
            req.user.id
        );

    return ok(

        res,

        {

            exportedAt:
                new Date(),

            total:
                referrals.length,

            referrals

        },

        "Referral export generated"

    );

}catch(error){

    return serverError(

        res,

        error

    );

}

};

// ======================================
// UPGRADE DISCOUNT
// ======================================

referralController.getUpgradeDiscount =
async(req,res)=>{

try{

    const client =
        await Client.findById(
            req.user.id
        );

    if(!client){

        return notFound(

            res,

            "Client not found"

        );

    }

    const discount =

        client.referredBy

        ? 30

        : 0;

    return ok(

        res,

        {

            eligible:

                discount>0,

            discount,

            message:

                discount>0

                ?

                "30% upgrade discount available"

                :

                "No upgrade discount"

        }

    );

}catch(error){

    return serverError(

        res,

        error

    );

}

};

// ======================================
// NEXT
// ======================================
//
// Part 7
//
// • Admin Dashboard
// • Fraud Detection
// • Manual Approval
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

referralController.adminDashboard =
async(req,res)=>{

try{

    const admin =
        await Client.findById(
            req.user.id
        );

    if(
        !admin ||
        admin.role !== "admin"
    ){

        return forbidden(
            res,
            "Access denied"
        );

    }

    const referrals =
        await Referral.find();

    const dashboard={

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

    };

    return ok(

        res,

        {

            dashboard

        }

    );

}catch(error){

    return serverError(
        res,
        error
    );

}

};

// ======================================
// FRAUD DETECTION
// ======================================

referralController.getFraudCases =
async(req,res)=>{

try{

    const admin =
        await Client.findById(
            req.user.id
        );

    if(
        !admin ||
        admin.role !== "admin"
    ){

        return forbidden(
            res,
            "Access denied"
        );

    }

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

    return ok(

        res,

        {

            total:
                fraud.length,

            fraud

        }

    );

}catch(error){

    return serverError(
        res,
        error
    );

}

};

// ======================================
// MANUAL APPROVAL
// ======================================

referralController.manualApproveReward =
async(req,res)=>{

try{

    const admin =
        await Client.findById(
            req.user.id
        );

    if(
        !admin ||
        admin.role !== "admin"
    ){

        return forbidden(
            res,
            "Access denied"
        );

    }

    const referral =
        await Referral.findById(
            req.params.id
        );

    if(!referral){

        return notFound(
            res,
            "Referral not found"
        );

    }

    referral.status =
        "rewarded";

    referral.rewardedAt =
        new Date();

    referral.manualApproved =
        true;

    await referral.save();

    return ok(

        res,

        {

            referral

        },

        "Reward approved"

    );

}catch(error){

    return serverError(
        res,
        error
    );

}

};

// ======================================
// HEALTH CHECK
// ======================================

referralController.health =
async(req,res)=>{

    return ok(

        res,

        {

            service:
                "Referral Controller",

            status:
                "Healthy",

            timestamp:
                new Date()

        }

    );

};

// ======================================
// EXPORT
// ======================================

module.exports =
referralController;
