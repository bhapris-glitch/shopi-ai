// ======================================
// utils/segmentation.js
// ======================================

function detectSegment(customer){

  const spent =
    customer.totalSpent || 0;

  const orders =
    customer.totalOrders || 0;

  // =========================
  // VIP
  // =========================

  if(spent >= 1000){

    return "vip";

  }

  // =========================
  // LOYAL
  // =========================

  if(orders >= 5){

    return "loyal";

  }

  // =========================
  // ACTIVE
  // =========================

  if(orders >= 2){

    return "active";

  }

  return "new";

}

module.exports = {
  detectSegment
};
