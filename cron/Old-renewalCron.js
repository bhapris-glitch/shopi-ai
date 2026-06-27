// ======================================
// cron/renewalCron.js
// Layboka AI Renewal Engine
// Stripe USD Billing
// Auto Renew + Auto Lock
// Production Ready - Part -1
// ======================================

require("dotenv").config();

const cron = require("node-cron");
const Stripe = require("stripe");

const Client = require("../models/Client");
const Subscription = require("../models/Subscription");

const sendEmail =
require("../services/email");

// ======================================
// STRIPE
// ======================================

const stripe = new Stripe(
  process.env.STRIPE_SECRET
);

// ======================================
// CONFIG
// ======================================

const GRACE_PERIOD_DAYS = 3;

const DAY =
24 * 60 * 60 * 1000;

// ======================================
// LOG
// ======================================

function log(message){

  console.log(
    `[RenewalCron] ${message}`
  );

}

// ======================================
// LOCK CLIENT
// ======================================

async function lockClient(
  clientId,
  reason = "expired"
){

  try{

    await Client.findByIdAndUpdate(

      clientId,

      {

        paid:false,

        locked:true,

        status:reason

      }

    );

    log(
      `Client Locked ${clientId}`
    );

  }catch(err){

    console.log(err);

  }

}

// ======================================
// UNLOCK CLIENT
// ======================================

async function unlockClient(
  clientId
){

  try{

    await Client.findByIdAndUpdate(

      clientId,

      {

        paid:true,

        locked:false,

        status:"active"

      }

    );

    log(
      `Client Unlocked ${clientId}`
    );

  }catch(err){

    console.log(err);

  }

}

// ======================================
// UPDATE NEXT BILLING
// ======================================

async function updateRenewalDate(
  subscriptionId
){

  const nextRenewal = new Date(
    Date.now() +
    30 * DAY
  );

  await Subscription.findByIdAndUpdate(

    subscriptionId,

    {

      renewalDate:
      nextRenewal,

      status:"active",

      paid:true,

      locked:false

    }

  );

  return nextRenewal;

}

// ======================================
// SEND PAYMENT FAILED EMAIL
// ======================================

async function sendFailedEmail(
  client
){

  try{

    if(!client.email) return;

    await sendEmail({

      to:client.email,

      subject:
      "Payment Failed - Layboka AI",

      html:`

      <h2>
      Payment Failed
      </h2>

      <p>
      We could not renew your
      subscription.
      </p>

      <p>
      Update your payment method
      to continue using
      Layboka AI.
      </p>

      <a href="${process.env.BASE_URL}/billing">
      Update Billing
      </a>

      `

    });

  }catch(err){

    console.log(err);

  }

}

// ======================================
// SEND EXPIRY EMAIL
// ======================================

async function sendExpiredEmail(
  client
){

  try{

    if(!client.email) return;

    await sendEmail({

      to:client.email,

      subject:
      "Subscription Expired",

      html:`

      <h2>
      Subscription Expired
      </h2>

      <p>
      Your Layboka AI account
      has been locked.
      </p>

      <a href="${process.env.BASE_URL}/pricing">
      Renew Subscription
      </a>

      `

    });

  }catch(err){

    console.log(err);

  }

}

// ======================================
// START CRON
// ======================================

function startRenewalCron(){

  log(
    "Renewal Engine Started"
  );

  // Runs every hour

  cron.schedule(

    "0 * * * *",

    async ()=>{

      try{

        log(
          "Checking subscriptions..."
        );

        // PART 2 CONTINUES HERE

      }catch(err){

        console.log(err);

      }

    }

  );

}

// ======================================
// EXPORT
// ======================================

module.exports =
startRenewalCron;
// ======================================
// PROCESS SUBSCRIPTIONS - Part -2
// ======================================

async function processSubscriptions() {
  try {

    console.log("🔍 Checking subscriptions...");

    const subscriptions = await Subscription.find({
      status: {
        $in: ["active", "past_due"]
      }
    }).populate("clientId");

    for (const subscription of subscriptions) {

      try {

        const client = subscription.clientId;

        if (!client) continue;

        // ======================================
        // NOT DUE YET
        // ======================================

        if (
          subscription.renewalDate &&
          new Date(subscription.renewalDate) > new Date()
        ) {
          continue;
        }

        console.log(
          `💳 Checking renewal for ${client.store}`
        );

        // ======================================
        // STRIPE SUBSCRIPTIONS
        // ======================================

        if (
          subscription.provider === "stripe" &&
          stripe &&
          subscription.subscriptionId
        ) {

          const stripeSub =
            await stripe.subscriptions.retrieve(
              subscription.subscriptionId
            );

          // ======================================
          // ACTIVE
          // ======================================

          if (
            stripeSub.status === "active" ||
            stripeSub.status === "trialing"
          ) {

            const nextRenewal =
              new Date(
                Date.now() +
                30 * 24 * 60 * 60 * 1000
              );

            subscription.status = "active";
            subscription.paid = true;
            subscription.locked = false;
            subscription.renewalDate = nextRenewal;

            await subscription.save();

            client.paid = true;
            client.locked = false;
            client.status = "active";
            client.renewalDate = nextRenewal;

            await client.save();

            console.log(
              `✅ Stripe renewed: ${client.store}`
            );

          }

          // ======================================
          // FAILED
          // ======================================

          else {

            await handleFailedRenewal(
              client,
              subscription,
              "Stripe"
            );

          }

        }

        // ======================================
        // MANUAL SUBSCRIPTIONS
        // ======================================

        if (
          subscription.provider === "manual"
        ) {

          if (
            subscription.expiresAt &&
            new Date(subscription.expiresAt) < new Date()
          ) {

            await handleExpiredSubscription(
              client,
              subscription
            );

          }

        }

      } catch (err) {

        console.log(
          "❌ Subscription Error:",
          err.message
        );

      }

    }

  } catch (err) {

    console.log(
      "❌ Renewal Processor Error:",
      err.message
    );

  }
}
// ======================================
// HANDLE FAILED RENEWAL - PART -3
// ======================================

async function handleFailedRenewal(
  client,
  subscription,
  provider = "Stripe"
){

  try{

    console.log(
      `❌ ${provider} payment failed: ${client.store}`
    );

    // ==================================
    // GRACE PERIOD
    // ==================================

    const graceDate = new Date(

      Date.now() +

      GRACE_PERIOD_DAYS * DAY

    );

    subscription.status =
      "past_due";

    subscription.paid =
      false;

    subscription.expiresAt =
      graceDate;

    await subscription.save();

    // ==================================
    // CLIENT UPDATE
    // ==================================

    client.paid =
      false;

    client.status =
      "payment_failed";

    await client.save();

    // ==================================
    // EMAIL
    // ==================================

    await sendFailedEmail(
      client
    );

    console.log(
      `⚠ Grace period started for ${client.store}`
    );

  }catch(err){

    console.log(
      "Failed Renewal Handler Error:",
      err.message
    );

  }

}

// ======================================
// HANDLE EXPIRED SUBSCRIPTION
// ======================================

async function handleExpiredSubscription(
  client,
  subscription
){

  try{

    console.log(
      `🚫 Expired: ${client.store}`
    );

    // ==================================
    // SUBSCRIPTION
    // ==================================

    subscription.status =
      "expired";

    subscription.locked =
      true;

    subscription.paid =
      false;

    await subscription.save();

    // ==================================
    // CLIENT LOCK
    // ==================================

    await lockClient(

      client._id,

      "expired"

    );

    // ==================================
    // EMAIL
    // ==================================

    await sendExpiredEmail(
      client
    );

    console.log(
      `🔒 Account locked: ${client.store}`
    );

  }catch(err){

    console.log(
      "Expired Handler Error:",
      err.message
    );

  }

}

// ======================================
// CHECK GRACE PERIOD ACCOUNTS
// ======================================

async function processPastDueAccounts(){

  try{

    const subscriptions =
      await Subscription.find({

        status:"past_due"

      }).populate("clientId");

    for(
      const subscription
      of subscriptions
    ){

      try{

        const client =
          subscription.clientId;

        if(!client) continue;

        // ==========================
        // GRACE PERIOD OVER
        // ==========================

        if(

          subscription.expiresAt &&

          new Date(subscription.expiresAt)

          <

          new Date()

        ){

          await handleExpiredSubscription(

            client,

            subscription

          );

        }

      }catch(err){

        console.log(
          err.message
        );

      }

    }

  }catch(err){

    console.log(
      err.message
    );

  }

}
// ======================================
// RECOVER PAYMENT SUCCESS
// AUTO UNLOCK - PART - 4
// ======================================

async function recoverAccounts() {

  try {

    const subscriptions =
      await Subscription.find({

        status: "past_due",

        provider: "stripe",

        subscriptionId: {
          $ne: ""
        }

      }).populate("clientId");

    for (const subscription of subscriptions) {

      try {

        const client =
          subscription.clientId;

        if (!client) continue;

        const stripeSub =
          await stripe.subscriptions.retrieve(
            subscription.subscriptionId
          );

        // =============================
        // PAYMENT SUCCESS AGAIN
        // =============================

        if (
          stripeSub.status === "active"
        ) {

          const nextRenewal =
            new Date(
              Date.now() +
              30 * DAY
            );

          subscription.status =
            "active";

          subscription.paid =
            true;

          subscription.locked =
            false;

          subscription.renewalDate =
            nextRenewal;

          subscription.expiresAt =
            nextRenewal;

          await subscription.save();

          await unlockClient(
            client._id
          );

          await Client.findByIdAndUpdate(

            client._id,

            {

              renewalDate:
                nextRenewal

            }

          );

          console.log(
            `✅ Recovery Success: ${client.store}`
          );

        }

      } catch (err) {

        console.log(
          err.message
        );

      }

    }

  } catch (err) {

    console.log(
      err.message
    );

  }

}

// ======================================
// MAIN CRON LOOP
// ======================================

function startRenewalCron() {

  log(
    "Renewal Engine Started"
  );

  // ====================================
  // RUN EVERY HOUR
  // ====================================

  cron.schedule(

    "0 * * * *",

    async () => {

      try {

        log(
          "Running renewal cycle..."
        );

        // ============================
        // ACTIVE SUBSCRIPTIONS
        // ============================

        await processSubscriptions();

        // ============================
        // PAST DUE
        // ============================

        await processPastDueAccounts();

        // ============================
        // RECOVERY CHECK
        // ============================

        await recoverAccounts();

        log(
          "Renewal cycle complete"
        );

      } catch (err) {

        console.log(
          "Renewal Cycle Error:",
          err.message
        );

      }

    }

  );

  // ====================================
  // STARTUP RUN
  // ====================================

  setTimeout(

    async () => {

      try {

        log(
          "Initial startup sync..."
        );

        await processSubscriptions();

        await processPastDueAccounts();

        await recoverAccounts();

      } catch (err) {

        console.log(
          err.message
        );

      }

    },

    15000

  );

}

// ======================================
// EXPORT
// ======================================

module.exports =
startRenewalCron;
