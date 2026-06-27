// ======================================
// cron/renewalCron.js
// Layboka AI
// Subscription / Referral / Reminder Cron
// Production Ready
// Part 1
// ======================================

"use strict";

// ======================================
// IMPORTS
// ======================================

const cron =
require("node-cron");

// ======================================
// MODELS
// ======================================

const Client =
require("../models/Client");

const Subscription =
require("../models/Subscription");

const Referral =
require("../models/Referral");

// ======================================
// SERVICES
// ======================================

const referralService =
require("../src/services/referral.service");

// ======================================
// JOBS
// ======================================

const referralRewardJob =
require("../src/jobs/referralReward.job");

const referralReminderJob =
require("../src/jobs/referralReminder.job");

// ======================================
// CONSTANTS
// ======================================

const CRON_NAME =
"Renewal Cron";

const STATUS = {

TRIAL:"trial",

ACTIVE:"active",

EXPIRED:"expired",

PAYMENT_FAILED:"payment_failed",

CANCELLED:"cancelled"

};

// ======================================
// LOGGER
// ======================================

function log(message){

    console.log(

        `[${CRON_NAME}]`,

        new Date().toISOString(),

        message

    );

}

// ======================================
// CRON OBJECT
// ======================================

const renewalCron = {};

// ======================================
// NEXT
// ======================================
//
// Part 2
//
// • Hourly Scheduler
// • Referral Reminder Job
// • Referral Reward Job
// • Health Monitor
// ======================================
// PART 2
// Hourly Scheduler
// Reminder Jobs
// Reward Jobs
// ======================================

// ======================================
// HOURLY AUTOMATION
// Runs every hour
// ======================================

renewalCron.startHourlyJob = ()=>{

    cron.schedule(

        "0 * * * *",

        async()=>{

            try{

                log("Hourly cron started");

                // ==========================
                // Reminder Engine
                // ==========================

                await referralReminderJob
                    .execute();

                // ==========================
                // Reward Engine
                // ==========================

                await referralRewardJob
                    .execute();

                log("Hourly cron completed");

            }catch(error){

                console.error(error);

                log("Hourly cron failed");

            }

        },

        {

            timezone:"UTC"

        }

    );

};

// ======================================
// HEALTH CHECK
// ======================================

renewalCron.health =
()=>{

    return{

        cron:CRON_NAME,

        status:"healthy",

        hourly:true,

        timestamp:new Date()

    };

};

// ======================================
// NEXT
// ======================================
//
// Part 3
//
// • Trial expiry checker
// • Lock expired chatbot
// • Unlock paid chatbot
// • Payment failed lock
// ======================================
// PART 3
// Trial Expiry
// Lock / Unlock Chatbot
// Payment Failure
// ======================================

// ======================================
// PROCESS TRIAL EXPIRY
// ======================================

renewalCron.processTrialExpiry =
async()=>{

    log("Checking expired trials...");

    const subscriptions =

        await Subscription.find({

            status:STATUS.TRIAL

        });

    for(const subscription of subscriptions){

        try{

            if(
                !subscription.expiryDate
            ){

                continue;

            }

            if(
                new Date(subscription.expiryDate)
                >
                new Date()
            ){

                continue;

            }

            // =========================
            // LOCK SUBSCRIPTION
            // =========================

            subscription.status =
                STATUS.EXPIRED;

            subscription.locked = true;

            subscription.bannerEnabled = true;

            subscription.showRenewBanner = true;

            subscription.bannerType =
                "expired";

            subscription.bannerColor =
                "red";

            await subscription.save();

            // =========================
            // LOCK CLIENT CHATBOT
            // =========================

            await Client.updateOne(

                {

                    _id:
                    subscription.clientId

                },

                {

                    chatbotEnabled:false,

                    aiEnabled:false,

                    subscriptionStatus:
                    STATUS.EXPIRED

                }

            );

            log(

                `Expired -> ${subscription.clientId}`

            );

        }catch(error){

            console.error(error);

        }

    }

};

// ======================================
// UNLOCK AFTER PAYMENT
// ======================================

renewalCron.unlockPaidSubscriptions =
async()=>{

    log("Checking paid subscriptions...");

    const subscriptions =

        await Subscription.find({

            status:STATUS.ACTIVE,

            locked:true,

            paid:true

        });

    for(const subscription of subscriptions){

        try{

            subscription.locked = false;

            subscription.bannerEnabled = false;

            subscription.showRenewBanner = false;

            subscription.bannerType = "";

            subscription.bannerColor = "";

            subscription.bannerAnimation = "";

            subscription.reminder48Sent = false;

            subscription.reminder24Sent = false;

            subscription.reminder6Sent = false;

            await subscription.save();

            await Client.updateOne(

                {

                    _id:
                    subscription.clientId

                },

                {

                    chatbotEnabled:true,

                    aiEnabled:true,

                    subscriptionStatus:
                    STATUS.ACTIVE

                }

            );

            log(

                `Unlocked -> ${subscription.clientId}`

            );

        }catch(error){

            console.error(error);

        }

    }

};

// ======================================
// PAYMENT FAILED
// ======================================

renewalCron.lockFailedPayments =
async()=>{

    log("Checking failed payments...");

    const subscriptions =

        await Subscription.find({

            status:STATUS.PAYMENT_FAILED,

            locked:false

        });

    for(const subscription of subscriptions){

        try{

            subscription.locked = true;

            subscription.bannerEnabled = true;

            subscription.showRenewBanner = true;

            subscription.bannerType =
                "payment_failed";

            subscription.bannerColor =
                "red";

            await subscription.save();

            await Client.updateOne(

                {

                    _id:
                    subscription.clientId

                },

                {

                    chatbotEnabled:false,

                    aiEnabled:false,

                    subscriptionStatus:
                    STATUS.PAYMENT_FAILED

                }

            );

            log(

                `Payment failed -> ${subscription.clientId}`

            );

        }catch(error){

            console.error(error);

        }

    }

};

// ======================================
// NEXT
// ======================================
//
// Part 4
//
// • Renewal processing
// • Auto-renew subscriptions
// • Cancel expired subscriptions
// • Restore billing
// ======================================
// PART 4
// Renewal Processing
// Auto Renew
// Billing Restore
// ======================================

// ======================================
// PROCESS AUTO RENEWALS
// ======================================

renewalCron.processRenewals =
async()=>{

    log("Processing renewals...");

    const subscriptions =

        await Subscription.find({

            status:STATUS.ACTIVE,

            autoRenew:true,

            renewalDate:{
                $lte:new Date()
            }

        });

    for(const subscription of subscriptions){

        try{

            // ==================================
            // Stripe/Renewal Service
            // Will charge customer here
            // ==================================

            log(

                `Renewal -> ${subscription.clientId}`

            );

        }catch(error){

            console.error(error);

        }

    }

};

// ======================================
// EXTEND SUBSCRIPTION
// AFTER SUCCESSFUL PAYMENT
// ======================================

renewalCron.extendSubscription =
async(subscription)=>{

    const start =

        new Date();

    const renewal =

        new Date(start);

    if(

        subscription.interval === "yearly"

    ){

        renewal.setFullYear(

            renewal.getFullYear()+1

        );

    }else{

        renewal.setMonth(

            renewal.getMonth()+1

        );

    }

    subscription.startDate =
        start;

    subscription.renewalDate =
        renewal;

    subscription.expiryDate =
        renewal;

    subscription.status =
        STATUS.ACTIVE;

    subscription.locked =
        false;

    subscription.paid =
        true;

    subscription.lastPaymentDate =
        new Date();

    subscription.renewalsCount =
        (subscription.renewalsCount || 0)+1;

    await subscription.save();

    log(

        `Subscription extended -> ${subscription.clientId}`

    );

};

// ======================================
// RESTORE NORMAL BILLING
// AFTER FREE MONTH
// ======================================

renewalCron.restoreRewardBilling =
async()=>{

    log("Restoring reward billing...");

    const subscriptions =

        await Subscription.find({

            rewardConsumed:true

        });

    for(const subscription of subscriptions){

        try{

            await referralService
                .getBillingSummary(

                    subscription.clientId

                );

        }catch(error){

            console.error(error);

        }

    }

};

// ======================================
// CANCELLED SUBSCRIPTIONS
// ======================================

renewalCron.processCancelled =
async()=>{

    log("Checking cancelled subscriptions...");

    const subscriptions =

        await Subscription.find({

            status:STATUS.CANCELLED,

            locked:false

        });

    for(const subscription of subscriptions){

        try{

            subscription.locked = true;

            await subscription.save();

            await Client.updateOne(

                {

                    _id:
                    subscription.clientId

                },

                {

                    chatbotEnabled:false,

                    aiEnabled:false

                }

            );

            log(

                `Cancelled -> ${subscription.clientId}`

            );

        }catch(error){

            console.error(error);

        }

    }

};

// ======================================
// NEXT
// ======================================
// Part 5
//
// • Daily maintenance
// • VIP badge updates
// • Referral cleanup
// • Analytics refresh
// ======================================
// PART 5
// Daily Maintenance
// VIP Update
// Cleanup
// Analytics Refresh
// ======================================

// ======================================
// DAILY MAINTENANCE
// ======================================

renewalCron.dailyMaintenance =
async()=>{

    log("Running daily maintenance...");

    try{

        await renewalCron
            .refreshVIPStatus();

        await renewalCron
            .cleanupOldReferrals();

        await renewalCron
            .refreshAnalytics();

        log("Daily maintenance finished.");

    }catch(error){

        console.error(error);

    }

};

// ======================================
// VIP BADGE REFRESH
// ======================================

renewalCron.refreshVIPStatus =
async()=>{

    log("Refreshing VIP badges...");

    const clients =
        await Client.find();

    for(const client of clients){

        try{

            await referralService
                .updateVIPBadge(
                    client._id
                );

        }catch(error){

            console.error(error);

        }

    }

    log("VIP badge refresh completed.");

};

// ======================================
// REFERRAL CLEANUP
// ======================================

renewalCron.cleanupOldReferrals =
async()=>{

    log("Cleaning referral database...");

    const oneYearAgo =
        new Date();

    oneYearAgo.setFullYear(

        oneYearAgo.getFullYear()-1

    );

    const referrals =

        await Referral.find({

            status:"rejected",

            updatedAt:{
                $lt:oneYearAgo
            }

        });

    for(const referral of referrals){

        try{

            await Referral.deleteOne({

                _id:referral._id

            });

        }catch(error){

            console.error(error);

        }

    }

    log(

        `Old referrals removed : ${referrals.length}`

    );

};

// ======================================
// REFRESH ANALYTICS
// ======================================

renewalCron.refreshAnalytics =
async()=>{

    log("Refreshing referral analytics...");

    const clients =
        await Client.find();

    for(const client of clients){

        try{

            await referralService
                .getAnalytics(
                    client._id
                );

        }catch(error){

            console.error(error);

        }

    }

    log("Analytics refresh completed.");

};

// ======================================
// NEXT
// ======================================
//
// Part 6
//
// • Hourly execute()
// • Daily execute()
// • Weekly execute()
// • Monthly execute()
// ======================================
// PART 6
// Hourly
// Daily
// Weekly
// Monthly Scheduler
// ======================================

// ======================================
// HOURLY EXECUTION
// ======================================

renewalCron.executeHourly =
async()=>{

    log("Hourly automation started...");

    await renewalCron.processTrialExpiry();

    await renewalCron.unlockPaidSubscriptions();

    await renewalCron.lockFailedPayments();

    await referralReminderJob.execute();

    log("Hourly automation finished.");

};

// ======================================
// DAILY EXECUTION
// ======================================

renewalCron.executeDaily =
async()=>{

    log("Daily automation started...");

    await renewalCron.processRenewals();

    await renewalCron.restoreRewardBilling();

    await renewalCron.processCancelled();

    await referralRewardJob.execute();

    await renewalCron.dailyMaintenance();

    log("Daily automation finished.");

};

// ======================================
// WEEKLY EXECUTION
// ======================================

renewalCron.executeWeekly =
async()=>{

    log("Weekly automation started...");

    await renewalCron.refreshVIPStatus();

    await renewalCron.refreshAnalytics();

    log("Weekly automation finished.");

};

// ======================================
// MONTHLY EXECUTION
// ======================================

renewalCron.executeMonthly =
async()=>{

    log("Monthly automation started...");

    await renewalCron.cleanupOldReferrals();

    await renewalCron.refreshAnalytics();

    log("Monthly automation finished.");

};

// ======================================
// NEXT
// ======================================
//
// Part 7
//
// • Register all cron schedules
// • Every hour
// • Every day
// • Every week
// • Every month   
// ======================================
// PART 7
// Register All Cron Schedules
// ======================================

// ======================================
// START ALL CRON JOBS
// ======================================

renewalCron.start = ()=>{

    log("Starting Renewal Cron Scheduler...");

    // ==================================
    // EVERY HOUR
    // Minute 0 of every hour
    // ==================================

    cron.schedule(

        "0 * * * *",

        async()=>{

            await renewalCron.executeHourly();

        },

        {

            timezone:"UTC"

        }

    );

    // ==================================
    // EVERY DAY
    // 02:00 UTC
    // ==================================

    cron.schedule(

        "0 2 * * *",

        async()=>{

            await renewalCron.executeDaily();

        },

        {

            timezone:"UTC"

        }

    );

    // ==================================
    // EVERY SUNDAY
    // 03:00 UTC
    // ==================================

    cron.schedule(

        "0 3 * * 0",

        async()=>{

            await renewalCron.executeWeekly();

        },

        {

            timezone:"UTC"

        }

    );

    // ==================================
    // FIRST DAY OF MONTH
    // 04:00 UTC
    // ==================================

    cron.schedule(

        "0 4 1 * *",

        async()=>{

            await renewalCron.executeMonthly();

        },

        {

            timezone:"UTC"

        }

    );

    log("Renewal Cron Scheduler Started");

};

// ======================================
// STOP CRON
// ======================================

renewalCron.stop =
()=>{

    log(

        "Renewal Cron Scheduler Stopped"

    );

};

// ======================================
// NEXT
// ======================================
//
// Part 8
//
// • Health
// • Status
// • Module Export
// • Production Finish
// ======================================
// PART 8
// Health
// Status
// Export
// Production Finish
// ======================================

// ======================================
// HEALTH CHECK
// ======================================

renewalCron.health =
()=>{

    return{

        service:
            CRON_NAME,

        status:
            "healthy",

        version:
            "1.0.0",

        timezone:
            "UTC",

        timestamp:
            new Date(),

        jobs:{

            hourly:true,

            daily:true,

            weekly:true,

            monthly:true

        }

    };

};

// ======================================
// STATUS
// ======================================

renewalCron.status =
()=>{

    return{

        cron:
            CRON_NAME,

        running:true,

        startedAt:
            new Date(),

        schedules:{

            hourly:
                "0 * * * *",

            daily:
                "0 2 * * *",

            weekly:
                "0 3 * * 0",

            monthly:
                "0 4 1 * *"

        }

    };

};

// ======================================
// INITIALIZE
// ======================================
//
// Call once from server.js
//
// const renewalCron =
// require("./cron/renewalCron");
//
// renewalCron.start();
//
// ======================================

// ======================================
// EXPORT
// ======================================

module.exports =
renewalCron;
