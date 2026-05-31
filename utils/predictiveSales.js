// ======================================
// utils/predictiveSales.js
// Layboka AI Predictive Sales Engine
// Production Version
// Updated 1Jun, 2026
// ======================================

const {
  detectSegment
} = require("./learningAI");

// ======================================
// NEXT PURCHASE PREDICTION
// ======================================

function predictNextPurchase(

  customer = {}

){

  try{

    const spent =
      customer.totalSpent || 0;

    const orders =
      customer.orders || 0;

    const purchaseIntent =
      customer.purchaseIntent || 0;

    // =========================
    // VIP CUSTOMER
    // =========================

    if(

      spent > 1000 ||

      purchaseIntent > 80

    ){

      return {

        likelyToBuy:true,

        productType:"premium",

        probability:"92%",

        estimatedSpend:

          spent + 200

      };

    }

    // =========================
    // MID CUSTOMER
    // =========================

    if(

      spent > 300 ||

      orders > 3

    ){

      return {

        likelyToBuy:true,

        productType:"mid-range",

        probability:"74%",

        estimatedSpend:

          spent + 75

      };

    }

    // =========================
    // STARTER
    // =========================

    return {

      likelyToBuy:false,

      productType:"starter",

      probability:"38%",

      estimatedSpend:

        spent + 25

    };

  }catch(err){

    console.log(

      "PREDICT ERROR:",

      err

    );

    return {

      likelyToBuy:false,

      productType:"starter",

      probability:"0%",

      estimatedSpend:0

    };

  }

}

// ======================================
// CUSTOMER VALUE SCORE
// ======================================

function calculateCustomerValue(

  customer = {}

){

  try{

    let score = 0;

    score +=
      customer.totalSpent || 0;

    score +=
      (customer.orders || 0) * 25;

    score +=
      customer.purchaseIntent || 0;

    if(score > 1000){

      return "vip";

    }

    if(score > 400){

      return "high";

    }

    if(score > 150){

      return "medium";

    }

    return "low";

  }catch(err){

    return "low";

  }

}

// ======================================
// REVENUE FORECAST
// ======================================

function forecastRevenue(

  customers = []

){

  try{

    let projectedRevenue = 0;

    customers.forEach(

      (customer)=>{

        const prediction =

          predictNextPurchase(
            customer
          );

        projectedRevenue +=

          prediction.estimatedSpend || 0;

      }

    );

    return {

      customers:

        customers.length,

      projectedRevenue:

        Number(
          projectedRevenue.toFixed(2)
        )

    };

  }catch(err){

    return {

      customers:0,

      projectedRevenue:0

    };

  }

}

// ======================================
// SEGMENT FORECAST
// ======================================

function forecastSegment(

  visitorId

){

  try{

    return detectSegment(
      visitorId
    );

  }catch(err){

    return "normal";

  }

}

// ======================================
// EXPORTS
// ======================================

module.exports = {

  predictNextPurchase,

  calculateCustomerValue,

  forecastRevenue,

  forecastSegment

};
