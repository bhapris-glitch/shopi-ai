// ======================================
// cron/renewalCron.js
// Auto Renewal + Auto Lock System
// Production Ready
// ======================================

require("dotenv").config();

const cron = require("node-cron");

const Razorpay = require("razorpay");

const stripePackage =
  require("stripe");

const Client =
  require("../models/Client");

const sendEmail =
  require("../services/email");

const sendWhatsApp =
  require("../services/whatsapp");

// ======================================
// INIT RAZORPAY
// ======================================

let razorpay = null;

if(
  process.env.RAZORPAY_KEY &&
  process.env.RAZORPAY_SECRET
){

  razorpay = new Razorpay({

    key_id:
      process.env.RAZORPAY_KEY,

    key_secret:
      process.env.RAZORPAY_SECRET

  });

}

// ======================================
// INIT STRIPE
// ======================================

let stripe = null;

if(process.env.STRIPE_SECRET){

  stripe = stripePackage(
    process.env.STRIPE_SECRET
  );

}

// ======================================
// START RENEWAL CRON
// ======================================

const startRenewalCron = ()=>{

  console.log(
    "💳 Renewal Cron Started"
  );

  // ======================================
  // RUN EVERY 1 HOUR
  // ======================================

  cron.schedule("0 * * * *", async ()=>{

    try{

      console.log(
        "🔍 Checking subscriptions..."
      );

      // ======================================
      // FIND ACTIVE CLIENTS
      // ======================================

      const clients =
        await Client.find({

          paid:true,

          status:"active"

        });

      // ======================================
      // LOOP CLIENTS
      // ======================================

      for(const client of clients){

        try{

          // ======================================
          // EXPIRED?
          // ======================================

          if(

            client.nextBillingDate &&

            new Date() >

            new Date(client.nextBillingDate)

          ){

            console.log(
              `💳 Renewing ${client.store}`
            );

            // ======================================
            // RAZORPAY SUBSCRIPTIONS
            // ======================================

            if(

              client.paymentGateway ===
              "razorpay"

            ){

              if(

                razorpay &&

                client.subscriptionId

              ){

                const sub =
                  await razorpay
                  .subscriptions
                  .fetch(
                    client.subscriptionId
                  );

                // ======================================
                // ACTIVE PAYMENT
                // ======================================

                if(
                  sub.status === "active"
                ){

                  client.nextBillingDate =

                    new Date(

                      Date.now() +

                      28 * 24 * 60 * 60 * 1000

                    );

                  client.paid = true;

                  client.status = "active";

                  await client.save();

                  console.log(
                    `✅ Razorpay renewed: ${client.store}`
                  );

                }

                // ======================================
                // PAYMENT FAILED
                // ======================================

                else{

                  client.paid = false;

                  client.status =
                    "expired";

                  client.chatLocked = true;

                  await client.save();

                  // EMAIL
                  if(client.email){

                    await sendEmail({

                      to:client.email,

                      subject:
                        "Payment Failed",

                      html:`

                      <h2>
                      Subscription Expired
                      </h2>

                      <p>
                      Your AI chatbot
                      has been paused.
                      </p>

                      <a href="${process.env.BASE_URL}/pricing.html">
                      Renew Subscription
                      </a>

                      `

                    });

                  }

                  // WHATSAPP
                  if(client.phone){

                    await sendWhatsApp({

                      phone:client.phone,

                      message:`
Your Layboka AI subscription failed.

Renew now:
${process.env.BASE_URL}/pricing.html
                      `

                    });

                  }

                  console.log(
                    `❌ Razorpay failed: ${client.store}`
                  );

                }

              }

            }

            // ======================================
            // STRIPE SUBSCRIPTIONS
            // ======================================

            if(

              client.paymentGateway ===
              "stripe"

            ){

              if(

                stripe &&

                client.subscriptionId

              ){

                const sub =
                  await stripe.subscriptions.retrieve(

                    client.subscriptionId

                  );

                // ======================================
                // ACTIVE
                // ======================================

                if(
                  sub.status === "active"
                ){

                  client.nextBillingDate =

                    new Date(

                      Date.now() +

                      28 * 24 * 60 * 60 * 1000

                    );

                  client.paid = true;

                  client.status = "active";

                  await client.save();

                  console.log(
                    `✅ Stripe renewed: ${client.store}`
                  );

                }

                // ======================================
                // FAILED
                // ======================================

                else{

                  client.paid = false;

                  client.status =
                    "expired";

                  client.chatLocked = true;

                  await client.save();

                  // EMAIL
                  if(client.email){

                    await sendEmail({

                      to:client.email,

                      subject:
                        "Subscription Expired",

                      html:`

                      <h2>
                      Payment Failed
                      </h2>

                      <p>
                      Your chatbot
                      has been locked.
                      </p>

                      <a href="${process.env.BASE_URL}/pricing.html">
                      Renew Now
                      </a>

                      `

                    });

                  }

                  // WHATSAPP
                  if(client.phone){

                    await sendWhatsApp({

                      phone:client.phone,

                      message:`
Payment failed.

Renew your AI chatbot:
${process.env.BASE_URL}/pricing.html
                      `

                    });

                  }

                  console.log(
                    `❌ Stripe failed: ${client.store}`
                  );

                }

              }

            }

          }

        }catch(err){

          console.log(
            "❌ Renewal Error:",
            err.message
          );

        }

      }

    }catch(err){

      console.log(
        "❌ Cron Fatal Error:",
        err.message
      );

    }

  });

};

// ======================================
// EXPORT
// ======================================

module.exports =
  startRenewalCron;
