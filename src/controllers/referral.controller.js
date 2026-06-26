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
