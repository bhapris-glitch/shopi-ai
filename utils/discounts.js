// ======================================
// utils/discounts.js
// AI Smart Discounts
// ======================================

function generateDiscount(total){

  // ======================================
  // SMALL CART
  // ======================================

  if(total < 50){

    return {

      code:"SAVE5",

      percent:5,

      message:
        "🎁 Here's 5% OFF to complete your order today."

    };

  }

  // ======================================
  // MEDIUM CART
  // ======================================

  if(total < 150){

    return {

      code:"SAVE10",

      percent:10,

      message:
        "🔥 Unlock 10% OFF before your cart expires."

    };

  }

  // ======================================
  // LARGE CART
  // ======================================

  return {

    code:"SAVE15",

    percent:15,

    message:
      "🚀 VIP OFFER: Enjoy 15% OFF on your premium order."

  };

}

module.exports = {

  generateDiscount

};
