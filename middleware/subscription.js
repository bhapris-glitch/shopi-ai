// ======================================
// middleware/subscription.js
// Layboka AI Subscription Middleware
// Premium Trial + Auto Lock System
// Updated Jun 2026
// ======================================

const Subscription =
require("../models/Subscription");

const Client =
require("../models/Client");

const sendEmail =
require("../utils/email");

const sendWhatsApp =
require("../utils/whatsapp");

// ======================================
// CONFIG
// ======================================

const TRIAL_DAYS = 7;

const DAY =
24 * 60 * 60 * 1000;

const WARNING_PERIOD =
24 * 60 * 60 * 1000;

// ======================================
// GET EXPIRY DATE
// ======================================

function getTrialExpiry(subscription){

  if(!subscription)
    return null;

  if(subscription.expiryDate)
    return new Date(
      subscription.expiryDate
    );

  return new Date(

    new Date(
      subscription.createdAt
    ).getTime()

    +

    (TRIAL_DAYS * DAY)

  );

}

// ======================================
// REMAINING TIME
// ======================================

function getRemainingTime(expiry){

  const diff =
    expiry.getTime() -
    Date.now();

  return {

    milliseconds: diff,

    seconds:
      Math.floor(
        diff / 1000
      ),

    minutes:
      Math.floor(
        diff /
        (60 * 1000)
      ),

    hours:
      Math.floor(
        diff /
        (60 * 60 * 1000)
      ),

    days:
      Math.floor(
        diff / DAY
      )

  };

}

// ======================================
// FORMAT COUNTDOWN
// ======================================

function formatCountdown(ms){

  if(ms <= 0)
    return "Expired";

  const days =
    Math.floor(ms / DAY);

  const hours =
    Math.floor(
      (ms % DAY) /
      (60 * 60 * 1000)
    );

  const minutes =
    Math.floor(
      (ms % (60 * 60 * 1000)) /
      (60 * 1000)
    );

  return `${days}d ${hours}h ${minutes}m`;

}

// ======================================
// BUILD BANNER
// ======================================

function buildBanner(

  subscription,

  remaining

){

  if(
    subscription.status !== "trial"
  ){
    return null;
  }

  return {

    show:true,

    type:"warning",

    title:
      "Premium Trial",

    countdown:
      formatCountdown(
        remaining.milliseconds
      ),

    message:
      `Your AI Sales Agent trial expires in ${formatCountdown(remaining.milliseconds)}.`,

    buttonText:
      "Upgrade Now",

    rating:"★★★★★"

  };

}
// ======================================
// LOAD SUBSCRIPTION - PART 2/5
// ======================================

async function loadSubscription(
  clientId
){

  let subscription =
    await Subscription.findOne({
      clientId
    });

  if(!subscription){

    subscription =
      await Subscription.create({

        clientId,

        plan:"premium",

        status:"trial",

        paid:false,

        autoRenew:false,

        locked:false,

        startDate:new Date(),

        expiryDate:
          new Date(
            Date.now() +
            (TRIAL_DAYS * DAY)
          )

      });

  }

  return subscription;

}

// ======================================
// AUTO EXPIRE TRIAL
// ======================================

async function expireTrial(

  client,

  subscription

){

  const expiry =
    getTrialExpiry(
      subscription
    );

  if(!expiry)
    return false;

  if(Date.now() < expiry)
    return false;

  subscription.status =
    "expired";

  subscription.locked =
    true;

  subscription.paid =
    false;

  subscription.expiryDate =
    expiry;

  await subscription.save();

  client.status =
    "expired";

  client.paid =
    false;

  await client.save();

  return true;

}

// ======================================
// SHOULD SEND
// 24 HOUR REMINDER
// ======================================

function shouldSendReminder(

  subscription,

  remaining

){

  if(
    subscription.status !== "trial"
  ){
    return false;
  }

  if(
    subscription.trialReminderSent
  ){
    return false;
  }

  return (
    remaining.milliseconds <=
      WARNING_PERIOD &&
    remaining.milliseconds > 0
  );

}

// ======================================
// MARK REMINDER SENT
// ======================================

async function markReminderSent(
  subscription
){

  subscription.trialReminderSent =
    true;

  await subscription.save();

}

// ======================================
// GET AGENT NAME
// ======================================

function getAgentName(client){

  return (

    client.agentName ||

    client.salesAgentName ||

    "AI Sales Agent"

  );

}
// ======================================
// SUBSCRIPTION MIDDLEWARE - PART 3/5
// ======================================

async function subscriptionMiddleware(

  req,

  res,

  next

){

  try{

    // ===========================
    // CLIENT
    // ===========================

    const client =

      req.client ||

      req.user ||

      req.shop ||

      null;

    if(!client){

      return res.status(401).json({

        success:false,

        message:"Unauthorized"

      });

    }

    // ===========================
    // LOAD SUBSCRIPTION
    // ===========================

    const subscription =

      await loadSubscription(
        client._id
      );

    // ===========================
    // AUTO EXPIRE
    // ===========================

    await expireTrial(

      client,

      subscription

    );

    // ===========================
    // REMAINING TIME
    // ===========================

    const expiry =

      getTrialExpiry(
        subscription
      );

    const remaining =

      getRemainingTime(
        expiry
      );

    // ===========================
    // REQUEST DATA
    // ===========================

    req.subscription =
      subscription;

    req.subscriptionInfo = {

      plan:
        subscription.plan,

      status:
        subscription.status,

      paid:
        subscription.paid,

      locked:
        subscription.locked,

      expiryDate:
        expiry,

      remaining,

      banner:
        buildBanner(

          subscription,

          remaining

        ),

      agentName:
        getAgentName(client)

    };

    // ===========================
    // LOCKED
    // ===========================

    if(subscription.locked){

      return res.status(403).json({

        success:false,

        locked:true,

        trialExpired:true,

        message:

          `Your ${getAgentName(client)} Premium Trial has ended.`,

        upgrade:true,

        banner:
          req.subscriptionInfo.banner

      });

    }

    next();

  }catch(err){

    console.error(

      "Subscription Middleware:",

      err

    );

    return res.status(500).json({

      success:false,

      message:"Subscription Error"

    });

  }

  }
// ======================================
// SEND 24 HOUR TRIAL REMINDER - PART 4/5
// ======================================

async function sendTrialReminder(

  client,

  subscription,

  remaining

){

  try{

    if(

      !shouldSendReminder(

        subscription,

        remaining

      )

    ){

      return;

    }

    const agentName =
      getAgentName(client);

    const upgradeUrl =

      `${process.env.APP_URL}/pricing`;

    // ==================================
    // EMAIL
    // ==================================

    if(

      client.email &&

      typeof sendEmail ===
      "function"

    ){

      await sendEmail(

        client.email,

        `${agentName} Trial Ends in 24 Hours`,

        `
        <h2>Your Premium AI Trial Ends Soon</h2>

        <p>

        Dear ${client.storeDisplayName || "Merchant"},

        </p>

        <p>

        Your <strong>${agentName}</strong> Premium Trial
        will expire in <strong>24 hours</strong>.

        </p>

        <p>

        Continue enjoying:

        </p>

        <ul>

        <li>GPT-5 AI</li>

        <li>Smart Upsells</li>

        <li>Checkout Closer</li>

        <li>Cart Recovery</li>

        <li>Premium AI Sales Agent</li>

        </ul>

        <p>

        ⭐⭐⭐⭐⭐

        Thousands of merchants trust Layboka AI.

        </p>

        <a
        href="${upgradeUrl}"
        style="
        background:#00ffc3;
        padding:14px 24px;
        text-decoration:none;
        border-radius:10px;
        font-weight:bold;
        color:#000;
        ">
        Renew Now
        </a>

        `
      );

    }

    // ==================================
    // WHATSAPP
    // ==================================

    if(

      client.phone &&

      typeof sendWhatsApp ===
      "function"

    ){

      await sendWhatsApp(

        client.phone,

`⏳ ${agentName} Premium Trial

Dear ${client.storeDisplayName || "Merchant"},

Your AI Sales Agent Premium Trial expires in 24 hours.

⭐⭐⭐⭐⭐ Rated by merchants.

Renew now:

${upgradeUrl}`

      );

    }

    // ==================================
    // SAVE
    // ==================================

    await markReminderSent(
      subscription
    );

  }catch(err){

    console.error(

      "Trial Reminder Error:",

      err

    );

  }

}
// ======================================
// CALL TRIAL REMINDER - PART 5/5
// ======================================

async function processTrialReminder(

  client,

  subscription,

  remaining

){

  try{

    await sendTrialReminder(

      client,

      subscription,

      remaining

    );

  }catch(err){

    console.error(

      "Reminder Processor:",

      err

    );

  }

}

// ======================================
// UPDATED MIDDLEWARE
// ======================================

const originalMiddleware =
subscriptionMiddleware;

subscriptionMiddleware =
async function(

  req,

  res,

  next

){

  try{

    await originalMiddleware(

      req,

      res,

      async()=>{

        if(

          req.subscription &&

          req.subscriptionInfo

        ){

          await processTrialReminder(

            req.client ||

            req.user ||

            req.shop,

            req.subscription,

            req.subscriptionInfo
              .remaining

          );

        }

        next();

      }

    );

  }catch(err){

    console.error(err);

    return res.status(500).json({

      success:false,

      message:"Subscription middleware failed."

    });

  }

};

// ======================================
// EXPORTS
// ======================================

module.exports = {

  subscriptionMiddleware,

  loadSubscription,

  validateSubscription:
    loadSubscription,

  getTrialExpiry,

  getRemainingTime,

  formatCountdown,

  buildBanner,

  getAgentName

};
