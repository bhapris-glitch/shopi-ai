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
// ==============================
// ======================================
// PART 3
// Growth & Starter Qualification Engine
// Production Ready
// ======================================

// ======================================
// LOAD REFERRAL + SUBSCRIPTION
// ======================================

async function loadReferralQualification(clientId){

    const referral =
        await Referral.findOne({
            referredClientId: clientId
        });

    if(!referral){
        return null;
    }

    const subscription =
        await Subscription.findOne({
            clientId: clientId
        });

    return {
        referral,
        subscription
    };

}

// ======================================
// CAN QUALIFY
// ======================================

function canQualifyReferral(subscription){

    if(!subscription)
        return false;

    if(!isSubscriptionEligible(subscription))
        return false;

    if(!subscription.paid)
        return false;

    if(!hasCompletedMinimumDays(subscription))
        return false;

    return true;

}

// ======================================
// QUALIFY STARTER / GROWTH
// ======================================

async function qualifyGrowthReferral(clientId){

    const data =
        await loadReferralQualification(clientId);

    if(!data)
        return null;

    const {
        referral,
        subscription
    } = data;

    if(
        referral.status === STATUS.REWARDED ||
        referral.status === STATUS.REJECTED
    ){
        return referral;
    }

    if(!subscription){

        referral.status = STATUS.REJECTED;
        referral.rejectReason =
            "Subscription not found";

        await referral.save();

        return referral;

    }

    // Only Starter & Growth use free renewal rewards

    if(
        !(
            subscription.plan === "starter" ||
            subscription.plan === "growth"
        )
    ){
        return referral;
    }

    if(!canQualifyReferral(subscription)){
        return referral;
    }

    // Cancelled before qualification

    if(subscription.cancelledAt){

        const activeDays =
            diffDays(
                new Date(subscription.startDate),
                new Date(subscription.cancelledAt)
            );

        if(activeDays < REFERRAL_ACTIVE_DAYS){

            referral.status =
                STATUS.REJECTED;

            referral.rejectReason =
                "Cancelled before qualification";

            await referral.save();

            return referral;

        }

    }

    // Refund protection

    if(subscription.refunded){

        referral.status =
            STATUS.REJECTED;

        referral.rejectReason =
            "Payment refunded";

        await referral.save();

        return referral;

    }

    referral.status =
        STATUS.QUALIFIED;

    referral.qualifiedAt =
        now();

    await referral.save();

    return referral;

}

// ======================================
// APPLY FREE RENEWAL
// ======================================

async function rewardGrowthReferral(clientId){

    const data =
        await loadReferralQualification(clientId);

    if(!data)
        return null;

    const {
        referral
    } = data;

    if(!referral)
        return null;

    if(
        referral.status !== STATUS.QUALIFIED
    ){
        return referral;
    }

    return await applyGrowthReward(referral);

}

// ======================================
// QUALIFICATION STATUS
// ======================================

async function getQualificationStatus(clientId){

    const data =
        await loadReferralQualification(clientId);

    if(!data){

        return{
            qualified:false
        };

    }

    const {
        referral,
        subscription
    } = data;

    return{

        qualified:
            referral.status === STATUS.QUALIFIED,

        rewarded:
            referral.status === STATUS.REWARDED,

        rejected:
            referral.status === STATUS.REJECTED,

        rewardType:
            referral.rewardType,

        rewardStatus:
            referral.rewardStatus,

        rewardValue:
            referral.rewardValue,

        plan:
            subscription?.plan || null,

        activeDays:
            subscription?.startDate
                ? diffDays(
                    new Date(subscription.startDate),
                    now()
                  )
                : 0

    };

}

// ======================================
// NEXT PART
// ======================================
//
// Part 4
//
// • Premium VIP Qualification
// • VIP milestone rewards
// • Enterprise reward flow
// • VIP badge system
// • Reward processing
// ======================================
// PART 4
// Premium VIP Reward Engine
// Production Ready
// ======================================

// ======================================
// PREMIUM QUALIFICATION
// ======================================

async function qualifyPremiumReferral(clientId){

    const data =
        await loadReferralQualification(clientId);

    if(!data)
        return null;

    const {
        referral,
        subscription
    } = data;

    if(
        referral.status === STATUS.REWARDED ||
        referral.status === STATUS.REJECTED
    ){
        return referral;
    }

    if(!subscription)
        return referral;

    if(!isPremium(subscription))
        return referral;

    if(!canQualifyReferral(subscription))
        return referral;

    referral.status =
        STATUS.QUALIFIED;

    referral.qualifiedAt =
        now();

    await referral.save();

    return referral;

}

// ======================================
// ENTERPRISE QUALIFICATION
// ======================================

async function qualifyEnterpriseReferral(clientId){

    const data =
        await loadReferralQualification(clientId);

    if(!data)
        return null;

    const {
        referral,
        subscription
    } = data;

    if(!subscription)
        return referral;

    if(!isEnterprise(subscription))
        return referral;

    if(!canQualifyReferral(subscription))
        return referral;

    referral.status =
        STATUS.QUALIFIED;

    referral.qualifiedAt =
        now();

    await referral.save();

    return referral;

}

// ======================================
// PREMIUM REFERRAL COUNT
// ======================================

async function getPremiumReferralCount(referrerClientId){

    return await Referral.countDocuments({

        referrerClientId,

        status:STATUS.REWARDED,

        referredPlan:PREMIUM_PLAN

    });

}

// ======================================
// VIP LEVEL
// ======================================

function getVIPLevel(total){

    if(total >= 100)
        return "Titanium";

    if(total >= 50)
        return "Diamond";

    if(total >= 25)
        return "Platinum";

    if(total >= 10)
        return "Gold";

    if(total >= 5)
        return "Silver";

    if(total >= 1)
        return "Bronze";

    return null;

}

// ======================================
// UPDATE VIP BADGE
// ======================================

async function updateVIPBadge(clientId){

    const total =
        await getPremiumReferralCount(clientId);

    const badge =
        getVIPLevel(total);

    await Client.updateOne(

        {
            _id:clientId
        },

        {

            $set:{

                vipBadge:badge,

                vipReferralCount:total

            }

        }

    );

}

// ======================================
// PREMIUM VIP REWARD
// ======================================

async function processPremiumVIPReward(referral){

    if(!referral)
        return null;

    const referrer =

        await Client.findById(

            referral.referrerClientId

        );

    if(!referrer)
        return null;

    const total =

        await getPremiumReferralCount(

            referrer._id

        ) + 1;

    const reward =

        PREMIUM_REWARD_TABLE[total];

    if(!reward)
        return null;

    referral.rewardType =
        reward.rewardType;

    referral.rewardStatus =
        STATUS.REWARDED;

    referral.rewardedAt =
        now();

    referral.vipLevel =
        total;

    switch(reward.rewardType){

        case REWARD_TYPES.CREDIT:

            referrer.walletCredit =
                (referrer.walletCredit || 0)
                +
                reward.amount;

            referral.rewardAmount =
                reward.amount;

        break;

        case REWARD_TYPES.CASH:

            referrer.cashReward =
                (referrer.cashReward || 0)
                +
                reward.amount;

            referral.rewardAmount =
                reward.amount;

        break;

        case REWARD_TYPES.UPGRADE:

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

    await updateVIPBadge(referrer._id);

    return referral;

}

// ======================================
// ENTERPRISE REWARD
// ======================================

async function processEnterpriseReward(referral){

    if(!referral)
        return null;

    referral.rewardStatus =
        STATUS.QUALIFIED;

    referral.rewardType =
        "manual";

    referral.rewardedAt =
        null;

    referral.manualReview =
        true;

    await referral.save();

    return referral;

}

// ======================================
// VIP SUMMARY
// ======================================

async function getVIPSummary(clientId){

    const client =

        await Client.findById(clientId);

    if(!client)
        return null;

    return{

        badge:
            client.vipBadge || null,

        referrals:
            client.vipReferralCount || 0,

        walletCredit:
            client.walletCredit || 0,

        cashReward:
            client.cashReward || 0,

        vipMonths:
            client.vipMonths || 0

    };

}

// ======================================
// NEXT PART
// ======================================
//
// Part 5
//
// • Billing Integration
// • Starter FREE renewal
// • Growth FREE renewal
// • Premium reward processing
// • Enterprise manual workflow
// • Reward queue
// • Billing summary
// ======================================
// PART 5
// Billing & Reward Processing Engine
// Production Ready
// ======================================
// ======================================
// APPLY STARTER REWARD
// ======================================

async function applyStarterReward(referral){

    if(!referral)
        return null;

    const subscription =
        await Subscription.findOne({

            clientId:
                referral.referrerClientId

        });

    if(!subscription)
        return null;

    if(subscription.plan !== "starter")
        return null;

    subscription.rewardApplied = true;

    subscription.rewardType = "starter_free_month";

    subscription.rewardReferral = referral._id;

    subscription.rewardAppliedAt = now();

    subscription.nextInvoiceAmount = 0;

    referral.rewardStatus = STATUS.REWARDED;

    referral.rewardType = REWARD_TYPES.FREE_MONTH;

    referral.rewardValue = 25;

    referral.rewardedAt = now();

    await subscription.save();

    await referral.save();

    return referral;

}

// ======================================
// APPLY GROWTH REWARD
// ======================================

async function applyGrowthReward(referral){

    if(!referral)
        return null;

    const subscription =
        await Subscription.findOne({

            clientId:
                referral.referrerClientId

        });

    if(!subscription)
        return null;

    if(subscription.plan !== "growth")
        return null;

    subscription.rewardApplied = true;

    subscription.rewardType = "growth_free_month";

    subscription.rewardReferral = referral._id;

    subscription.rewardAppliedAt = now();

    subscription.nextInvoiceAmount = 0;

    referral.rewardStatus = STATUS.REWARDED;

    referral.rewardType = REWARD_TYPES.FREE_MONTH;

    referral.rewardValue = 59;

    referral.rewardedAt = now();

    await subscription.save();

    await referral.save();

    return referral;

}

// ======================================
// APPLY QUALIFIED REWARD
// ======================================

async function applyQualifiedReward(referral){

    if(!referral)
        return null;

    const subscription =
        await Subscription.findOne({

            clientId:
                referral.referrerClientId

        });

    if(!subscription)
        return null;

    switch(subscription.plan){

        case "starter":

            return await applyStarterReward(referral);

        case "growth":

            return await applyGrowthReward(referral);

        case "premium":

            return await processPremiumVIPReward(referral);

        case "enterprise":

            return await processEnterpriseReward(referral);

        default:

            return referral;

    }

}

// ======================================
// BUILD BILLING SUMMARY
// ======================================

function buildBillingSummary(subscription){

    return{

        currentPlan:
            subscription.plan,

        currency:
            subscription.currency,

        amount:
            subscription.amount,

        nextInvoiceAmount:
            subscription.nextInvoiceAmount,

        rewardApplied:
            subscription.rewardApplied,

        rewardType:
            subscription.rewardType,

        rewardConsumed:
            subscription.rewardConsumed,

        autoRenew:
            subscription.autoRenew,

        renewalDate:
            subscription.renewalDate

    };

}

// ======================================
// FINALIZE FREE MONTH
// ======================================

async function finalizeReward(subscription){

    if(!subscription)
        return;

    if(!subscription.rewardApplied)
        return;

    subscription.rewardApplied = false;

    subscription.rewardConsumed = true;

    subscription.rewardConsumedAt = now();

    switch(subscription.plan){

        case "starter":

            subscription.nextInvoiceAmount = 25;

        break;

        case "growth":

            subscription.nextInvoiceAmount = 59;

        break;

        case "premium":

            subscription.nextInvoiceAmount = 149;

        break;

    }

    await subscription.save();

}

// ======================================
// RESTORE NORMAL BILLING
// ======================================

async function restoreBilling(subscription){

    if(!subscription)
        return;

    subscription.rewardApplied = false;

    subscription.rewardConsumed = false;

    switch(subscription.plan){

        case "starter":

            subscription.amount = 25;
            subscription.nextInvoiceAmount = 25;

        break;

        case "growth":

            subscription.amount = 59;
            subscription.nextInvoiceAmount = 59;

        break;

        case "premium":

            subscription.amount = 149;
            subscription.nextInvoiceAmount = 149;

        break;

    }

    await subscription.save();

}

// ======================================
// FIRST UPGRADE DISCOUNT
// ======================================

async function applyReferralUpgradeDiscount(client){

    if(!client)
        return{

            eligible:false

        };

    if(!client.isReferralCustomer){

        return{

            eligible:false

        };

    }

    if(client.firstUpgradeDiscountUsed){

        return{

            eligible:false

        };

    }

    return{

        eligible:true,

        discountPercent:30

    };

}

// ======================================
// CONSUME UPGRADE DISCOUNT
// ======================================

async function consumeUpgradeDiscount(clientId){

    await Client.updateOne(

        {

            _id:clientId

        },

        {

            $set:{

                firstUpgradeDiscountUsed:true

            }

        }

    );

}

// ======================================
// NEXT PART
// ======================================
//
// Part 6
//
// • Referral analytics
// • Dashboard
// • Monthly statistics
// • Leaderboard
// • Reward history
// • Admin reporting
// • Referral exports
// ======================================
// PART 6
// Referral Analytics Engine
// Production Ready
// ======================================
// ======================================
// TOTAL REFERRALS
// ======================================

async function getTotalReferrals(clientId){

    return await Referral.countDocuments({

        referrerClientId:clientId

    });

}

// ======================================
// QUALIFIED REFERRALS
// ======================================

async function getQualifiedReferrals(clientId){

    return await Referral.countDocuments({

        referrerClientId:clientId,

        status:STATUS.QUALIFIED

    });

}

// ======================================
// REWARDED REFERRALS
// ======================================

async function getRewardedReferrals(clientId){

    return await Referral.countDocuments({

        referrerClientId:clientId,

        status:STATUS.REWARDED

    });

}

// ======================================
// PENDING REFERRALS
// ======================================

async function getPendingReferrals(clientId){

    return await Referral.countDocuments({

        referrerClientId:clientId,

        status:STATUS.PENDING

    });

}

// ======================================
// REJECTED REFERRALS
// ======================================

async function getRejectedReferrals(clientId){

    return await Referral.countDocuments({

        referrerClientId:clientId,

        status:STATUS.REJECTED

    });

}

// ======================================
// TOTAL REWARD VALUE
// ======================================

async function getTotalRewardValue(clientId){

    const rewards =

        await Referral.find({

            referrerClientId:clientId,

            rewardStatus:STATUS.REWARDED

        });

    let total = 0;

    for(const reward of rewards){

        total += reward.rewardValue || 0;

        total += reward.rewardAmount || 0;

    }

    return total;

}

// ======================================
// MONTHLY REFERRALS
// ======================================

async function getMonthlyReferrals(clientId){

    const start = new Date();

    start.setDate(1);

    start.setHours(0,0,0,0);

    return await Referral.countDocuments({

        referrerClientId:clientId,

        createdAt:{

            $gte:start

        }

    });

}

// ======================================
// MONTHLY REWARD VALUE
// ======================================

async function getMonthlyRewardValue(clientId){

    const start = new Date();

    start.setDate(1);

    start.setHours(0,0,0,0);

    const rewards =

        await Referral.find({

            referrerClientId:clientId,

            rewardedAt:{

                $gte:start

            }

        });

    let total = 0;

    for(const item of rewards){

        total += item.rewardValue || 0;

        total += item.rewardAmount || 0;

    }

    return total;

}

// ======================================
// REFERRAL HISTORY
// ======================================

async function getReferralHistory(clientId){

    return await Referral.find({

        referrerClientId:clientId

    })

    .populate(

        "referredClientId",

        "store email"

    )

    .sort({

        createdAt:-1

    });

}

// ======================================
// LEADERBOARD
// ======================================

async function getReferralLeaderboard(limit=20){

    return await Referral.aggregate([

        {

            $match:{

                rewardStatus:STATUS.REWARDED

            }

        },

        {

            $group:{

                _id:"$referrerClientId",

                referrals:{

                    $sum:1

                },

                rewards:{

                    $sum:"$rewardValue"

                }

            }

        },

        {

            $sort:{

                referrals:-1

            }

        },

        {

            $limit:limit

        }

    ]);

}

// ======================================
// DASHBOARD SUMMARY
// ======================================

async function buildReferralDashboard(clientId){

    return{

        total:

            await getTotalReferrals(clientId),

        pending:

            await getPendingReferrals(clientId),

        qualified:

            await getQualifiedReferrals(clientId),

        rewarded:

            await getRewardedReferrals(clientId),

        rejected:

            await getRejectedReferrals(clientId),

        monthly:

            await getMonthlyReferrals(clientId),

        totalRewards:

            await getTotalRewardValue(clientId),

        monthlyRewards:

            await getMonthlyRewardValue(clientId)

    };

}

// ======================================
// EXPORT REFERRALS
// ======================================

async function exportReferralData(clientId){

    const rows =

        await Referral.find({

            referrerClientId:clientId

        })

        .populate(

            "referredClientId",

            "store email"

        );

    return rows.map(item=>({

        referralCode:item.referralCode,

        referredStore:item.referredStore,

        plan:item.referredPlan,

        status:item.status,

        reward:item.rewardType,

        rewardValue:item.rewardValue,

        rewardAmount:item.rewardAmount,

        qualifiedAt:item.qualifiedAt,

        rewardedAt:item.rewardedAt,

        createdAt:item.createdAt

    }));

}

// ======================================
// NEXT PART
// ======================================
//
// Part 7
//
// • Scheduled automation
// • Daily qualification cron
// • Reward processing cron
// • Reminder emails
// • Fraud cleanup
// • Auto reject expired referrals
// ======================================
// PART 7
// Referral Automation Engine
// Production Ready
// ======================================
// ======================================
// DAILY QUALIFICATION JOB
// ======================================

async function runDailyQualificationJob(){

    const pendingReferrals =
        await Referral.find({

            status:STATUS.PENDING,

            referredClientId:{
                $ne:null
            }

        });

    let qualified = 0;

    for(const referral of pendingReferrals){

        const subscription =
            await Subscription.findOne({

                clientId:
                    referral.referredClientId

            });

        if(!subscription)
            continue;

        switch(subscription.plan){

            case "starter":

            case "growth":

                await qualifyGrowthReferral(

                    referral.referredClientId

                );

            break;

            case "premium":

                await qualifyPremiumReferral(

                    referral.referredClientId

                );

            break;

            case "enterprise":

                await qualifyEnterpriseReferral(

                    referral.referredClientId

                );

            break;

        }

        qualified++;

    }

    return qualified;

}

// ======================================
// REWARD DISTRIBUTION JOB
// ======================================

async function runRewardDistributionJob(){

    const referrals =

        await Referral.find({

            status:STATUS.QUALIFIED,

            rewardStatus:{
                $ne:STATUS.REWARDED
            }

        });

    let processed = 0;

    for(const referral of referrals){

        await applyQualifiedReward(referral);

        processed++;

    }

    return processed;

}

// ======================================
// AUTO EXPIRE REFERRALS
// ======================================

async function expireOldReferrals(){

    const expiryDate =
        addDays(now(),-90);

    const referrals =

        await Referral.find({

            status:STATUS.PENDING,

            createdAt:{
                $lte:expiryDate
            }

        });

    for(const referral of referrals){

        referral.status =
            STATUS.REJECTED;

        referral.rejectReason =
            "Referral expired";

        await referral.save();

    }

    return referrals.length;

}

// ======================================
// DUPLICATE CLEANUP
// ======================================

async function cleanupDuplicateReferrals(){

    const referrals =
        await Referral.find({

            status:STATUS.PENDING

        });

    let duplicates = 0;

    const stores = new Set();

    for(const referral of referrals){

        if(

            stores.has(

                referral.referredStore

            )

        ){

            referral.status =
                STATUS.REJECTED;

            referral.rejectReason =
                "Duplicate Store";

            await referral.save();

            duplicates++;

            continue;

        }

        stores.add(

            referral.referredStore

        );

    }

    return duplicates;

}

// ======================================
// REMINDER EMAIL QUEUE
// ======================================

async function getReminderQueue(){

    const tomorrow =

        addDays(now(),1);

    return await Subscription.find({

        autoRenew:true,

        renewalReminderSent:false,

        renewalDate:{

            $lte:tomorrow

        }

    });

}

// ======================================
// MARK REMINDER SENT
// ======================================

async function markReminderSent(subscriptionId){

    await Subscription.updateOne(

        {

            _id:subscriptionId

        },

        {

            $set:{

                renewalReminderSent:true

            }

        }

    );

}

// ======================================
// RESET MONTHLY FLAGS
// ======================================

async function resetReminderFlags(){

    await Subscription.updateMany(

        {},

        {

            $set:{

                renewalReminderSent:false

            }

        }

    );

}

// ======================================
// DAILY CRON
// ======================================

async function runReferralCron(){

    await cleanupDuplicateReferrals();

    await expireOldReferrals();

    await runDailyQualificationJob();

    await runRewardDistributionJob();

}

// ======================================
// AUTOMATION SUMMARY
// ======================================

async function getAutomationSummary(){

    return{

        pending:

            await Referral.countDocuments({

                status:STATUS.PENDING

            }),

        qualified:

            await Referral.countDocuments({

                status:STATUS.QUALIFIED

            }),

        rewarded:

            await Referral.countDocuments({

                rewardStatus:STATUS.REWARDED

            }),

        reminders:

            (await getReminderQueue()).length

    };

}

// ======================================
// NEXT PART
// ======================================
//
// Part 8
//
// • Module exports
// • Final production integration
// • Public API
// • Admin API
// • Internal helpers
// • Production optimization
// • Final cleanup
// ======================================
// PART 8
// Final Engine Exports
// Production Ready
// ======================================

// ======================================
// PUBLIC API
// ======================================

module.exports = {

    // ----------------------------------
    // Registration
    // ----------------------------------

    createReferralOwner,
    registerReferral,
    validateReferralCode,
    generateReferralCode,
    saveFirstPayment,

    // ----------------------------------
    // Qualification
    // ----------------------------------

    qualifyGrowthReferral,
    qualifyPremiumReferral,
    qualifyEnterpriseReferral,

    // ----------------------------------
    // Rewards
    // ----------------------------------

    applyStarterReward,
    applyGrowthReward,
    applyQualifiedReward,
    processPremiumVIPReward,
    processEnterpriseReward,

    // ----------------------------------
    // Upgrade Discount
    // ----------------------------------

    applyReferralUpgradeDiscount,
    consumeUpgradeDiscount,

    // ----------------------------------
    // Billing
    // ----------------------------------

    buildBillingSummary,
    finalizeReward,
    restoreBilling,
    revokeReward,

    getStripeCheckoutAmount,
    getRazorpayCheckoutAmount,

    // ----------------------------------
    // Dashboard
    // ----------------------------------

    getClientReferrals,
    getReferralHistory,

    getTotalReferrals,
    getPendingReferrals,
    getQualifiedReferrals,
    getRewardedReferrals,
    getRejectedReferrals,

    getMonthlyReferrals,
    getMonthlyRewardValue,
    getTotalRewardValue,

    buildReferralDashboard,

    exportReferralData,

    getReferralLeaderboard,

    // ----------------------------------
    // VIP
    // ----------------------------------

    getVIPSummary,
    updateVIPBadge,
    getPremiumReferralCount,

    // ----------------------------------
    // Automation
    // ----------------------------------

    runDailyQualificationJob,
    runRewardDistributionJob,

    cleanupDuplicateReferrals,
    expireOldReferrals,

    getReminderQueue,
    markReminderSent,
    resetReminderFlags,

    runReferralCron,
    getAutomationSummary,

    // ----------------------------------
    // Internal Helpers
    // ----------------------------------

    normalizeStore,
    normalizeReferralCode,

    hasCompletedMinimumDays,
    isSubscriptionEligible,

    isGrowth,
    isPremium,
    isEnterprise,

    addDays,
    diffDays,
    now,

    isValidObjectId

};

// ======================================
// END OF FILE
// Referral Engine
// Version 2.0
// Layboka AI
// ======================================
