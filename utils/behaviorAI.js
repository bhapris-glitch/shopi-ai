// ======================================
// utils/behaviorAI.js
// Layboka AI Behavior Engine
// Updated 1Jun, 2026
// ======================================

const {
  getUserLearning
} = require("./learningAI");

// ======================================
// DETECT CUSTOMER MOOD
// ======================================

function detectBehaviorMood(

  messages = []

){

  try{

    const text =
      messages
      .join(" ")
      .toLowerCase();

    if(

      text.includes("love") ||

      text.includes("awesome") ||

      text.includes("amazing")

    ){

      return "excited";

    }

    if(

      text.includes("cheap") ||

      text.includes("discount") ||

      text.includes("offer") ||

      text.includes("price")

    ){

      return "price_sensitive";

    }

    if(

      text.includes("fast") ||

      text.includes("today") ||

      text.includes("urgent")

    ){

      return "urgent";

    }

    if(

      text.includes("help") ||

      text.includes("which") ||

      text.includes("confused")

    ){

      return "confused";

    }

    return "normal";

  }catch(err){

    return "normal";

  }

}

// ======================================
// RESPONSE STRATEGY
// ======================================

function getBehaviorStrategy(

  mood

){

  switch(mood){

    case "excited":

      return {

        tone:"energetic",

        action:"upsell",

        message:
        "Show premium recommendations"

      };

    case "price_sensitive":

      return {

        tone:"discount",

        action:"coupon",

        message:
        "Offer bundle or coupon"

      };

    case "urgent":

      return {

        tone:"fast",

        action:"checkout",

        message:
        "Push fast checkout"

      };

    case "confused":

      return {

        tone:"helpful",

        action:"guide",

        message:
        "Recommend best products"

      };

    default:

      return {

        tone:"normal",

        action:"engage",

        message:
        "Continue conversation"

      };

  }

}

// ======================================
// RECOMMENDATIONS
// ======================================

async function behaviorRecommendations(

  visitorId

){

  try{

    const user =
      await getUserLearning(
        visitorId
      );

    if(!user){

      return [];

    }

    const recommendations = [];

    if(

      user.purchaseIntent > 70

    ){

      recommendations.push(

        "premium_products",

        "fast_checkout",

        "vip_discount"

      );

    }

    if(

      user.cartProducts &&
      user.cartProducts.length > 0

    ){

      recommendations.push(

        "cart_reminder",

        "bundle_offer"

      );

    }

    if(

      user.viewedProducts &&
      user.viewedProducts.length > 5

    ){

      recommendations.push(

        "best_sellers",

        "social_proof"

      );

    }

    return recommendations;

  }catch(err){

    console.log(

      "BEHAVIOR AI ERROR:",

      err

    );

    return [];

  }

}

// ======================================
// EXPORTS
// ======================================

module.exports = {

  detectBehaviorMood,

  getBehaviorStrategy,

  behaviorRecommendations

};
