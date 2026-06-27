// ======================================
// shopi-ai/src/services/subscription.service.js
// Layboka AI
// Subscription Service
// Production Ready
// Part 1
// ======================================

"use strict";

// ======================================
// IMPORTS
// ======================================

const mongoose =
require("mongoose");

const Client =
require("../../models/Client");

const Subscription =
require("../../models/Subscription");

const Referral =
require("../../models/Referral");

const referralService =
require("./referral.service");

// ======================================
// CONSTANTS
// ======================================

const PLAN = {

FREE:"free",

STARTER:"starter",

GROWTH:"growth",

PREMIUM:"premium",

ENTERPRISE:"enterprise"

};

const STATUS = {

TRIAL:"trial",

ACTIVE:"active",

EXPIRED:"expired",

CANCELLED:"cancelled",

PAUSED:"paused",

PAYMENT_FAILED:"payment_failed"

};

const BILLING = {

MONTHLY:"monthly",

YEARLY:"yearly"

};

const CURRENCY =

"USD";

const TRIAL_DAYS =

14;

const UPGRADE_DISCOUNT =

30;

// ======================================
// SERVICE
// ======================================

const subscriptionService = {};

// ======================================
// LOGGER
// ======================================

function log(

    message,

    data={}

){

    console.log({

        module:

        "SubscriptionService",

        timestamp:

        new Date(),

        message,

        data

    });

}

// ======================================
// RESPONSE
// ======================================

function buildResponse(

    success,

    message,

    payload={}

){

    return{

        success,

        message,

        ...payload

    };

}

// ======================================
// DATABASE TRANSACTION
// ======================================

async function withTransaction(

    callback

){

    const session =

        await mongoose.startSession();

    session.startTransaction();

    try{

        const result =

            await callback(

                session

            );

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
// DATE HELPERS
// ======================================

function addDays(

    date,

    days

){

    const d =

        new Date(date);

    d.setDate(

        d.getDate()+days

    );

    return d;

}

function addMonths(

    date,

    months

){

    const d =

        new Date(date);

    d.setMonth(

        d.getMonth()+months

    );

    return d;

}

function addYears(

    date,

    years

){

    const d =

        new Date(date);

    d.setFullYear(

        d.getFullYear()+years

    );

    return d;

}

// ======================================
// NEXT
// ======================================
//
// Part 2
//
// • createTrial()
// • activateSubscription()
// • createSubscription()
// • upgradeSubscription()
//
