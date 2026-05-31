// ======================================
// utils/churnPrediction.js
// Layboka AI Churn Prediction Engine
// Production Version
// Updated 1Jun, 2026
// ======================================

const {
  getUserLearning
} = require("./learningAI");

// ======================================
// PREDICT CHURN
// ======================================

function predictChurn(

  visitorId

){

  try{

    const user =
      getUserLearning(
        visitorId
      );

    if(!user){

      return {

        risk:"medium",

        score:50,

        reason:
          "No learning data"

      };

    }

    let score = 0;

    const reasons = [];

    // ==================================
    // LAST ACTIVE
    // ==================================

    const hoursInactive =

      (

        Date.now()

        -

        new Date(
          user.lastSeen
        ).getTime()

      )

      /

      (1000 * 60 * 60);

    if(hoursInactive > 72){

      score += 40;

      reasons.push(
        "inactive_72h"
      );

    }

    else if(

      hoursInactive > 24

    ){

      score += 20;

      reasons.push(
        "inactive_24h"
      );

    }

    // ==================================
    // LOW BUY INTENT
    // ==================================

    if(

      user.purchaseIntent < 20

    ){

      score += 30;

      reasons.push(
        "low_intent"
      );

    }

    else if(

      user.purchaseIntent < 50

    ){

      score += 10;

    }

    // ==================================
    // CART ABANDONMENT
    // ==================================

    if(

      user.cartProducts &&
      user.cartProducts.length > 0 &&
      hoursInactive > 24

    ){

      score += 40;

      reasons.push(
        "abandoned_cart"
      );

    }

    // ==================================
    // NO PRODUCT INTEREST
    // ==================================

    if(

      !user.viewedProducts ||

      user.viewedProducts.length === 0

    ){

      score += 10;

      reasons.push(
        "low_engagement"
      );

    }

    // ==================================
    // FINAL RISK
    // ==================================

    let risk = "low";

    if(score >= 70){

      risk = "high";

    }

    else if(score >= 40){

      risk = "medium";

    }

    return {

      risk,

      score,

      reasons,

      hoursInactive:
        Math.floor(
          hoursInactive
        )

    };

  }

  catch(err){

    console.log(

      "CHURN ERROR:",

      err.message

    );

    return {

      risk:"unknown",

      score:0,

      reasons:[]

    };

  }

}

// ======================================
// RETENTION OFFER
// ======================================

function generateRetentionOffer(

  risk

){

  try{

    if(risk === "high"){

      return {

        type:"discount",

        value:"20% OFF",

        message:
          "Complete your order today and save 20%."

      };

    }

    if(risk === "medium"){

      return {

        type:"free_shipping",

        value:"FREE SHIPPING",

        message:
          "Free shipping available for a limited time."

      };

    }

    return {

      type:"upsell",

      value:"BONUS OFFER",

      message:
        "Recommended products waiting for you."

    };

  }

  catch(err){

    return {

      type:"none",

      value:"",

      message:""

    };

  }

}

// ======================================
// RETENTION PRIORITY
// ======================================

function getRetentionPriority(

  risk

){

  if(risk === "high"){

    return 1;

  }

  if(risk === "medium"){

    return 2;

  }

  return 3;

}

// ======================================
// EXPORTS
// ======================================

module.exports = {

  predictChurn,

  generateRetentionOffer,

  getRetentionPriority

};
