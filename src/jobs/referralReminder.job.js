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
// ======================================
// PART 3
// 24 Hour Reminder
// 6 Hour Reminder
// Warning Banner
// ======================================

// ======================================
// 24 HOUR REMINDER
// ======================================

referralReminderJob.process24HourReminder =
async()=>{

    log("Checking 24 hour reminders...");

    const subscriptions =

        await Subscription.find({

            status:STATUS.TRIAL,

            locked:false,

            reminder24Sent:false

        });

    for(const subscription of subscriptions){

        try{

            if(!subscription.expiryDate)
                continue;

            const hours =

                hoursRemaining(

                    subscription.expiryDate

                );

            if(

                hours <= HOURS_24 &&

                hours > HOURS_6

            ){

                subscription.showRenewBanner = true;

                subscription.bannerEnabled = true;

                subscription.bannerType =

                    "trial_24";

                subscription.bannerColor =

                    "orange";

                subscription.reminder24Sent = true;

                subscription.bannerStart =
                    now();

                await subscription.save();

                log(

                    `24h reminder -> ${subscription.clientId}`

                );

                // TODO
                // Email Reminder
                // Push Notification
                // WhatsApp
                // In-App Notification

            }

        }catch(error){

            console.error(error);

        }

    }

};

// ======================================
// 6 HOUR REMINDER
// ======================================

referralReminderJob.process6HourReminder =
async()=>{

    log("Checking 6 hour reminders...");

    const subscriptions =

        await Subscription.find({

            status:STATUS.TRIAL,

            locked:false,

            reminder6Sent:false

        });

    for(const subscription of subscriptions){

        try{

            if(!subscription.expiryDate)
                continue;

            const hours =

                hoursRemaining(

                    subscription.expiryDate

                );

            if(

                hours <= HOURS_6 &&

                hours >= 0

            ){

                subscription.showRenewBanner = true;

                subscription.bannerEnabled = true;

                subscription.bannerType =

                    "trial_6";

                subscription.bannerColor =

                    "red";

                subscription.bannerAnimation =

                    "pulse";

                subscription.reminder6Sent = true;

                subscription.bannerStart =
                    now();

                await subscription.save();

                log(

                    `6h reminder -> ${subscription.clientId}`

                );

                // TODO
                // Final Reminder Email
                // SMS
                // WhatsApp
                // Push Notification

            }

        }catch(error){

            console.error(error);

        }

    }

};

// ======================================
// CHATBOT WARNING DATA
// chatbot.js reads these values
// ======================================

referralReminderJob.buildBannerData =
(subscription)=>{

    return{

        show:

            subscription.showRenewBanner,

        type:

            subscription.bannerType,

        color:

            subscription.bannerColor ||

            "blue",

        animation:

            subscription.bannerAnimation ||

            "none",

        expiryDate:

            subscription.expiryDate,

        title:

            "Premium Trial",

        message:

            "Recharge now to keep your AI Assistant running."

    };

};

// ======================================
// NEXT
// ======================================
//
// Part 4
//
// • Trial expired
// • Lock chatbot
// • Unlock after payment
// • Expired banner
// ======================================
// PART 4
// Trial Expired
// Lock Chatbot
// Unlock After Payment
// ======================================

// ======================================
// EXPIRE TRIAL
// ======================================

referralReminderJob.processExpiredTrials =
async()=>{

    log("Checking expired trials...");

    const subscriptions =

        await Subscription.find({

            status:STATUS.TRIAL,

            locked:false

        });

    for(const subscription of subscriptions){

        try{

            if(!subscription.expiryDate)
                continue;

            if(

                new Date(subscription.expiryDate)

                >

                now()

            ){

                continue;

            }

            subscription.status =
                STATUS.EXPIRED;

            subscription.locked = true;

            subscription.bannerEnabled = true;

            subscription.showRenewBanner = true;

            subscription.bannerType =
                "expired";

            subscription.bannerColor =
                "red";

            subscription.bannerAnimation =
                "pulse";

            await subscription.save();

            const client =

                await Client.findById(

                    subscription.clientId

                );

            if(client){

                // ==================================
                // CHATBOT LOCK
                // ==================================

                client.chatbotEnabled = false;

                client.aiEnabled = false;

                client.subscriptionStatus =
                    STATUS.EXPIRED;

                await client.save();

            }

            log(

                `Trial expired -> ${subscription.clientId}`

            );

            // TODO
            // Send Expired Email
            // Push Notification
            // WhatsApp Reminder

        }catch(error){

            console.error(error);

        }

    }

};

// ======================================
// UNLOCK CHATBOT
// AFTER SUCCESSFUL PAYMENT
// ======================================

referralReminderJob.unlockSubscription =
async(clientId)=>{

    const subscription =

        await Subscription.findOne({

            clientId

        });

    if(!subscription)
        return;

    subscription.status =
        STATUS.ACTIVE;

    subscription.locked = false;

    subscription.showRenewBanner = false;

    subscription.bannerEnabled = false;

    subscription.bannerType = "";

    subscription.bannerColor = "";

    subscription.bannerAnimation = "";

    subscription.reminder48Sent = false;

    subscription.reminder24Sent = false;

    subscription.reminder6Sent = false;

    await subscription.save();

    const client =

        await Client.findById(

            clientId

        );

    if(client){

        client.chatbotEnabled = true;

        client.aiEnabled = true;

        client.subscriptionStatus =
            STATUS.ACTIVE;

        await client.save();

    }

    log(

        `Subscription unlocked -> ${clientId}`

    );

};

// ======================================
// PAYMENT FAILED
// LOCK CHATBOT
// ======================================

referralReminderJob.lockPaymentFailed =
async(clientId)=>{

    const subscription =

        await Subscription.findOne({

            clientId

        });

    if(!subscription)
        return;

    subscription.status =
        STATUS.PAYMENT_FAILED;

    subscription.locked = true;

    subscription.showRenewBanner = true;

    subscription.bannerEnabled = true;

    subscription.bannerType =
        "payment_failed";

    subscription.bannerColor =
        "red";

    await subscription.save();

    const client =

        await Client.findById(

            clientId

        );

    if(client){

        client.chatbotEnabled = false;

        client.aiEnabled = false;

        client.subscriptionStatus =
            STATUS.PAYMENT_FAILED;

        await client.save();

    }

    log(

        `Payment failed -> ${clientId}`

    );

};

// ======================================
// NEXT
// ======================================
//
// Part 5
//
// • Daily scheduler
// • Health check
// • Execute()
// • module.exports
// • Production finish
// ======================================
// PART 5
// Execute
// Scheduler
// Health
// Production Finish
// ======================================

// ======================================
// MAIN EXECUTION
// ======================================

referralReminderJob.execute =
async()=>{

    try{

        log("================================");

        log("Referral Reminder Job Started");

        // ----------------------------------
        // Reminder Sequence
        // ----------------------------------

        await referralReminderJob
            .process48HourReminder();

        await referralReminderJob
            .process24HourReminder();

        await referralReminderJob
            .process6HourReminder();

        // ----------------------------------
        // Expiry Check
        // ----------------------------------

        await referralReminderJob
            .processExpiredTrials();

        log("Referral Reminder Job Finished");

        log("================================");

        return true;

    }catch(error){

        console.error(error);

        log("Referral Reminder Job Failed");

        return false;

    }

};

// ======================================
// HEALTH CHECK
// ======================================

referralReminderJob.health =
()=>{

    return{

        service:
            JOB_NAME,

        status:
            "healthy",

        version:
            "1.0.0",

        timestamp:
            new Date()

    };

};

// ======================================
// CRON USAGE
// ======================================
//
// cron.schedule(
//
// "0 * * * *",
//
// async()=>{
//
// await referralReminderJob.execute();
//
// }
//
// );
//
// Runs every hour.
//
// Chatbot.js should call:
//
// GET /api/subscription/status
//
// Returned example:
//
// {
//   showRenewBanner:true,
//   bannerType:"trial_48",
//   bannerColor:"blue",
//   bannerAnimation:"none",
//   expiryDate:"2026-07-01T12:00:00Z",
//   locked:false
// }
//
// chatbot.js calculates the live countdown
// every second from expiryDate.
//
// ======================================
// MODULE EXPORT
// ======================================

module.exports =
referralReminderJob; 
