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
