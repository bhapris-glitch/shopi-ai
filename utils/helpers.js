// ======================================
// utils/helpers.js
// Global Helper Functions
// Production Ready
// ======================================

const crypto =
  require("crypto");

// ======================================
// GENERATE RANDOM ID
// ======================================

function generateId(

  prefix = "id"

){

  return (

    prefix +

    "_" +

    crypto
      .randomBytes(6)
      .toString("hex")

  );

}

// ======================================
// FORMAT DATE
// ======================================

function formatDate(date){

  try{

    return new Date(date)
      .toLocaleDateString(

        "en-US",

        {

          year:"numeric",

          month:"short",

          day:"numeric"

        }

      );

  }catch(err){

    return "Invalid Date";

  }

}

// ======================================
// FORMAT TIME
// ======================================

function formatTime(date){

  try{

    return new Date(date)
      .toLocaleTimeString(

        "en-US",

        {

          hour:"2-digit",

          minute:"2-digit"

        }

      );

  }catch(err){

    return "--:--";

  }

}

// ======================================
// DAYS LEFT
// ======================================

function daysLeft(endDate){

  const now =
    new Date();

  const end =
    new Date(endDate);

  const diff =
    end - now;

  return Math.max(

    0,

    Math.ceil(

      diff /

      (1000 * 60 * 60 * 24)

    )

  );

}

// ======================================
// TRIAL EXPIRED
// ======================================

function isTrialExpired(

  trialEnds

){

  return (

    Date.now() >

    new Date(trialEnds)

  );

}

// ======================================
// MASK EMAIL
// ======================================

function maskEmail(email){

  if(!email) return "";

  const parts =
    email.split("@");

  return (

    parts[0].slice(0,2)

    +

    "***@"

    +

    parts[1]

  );

}

// ======================================
// MASK PHONE
// ======================================

function maskPhone(phone){

  if(!phone) return "";

  return (

    "****" +

    phone.slice(-4)

  );

}

// ======================================
// FORMAT PRICE
// ======================================

function formatPrice(

  amount,

  currency = "₹"

){

  return (

    currency +

    Number(amount)
      .toLocaleString()

  );

}

// ======================================
// VALID EMAIL
// ======================================

function isValidEmail(email){

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    .test(email);

}

// ======================================
// VALID URL
// ======================================

function isValidURL(url){

  try{

    new URL(url);

    return true;

  }catch(err){

    return false;

  }

}

// ======================================
// SLEEP
// ======================================

function sleep(ms){

  return new Promise(resolve=>{

    setTimeout(resolve,ms);

  });

}

// ======================================
// SANITIZE TEXT
// ======================================

function sanitize(text){

  if(!text) return "";

  return text

    .replace(/</g,"&lt;")

    .replace(/>/g,"&gt;")

    .trim();

}

// ======================================
// EXPORTS
// ======================================

module.exports = {

  generateId,

  formatDate,

  formatTime,

  daysLeft,

  isTrialExpired,

  maskEmail,

  maskPhone,

  formatPrice,

  isValidEmail,

  isValidURL,

  sleep,

  sanitize

};
