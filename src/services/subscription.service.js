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
// ======================================
// PART 2
// Trial
// Create Subscription
// Activate Subscription
// Upgrade Subscription
// ======================================

// ======================================
// CREATE TRIAL
// ======================================

subscriptionService.createTrial =
async(

    clientId,

    email,

    store

)=>{

    return await withTransaction(

    async()=>{

        const client =

            await Client.findById(

                clientId

            );

        if(!client){

            return buildResponse(

                false,

                "Client not found"

            );

        }

        let subscription =

            await Subscription.findOne({

                clientId

            });

        if(subscription){

            return buildResponse(

                false,

                "Subscription already exists"

            );

        }

        subscription =

            await Subscription.create({

                clientId,

                store,

                email,

                plan:PLAN.STARTER,

                provider:"stripe",

                amount:25,

                currency:CURRENCY,

                interval:BILLING.MONTHLY,

                status:STATUS.TRIAL,

                paid:false,

                locked:false,

                autoRenew:true,

                startDate:new Date(),

                expiryDate:addDays(

                    new Date(),

                    TRIAL_DAYS

                ),

                renewalDate:addDays(

                    new Date(),

                    TRIAL_DAYS

                )

            });

        client.subscriptionStatus =
            STATUS.TRIAL;

        client.chatbotEnabled = true;

        client.aiEnabled = true;

        await client.save();

        log(

            "Trial created",

            {

                clientId,

                subscriptionId:

                subscription._id

            }

        );

        return buildResponse(

            true,

            "Trial created",

            {

                subscription

            }

        );

    });

};

// ======================================
// CREATE PAID SUBSCRIPTION
// ======================================

subscriptionService.createSubscription =
async(

    clientId,

    plan,

    interval,

    amount,

    stripeCustomerId,

    stripeSubscriptionId

)=>{

    return await withTransaction(

    async()=>{

        const subscription =

            await Subscription.findOne({

                clientId

            });

        if(!subscription){

            return buildResponse(

                false,

                "Subscription not found"

            );

        }

        subscription.plan = plan;

        subscription.interval = interval;

        subscription.amount = amount;

        subscription.customerId =
            stripeCustomerId;

        subscription.subscriptionId =
            stripeSubscriptionId;

        subscription.provider =
            "stripe";

        subscription.paid = true;

        subscription.status =
            STATUS.ACTIVE;

        subscription.locked = false;

        subscription.startDate =
            new Date();

        subscription.renewalDate =

            interval===BILLING.YEARLY

            ?

            addYears(

                new Date(),

                1

            )

            :

            addMonths(

                new Date(),

                1

            );

        subscription.expiryDate =
            subscription.renewalDate;

        await subscription.save();

        return buildResponse(

            true,

            "Subscription created",

            {

                subscription

            }

        );

    });

};

// ======================================
// ACTIVATE SUBSCRIPTION
// ======================================

subscriptionService.activateSubscription =
async(clientId)=>{

    const client =

        await Client.findById(

            clientId

        );

    if(!client){

        return buildResponse(

            false,

            "Client not found"

        );

    }

    client.subscriptionStatus =
        STATUS.ACTIVE;

    client.chatbotEnabled = true;

    client.aiEnabled = true;

    await client.save();

    return buildResponse(

        true,

        "Subscription activated"

    );

};

// ======================================
// UPGRADE SUBSCRIPTION
// ======================================

subscriptionService.upgradeSubscription =
async(

    clientId,

    newPlan

)=>{

    const subscription =

        await Subscription.findOne({

            clientId

        });

    if(!subscription){

        return buildResponse(

            false,

            "Subscription not found"

        );

    }

    subscription.plan = newPlan;

    subscription.upgradeDiscount =
        UPGRADE_DISCOUNT;

    subscription.upgradedAt =
        new Date();

    await subscription.save();

    return buildResponse(

        true,

        "Subscription upgraded",

        {

            discount:

            UPGRADE_DISCOUNT,

            subscription

        }

    );

};

// ======================================
// NEXT
// ======================================
//
// Part 3
//
// • renewSubscription()
// • extendSubscription()
// • cancelSubscription()
// • pauseSubscription()
// ======================================
// PART 3
// Renewal
// Extend
// Cancel
// Pause
// ======================================

// ======================================
// RENEW SUBSCRIPTION
// ======================================

subscriptionService.renewSubscription =
async(clientId)=>{

    return await withTransaction(

    async()=>{

        const subscription =

            await Subscription.findOne({

                clientId

            });

        if(!subscription){

            return buildResponse(

                false,

                "Subscription not found"

            );

        }

        if(subscription.locked){

            return buildResponse(

                false,

                "Subscription is locked"

            );

        }

        const now =

            new Date();

        subscription.lastPaymentDate =
            now;

        subscription.renewalsCount =
            (subscription.renewalsCount || 0) + 1;

        if(

            subscription.interval ===

            BILLING.YEARLY

        ){

            subscription.renewalDate =

                addYears(

                    now,

                    1

                );

        }else{

            subscription.renewalDate =

                addMonths(

                    now,

                    1

                );

        }

        subscription.expiryDate =
            subscription.renewalDate;

        subscription.status =
            STATUS.ACTIVE;

        subscription.paid = true;

        subscription.locked = false;

        await subscription.save();

        log(

            "Subscription renewed",

            {

                clientId,

                renewalDate:

                subscription.renewalDate

            }

        );

        return buildResponse(

            true,

            "Subscription renewed",

            {

                subscription

            }

        );

    });

};

// ======================================
// EXTEND SUBSCRIPTION
// FREE MONTH / ADMIN BONUS
// ======================================

subscriptionService.extendSubscription =
async(

    clientId,

    months = 1

)=>{

    const subscription =

        await Subscription.findOne({

            clientId

        });

    if(!subscription){

        return buildResponse(

            false,

            "Subscription not found"

        );

    }

    subscription.expiryDate =

        addMonths(

            subscription.expiryDate,

            months

        );

    subscription.renewalDate =
        subscription.expiryDate;

    await subscription.save();

    log(

        "Subscription extended",

        {

            clientId,

            months

        }

    );

    return buildResponse(

        true,

        "Subscription extended",

        {

            subscription

        }

    );

};

// ======================================
// CANCEL SUBSCRIPTION
// ======================================

subscriptionService.cancelSubscription =
async(clientId)=>{

    const subscription =

        await Subscription.findOne({

            clientId

        });

    if(!subscription){

        return buildResponse(

            false,

            "Subscription not found"

        );

    }

    subscription.status =
        STATUS.CANCELLED;

    subscription.autoRenew =
        false;

    subscription.cancelledAt =
        new Date();

    await subscription.save();

    log(

        "Subscription cancelled",

        {

            clientId

        }

    );

    return buildResponse(

        true,

        "Subscription cancelled",

        {

            subscription

        }

    );

};

// ======================================
// PAUSE SUBSCRIPTION
// ======================================

subscriptionService.pauseSubscription =
async(clientId)=>{

    const subscription =

        await Subscription.findOne({

            clientId

        });

    if(!subscription){

        return buildResponse(

            false,

            "Subscription not found"

        );

    }

    subscription.status =
        STATUS.PAUSED;

    subscription.pausedAt =
        new Date();

    await subscription.save();

    log(

        "Subscription paused",

        {

            clientId

        }

    );

    return buildResponse(

        true,

        "Subscription paused",

        {

            subscription

        }

    );

};

// ======================================
// NEXT
// ======================================
//
// Part 4
//
// • lockChatbot()
// • unlockChatbot()
// • paymentFailed()
// • expireTrial(
// ======================================
// PART 4
// Chatbot Lock
// Chatbot Unlock
// Payment Failed
// Trial Expiry
// ======================================

// ======================================
// LOCK CHATBOT
// ======================================

subscriptionService.lockChatbot =
async(clientId)=>{

    return await withTransaction(

    async()=>{

        const client =

            await Client.findById(

                clientId

            );

        if(!client){

            return buildResponse(

                false,

                "Client not found"

            );

        }

        const subscription =

            await Subscription.findOne({

                clientId

            });

        if(!subscription){

            return buildResponse(

                false,

                "Subscription not found"

            );

        }

        subscription.locked = true;

        await subscription.save();

        client.chatbotEnabled = false;

        client.aiEnabled = false;

        await client.save();

        log(

            "Chatbot locked",

            {

                clientId

            }

        );

        return buildResponse(

            true,

            "Chatbot locked"

        );

    });

};

// ======================================
// UNLOCK CHATBOT
// ======================================

subscriptionService.unlockChatbot =
async(clientId)=>{

    return await withTransaction(

    async()=>{

        const client =

            await Client.findById(

                clientId

            );

        if(!client){

            return buildResponse(

                false,

                "Client not found"

            );

        }

        const subscription =

            await Subscription.findOne({

                clientId

            });

        if(!subscription){

            return buildResponse(

                false,

                "Subscription not found"

            );

        }

        subscription.locked = false;

        subscription.status = STATUS.ACTIVE;

        subscription.paid = true;

        subscription.showRenewBanner = false;

        subscription.bannerEnabled = false;

        subscription.bannerType = "";

        subscription.bannerColor = "";

        subscription.bannerAnimation = "";

        subscription.reminder48Sent = false;

        subscription.reminder24Sent = false;

        subscription.reminder6Sent = false;

        await subscription.save();

        client.chatbotEnabled = true;

        client.aiEnabled = true;

        client.subscriptionStatus =
            STATUS.ACTIVE;

        await client.save();

        log(

            "Chatbot unlocked",

            {

                clientId

            }

        );

        return buildResponse(

            true,

            "Chatbot unlocked"

        );

    });

};

// ======================================
// PAYMENT FAILED
// ======================================

subscriptionService.paymentFailed =
async(clientId)=>{

    const subscription =

        await Subscription.findOne({

            clientId

        });

    if(!subscription){

        return buildResponse(

            false,

            "Subscription not found"

        );

    }

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

    await subscriptionService

        .lockChatbot(

            clientId

        );

    log(

        "Payment failed",

        {

            clientId

        }

    );

    return buildResponse(

        true,

        "Payment failed processed"

    );

};

// ======================================
// EXPIRE TRIAL
// ======================================

subscriptionService.expireTrial =
async(clientId)=>{

    const subscription =

        await Subscription.findOne({

            clientId

        });

    if(!subscription){

        return buildResponse(

            false,

            "Subscription not found"

        );

    }

    subscription.status =
        STATUS.EXPIRED;

    subscription.locked = true;

    subscription.showRenewBanner = true;

    subscription.bannerEnabled = true;

    subscription.bannerType =
        "expired";

    subscription.bannerColor =
        "red";

    subscription.expiredAt =
        new Date();

    await subscription.save();

    await subscriptionService

        .lockChatbot(

            clientId

        );

    log(

        "Trial expired",

        {

            clientId

        }

    );

    return buildResponse(

        true,

        "Trial expired"

    );

};

// ======================================
// NEXT
// ======================================
//
// Part 5
//
// • getSubscriptionStatus()
// • Countdown banner API
// • 48h / 24h / 6h banner
// • Recharge Now data
// ======================================
// PART 5
// Subscription Status
// Countdown Banner
// Recharge Banner API
// ======================================

// ======================================
// GET SUBSCRIPTION STATUS
// Used by chatbot.js
// ======================================

subscriptionService.getSubscriptionStatus =
async(clientId)=>{

    const subscription =

        await Subscription.findOne({

            clientId

        });

    if(!subscription){

        return buildResponse(

            false,

            "Subscription not found"

        );

    }

    const now = Date.now();

    const expiry =

        new Date(

            subscription.expiryDate

        ).getTime();

    const secondsRemaining =

        Math.max(

            0,

            Math.floor(

                (expiry-now)/1000

            )

        );

    return buildResponse(

        true,

        "Subscription status",

        {

            subscription

        }

    );

};

// ======================================
// CHATBOT BANNER
// ======================================

subscriptionService.getBanner =
async(clientId)=>{

    const subscription =

        await Subscription.findOne({

            clientId

        });

    if(!subscription){

        return buildResponse(

            false,

            "Subscription not found"

        );

    }

    const remainingSeconds =

        Math.max(

            0,

            Math.floor(

                (

                    new Date(

                        subscription.expiryDate

                    )-

                    new Date()

                )/1000

            )

        );

    return buildResponse(

        true,

        "Banner",

        {

            showBanner:

                subscription.showRenewBanner,

            bannerEnabled:

                subscription.bannerEnabled,

            bannerType:

                subscription.bannerType,

            bannerColor:

                subscription.bannerColor ||

                "blue",

            bannerAnimation:

                subscription.bannerAnimation ||

                "none",

            title:

                "Premium Trial",

            message:

                "Your Premium Trial expires soon.",

            remainingSeconds,

            expiryDate:

                subscription.expiryDate,

            locked:

                subscription.locked,

            status:

                subscription.status

        }

    );

};

// ======================================
// RENEW NOW BUTTON
// ======================================

subscriptionService.getRechargeData =
async(clientId)=>{

    const subscription =

        await Subscription.findOne({

            clientId

        });

    if(!subscription){

        return buildResponse(

            false,

            "Subscription not found"

        );

    }

    return buildResponse(

        true,

        "Recharge information",

        {

            buttonText:

                "Recharge Now",

            billingUrl:

                "/billing",

            currentPlan:

                subscription.plan,

            currentPrice:

                subscription.amount,

            currency:

                subscription.currency,

            upgradeDiscount:

                subscription.upgradeDiscount || 0

        }

    );

};

// ======================================
// CHATBOT RESPONSE
// Used by chatbot.js
// ======================================
//
// {
//   showBanner:true,
//   title:"Premium Trial",
//   message:"Your Premium Trial expires in",
//   remainingSeconds:132480,
//   buttonText:"Recharge Now",
//   billingUrl:"/billing"
// }
//
// chatbot.js converts remainingSeconds
// into:
//
// 36:46:30
//
// and updates every second.
//
// ======================================
// NEXT
// ======================================
//
// Part 6
//
// • Upgrade Discount
// • Referral Integration
// • First payment reward
// • Upgrade reward
// ======================================
// PART 6
// Referral Integration
// Upgrade Discount
// First Payment Reward
// ======================================

// ======================================
// GET UPGRADE DISCOUNT
// ======================================

subscriptionService.getUpgradeDiscount =
async(clientId)=>{

    const client =

        await Client.findById(

            clientId

        );

    if(!client){

        return buildResponse(

            false,

            "Client not found"

        );

    }

    const eligible =

        !!client.referredBy;

    return buildResponse(

        true,

        "Upgrade discount",

        {

            eligible,

            discount:

                eligible

                ? UPGRADE_DISCOUNT

                : 0

        }

    );

};

// ======================================
// FIRST PAYMENT SUCCESS
// Called from Stripe Webhook
// ======================================

subscriptionService.processFirstPayment =
async(

    clientId,

    amount

)=>{

    try{

        await referralService

            .saveFirstPayment(

                clientId,

                amount

            );

        log(

            "First payment processed",

            {

                clientId,

                amount

            }

        );

        return buildResponse(

            true,

            "First payment completed"

        );

    }catch(error){

        console.error(error);

        return buildResponse(

            false,

            error.message

        );

    }

};

// ======================================
// QUALIFY REFERRAL
// AFTER PAYMENT
// ======================================

subscriptionService.processReferralQualification =
async(clientId)=>{

    const subscription =

        await Subscription.findOne({

            clientId

        });

    if(!subscription){

        return buildResponse(

            false,

            "Subscription not found"

        );

    }

    switch(subscription.plan){

        case PLAN.STARTER:

            await referralService

                .applyStarterReward(

                    clientId

                );

            break;

        case PLAN.GROWTH:

            await referralService

                .qualifyGrowthReferral(

                    clientId

                );

            break;

        case PLAN.PREMIUM:

            await referralService

                .qualifyPremiumReferral(

                    clientId

                );

            break;

        case PLAN.ENTERPRISE:

            await referralService

                .applyEnterpriseReward(

                    clientId

                );

            break;

    }

    return buildResponse(

        true,

        "Referral qualification processed"

    );

};

// ======================================
// UPGRADE REWARD
// Existing customer upgrading
// ======================================

subscriptionService.processUpgradeReward =
async(

    clientId,

    oldPlan,

    newPlan

)=>{

    const client =

        await Client.findById(

            clientId

        );

    if(!client){

        return buildResponse(

            false,

            "Client not found"

        );

    }

    const discount =

        client.referredBy

        ?

        UPGRADE_DISCOUNT

        :

        0;

    log(

        "Upgrade reward",

        {

            clientId,

            oldPlan,

            newPlan,

            discount

        }

    );

    return buildResponse(

        true,

        "Upgrade reward calculated",

        {

            oldPlan,

            newPlan,

            discount

        }

    );

};

// ======================================
// NEXT
// ======================================
//
// Part 7
//
// • Billing summary
// • Analytics
// • Enterprise request
// • Admin dashboard
// ======================================
// PART 7
// Billing Summary
// Analytics
// Enterprise
// Admin
// ======================================

// ======================================
// BILLING SUMMARY
// ======================================

subscriptionService.getBillingSummary =
async(clientId)=>{

    const subscription =

        await Subscription.findOne({

            clientId

        });

    if(!subscription){

        return buildResponse(

            false,

            "Subscription not found"

        );

    }

    return buildResponse(

        true,

        "Billing summary",

        {

            plan:
                subscription.plan,

            amount:
                subscription.amount,

            currency:
                subscription.currency,

            interval:
                subscription.interval,

            status:
                subscription.status,

            startDate:
                subscription.startDate,

            renewalDate:
                subscription.renewalDate,

            expiryDate:
                subscription.expiryDate,

            renewals:
                subscription.renewalsCount || 0,

            autoRenew:
                subscription.autoRenew,

            upgradeDiscount:
                subscription.upgradeDiscount || 0

        }

    );

};

// ======================================
// SUBSCRIPTION ANALYTICS
// ======================================

subscriptionService.getAnalytics =
async(clientId)=>{

    const subscription =

        await Subscription.findOne({

            clientId

        });

    if(!subscription){

        return buildResponse(

            false,

            "Subscription not found"

        );

    }

    return buildResponse(

        true,

        "Analytics",

        {

            subscriptionAgeDays:

                Math.floor(

                    (

                        Date.now()

                        -

                        new Date(

                            subscription.startDate

                        )

                    )

                    /

                    (1000*60*60*24)

                ),

            renewals:

                subscription.renewalsCount || 0,

            paid:

                subscription.paid,

            locked:

                subscription.locked,

            status:

                subscription.status

        }

    );

};

// ======================================
// ENTERPRISE REQUEST
// ======================================

subscriptionService.createEnterpriseRequest =
async(

    clientId,

    formData

)=>{

    const client =

        await Client.findById(

            clientId

        );

    if(!client){

        return buildResponse(

            false,

            "Client not found"

        );

    }

    log(

        "Enterprise request",

        {

            clientId,

            company:

                formData.company,

            employees:

                formData.employees,

            requirement:

                formData.requirement

        }

    );

    return buildResponse(

        true,

        "Enterprise request submitted"

    );

};

// ======================================
// ADMIN DASHBOARD
// ======================================

subscriptionService.adminDashboard =
async()=>{

    const subscriptions =

        await Subscription.find();

    return buildResponse(

        true,

        "Subscription dashboard",

        {

            total:

                subscriptions.length,

            active:

                subscriptions.filter(

                    s=>s.status===STATUS.ACTIVE

                ).length,

            trial:

                subscriptions.filter(

                    s=>s.status===STATUS.TRIAL

                ).length,

            expired:

                subscriptions.filter(

                    s=>s.status===STATUS.EXPIRED

                ).length,

            cancelled:

                subscriptions.filter(

                    s=>s.status===STATUS.CANCELLED

                ).length,

            paymentFailed:

                subscriptions.filter(

                    s=>s.status===STATUS.PAYMENT_FAILED

                ).length

        }

    );

};

// ======================================
// NEXT
// ======================================
//
// Part 8
//
// • Health()
// • System Status()
// • Stripe helpers
// • module.exports
// • Production finish
// ======================================
// PART 8
// Health
// Status
// Stripe Helpers
// Export
// Production Finish
// ======================================

// ======================================
// SERVICE HEALTH
// ======================================

subscriptionService.health =
()=>{

    return{

        service:
            "Subscription Service",

        status:
            "healthy",

        version:
            "1.0.0",

        currency:
            CURRENCY,

        trialDays:
            TRIAL_DAYS,

        upgradeDiscount:
            UPGRADE_DISCOUNT,

        timestamp:
            new Date()

    };

};

// ======================================
// SYSTEM STATUS
// ======================================

subscriptionService.status =
async()=>{

    const total =

        await Subscription.countDocuments();

    const active =

        await Subscription.countDocuments({

            status:STATUS.ACTIVE

        });

    const trial =

        await Subscription.countDocuments({

            status:STATUS.TRIAL

        });

    const expired =

        await Subscription.countDocuments({

            status:STATUS.EXPIRED

        });

    const cancelled =

        await Subscription.countDocuments({

            status:STATUS.CANCELLED

        });

    const paymentFailed =

        await Subscription.countDocuments({

            status:STATUS.PAYMENT_FAILED

        });

    return{

        total,

        active,

        trial,

        expired,

        cancelled,

        paymentFailed

    };

};

// ======================================
// STRIPE HELPERS
// These methods are called from
// stripe.webhook.js
// ======================================

// Invoice Paid
subscriptionService.onInvoicePaid =
async(clientId)=>{

    await subscriptionService

        .unlockChatbot(

            clientId

        );

    await subscriptionService

        .renewSubscription(

            clientId

        );

    await subscriptionService

        .processReferralQualification(

            clientId

        );

};

// Invoice Payment Failed
subscriptionService.onInvoiceFailed =
async(clientId)=>{

    await subscriptionService

        .paymentFailed(

            clientId

        );

};

// Subscription Cancelled
subscriptionService.onSubscriptionCancelled =
async(clientId)=>{

    await subscriptionService

        .cancelSubscription(

            clientId

        );

    await subscriptionService

        .lockChatbot(

            clientId

        );

};

// Subscription Updated
subscriptionService.onSubscriptionUpdated =
async(

    clientId,

    plan

)=>{

    await subscriptionService

        .upgradeSubscription(

            clientId,

            plan

        );

};

// ======================================
// EXPORT
// ======================================

module.exports =
subscriptionService;
