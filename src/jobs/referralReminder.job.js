// ======================================
// src/jobs/referralReminder.job.js
// Layboka AI
// Referral Reminder Job
// Production Ready
// Part 1
// ======================================

"use strict";

// ======================================
// IMPORTS
// ======================================

const Subscription =
require("../../models/Subscription");

const Client =
require("../../models/Client");

const Referral =
require("../../models/Referral");

const referralService =
require("../services/referral.service");

// ======================================
// CONSTANTS
// ======================================

const JOB_NAME =
"Referral Reminder Job";

const HOURS_48 =
48;

const HOURS_24 =
24;

const HOURS_6 =
6;

const STATUS = {

TRIAL:"trial",

ACTIVE:"active",

EXPIRED:"expired",

PAYMENT_FAILED:"payment_failed"

};

// ======================================
// LOGGER
// ======================================

function log(message){

    console.log(

        `[${JOB_NAME}]`,

        new Date().toISOString(),

        message

    );

}

// ======================================
// DATE HELPERS
// ======================================

function now(){

    return new Date();

}

function hoursRemaining(date){

    const diff =

        new Date(date).getTime()

        -

        Date.now();

    return Math.floor(

        diff /

        (1000*60*60)

    );

}

// ======================================
// JOB OBJECT
// ======================================

const referralReminderJob = {};

// ======================================
// NEXT
// ======================================
//
// Part 2
//
// • 48-hour reminder
// • Enable chatbot banner
// • Prevent duplicate reminders
// ======================================
// PART 2
// 48 Hour Reminder
// Chatbot Banner
// Duplicate Protection
// ======================================

// ======================================
// 48 HOUR REMINDER
// ======================================

referralReminderJob.process48HourReminder =
async()=>{

    log("Checking 48 hour reminders...");

    const subscriptions =

        await Subscription.find({

            status:STATUS.TRIAL,

            locked:false

        });

    for(const subscription of subscriptions){

        try{

            if(

                subscription.reminder48Sent

            ){

                continue;

            }

            if(

                !subscription.expiryDate

            ){

                continue;

            }

            const hours =

                hoursRemaining(

                    subscription.expiryDate

                );

            if(

                hours <= HOURS_48 &&

                hours > HOURS_24

            ){

                subscription.showRenewBanner = true;

                subscription.bannerType =

                    "trial_48";

                subscription.bannerStart =

                    now();

                subscription.reminder48Sent =

                    true;

                subscription.bannerEnabled =

                    true;

                await subscription.save();

                log(

                    `48h reminder -> ${subscription.clientId}`

                );

                // Email service
                // Notification service
                // Push notification
                // will be called here

            }

        }catch(error){

            console.error(error);

        }

    }

};

// ======================================
// CHATBOT COUNTDOWN
// ======================================

referralReminderJob.enableCountdown =
async(subscription)=>{

    subscription.showRenewBanner = true;

    subscription.bannerEnabled = true;

    subscription.bannerType =

        "countdown";

    subscription.bannerStart =

        now();

    await subscription.save();

};

// ======================================
// REMOVE BANNER
// AFTER PAYMENT
// ======================================

referralReminderJob.clearBanner =
async(subscription)=>{

    subscription.showRenewBanner = false;

    subscription.bannerEnabled = false;

    subscription.bannerType = "";

    subscription.bannerStart = null;

    subscription.reminder48Sent = false;

    subscription.reminder24Sent = false;

    subscription.reminder6Sent = false;

    await subscription.save();

};

// ======================================
// NEXT
// ======================================
//
// Part 3
//
// • 24 hour reminder
// • 6 hour reminder
// • Red warning banner
// • Email reminder

  
