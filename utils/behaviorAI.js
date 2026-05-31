// ======================================
// utils/behaviorAI.js
// Layboka AI Behavior Engine
// Production Version
// Updated 1 Jun, 2026
// ======================================

const {
  getUserLearning,
  detectSegment
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

    // ==========================
    // EXCITED
    // ==========================

    if(

      text.includes("love") ||

      text.includes("awesome") ||

      text.includes("amazing") ||

      text.includes("perfect")

    ){

      return "excited";

    }

    // ==========================
    // PRICE SENSITIVE
    // ==========================

    if(

      text.includes("cheap") ||

      text.includes("discount") ||

      text.includes("offer") ||

      text.includes("price") ||

      text.includes("budget")

    ){

      return "price_sensitive";

    }

    // ==========================
    // URGENT
    // ==========================

    if(

      text.includes("fast") ||

      text.includes("today") ||

      text.includes("urgent") ||

      text.includes("now")

    ){

      return "urgent";

    }

    // ==========================
    // CONFUSED
    // ==========================

    if(

      text.includes("help") ||

      text.includes("which") ||

      text.includes("recommend") ||

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
        "Show premium products"

      };

    case "price_sensitive":

      return {

        tone:"discount",

        action:"coupon",

        message:
        "Offer discount bundle"

      };

    case "urgent":

      return {

        tone:"fast",

        action:"checkout",

        message:
        "Push quick checkout"

      };

    case "confused":

      return {

        tone:"helpful",

        action:"guide",

        message:
        "Guide customer"

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
// AI RECOMMENDATIONS
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

    // ==========================
    // SEGMENT
    // ==========================

    const segment =

      detectSegment(
        visitorId
      );

    // ==========================
    // HOT BUYER
    // ==========================

    if(

      user.purchaseIntent > 70

    ){

      recommendations.push(

        "premium_products",

        "vip_discount",

        "fast_checkout"

      );

    }

    // ==========================
    // CART USER
    // ==========================

    if(

      user.cartProducts?.length > 0

    ){

      recommendations.push(

        "cart_reminder",

        "bundle_offer"

      );

    }

    // ==========================
    // BROWSER
    // ==========================

    if(

      user.viewedProducts?.length > 5

    ){

      recommendations.push(

        "best_sellers",

        "social_proof"

      );

    }

    // ==========================
    // VIP
    // ==========================

    if(segment === "vip"){

      recommendations.push(

        "vip_access",

        "premium_bundle",

        "exclusive_offer"

      );

    }

    // ==========================
    // REMOVE DUPLICATES
    // ==========================

    return [

      ...new Set(
        recommendations
      )

    ];

  }catch(err){

    console.log(

      "BEHAVIOR AI ERROR:",

      err

    );

    return [];

  }

}

// ======================================
// CUSTOMER PROFILE
// ======================================

async function getBehaviorProfile(

  visitorId

){

  try{

    const user =

      await getUserLearning(
        visitorId
      );

    if(!user){

      return null;

    }

    return {

      purchaseIntent:
        user.purchaseIntent || 0,

      viewedProducts:
        user.viewedProducts?.length || 0,

      cartProducts:
        user.cartProducts?.length || 0,

      avgSpend:
        user.avgSpend || 0,

      segment:
        detectSegment(
          visitorId
        )

    };

  }catch(err){

    return null;

  }

}

// ======================================
// EXPORTS
// ======================================

module.exports = {

  detectBehaviorMood,

  getBehaviorStrategy,

  behaviorRecommendations,

  getBehaviorProfile

};
