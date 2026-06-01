// ======================================
// cron/abandonedCartCron.js
// Layboka AI
// Production Abandoned Cart Recovery
// updated 1 Jun 2026
// ======================================

require("dotenv").config();

const cron = require("node-cron");
const jwt = require("jsonwebtoken");

const Recovery = require("../models/Recovery");
const Client = require("../models/Client");

const sendRecoveryEmail =
require("../services/email");

const {
  sendWhatsAppRecovery
} = require("../utils/whatsapp");

// ======================================
// CONFIG
// ======================================

const JWT_SECRET =
process.env.JWT_SECRET;

const BASE_URL =
process.env.BASE_URL;

// ======================================
// PREVENT DUPLICATE STARTS
// ======================================

let cronStarted = false;

// ======================================
// CREATE RECOVERY LINK
// ======================================

function createRecoveryLink(cartId){

  const token = jwt.sign(

    {
      cartId
    },

    JWT_SECRET,

    {
      expiresIn:"7d"
    }

  );

  return `${BASE_URL}/recover/${token}`;

}

// ======================================
// SEND REMINDER
// ======================================

async function sendReminder({

  recovery,
  client,
  stage

}){

  try{

    const recoveryUrl =
      createRecoveryLink(
        recovery.cartId
      );

    // ====================================
    // EMAIL
    // ====================================

    if(recovery.email){

      await sendRecoveryEmail({

        to: recovery.email,

        name:
          recovery.name ||
          "Customer",

        store:
          client.store ||

          client.storeName ||

          "Store",

        cart:
          recovery.cart || [],

        recoveryUrl,

        stage

      });

    }

    // ====================================
    // WHATSAPP
    // ====================================

    if(recovery.phone){

      await sendWhatsAppRecovery({

        phone:
          recovery.phone,

        name:
          recovery.name ||
          "Customer",

        store:
          client.store ||

          client.storeName ||

          "Store",

        recoveryUrl,

        stage

      });

    }

    return true;

  }catch(err){

    console.log(
      "Reminder Send Error:",
      err.message
    );

    return false;

  }

}

// ======================================
// FIRST REMINDER
// 30 MINUTES
// ======================================

async function processFirstReminder(){

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
        $lte: threshold
      }

    })

    .limit(200);

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
        err.message
      );

    }

  }

}

// ======================================
// SECOND REMINDER
// 24 HOURS
// ======================================

async function processSecondReminder(){

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
        $lte: threshold
      }

    })

    .limit(200);

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

        recovery.secondReminderSent =
          true;

        recovery.secondReminderSentAt =
          new Date();

        await recovery.save();

      }

    }catch(err){

      console.log(
        err.message
      );

    }

  }

}

// ======================================
// THIRD REMINDER
// 72 HOURS
// ======================================

async function processThirdReminder(){

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
        $lte: threshold
      }

    })

    .limit(200);

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

        recovery.thirdReminderSent =
          true;

        recovery.thirdReminderSentAt =
          new Date();

        await recovery.save();

      }

    }catch(err){

      console.log(
        err.message
      );

    }

  }

}

// ======================================
// START CRON
// ======================================

function startAbandonedCartCron(){

  if(cronStarted){

    console.log(
      "Abandoned Cart Cron already running"
    );

    return;
  }

  cronStarted = true;

  console.log(
    "🛒 Layboka Abandoned Cart Recovery Started"
  );

  // ================================
  // EVERY 15 MINUTES
  // ================================

  cron.schedule(

    "*/15 * * * *",

    async()=>{

      try{

        console.log(
          "🛒 Checking abandoned carts..."
        );

        await processFirstReminder();

        await processSecondReminder();

        await processThirdReminder();

      }catch(err){

        console.log(
          "Cron Error:",
          err.message
        );

      }

    }

  );

}

module.exports =
startAbandonedCartCron;
