// ======================================
// shopi-ai/src/webhooks/stripe.webhook.js
// Layboka AI
// Stripe Webhook
// Production Ready
// Part 1
// ======================================

"use strict";

// ======================================
// IMPORTS
// ======================================

const Stripe =
require("stripe");

const subscriptionService =
require("../services/subscription.service");

const referralService =
require("../services/referral.service");

const Subscription =
require("../../models/Subscription");

const Client =
require("../../models/Client");

// ======================================
// STRIPE
// ======================================

const stripe =

new Stripe(

    process.env.STRIPE_SECRET_KEY,

    {

        apiVersion:

        "2025-06-30.basil"

    }

);

// ======================================
// WEBHOOK SECRET
// ======================================

const WEBHOOK_SECRET =

process.env

.STRIPE_WEBHOOK_SECRET;

// ======================================
// EVENTS
// ======================================

const EVENTS = {

CHECKOUT_COMPLETED:

"checkout.session.completed",

SUBSCRIPTION_CREATED:

"customer.subscription.created",

SUBSCRIPTION_UPDATED:

"customer.subscription.updated",

SUBSCRIPTION_DELETED:

"customer.subscription.deleted",

INVOICE_PAID:

"invoice.paid",

INVOICE_FAILED:

"invoice.payment_failed"

};

// ======================================
// LOGGER
// ======================================

function log(

    event,

    data={}

){

    console.log({

        module:

        "StripeWebhook",

        timestamp:

        new Date(),

        event,

        data

    });

}

// ======================================
// WEBHOOK OBJECT
// ======================================

const stripeWebhook = {};

// ======================================
// NEXT
// ======================================
//
// Part 2
//
// • Verify Stripe signature
// • Parse webhook event
// • Main webhook handler
// • Event dispatcher
// ======================================
// PART 2
// Verify Signature
// Main Webhook Handler
// Event Dispatcher
// ======================================

// ======================================
// VERIFY STRIPE SIGNATURE
// ======================================

stripeWebhook.verify =
(

    request

)=>{

    const signature =

        request.headers[
            "stripe-signature"
        ];

    return stripe.webhooks.constructEvent(

        request.body,

        signature,

        WEBHOOK_SECRET

    );

};

// ======================================
// MAIN WEBHOOK
// ======================================

stripeWebhook.handle =
async(

    req,

    res

)=>{

    let event;

    try{

        event =

            stripeWebhook.verify(

                req

            );

    }catch(error){

        console.error(

            "Stripe signature failed:",

            error.message

        );

        return res.status(400)

        .send(

            `Webhook Error: ${error.message}`

        );

    }

    log(

        "Webhook received",

        {

            id:event.id,

            type:event.type

        }

    );

    try{

        await stripeWebhook.dispatch(

            event

        );

        return res.status(200)

        .json({

            received:true

        });

    }catch(error){

        console.error(error);

        return res.status(500)

        .json({

            success:false,

            message:error.message

        });

    }

};

// ======================================
// EVENT DISPATCHER
// ======================================

stripeWebhook.dispatch =
async(

    event

)=>{

    switch(event.type){

        case EVENTS.CHECKOUT_COMPLETED:

            return await stripeWebhook

            .checkoutCompleted(

                event.data.object

            );

        case EVENTS.SUBSCRIPTION_CREATED:

            return await stripeWebhook

            .subscriptionCreated(

                event.data.object

            );

        case EVENTS.SUBSCRIPTION_UPDATED:

            return await stripeWebhook

            .subscriptionUpdated(

                event.data.object

            );

        case EVENTS.SUBSCRIPTION_DELETED:

            return await stripeWebhook

            .subscriptionDeleted(

                event.data.object

            );

        case EVENTS.INVOICE_PAID:

            return await stripeWebhook

            .invoicePaid(

                event.data.object

            );

        case EVENTS.INVOICE_FAILED:

            return await stripeWebhook

            .invoiceFailed(

                event.data.object

            );

        default:

            log(

                "Unhandled Stripe event",

                {

                    type:event.type

                }

            );

            return;

    }

};

// ======================================
// NEXT
// ======================================
//
// Part 3
//
// • checkout.session.completed
// • Save customer
// • Save subscription
// • Activate subscription
// ======================================
// PART 3
// checkout.session.completed
// Production Ready
// ======================================

// ======================================
// CHECKOUT COMPLETED
// ======================================

stripeWebhook.checkoutCompleted =
async(session)=>{

    try{

        log(

            "Checkout completed",

            {

                sessionId:

                session.id

            }

        );

        const clientId =

            session.metadata

            ?.clientId;

        if(!clientId){

            log(

                "Missing clientId",

                {

                    session:

                    session.id

                }

            );

            return;

        }

        const plan =

            session.metadata

            ?.plan ||

            "starter";

        const interval =

            session.metadata

            ?.interval ||

            "monthly";

        const amount =

            session.amount_total

            ?

            session.amount_total/100

            :

            0;

        // ==================================
        // CREATE SUBSCRIPTION
        // ==================================

        await subscriptionService

        .createSubscription(

            clientId,

            plan,

            interval,

            amount,

            session.customer,

            session.subscription

        );

        // ==================================
        // ACTIVATE
        // ==================================

        await subscriptionService

        .activateSubscription(

            clientId

        );

        // ==================================
        // UNLOCK CHATBOT
        // ==================================

        await subscriptionService

        .unlockChatbot(

            clientId

        );

        // ==================================
        // PROCESS FIRST PAYMENT
        // ==================================

        await subscriptionService

        .processFirstPayment(

            clientId,

            amount

        );

        // ==================================
        // REFERRAL QUALIFICATION
        // ==================================

        await subscriptionService

        .processReferralQualification(

            clientId

        );

        // ==================================
        // UPDATE CLIENT
        // ==================================

        await Client.findByIdAndUpdate(

            clientId,

            {

                stripeCustomerId:

                    session.customer,

                stripeSubscriptionId:

                    session.subscription,

                subscriptionPlan:

                    plan,

                chatbotEnabled:true,

                aiEnabled:true

            }

        );

        log(

            "Checkout processed",

            {

                clientId,

                customer:

                session.customer,

                subscription:

                session.subscription

            }

        );

    }catch(error){

        console.error(

            "checkoutCompleted",

            error

        );

        throw error;

    }

};

// ======================================
// NEXT
// ======================================
//
// Part 4
//
// • customer.subscription.created
// • customer.subscription.updated
// • Update database
// • Sync Stripe status
// ======================================
// PART 4
// customer.subscription.created
// customer.subscription.updated
// Production Ready
// ======================================

// ======================================
// SUBSCRIPTION CREATED
// ======================================

stripeWebhook.subscriptionCreated =
async(subscription)=>{

    try{

        log(

            "Subscription created",

            {

                subscriptionId:

                subscription.id

            }

        );

        const dbSubscription =

            await Subscription.findOne({

                customerId:

                subscription.customer

            });

        if(!dbSubscription){

            log(

                "Subscription not found",

                {

                    customer:

                    subscription.customer

                }

            );

            return;

        }

        dbSubscription.subscriptionId =
            subscription.id;

        dbSubscription.status =
            "active";

        dbSubscription.locked =
            false;

        dbSubscription.autoRenew =
            !subscription.cancel_at_period_end;

        dbSubscription.startDate =
            new Date(

                subscription.start_date * 1000

            );

        dbSubscription.renewalDate =
            new Date(

                subscription.current_period_end * 1000

            );

        dbSubscription.expiryDate =
            dbSubscription.renewalDate;

        await dbSubscription.save();

        await subscriptionService
        .unlockChatbot(

            dbSubscription.clientId

        );

        log(

            "Subscription activated",

            {

                clientId:

                dbSubscription.clientId

            }

        );

    }catch(error){

        console.error(

            "subscriptionCreated",

            error

        );

        throw error;

    }

};

// ======================================
// SUBSCRIPTION UPDATED
// ======================================

stripeWebhook.subscriptionUpdated =
async(subscription)=>{

    try{

        log(

            "Subscription updated",

            {

                subscriptionId:

                subscription.id

            }

        );

        const dbSubscription =

            await Subscription.findOne({

                subscriptionId:

                subscription.id

            });

        if(!dbSubscription){

            log(

                "Database subscription missing",

                {

                    subscriptionId:

                    subscription.id

                }

            );

            return;

        }

        dbSubscription.status =
            subscription.status;

        dbSubscription.autoRenew =
            !subscription.cancel_at_period_end;

        dbSubscription.renewalDate =
            new Date(

                subscription.current_period_end * 1000

            );

        dbSubscription.expiryDate =
            dbSubscription.renewalDate;

        if(

            subscription.cancel_at

        ){

            dbSubscription.cancelledAt =
                new Date(

                    subscription.cancel_at * 1000

                );

        }

        await dbSubscription.save();

        await subscriptionService
        .onSubscriptionUpdated(

            dbSubscription.clientId,

            dbSubscription.plan

        );

        log(

            "Subscription synchronized",

            {

                clientId:

                dbSubscription.clientId

            }

        );

    }catch(error){

        console.error(

            "subscriptionUpdated",

            error

        );

        throw error;

    }

};

// ======================================
// NEXT
// ======================================
//
// Part 5
//
// • invoice.paid
// • Successful renewal
// • Unlock chatbot
// • Referral reward
// ======================================
// PART 5
// invoice.paid
// Successful Renewal
// Production Ready
// ======================================

// ======================================
// INVOICE PAID
// ======================================

stripeWebhook.invoicePaid =
async(invoice)=>{

    try{

        log(

            "Invoice paid",

            {

                invoiceId:

                invoice.id

            }

        );

        const subscription =

            await Subscription.findOne({

                customerId:

                invoice.customer

            });

        if(!subscription){

            log(

                "Subscription missing",

                {

                    customer:

                    invoice.customer

                }

            );

            return;

        }

        // ==================================
        // UPDATE PAYMENT
        // ==================================

        subscription.paymentId =
            invoice.payment_intent || "";

        subscription.paid = true;

        subscription.status = "active";

        subscription.locked = false;

        subscription.lastPaymentDate =
            new Date();

        subscription.renewalsCount =
            (subscription.renewalsCount || 0) + 1;

        if(

            invoice.lines &&
            invoice.lines.data &&
            invoice.lines.data.length

        ){

            const period =

                invoice.lines.data[0].period;

            if(period){

                subscription.startDate =
                    new Date(

                        period.start * 1000

                    );

                subscription.renewalDate =
                    new Date(

                        period.end * 1000

                    );

                subscription.expiryDate =
                    subscription.renewalDate;

            }

        }

        subscription.showRenewBanner = false;

        subscription.bannerEnabled = false;

        subscription.bannerType = "";

        subscription.bannerColor = "";

        subscription.bannerAnimation = "";

        subscription.reminder48Sent = false;

        subscription.reminder24Sent = false;

        subscription.reminder6Sent = false;

        subscription.autoRenew = true;

        await subscription.save();

        // ==================================
        // SERVICE ACTIONS
        // ==================================

        await subscriptionService

        .unlockChatbot(

            subscription.clientId

        );

        await subscriptionService

        .renewSubscription(

            subscription.clientId

        );

        await subscriptionService

        .processReferralQualification(

            subscription.clientId

        );

        log(

            "Invoice processed",

            {

                clientId:

                subscription.clientId,

                renewalDate:

                subscription.renewalDate

            }

        );

    }catch(error){

        console.error(

            "invoicePaid",

            error

        );

        throw error;

    }

};

// ======================================
// NEXT
// ======================================
//
// Part 6
//
// • invoice.payment_failed
// • Lock chatbot
// • Enable renew banner
// • Send reminders 
// ======================================
// PART 6
// invoice.payment_failed
// Production Ready
// ======================================

// ======================================
// INVOICE PAYMENT FAILED
// ======================================

stripeWebhook.invoiceFailed =
async(invoice)=>{

    try{

        log(

            "Invoice payment failed",

            {

                invoiceId:

                invoice.id

            }

        );

        const subscription =

            await Subscription.findOne({

                customerId:

                invoice.customer

            });

        if(!subscription){

            log(

                "Subscription missing",

                {

                    customer:

                    invoice.customer

                }

            );

            return;

        }

        // ==================================
        // UPDATE SUBSCRIPTION
        // ==================================

        subscription.status =
            "payment_failed";

        subscription.paid = false;

        subscription.locked = true;

        subscription.lastFailedPayment =
            new Date();

        subscription.failedInvoiceId =
            invoice.id;

        subscription.showRenewBanner = true;

        subscription.bannerEnabled = true;

        subscription.bannerType =
            "payment_failed";

        subscription.bannerColor =
            "red";

        subscription.bannerAnimation =
            "pulse";

        subscription.autoRenew = true;

        await subscription.save();

        // ==================================
        // LOCK CHATBOT
        // ==================================

        await subscriptionService

        .paymentFailed(

            subscription.clientId

        );

        await subscriptionService

        .lockChatbot(

            subscription.clientId

        );

        // ==================================
        // REFERRAL SAFETY
        // ==================================

        if(

            referralService

            .cancelPendingReward

        ){

            await referralService

            .cancelPendingReward(

                subscription.clientId

            );

        }

        // ==================================
        // LOG
        // ==================================

        log(

            "Payment failed processed",

            {

                clientId:

                subscription.clientId,

                customer:

                invoice.customer

            }

        );

    }catch(error){

        console.error(

            "invoiceFailed",

            error

        );

        throw error;

    }

};

// ======================================
// NEXT
// ======================================
//
// Part 7
//
// • customer.subscription.deleted
// • Cancel subscription
// • Lock chatbot
// • Cleanup
// ======================================
// PART 7
// customer.subscription.deleted
// Production Ready
// ======================================

// ======================================
// SUBSCRIPTION DELETED
// ======================================

stripeWebhook.subscriptionDeleted =
async(subscription)=>{

    try{

        log(

            "Subscription deleted",

            {

                subscriptionId:

                subscription.id

            }

        );

        const dbSubscription =

            await Subscription.findOne({

                subscriptionId:

                subscription.id

            });

        if(!dbSubscription){

            log(

                "Database subscription missing",

                {

                    subscriptionId:

                    subscription.id

                }

            );

            return;

        }

        // ==================================
        // UPDATE DATABASE
        // ==================================

        dbSubscription.status =
            "cancelled";

        dbSubscription.locked = true;

        dbSubscription.paid = false;

        dbSubscription.autoRenew = false;

        dbSubscription.cancelledAt =
            new Date();

        dbSubscription.showRenewBanner = true;

        dbSubscription.bannerEnabled = true;

        dbSubscription.bannerType =
            "subscription_cancelled";

        dbSubscription.bannerColor =
            "red";

        dbSubscription.bannerAnimation =
            "pulse";

        await dbSubscription.save();

        // ==================================
        // LOCK CHATBOT
        // ==================================

        await subscriptionService

        .cancelSubscription(

            dbSubscription.clientId

        );

        await subscriptionService

        .lockChatbot(

            dbSubscription.clientId

        );

        // ==================================
        // UPDATE CLIENT
        // ==================================

        await Client.findByIdAndUpdate(

            dbSubscription.clientId,

            {

                chatbotEnabled:false,

                aiEnabled:false,

                subscriptionStatus:
                    "cancelled"

            }

        );

        // ==================================
        // CANCEL REFERRAL REWARDS
        // ==================================

        if(

            referralService

            .cancelPendingReward

        ){

            await referralService

            .cancelPendingReward(

                dbSubscription.clientId

            );

        }

        // ==================================
        // LOG
        // ==================================

        log(

            "Subscription cancellation completed",

            {

                clientId:

                dbSubscription.clientId

            }

        );

    }catch(error){

        console.error(

            "subscriptionDeleted",

            error

        );

        throw error;

    }

};

// ======================================
// NEXT
// ======================================
//
// Part 8
//
// • Default handler
// • Unknown events
// • Export
// • Production Finish
// ======================================
// PART 8
// Default Handler
// Export
// Production Finish
// ======================================

// ======================================
// UNKNOWN EVENT
// ======================================

stripeWebhook.unhandled =
async(event)=>{

    log(

        "Unhandled Stripe event",

        {

            id:event.id,

            type:event.type

        }

    );

    return;

};

// ======================================
// SAFE DISPATCH
// ======================================

stripeWebhook.process =
async(event)=>{

    switch(event.type){

        case EVENTS.CHECKOUT_COMPLETED:

            return stripeWebhook

                .checkoutCompleted(

                    event.data.object

                );

        case EVENTS.SUBSCRIPTION_CREATED:

            return stripeWebhook

                .subscriptionCreated(

                    event.data.object

                );

        case EVENTS.SUBSCRIPTION_UPDATED:

            return stripeWebhook

                .subscriptionUpdated(

                    event.data.object

                );

        case EVENTS.INVOICE_PAID:

            return stripeWebhook

                .invoicePaid(

                    event.data.object

                );

        case EVENTS.INVOICE_FAILED:

            return stripeWebhook

                .invoiceFailed(

                    event.data.object

                );

        case EVENTS.SUBSCRIPTION_DELETED:

            return stripeWebhook

                .subscriptionDeleted(

                    event.data.object

                );

        default:

            return stripeWebhook

                .unhandled(

                    event

                );

    }

};

// ======================================
// EXPRESS ROUTE HANDLER
// Used in server.js
// ======================================

stripeWebhook.webhook =
async(req,res)=>{

    try{

        const event =

            stripeWebhook.verify(

                req

            );

        await stripeWebhook

            .process(

                event

            );

        return res

        .status(200)

        .json({

            received:true

        });

    }catch(error){

        console.error(

            "Stripe webhook error",

            error

        );

        return res

        .status(400)

        .json({

            success:false,

            message:error.message

        });

    }

};

// ======================================
// EXPORT
// ======================================

module.exports =
stripeWebhook;
