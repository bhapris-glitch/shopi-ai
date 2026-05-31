// ======================================
// utils/conversionScore.js
// Layboka AI Conversion Score Engine
// Production Version
// Updated 1Jun, 2026
// ======================================

// ======================================
// CALCULATE SCORE
// ======================================

function calculateScore(

  data = {}

){

  try{

    let score = 0;

    // =========================
    // VISITS
    // =========================

    const visits =

      Number(
        data.visits || 0
      );

    if(visits >= 10){

      score += 30;

    }

    else if(visits >= 5){

      score += 20;

    }

    else if(visits >= 2){

      score += 10;

    }

    // =========================
    // CART
    // =========================

    if(data.cart){

      score += 30;

    }

    // =========================
    // CHAT
    // =========================

    const chatMessages =

      Number(
        data.chatMessages || 0
      );

    if(chatMessages >= 10){

      score += 25;

    }

    else if(chatMessages >= 3){

      score += 20;

    }

    else if(chatMessages >= 1){

      score += 10;

    }

    // =========================
    // RETURN USER
    // =========================

    if(data.returning){

      score += 20;

    }

    // =========================
    // PRODUCT VIEWS
    // =========================

    const productViews =

      Number(
        data.productViews || 0
      );

    if(productViews >= 5){

      score += 15;

    }

    // =========================
    // CHECKOUT STARTED
    // =========================

    if(data.checkoutStarted){

      score += 25;

    }

    // =========================
    // PURCHASE INTENT
    // =========================

    const purchaseIntent =

      Number(
        data.purchaseIntent || 0
      );

    score += Math.min(
      20,
      Math.floor(
        purchaseIntent / 5
      )
    );

    // =========================
    // LIMIT
    // =========================

    score = Math.min(
      score,
      100
    );

    return score;

  }

  catch(err){

    console.log(

      "CONVERSION SCORE ERROR:",

      err.message

    );

    return 0;

  }

}

// ======================================
// CONVERT SCORE TO LABEL
// ======================================

function getConversionLabel(

  score = 0

){

  if(score >= 80){

    return "hot";

  }

  if(score >= 50){

    return "warm";

  }

  return "cold";

}

// ======================================
// EXPORTS
// ======================================

module.exports = {

  calculateScore,

  getConversionLabel

};
