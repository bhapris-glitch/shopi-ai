// ======================================
// src/engines/referral.engine.js
// Layboka AI
// Referral Business Engine
// Production Ready
// ======================================

"use strict";

// ======================================
// IMPORTS
// ======================================

const mongoose = require("mongoose");

const Client = require("../../models/Client");
const Referral = require("../../models/Referral");
const Subscription = require("../../models/Subscription");

// ======================================
// CONSTANTS
// ======================================

const REFERRAL_ACTIVE_DAYS = 15;

const GROWTH_PLAN = "growth";
const PREMIUM_PLAN = "premium";
const ENTERPRISE_PLAN = "enterprise";

const REWARD_TYPES = {

FREE_MONTH: "free_month",

UPGRADE: "upgrade",

CREDIT: "credit",

CASH: "cash"

};

const STATUS = {

PENDING: "pending",

QUALIFIED: "qualified",

REWARDED: "rewarded",

REJECTED: "rejected"

};

// ======================================
// GROWTH PLAN REWARD
// ======================================

const GROWTH_REWARD = {

plan: GROWTH_PLAN,

rewardType: REWARD_TYPES.FREE_MONTH,

minimumDays: 15,

nextInvoiceAmount: 0,

rewardValue: 89

};

// ======================================
// PREMIUM VIP PROGRAM
// ======================================

const PREMIUM_REWARD_TABLE = {

1:{

rewardType:"credit",

amount:50

},

2:{

rewardType:"credit",

amount:100

},

3:{

rewardType:"upgrade",

upgradeMonths:1

},

5:{

rewardType:"upgrade",

upgradeMonths:2

},

10:{

rewardType:"cash",

amount:500

}

};

// ======================================
// ENTERPRISE REWARD
// ======================================

const ENTERPRISE_REWARD = {

rewardType:"cash",

amount:1000

};

// ======================================
// DATE HELPERS
// ======================================

function now(){

return new Date();

}

function addDays(date,days){

const d = new Date(date);

d.setDate(d.getDate()+days);

return d;

}

function diffDays(start,end){

const oneDay = 1000*60*60*24;

return Math.floor(

(end-start)/oneDay

);

}

// ======================================
// OBJECT ID
// ======================================

function isValidObjectId(id){

return mongoose.Types.ObjectId.isValid(id);

}

// ======================================
// NORMALIZE STORE
// ======================================

function normalizeStore(store=""){

return store

.trim()

.toLowerCase()

.replace("https://","")

.replace("http://","")

.replace("www.","")

.split("/")[0];

}

// ======================================
// REFERRAL CODE
// ======================================

function normalizeReferralCode(code=""){

return code

.trim()

.toUpperCase();

}

// ======================================
// ELIGIBILITY
// ======================================

function hasCompletedMinimumDays(subscription){

if(!subscription)

return false;

if(!subscription.startDate)

return false;

const days = diffDays(

new Date(subscription.startDate),

now()

);

return days >= REFERRAL_ACTIVE_DAYS;

}

// ======================================
// ACTIVE SUBSCRIPTION
// ======================================

function isSubscriptionEligible(subscription){

if(!subscription)

return false;

if(subscription.status !== "active")

return false;

if(subscription.locked)

return false;

if(subscription.paymentFailed)

return false;

return true;

}

// ======================================
// GROWTH PLAN
// ======================================

function isGrowth(subscription){

return (

subscription.plan === GROWTH_PLAN

);

}

// ======================================
// PREMIUM PLAN
// ======================================

function isPremium(subscription){

return (

subscription.plan === PREMIUM_PLAN

);

}

// ======================================
// ENTERPRISE
// ======================================

function isEnterprise(subscription){

return (

subscription.plan === ENTERPRISE_PLAN

);

}

// ======================================
// DUPLICATE REFERRAL
// ======================================

async function alreadyReferred(clientId){

return await Referral.findOne({

referredClientId:clientId

});

}

// ======================================
// SAME STORE
// ======================================

async function duplicateStore(store){

return await Referral.findOne({

referredStore:

normalizeStore(store)

});

}

// ======================================
// VALID REFERRAL
// ======================================

async function getReferralByCode(code){

return await Referral.findOne({

referralCode:

normalizeReferralCode(code)

});

}

// ======================================
// SELF REFERRAL
// ======================================

function isSelfReferral(

referrer,

referred

){

return (

String(referrer)

===

String(referred)

);

}

// ======================================
// NEXT PART
// ======================================
// Part 2:
//
// • createReferral()
// • registerReferral()
// • fraud protection
// • signup tracking
// • first payment tracking
// ======================================
// PART 2
// Referral Registration Engine
// ======================================

// ======================================
// GENERATE UNIQUE REFERRAL CODE
// ======================================

async function generateReferralCode(client){

    let code;
    let exists = true;

    while (exists) {

        const random =
            Math.random()
            .toString(36)
            .substring(2, 6)
            .toUpperCase();

        code =
            (
                client.store ||
                client.company ||
                client.name ||
                "LAY"
            )
            .replace(/[^A-Za-z]/g, "")
            .substring(0, 4)
            .toUpperCase() +
            random;

        exists =
            await Referral.findOne({
                referralCode: code
            });

    }

    return code;

}

// ======================================
// CREATE REFERRAL OWNER
// ======================================

async function createReferralOwner(client){

    let existing =
        await Referral.findOne({
            referrerClientId: client._id,
            referredClientId: null
        });

    if(existing)
        return existing;

    const code =
        await generateReferralCode(client);

    const referral =
        await Referral.create({

            referrerClientId:
                client._id,

            referralCode:
                code,

            referredStore:"",

            referredPlan:"",

            status:
                STATUS.PENDING

        });

    return referral;

}

// ======================================
// VALIDATE REFERRAL CODE
// ======================================

async function validateReferralCode(

    referralCode,
    referredClient

){

    if(!referralCode){

        return{

            success:false,

            message:"Referral code missing"

        };

    }

    const referral =

        await getReferralByCode(

            referralCode

        );

    if(!referral){

        return{

            success:false,

            message:"Invalid referral code"

        };

    }

    if(

        isSelfReferral(

            referral.referrerClientId,

            referredClient._id

        )

    ){

        referral.selfReferralBlocked = true;

        referral.status = STATUS.REJECTED;

        await referral.save();

        return{

            success:false,

            message:"Self referral blocked"

        };

    }

    return{

        success:true,

        referral

    };

}

// ======================================
// REGISTER REFERRED CLIENT
// ======================================

async function registerReferral(

    referralCode,

    referredClient,

    selectedPlan

){

    const validation =

        await validateReferralCode(

            referralCode,

            referredClient

        );

    if(!validation.success)
        return validation;

    const referral =
        validation.referral;

    const duplicate =

        await alreadyReferred(

            referredClient._id

        );

    if(duplicate){

        referral.duplicateBlocked = true;

        referral.status = STATUS.REJECTED;

        await referral.save();

        return{

            success:false,

            message:"Client already referred"

        };

    }

    const duplicateStoreCheck =

        await duplicateStore(

            referredClient.store

        );

    if(

        duplicateStoreCheck &&

        duplicateStoreCheck._id.toString()

        !==

        referral._id.toString()

    ){

        referral.duplicateBlocked = true;

        referral.status = STATUS.REJECTED;

        await referral.save();

        return{

            success:false,

            message:"Store already referred"

        };

    }

    referral.referredClientId =
        referredClient._id;

    referral.referredStore =
        normalizeStore(

            referredClient.store

        );

    referral.referredPlan =
        selectedPlan;

    referral.signupDate =
        now();

    referral.status =
        STATUS.PENDING;

    await referral.save();

    return{

        success:true,

        referral

    };

}

// ======================================
// SAVE FIRST PAYMENT
// ======================================

async function saveFirstPayment(

    clientId,

    amount

){

    const referral =

        await Referral.findOne({

            referredClientId:
                clientId

        });

    if(!referral)
        return null;

    if(referral.firstPaymentDate)
        return referral;

    referral.firstPaymentDate =
        now();

    referral.firstPaymentAmount =
        amount;

    await referral.save();

    return referral;

}

// ======================================
// GET CLIENT REFERRALS
// ======================================

async function getClientReferrals(

    clientId

){

    return await Referral.find({

        referrerClientId:
            clientId

    })
    .sort({

        createdAt:-1

    });

}

// ======================================
// NEXT PART
// ======================================
//
// Part 3
//
// • Growth qualification
// • 15-day verification
// • First payment validation
// • Free month reward
// • Reward scheduler
// • Qualification engine
// ======================================
// PART 3
// Growth Qualification Engine
// Production Ready
// ======================================

// ======================================
// QUALIFICATION CHECK
// ======================================

async function qualifyGrowthReferral(clientId){

    const referral =
        await Referral.findOne({
            referredClientId: clientId
        });

    if(!referral)
        return null;

    if(referral.status === STATUS.REWARDED)
        return referral;

    if(referral.status === STATUS.REJECTED)
        return referral;

    const subscription =
        await Subscription.findOne({
            clientId: clientId
        });

    if(!subscription){

        referral.status = STATUS.REJECTED;
        referral.rejectReason = "Subscription not found";
        await referral.save();

        return referral;

    }

    // Must be Growth plan
    if(!isGrowth(subscription))
        return referral;

    // Active subscription required
    if(!isSubscriptionEligible(subscription))
        return referral;

    // Wait 15 days
    if(!hasCompletedMinimumDays(subscription))
        return referral;

    // Payment required
    if(!subscription.paid){

        referral.status = STATUS.REJECTED;
        referral.rejectReason = "Payment not completed";
        await referral.save();

        return referral;

    }

    // Cancelled before qualification
    if(
        subscription.cancelledAt &&
        diffDays(
            new Date(subscription.startDate),
            new Date(subscription.cancelledAt)
        ) < REFERRAL_ACTIVE_D
// ======================================
// PART 4
// Premium / VIP Referral Engine
// Production Ready
// ======================================

// ======================================
// PREMIUM QUALIFICATION
// ======================================

async function qualifyPremiumReferral(clientId){

    const referral =
        await Referral.findOne({
            referredClientId: clientId
        });

    if(!referral)
        return null;

    if(referral.status === STATUS.REWARDED)
        return referral;

    if(referral.status === STATUS.REJECTED)
        return referral;

    const subscription =
        await Subscription.findOne({
            clientId: clientId
        });

    if(!subscription)
        return referral;

    if(!isPremium(subscription))
        return referral;

    if(!isSubscriptionEligible(subscription))
        return referral;

    if(!subscription.paid)
        return referral;

    if(!hasCompletedMinimumDays(subscription))
        return referral;

    referral.status =
        STATUS.QUALIFIED;

    referral.qualifiedAt =
        now();

    await referral.save();

    return referral;

}

// ======================================
// TOTAL PREMIUM REFERRALS
// ======================================

async function getPremiumReferralCount(referrerId){

    return await Referral.countDocuments({

        referrerClientId:
            referrerId,

        referredPlan:
            PREMIUM_PLAN,

        status:
            STATUS.QUALIFIED

    });

}

// ======================================
// VIP REWARD
// ======================================

async function processPremiumVIPReward(referral){

    const count =
        await getPremiumReferralCount(
            referral.referrerClientId
        );

    const reward =
        PREMIUM_REWARD_TABLE[count];

    if(!reward)
        return null;

    const referrer =
        await Client.findById(
            referral.referrerClientId
        );

    if(!referrer)
        return null;

    referral.rewardType =
        reward.rewardType;

    referral.rewardStatus =
        STATUS.REWARDED;

    referral.rewardedAt =
        now();

    referral.vipLevel =
        count;

    switch(reward.rewardType){

        case "credit":

            referrer.walletCredit =
                (referrer.walletCredit || 0)
                +
                reward.amount;

            referral.rewardAmount =
                reward.amount;

        break;

        case "cash":

            referrer.cashReward =
                (referrer.cashReward || 0)
                +
                reward.amount;

            referral.rewardAmount =
                reward.amount;

        break;

        case "upgrade":

            referrer.vipMonths =
                (referrer.vipMonths || 0)
                +
                reward.upgradeMonths;

            referral.rewardMonths =
                reward.upgradeMonths;

        break;

    }

    await referrer.save();

    await referral.save();

    return referral;

}

// ======================================
// ENTERPRISE REWARD
// ======================================

async function processEnterpriseReward(referral){

    const referrer =
        await Client.findById(
            referral.referrerClientId
        );

    if(!referrer)
        return null;

    referrer.cashReward =
        (referrer.cashReward || 0)
        +
        ENTERPRISE_REWARD.amount;

    referral.rewardType =
        ENTERPRISE_REWARD.rewardType;

    referral.rewardAmount =
        ENTERPRISE_REWARD.amount;

    referral.rewardStatus =
        STATUS.REWARDED;

    referral.rewardedAt =
        now();

    await referrer.save();

    await referral.save();

    return referral;

}

// ======================================
// VIP BADGE
// ======================================

async function updateVIPBadge(clientId){

    const client =
        await Client.findById(clientId);

    if(!client)
        return;

    const referrals =
        await getPremiumReferralCount(
            clientId
        );

    if(referrals >= 10)
        client.vipBadge = "Diamond";

    else if(referrals >= 5)
        client.vipBadge = "Gold";

    else if(referrals >= 3)
        client.vipBadge = "Silver";

    else if(referrals >= 1)
        client.vipBadge = "Bronze";

    else
        client.vipBadge = null;

    await client.save();

}

// ======================================
// NEXT PART
// ======================================
//
// Part 5
//
// • Next billing cycle FREE
// • Billing engine
// • Renewal integration
// • Stripe integration
// • Auto renewal adjustment
// • Free invoice generation
// ======================================
// PART 5
// Billing Integration Engine
// Production Ready
// ======================================

// ======================================
// APPLY NEXT BILL FREE
// ======================================

async function applyGrowthReward(referral){

    if(!referral)
        return null;

    if(referral.rewardStatus === STATUS.REWARDED)
        return referral;

    const subscription =
        await Subscription.findOne({

            clientId:
                referral.referrerClientId

        });

    if(!subscription)
        return null;

    // Must be active
    if(!isSubscriptionEligible(subscription))
        return null;

    subscription.nextInvoiceAmount = 0;

    subscription.rewardReason =
        "Growth Referral Reward";

    subscription.rewardReferral =
        referral._id;

    subscription.rewardAppliedAt =
        now();

    subscription.rewardApplied = true;

    referral.rewardType =
        REWARD_TYPES.FREE_MONTH;

    referral.rewardValue =
        GROWTH_REWARD.rewardValue;

    referral.rewardStatus =
        STATUS.REWARDED;

    referral.rewardedAt =
        now();

    await subscription.save();

    await referral.save();

    return referral;

}

// ======================================
// BILLING SUMMARY
// ======================================

function buildBillingSummary(subscription){

    return{

        currentPlan:
            subscription.plan,

        amount:
            subscription.amount,

        nextInvoiceAmount:
            subscription.nextInvoiceAmount,

        rewardApplied:
            subscription.rewardApplied,

        autoRenew:
            subscription.autoRenew,

        renewalDate:
            subscription.renewalDate

    };

}

// ======================================
// AFTER SUCCESSFUL RENEWAL
// ======================================

async function finalizeReward(subscription){

    if(!subscription)
        return;

    if(!subscription.rewardApplied)
        return;

    subscription.rewardApplied = false;

    subscription.rewardConsumed = true;

    subscription.nextInvoiceAmount =
        subscription.planPrice ||
        subscription.amount;

    subscription.rewardConsumedAt =
        now();

    await subscription.save();

}

// ======================================
// RESTORE NORMAL BILLING
// ======================================

async function restoreBilling(subscription){

    if(!subscription)
        return;

    subscription.amount =
        subscription.planPrice ||
        subscription.amount;

    subscription.nextInvoiceAmount =
        subscription.planPrice ||
        subscription.amount;

    await subscription.save();

}

// ======================================
// CANCEL REWARD
// ======================================

async function revokeReward(referral){

    if(!referral)
        return;

    const subscription =
        await Subscription.findOne({

            clientId:
                referral.referrerClientId

        });

    if(subscription){

        subscription.rewardApplied = false;

        subscription.rewardConsumed = false;

        subscription.nextInvoiceAmount =
            subscription.planPrice ||
            subscription.amount;

        await subscription.save();

    }

    referral.rewardStatus =
        STATUS.REJECTED;

    referral.rejectReason =
        "Reward Revoked";

    await referral.save();

}

// ======================================
// STRIPE CHECKOUT
// ======================================

function getStripeCheckoutAmount(subscription){

    if(
        subscription.rewardApplied &&
        subscription.nextInvoiceAmount === 0
    ){

        return 0;

    }

    return subscription.planPrice ||
           subscription.amount;

}

// ======================================
// RAZORPAY CHECKOUT
// ======================================

function getRazorpayCheckoutAmount(subscription){

    if(
        subscription.rewardApplied &&
        subscription.nextInvoiceAmount === 0
    ){

        return 0;

    }

    return subscription.planPrice ||
           subscription.amount;

}

// ======================================
// BILLING SUMMARY
// ======================================

function buildBillingSummary(subscription){

    return{

        currentPlan:
            subscription.plan,

        amount:
            subscription.amount,

        nextInvoiceAmount:
            subscription.nextInvoiceAmount,

        rewardApplied:
            subscription.rewardApplied,

        autoRenew:
            subscription.autoRenew,

        renewalDate:
            subscription.renewalDate

    };

}

// ======================================
// NEXT PART
// ======================================
//
// PART 6
//
// • Referral emails
// • Reward emails
// • Reminder emails
// • Admin notifications
// • Client notifications
// • Email queue integration
// ======================================
// PART 6
// Email & Notification Engine
// Production Ready
// ======================================

const EmailQueue =
require("../models/EmailQueue");

const Notification =
require("../models/Notification");

const Client =
require("../models/Client");

const Referral =
require("../models/Referral");

const Subscription =
require("../models/Subscription");

// ======================================
// CREATE EMAIL JOB
// ======================================

async function queueEmail({

    to,
    subject,
    html,
    type="general"

}){

    return await EmailQueue.create({

        to,

        subject,

        html,

        type,

        status:"pending",

        retries:0,

        scheduledAt:new Date()

    });

}

// ======================================
// SEND REFERRAL INVITE
// ======================================

async function sendReferralInvite(

    referrer,

    referral

){

    if(!referrer.email)
        return;

    const url =
`${process.env.APP_URL}/signup?ref=${referral.referralCode}`;

    await queueEmail({

        to:referrer.email,

        subject:"Your Referral Link is Ready 🎉",

        type:"referral",

        html:`

<h2>Hello ${referrer.name}</h2>

<p>Your referral code is:</p>

<h1>${referral.referralCode}</h1>

<p>Share this link:</p>

<p>${url}</p>

<p>Growth referral = FREE next month.</p>

<p>Premium referrals unlock VIP rewards.</p>

`

    });

}

// ======================================
// REFERRED USER REGISTERED
// ======================================

async function sendReferralRegistered(

    referrer,

    referred

){

    if(!referrer.email)
        return;

    await queueEmail({

        to:referrer.email,

        subject:"Someone joined using your referral",

        type:"referral_registered",

        html:`

<h2>Good News 🎉</h2>

<p>${referred.store}
registered using your referral.</p>

<p>Reward will unlock after
15 days and successful payment.</p>

`

    });

}

// ======================================
// GROWTH REWARD EMAIL
// ======================================

async function sendGrowthRewardEmail(

    referrer

){

    if(!referrer.email)
        return;

    await queueEmail({

        to:referrer.email,

        subject:"Congratulations! Your next bill is FREE",

        type:"growth_reward",

        html:`

<h2>Congratulations 🎉</h2>

<p>Your Growth referral qualified.</p>

<p>Your next renewal invoice
will be <b>$0</b>.</p>

`

    });

}

// ======================================
// PREMIUM VIP EMAIL
// ======================================

async function sendPremiumRewardEmail(

    referrer,

    reward

){

    if(!referrer.email)
        return;

    await queueEmail({

        to:referrer.email,

        subject:"VIP Reward Unlocked ⭐",

        type:"premium_reward",

        html:`

<h2>VIP Reward Unlocked</h2>

<p>You earned:</p>

<h2>${reward.rewardType}</h2>

<p>Amount:
${reward.rewardAmount || reward.rewardMonths}</p>

`

    });

}

// ======================================
// ENTERPRISE REWARD EMAIL
// ======================================

async function sendEnterpriseRewardEmail(

    referrer,

    reward

){

    if(!referrer.email)
        return;

    await queueEmail({

        to:referrer.email,

        subject:"Enterprise Reward Paid",

        type:"enterprise_reward",

        html:`

<h2>Enterprise Reward</h2>

<p>You earned
$${reward.rewardAmount}</p>

`

    });

}

// ======================================
// REFERRAL REJECTED
// ======================================

async function sendReferralRejected(

    referrer,

    reason

){

    if(!referrer.email)
        return;

    await queueEmail({

        to:referrer.email,

        subject:"Referral not qualified",

        type:"rejected",

        html:`

<h2>Referral Update</h2>

<p>Reason:</p>

<p>${reason}</p>

`

    });

}

// ======================================
// SUBSCRIPTION REMINDERS
// ======================================

async function sendRenewalReminder(

    client,

    daysRemaining

){

    if(!client.email)
        return;

    await queueEmail({

        to:client.email,

        subject:`${daysRemaining} days remaining`,

        type:"renewal",

        html:`

<h2>Hello ${client.name}</h2>

<p>Your subscription expires in
<b>${daysRemaining} days</b>.</p>

<p>Please renew to avoid
chatbot lock.</p>

`

    });

}

// ======================================
// PAYMENT FAILED
// ======================================

async function sendPaymentFailed(

    client

){

    if(!client.email)
        return;

    await queueEmail({

        to:client.email,

        subject:"Payment Failed",

        type:"payment_failed",

        html:`

<h2>Payment Failed</h2>

<p>Your chatbot has been locked.</p>

<p>Please recharge now.</p>

`

    });

}

// ======================================
// CHATBOT LOCKED
// ======================================

async function sendChatbotLocked(

    client

){

    if(!client.email)
        return;

    await queueEmail({

        to:client.email,

        subject:"Chatbot Locked",

        type:"locked",

        html:`

<h2>Chatbot Locked</h2>

<p>Your subscription expired.</p>

<p>Recharge to activate
your AI assistant.</p>

`

    });

}

// ======================================
// ADMIN NOTIFICATION
// ======================================

async function notifyAdmin(

    title,

    message

){

    await Notification.create({

        title,

        message,

        type:"admin",

        read:false

    });

}

// ======================================
// CLIENT NOTIFICATION
// ======================================

async function notifyClient(

    clientId,

    title,

    message

){

    await Notification.create({

        clientId,

        title,

        message,

        type:"client",

        read:false

    });

}

// ======================================
// NEXT PART
// ======================================
//
// PART 7
//
// • Cron jobs
// • Daily qualification scan
// • Reward processor
// • Reminder processor
// • Payment failure processor
// • Automatic cleanup
// ======================================
// PART 7
// Referral Cron Engine
// Production Ready
// ======================================

const cron =
require("node-cron");

const Referral =
require("../models/Referral");

const Client =
require("../models/Client");

const Subscription =
require("../models/Subscription");

// ======================================
// DAILY REFERRAL SCAN
// Every Night 01:00
// ======================================

cron.schedule("0 1 * * *", async()=>{

    console.log(
        "Referral Qualification Started..."
    );

    try{

        const referrals =
            await Referral.find({

                status:
                    STATUS.PENDING

            });

        for(const referral of referrals){

            const subscription =
                await Subscription.findOne({

                    clientId:
                        referral.referredClientId

                });

            if(!subscription)
                continue;

            // ==================================
            // GROWTH
            // ==================================

            if(subscription.plan==="growth"){

                const qualified =
                    await qualifyGrowthReferral(
                        referral.referredClientId
                    );

                if(
                    qualified &&
                    qualified.status===
                    STATUS.QUALIFIED
                ){

                    await applyGrowthReward(
                        qualified
                    );

                    const referrer =
                        await Client.findById(
                            qualified.referrerClientId
                        );

                    if(referrer){

                        await sendGrowthRewardEmail(
                            referrer
                        );

                        await notifyClient(

                            referrer._id,

                            "Referral Reward",

                            "Your next renewal is FREE."

                        );

                    }

                }

            }

            // ==================================
            // PREMIUM
            // ==================================

            if(subscription.plan==="premium"){

                const qualified =
                    await qualifyPremiumReferral(
                        referral.referredClientId
                    );

                if(
                    qualified &&
                    qualified.status===
                    STATUS.QUALIFIED
                ){

                    const reward =
                        await processPremiumVIPReward(
                            qualified
                        );

                    if(reward){

                        const referrer =
                            await Client.findById(
                                reward.referrerClientId
                            );

                        if(referrer){

                            await updateVIPBadge(
                                referrer._id
                            );

                            await sendPremiumRewardEmail(

                                referrer,

                                reward

                            );

                            await notifyClient(

                                referrer._id,

                                "VIP Reward",

                                "Your Premium reward is ready."

                            );

                        }

                    }

                }

            }

            // ==================================
            // ENTERPRISE
            // ==================================

            if(subscription.plan==="enterprise"){

                const reward =
                    await processEnterpriseReward(
                        referral
                    );

                if(reward){

                    const referrer =
                        await Client.findById(
                            reward.referrerClientId
                        );

                    if(referrer){

                        await sendEnterpriseRewardEmail(

                            referrer,

                            reward

                        );

                    }

                }

            }

        }

        console.log(
            "Referral Qualification Finished."
        );

    }

    catch(error){

        console.error(
            "Referral Cron Error",
            error
        );

    }

});

// ======================================
// REMINDER SCAN
// Every Morning
// ======================================

cron.schedule(

"30 8 * * *",

async()=>{

try{

const subscriptions =
await Subscription.find({

status:"active"

});

for(const subscription of subscriptions){

const days =
diffDays(

new Date(),

new Date(subscription.renewalDate)

);

const client =
await Client.findById(
subscription.clientId
);

if(!client)
continue;

// 8 Days

if(days===8){

await sendRenewalReminder(

client,

8

);

}

// 2 Days

if(days===2){

await sendRenewalReminder(

client,

2

);

}

// Last Day

if(days===1){

await sendRenewalReminder(

client,

1

);

}

}

}

catch(error){

console.error(error);

}

});

// ======================================
// PAYMENT FAILURE
// Every Hour
// ======================================

cron.schedule(

"0 * * * *",

async()=>{

try{

const failed =
await Subscription.find({

status:"payment_failed"

});

for(const subscription of failed){

const client =
await Client.findById(
subscription.clientId
);

if(!client)
continue;

await sendPaymentFailed(
client
);

await notifyClient(

client._id,

"Payment Failed",

"Recharge required."

);

}

}

catch(error){

console.error(error);

}

});

// ======================================
// CHATBOT LOCK
// Every Hour
// ======================================

cron.schedule(

"15 * * * *",

async()=>{

try{

const expired =
await Subscription.find({

status:"expired"

});

for(const subscription of expired){

const client =
await Client.findById(
subscription.clientId
);

if(!client)
continue;

client.chatbotLocked=true;

await client.save();

await sendChatbotLocked(
client
);

}

}

catch(error){

console.error(error);

}

});

// ======================================
// CLEAN OLD REFERRALS
// Monthly
// ======================================

cron.schedule(

"0 2 1 * *",

async()=>{

try{

await Referral.deleteMany({

status:"rejected",

updatedAt:{

$lt:new Date(

Date.now()-

180*24*60*60*1000

)

}

});

}

catch(error){

console.error(error);

}

});

// ======================================
// NEXT PART
// ======================================
//
// PART 8
//
// • Exports
// • Dashboard helpers
// • Analytics
// • Leaderboard
// • Final integration
// • Production exports
