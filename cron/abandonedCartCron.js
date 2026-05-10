// ======================================
// cron/abandonedCartCron.js
// Production Abandoned Cart Recovery
// Auto WhatsApp + Email Recovery
// ======================================

require("dotenv").config();

const cron = require("node-cron");

const Client =
  require("../models/Client");

const Recovery =
  require("../models/Recovery");

const sendRecoveryEmail =
  require("../services/email");

const sendWhatsAppRecovery =
  require("../services/whatsapp");

// ======================================
// START CRON
// EVERY 15 MINUTES
// ======================================

const startAbandonedCartCron = ()=>{

  console.log(
    "🛒 Abandoned Cart Recovery Started"
  );

  // ======================================
  // EVERY 15 MINUTES
  // ======================================

  cron.schedule("*/15 * * * *", async ()=>{

    try{

      console.log(
        "🔍 Checking abandoned carts..."
      );

      // ======================================
      // FIND RECOVERIES
      // ======================================

      const recoveries =
        await Recovery.find({

          recovered:false,

          reminderSent:false,

          createdAt:{
            $lte:
              new Date(
                Date.now() -
                30 * 60 * 1000
              )
          }

        });

      console.log(
        `🛒 Found ${recoveries.length} abandoned carts`
      );

      // ======================================
      // LOOP USERS
      // ======================================

      for(const item of recoveries){

        try{

          // ======================================
          // GET CLIENT
          // ======================================

          const client =
            await Client.findById(
              item.clientId
            );

          if(!client){

            console.log(
              "❌ Client not found"
            );

            continue;

          }

          // ======================================
          // RECOVERY URL
          // ======================================

          const recoveryUrl =

            `${process.env.BASE_URL}/checkout?cart=${item.cartId}`;

          // ======================================
          // EMAIL RECOVERY
          // ======================================

          if(item.email){

            await sendRecoveryEmail({

              to:item.email,

              name:item.name || "Customer",

              store:client.store,

              cart:item.cart,

              recoveryUrl

            });

            console.log(
              `📧 Recovery email sent to ${item.email}`
            );

          }

          // ======================================
          // WHATSAPP RECOVERY
          // ======================================

          if(item.phone){

            await sendWhatsAppRecovery({

              phone:item.phone,

              name:item.name || "Customer",

              store:client.store,

              recoveryUrl

            });

            console.log(
              `📱 WhatsApp sent to ${item.phone}`
            );

          }

          // ======================================
          // UPDATE STATUS
          // ======================================

          item.reminderSent = true;

          item.reminderSentAt =
            new Date();

          await item.save();

        }catch(err){

          console.log(
            "❌ Recovery Error:",
            err.message
          );

        }

      }

    }catch(err){

      console.log(
        "❌ Cron Error:",
        err.message
      );

    }

  });

  // ======================================
  // SECOND REMINDER
  // AFTER 24 HOURS
  // ======================================

  cron.schedule("0 * * * *", async ()=>{

    try{

      console.log(
        "⏰ Checking second reminders..."
      );

      const secondReminders =
        await Recovery.find({

          recovered:false,

          secondReminderSent:false,

          reminderSent:true,

          reminderSentAt:{
            $lte:
              new Date(
                Date.now() -
                24 * 60 * 60 * 1000
              )
          }

        });

      for(const item of secondReminders){

        try{

          const client =
            await Client.findById(
              item.clientId
            );

          if(!client) continue;

          const recoveryUrl =

            `${process.env.BASE_URL}/checkout?cart=${item.cartId}`;

          // ======================================
          // SECOND EMAIL
          // ======================================

          if(item.email){

            await sendRecoveryEmail({

              to:item.email,

              name:item.name || "Customer",

              store:client.store,

              cart:item.cart,

              recoveryUrl,

              secondReminder:true

            });

          }

          // ======================================
          // SECOND WHATSAPP
          // ======================================

          if(item.phone){

            await sendWhatsAppRecovery({

              phone:item.phone,

              name:item.name || "Customer",

              store:client.store,

              recoveryUrl,

              secondReminder:true

            });

          }

          item.secondReminderSent = true;

          await item.save();

          console.log(
            `✅ Second reminder sent`
          );

        }catch(err){

          console.log(
            "❌ Second Reminder Error:",
            err.message
          );

        }

      }

    }catch(err){

      console.log(
        "❌ Cron Error:",
        err.message
      );

    }

  });

};

// ======================================
// EXPORT
// ======================================

module.exports =
  startAbandonedCartCron;
