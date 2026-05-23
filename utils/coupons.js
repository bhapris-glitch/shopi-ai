// ======================================
// utils/coupons.js
// Layboka AI Smart Coupons
// ======================================

const crypto =
require("crypto");

// ======================================
// GENERATE CODE
// ======================================

function generateCouponCode(

  prefix = "LAY"

){

  return (

    prefix +

    "-" +

    crypto
    .randomBytes(3)
    .toString("hex")
    .toUpperCase()

  );

}

// ======================================
// DISCOUNT ENGINE
// ======================================

function calculateDiscount({

  cartValue = 0,

  customerType = "new",

  country = "US"

}){

  let discount = 5;

  // ====================================
  // CART VALUE
  // ====================================

  if(cartValue >= 500){

    discount = 20;

  }else if(cartValue >= 250){

    discount = 15;

  }else if(cartValue >= 100){

    discount = 10;

  }

  // ====================================
  // VIP BONUS
  // ====================================

  if(customerType === "vip"){

    discount += 5;

  }

  // ====================================
  // COUNTRY BONUS
  // ====================================

  if(country === "GB"){

    discount += 2;

  }

  if(country === "CA"){

    discount += 1;

  }

  // ====================================
  // MAX LIMIT
  // ====================================

  if(discount > 30){

    discount = 30;

  }

  return discount;

}

// ======================================
// AI OFFER MESSAGE
// ======================================

function generateOfferMessage({

  discount,

  country

}){

  if(discount >= 25){

    return `🔥 Exclusive ${discount}% OFF — Limited Time`;

  }

  if(discount >= 15){

    return `🎁 Special ${discount}% Discount Just For You`;

  }

  return `⚡ Save ${discount}% On Your Order`;

}

// ======================================
// CREATE COUPON
// ======================================

function createCoupon({

  cartValue,

  customerType,

  country

}){

  const discount =
    calculateDiscount({

      cartValue,

      customerType,

      country

    });

  const code =
    generateCouponCode();

  return {

    success:true,

    code,

    discount,

    message:
      generateOfferMessage({

        discount,

        country

      }),

    expiresIn:"24h"

  };

}

// ======================================
// EXPORTS
// ======================================

module.exports = {

  generateCouponCode,

  calculateDiscount,

  generateOfferMessage,

  createCoupon

};
