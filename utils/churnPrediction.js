// ======================================
// utils/churnPrediction.js
// Layboka AI Churn Prediction
// ======================================

const {
  getUserLearning
} = require("./learningAI");

// ======================================
// CHURN ANALYSIS
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

        score:50

      };

    }

    let score = 0;

    // ================================
    // LAST ACTIVE
    // ================================

    const hoursInactive =

      (
        Date.now() -

        new Date(
          user.lastSeen
        ).getTime()

      )

      /

      (1000*60*60);

    if(hoursInactive > 72){

      score += 40;

    }

    // ================================
    // LOW BUY INTENT
    // ================================

    if(
      user.purchaseIntent < 20
    ){

      score += 30;

    }

    // ================================
    // CART ABANDONMENT
    // ================================

    if(

      user.cartProducts.length > 0 &&

      hoursInactive > 24

    ){

      score += 40;

    }

    // ================================
    // FINAL RISK
    // ================================

    let risk = "low";

    if(score > 70){

      risk = "high";

    }else if(score > 40){

      risk = "medium";

    }

    return {

      risk,

      score

    };

  }catch(err){

    console.log(
      "CHURN ERROR:",
      err
    );

    return {

      risk:"unknown",

      score:0

    };

  }

}

// ======================================
// RETENTION OFFER
// ======================================

function generateRetentionOffer(

  risk

){

  if(risk === "high"){

    return {

      type:"discount",

      value:"20% OFF",

      message:
      "Complete your order today & save 20%"

    };

  }

  if(risk === "medium"){

    return {

      type:"shipping",

      value:"FREE SHIPPING",

      message:
      "Free shipping available today"

    };

  }

  return {

    type:"upsell",

    value:"BONUS",

    message:
    "Recommended products waiting for you"

  };

}

// ======================================
// EXPORTS
// ======================================

module.exports = {

  predictChurn,

  generateRetentionOffer

};
