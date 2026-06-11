// ======================================
// cron/abandonedCartCron.js
// Layboka AI
// US / UK / CA / AU Optimized
// Multi-Stage Cart Recovery
// Updated Jun 2026 - PART - 1
// ======================================

require("dotenv").config();

const cron = require("node-cron");
const jwt = require("jsonwebtoken");

const Recovery = require("../models/Recovery");
const Client = require("../models/Client");

const {
  sendCartRecovery
} = require("../services/email");

const {
  sendWhatsAppRecovery
} = require("../services/whatsapp");

// ======================================
// CONFIG
// ======================================

const JWT_SECRET =
  process.env.JWT_SECRET;

const BASE_URL =
  process.env.BASE_URL;

let cronStarted = false;

// ======================================
// CREATE RECOVERY LINK
// ======================================

function createRecoveryLink(cartId) {

  const token = jwt.sign(

    {
      cartId
    },

    JWT_SECRET,

    {
      expiresIn: "7d"
    }

  );

  return `${BASE_URL}/recover/${token}`;
}

// ======================================
// CREATE STAGE DISCOUNT
// ======================================

function getStageDiscount(stage) {

  switch(stage) {

    case "first":
      return "SAVE5";

    case "second":
      return "SAVE10";

    case "third":
      return "SAVE15";

    default:
      return "SAVE5";
  }
}

// ======================================
// CREATE STAGE SUBJECT
// ======================================

function getStageSubject(stage) {

  switch(stage) {

    case "first":
      return "🛒 You left something behind";

    case "second":
      return "🔥 Your cart is waiting";

    case "third":
      return "⏳ Final reminder before your cart expires";

    default:
      return "🛒 Complete your checkout";
  }
}


// ======================================
// SEND REMINDER - PART - 2
// ======================================

async function sendReminder({

  recovery,
  client,
  stage

}) {

  try {

    const recoveryUrl =
      createRecoveryLink(
        recovery.cartId
      );

    const discountCode =
      getStageDiscount(stage);

    const subject =
      getStageSubject(stage);

    const storeName =

      client.storeDisplayName ||

      client.store ||

      "Store";

    // ==================================
    // PRODUCT INFO
    // ==================================

    const firstProduct =

      recovery.cart?.[0] ||

      {};

    const productTitle =

      firstProduct.title ||

      "your items";

    // ==================================
    // EMAIL RECOVERY
    // ==================================

    if (recovery.email) {

      await sendCartRecovery({

        email:
          recovery.email,

        customerName:
          recovery.name ||

          "Customer",

        productTitle,

        checkoutUrl:
          recoveryUrl,

        discountCode

      });

      console.log(
        `📧 ${stage} email sent -> ${recovery.email}`
      );

    }

    // ==================================
    // WHATSAPP RECOVERY
    // ==================================

    if (recovery.phone) {

      await sendWhatsAppRecovery({

        phone:
          recovery.phone,

        name:
          recovery.name ||

          "Customer",

        store:
          storeName,

        recoveryUrl,

        secondReminder:
          stage === "second"

      });

      console.log(
        `📱 ${stage} WhatsApp sent -> ${recovery.phone}`
      );

    }

    // ==================================
    // SAVE ANALYTICS
    // ==================================

    client.recoveredCarts =
      (client.recoveredCarts || 0);

    await client.save();

    return true;

  } catch (err) {

    console.log(
      "Reminder Error:",
      err.message
    );

    return false;

  }

}
// ======================================
// FIRST REMINDER
// 30 MINUTES AFTER ABANDONMENT - PART 3
// ======================================

async function processFirstReminder() {

  const threshold =

    new Date(

      Date.now() -

      30 * 60 * 1000

    );

  const recoveries =

    await Recovery.find({

      recovered:false,

      reminderSent:false,

      createdAt:{
        $lte:threshold
      }

    })

    .limit(200);

  console.log(

    `🛒 First Reminder Queue: ${recoveries.length}`

  );

  for(const recovery of recoveries){

    try{

      const client =

        await Client.findById(

          recovery.clientId

        );

      if(!client){

        continue;

      }

      const success =

        await sendReminder({

          recovery,
          client,
          stage:"first"

        });

      if(success){

        recovery.reminderSent = true;

        recovery.reminderSentAt =
          new Date();

        await recovery.save();

      }

    }catch(err){

      console.log(

        "First Reminder Error:",

        err.message

      );

    }

  }

}

// ======================================
// SECOND REMINDER
// 24 HOURS LATER
// ======================================

async function processSecondReminder() {

  const threshold =

    new Date(

      Date.now() -

      24 * 60 * 60 * 1000

    );

  const recoveries =

    await Recovery.find({

      recovered:false,

      reminderSent:true,

      secondReminderSent:false,

      reminderSentAt:{
        $lte:threshold
      }

    })

    .limit(200);

  console.log(

    `🔥 Second Reminder Queue: ${recoveries.length}`

  );

  for(const recovery of recoveries){

    try{

      const client =

        await Client.findById(

          recovery.clientId

        );

      if(!client){

        continue;

      }

      const success =

        await sendReminder({

          recovery,
          client,
          stage:"second"

        });

      if(success){

        recovery.secondReminderSent = true;

        recovery.secondReminderSentAt =
          new Date();

        await recovery.save();

      }

    }catch(err){

      console.log(

        "Second Reminder Error:",

        err.message

      );

    }

  }

        }
// ======================================
// THIRD REMINDER
// 72 HOURS LATER
// FINAL RECOVERY ATTEMPT - PART 4
// ======================================

async function processThirdReminder() {

  const threshold =

    new Date(

      Date.now() -

      72 * 60 * 60 * 1000

    );

  const recoveries =

    await Recovery.find({

      recovered:false,

      secondReminderSent:true,

      thirdReminderSent:false,

      secondReminderSentAt:{
        $lte:threshold
      }

    })

    .limit(200);

  console.log(

    `⏳ Third Reminder Queue: ${recoveries.length}`

  );

  for(const recovery of recoveries){

    try{

      const client =

        await Client.findById(

          recovery.clientId

        );

      if(!client){

        continue;

      }

      const success =

        await sendReminder({

          recovery,
          client,
          stage:"third"

        });

      if(success){

        recovery.thirdReminderSent = true;

        recovery.thirdReminderSentAt =
          new Date();

        await recovery.save();

      }

    }catch(err){

      console.log(

        "Third Reminder Error:",

        err.message

      );

    }

  }

}

// ======================================
// CLEAN OLD RECOVERIES
// DELETE AFTER 30 DAYS
// ======================================

async function markExpiredRecoveries() {

  try{

    const threshold =

      new Date(

        Date.now() -

        30 * 24 * 60 * 60 * 1000

      );

    const result =

      await Recovery.deleteMany({

        recovered:false,

        createdAt:{
          $lte:threshold
        }

      });

    console.log(

      `🧹 Cleaned ${result.deletedCount} old recoveries`

    );

  }catch(err){

    console.log(

      "Cleanup Error:",

      err.message

    );

  }

}

// ======================================
// START CRON
// ======================================

function startAbandonedCartCron(){

  if(cronStarted){

    console.log(
      "🛒 Abandoned Cart Cron Already Running"
    );

    return;

  }

  cronStarted = true;

  console.log(
    "🛒 Layboka Recovery Cron Started"
  );

  // ==================================
  // EVERY 15 MINUTES
  // ==================================

  cron.schedule(

    "*/15 * * * *",

    async()=>{

      try{

        console.log(
          "🔍 Checking Abandoned Carts..."
        );

        await processFirstReminder();

        await processSecondReminder();

        await processThirdReminder();

      }catch(err){

        console.log(

          "Recovery Cron Error:",

          err.message

        );

      }

    }

  );

  // ==================================
  // DAILY CLEANUP
  // ==================================

  cron.schedule(

    "0 2 * * *",

    async()=>{

      await markExpiredRecoveries();

    }

  );

}

// ======================================
// EXPORT
// ======================================

module.exports =
  startAbandonedCartCron;
