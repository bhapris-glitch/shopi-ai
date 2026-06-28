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
