// ======================================
// src/jobs/referralReward.job.js
// Layboka AI
// Referral Reward Background Job
// Production Ready
// Part 1
// ======================================

"use strict";

// ======================================
// IMPORTS
// ======================================

const Referral =
require("../../models/Referral");

const Subscription =
require("../../models/Subscription");

const Client =
require("../../models/Client");

const referralEngine =
require("../engines/referral.engine");

const referralService =
require("../services/referral.service");

// ======================================
// CONSTANTS
// ======================================

const JOB_NAME =
"Referral Reward Job";

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
// JOB OBJECT
// ======================================

const referralRewardJob = {};

// ======================================
// NEXT
// ======================================
//
// Part 2
//
// • Starter qualification
// • Growth qualification
// • Premium qualification
// • Enterprise qualification
// ======================================
// PART 2
// Starter
// Growth
// Premium
// Enterprise Qualification
// ======================================

// ======================================
// STARTER QUALIFICATION
// ======================================

referralRewardJob.processStarter =
async()=>{

    log("Checking Starter referrals...");

    const referrals =

        await Referral.find({

            referredPlan:"starter",

            status:"pending"

        });

    for(const referral of referrals){

        try{

            await referralEngine

                .qualifyStarterReferral(

                    referral.referredClientId

                );

        }catch(error){

            console.error(error);

        }

    }

    log(

        `Starter checked : ${referrals.length}`

    );

};

// ======================================
// GROWTH QUALIFICATION
// ======================================

referralRewardJob.processGrowth =
async()=>{

    log("Checking Growth referrals...");

    const referrals =

        await Referral.find({

            referredPlan:"growth",

            status:"pending"

        });

    for(const referral of referrals){

        try{

            await referralEngine

                .qualifyGrowthReferral(

                    referral.referredClientId

                );

        }catch(error){

            console.error(error);

        }

    }

    log(

        `Growth checked : ${referrals.length}`

    );

};

// ======================================
// PREMIUM QUALIFICATION
// ======================================

referralRewardJob.processPremium =
async()=>{

    log("Checking Premium referrals...");

    const referrals =

        await Referral.find({

            referredPlan:"premium",

            status:"pending"

        });

    for(const referral of referrals){

        try{

            await referralEngine

                .qualifyPremiumReferral(

                    referral.referredClientId

                );

        }catch(error){

            console.error(error);

        }

    }

    log(

        `Premium checked : ${referrals.length}`

    );

};

// ======================================
// ENTERPRISE QUALIFICATION
// ======================================

referralRewardJob.processEnterprise =
async()=>{

    log("Checking Enterprise referrals...");

    const referrals =

        await Referral.find({

            referredPlan:"enterprise",

            status:"pending"

        });

    for(const referral of referrals){

        try{

            await referralEngine

                .qualifyEnterpriseReferral(

                    referral.referredClientId

                );

        }catch(error){

            console.error(error);

        }

    }

    log(

        `Enterprise checked : ${referrals.length}`

    );

};

// ======================================
// NEXT
// ======================================
//
// Part 3
//
// • Apply Starter rewards
// • Apply Growth rewards
// • Apply Premium rewards
// • Apply Enterprise rewards
// ======================================
// PART 3
// Apply Rewards Engine
// ======================================

// ======================================
// STARTER REWARDS
// ======================================

referralRewardJob.applyStarterRewards =
async()=>{

    log("Applying Starter rewards...");

    const referrals =
        await Referral.find({

            referredPlan:"starter",

            status:"qualified",

            rewardStatus:{
                $ne:"rewarded"
            }

        });

    for(const referral of referrals){

        try{

            await referralEngine
                .applyStarterReward(
                    referral
                );

            log(

                `Starter reward -> ${referral.referrerClientId}`

            );

        }catch(error){

            console.error(error);

        }

    }

};

// ======================================
// GROWTH REWARDS
// ======================================

referralRewardJob.applyGrowthRewards =
async()=>{

    log("Applying Growth rewards...");

    const referrals =
        await Referral.find({

            referredPlan:"growth",

            status:"qualified",

            rewardStatus:{
                $ne:"rewarded"
            }

        });

    for(const referral of referrals){

        try{

            await referralEngine
                .applyGrowthReward(
                    referral
                );

            log(

                `Growth reward -> ${referral.referrerClientId}`

            );

        }catch(error){

            console.error(error);

        }

    }

};

// ======================================
// PREMIUM REWARDS
// ======================================

referralRewardJob.applyPremiumRewards =
async()=>{

    log("Applying Premium rewards...");

    const referrals =
        await Referral.find({

            referredPlan:"premium",

            status:"qualified",

            rewardStatus:{
                $ne:"rewarded"
            }

        });

    for(const referral of referrals){

        try{

            await referralEngine
                .processPremiumVIPReward(
                    referral
                );

            log(

                `Premium reward -> ${referral.referrerClientId}`

            );

        }catch(error){

            console.error(error);

        }

    }

};

// ======================================
// ENTERPRISE REWARDS
// ======================================

referralRewardJob.applyEnterpriseRewards =
async()=>{

    log("Applying Enterprise rewards...");

    const referrals =
        await Referral.find({

            referredPlan:"enterprise",

            status:"qualified",

            rewardStatus:{
                $ne:"rewarded"
            }

        });

    for(const referral of referrals){

        try{

            await referralEngine
                .processEnterpriseReward(
                    referral
                );

            log(

                `Enterprise reward -> ${referral.referrerClientId}`

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
// • Update VIP badges
// • Finalize free-month rewards
// • Restore billing
// • Revoke invalid rewards
// ======================================
// PART 4
// VIP Badge
// Finalize Rewards
// Restore Billing
// Revoke Rewards
// ======================================

// ======================================
// UPDATE ALL VIP BADGES
// ======================================

referralRewardJob.updateVIPBadges =
async()=>{

    log("Updating VIP badges...");

    const clients =

        await Client.find({

            vipBadge:{
                $exists:true
            }

        });

    for(const client of clients){

        try{

            await referralEngine
                .updateVIPBadge(
                    client._id
                );

        }catch(error){

            console.error(error);

        }

    }

    log("VIP badge update completed.");

};

// ======================================
// FINALIZE FREE MONTH
// AFTER SUCCESSFUL RENEWAL
// ======================================

referralRewardJob.finalizeRewards =
async()=>{

    log("Finalizing reward billing...");

    const subscriptions =

        await Subscription.find({

            rewardApplied:true,

            rewardConsumed:false

        });

    for(const subscription of subscriptions){

        try{

            await referralEngine
                .finalizeReward(
                    subscription
                );

        }catch(error){

            console.error(error);

        }

    }

    log("Reward finalization completed.");

};

// ======================================
// RESTORE NORMAL BILLING
// ======================================

referralRewardJob.restoreBilling =
async()=>{

    log("Restoring billing...");

    const subscriptions =

        await Subscription.find({

            rewardConsumed:true

        });

    for(const subscription of subscriptions){

        try{

            await referralEngine
                .restoreBilling(
                    subscription
                );

        }catch(error){

            console.error(error);

        }

    }

    log("Billing restored.");

};

// ======================================
// REVOKE INVALID REWARDS
// ======================================

referralRewardJob.revokeInvalidRewards =
async()=>{

    log("Checking revoked rewards...");

    const referrals =

        await Referral.find({

            rewardStatus:"rewarded",

            revoked:true

        });

    for(const referral of referrals){

        try{

            await referralEngine
                .revokeReward(
                    referral
                );

        }catch(error){

            console.error(error);

        }

    }

    log("Reward revocation completed.");

};

// ======================================
// NEXT
// ======================================
//
// Part 5
//
// • Daily reward scheduler
// • Main execute()
// • Health check
// • module.exports
// • Production finish
// ======================================
// PART 5
// Scheduler
// Execute
// Health
// Export
// Production Finish
// ======================================

// ======================================
// RUN DAILY REWARD JOB
// ======================================

referralRewardJob.execute =
async()=>{

    try{

        log("================================");

        log("Referral Reward Job Started");

        // ----------------------------
        // Qualification
        // ----------------------------

        await referralRewardJob
            .processStarter();

        await referralRewardJob
            .processGrowth();

        await referralRewardJob
            .processPremium();

        await referralRewardJob
            .processEnterprise();

        // ----------------------------
        // Rewards
        // ----------------------------

        await referralRewardJob
            .applyStarterRewards();

        await referralRewardJob
            .applyGrowthRewards();

        await referralRewardJob
            .applyPremiumRewards();

        await referralRewardJob
            .applyEnterpriseRewards();

        // ----------------------------
        // VIP
        // ----------------------------

        await referralRewardJob
            .updateVIPBadges();

        // ----------------------------
        // Billing
        // ----------------------------

        await referralRewardJob
            .finalizeRewards();

        await referralRewardJob
            .restoreBilling();

        // ----------------------------
        // Fraud
        // ----------------------------

        await referralRewardJob
            .revokeInvalidRewards();

        log("Referral Reward Job Finished");

        log("================================");

        return true;

    }catch(error){

        console.error(error);

        log("Referral Reward Job Failed");

        return false;

    }

};

// ======================================
// HEALTH CHECK
// ======================================

referralRewardJob.health =
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
// OPTIONAL AUTO START
// ======================================
//
// This file should be scheduled from:
//
// cron/renewalCron.js
//
// Example:
//
// const referralRewardJob =
// require("../jobs/referralReward.job");
//
// cron.schedule(
// "0 2 * * *",
// async()=>{
//    await referralRewardJob.execute();
// });
//
// Runs every day at 02:00 AM server time.
//
// ======================================
// EXPORT
// ======================================

module.exports =
referralRewardJob;
