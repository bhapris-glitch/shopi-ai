// ======================================
// utils/predictiveSales.js
// ======================================

function predictNextPurchase(customer){

  const spent =
    customer.totalSpent || 0;

  // =========================
  // HIGH VALUE
  // =========================

  if(spent > 1000){

    return {

      likelyToBuy:true,

      productType:"premium",

      probability:"92%"

    };

  }

  // =========================
  // MEDIUM
  // =========================

  if(spent > 300){

    return {

      likelyToBuy:true,

      productType:"mid-range",

      probability:"74%"

    };

  }

  return {

    likelyToBuy:false,

    productType:"starter",

    probability:"38%"

  };

}

module.exports = {
  predictNextPurchase
};
