// ======================================
// utils/dynamicPricing.js
// AI Dynamic Pricing Engine
// Production Ready
// ======================================

// ======================================
// COUNTRY DISCOUNT RULES
// ======================================

const countryDiscounts = {

  US:10,

  GB:12,

  CA:11,

  AU:9,

  DE:8,

  FR:8

};

// ======================================
// VIP BONUS
// ======================================

const vipBonus = {

  bronze:3,

  silver:5,

  gold:8,

  platinum:12

};

// ======================================
// MAIN ENGINE
// ======================================

function generateDynamicOffer({

  country = "US",

  cartValue = 0,

  customerType = "new",

  conversionScore = 0,

  abandonedCart = false,

  viewedProducts = 0,

  totalOrders = 0

}){

  try{

    // ====================================
    // BASE DISCOUNT
    // ====================================

    let discount =

      countryDiscounts[country]
      || 8;

    // ====================================
    // CART VALUE BOOST
    // ====================================

    if(cartValue >= 100){

      discount += 5;

    }

    if(cartValue >= 300){

      discount += 7;

    }

    // ====================================
    // ABANDONED CART
    // ====================================

    if(abandonedCart){

      discount += 10;

    }

    // ====================================
    // HIGH INTENT USER
    // ====================================

    if(conversionScore >= 70){

      discount += 5;

    }

    // ====================================
    // VIEWED MANY PRODUCTS
    // ====================================

    if(viewedProducts >= 5){

      discount += 3;

    }

    // ====================================
    // LOYAL CUSTOMER
    // ====================================

    if(totalOrders >= 5){

      discount += 4;

    }

    // ====================================
    // VIP
    // ====================================

    if(vipBonus[customerType]){

      discount +=
        vipBonus[
          customerType
        ];

    }

    // ====================================
    // MAX LIMIT
    // ====================================

    if(discount > 35){

      discount = 35;

    }

    // ====================================
    // OFFER TYPE
    // ====================================

    let offerType =
      "percentage";

    let urgency =
      "standard";

    if(discount >= 20){

      urgency =
        "high";

    }

    // ====================================
    // AI MESSAGE
    // ====================================

    let message =

      `🎉 Special Offer Unlocked!

Get ${discount}% OFF today.`;

    // ====================================
    // HIGH VALUE
    // ====================================

    if(cartValue >= 300){

      message =
`🔥 VIP Exclusive:
Save ${discount}% on your premium order today.`;

    }

    // ====================================
    // ABANDONED CART
    // ====================================

    if(abandonedCart){

      message =
`🛒 Complete your order now and get ${discount}% OFF before it expires.`;

    }

    // ====================================
    // RETURN RESULT
    // ====================================

    return {

      success:true,

      discount,

      offerType,

      urgency,

      code:
        generateCouponCode(
          discount,
          country
        ),

      expiresIn:
        urgency === "high"
        ? "1 hour"
        : "24 hours",

      message

    };

  }catch(err){

    console.log(
      "DYNAMIC PRICING ERROR:",
      err
    );

    return {

      success:false,

      discount:10,

      message:
        "Special offer available."

    };

  }

}

// ======================================
// GENERATE COUPON
// ======================================

function generateCouponCode(

  discount,

  country

){

  const random =

    Math.random()
    .toString(36)
    .substring(2,7)
    .toUpperCase();

  return `LAY${country}${discount}${random}`;

}

// ======================================
// FINAL PRICE
// ======================================

function calculateFinalPrice({

  originalPrice,

  discount

}){

  const saved =

    (originalPrice * discount)
    / 100;

  const finalPrice =

    originalPrice - saved;

  return {

    originalPrice:
      Number(
        originalPrice.toFixed(2)
      ),

    saved:
      Number(
        saved.toFixed(2)
      ),

    finalPrice:
      Number(
        finalPrice.toFixed(2)
      )

  };

}

// ======================================
// EXPORTS
// ======================================

module.exports = {

  generateDynamicOffer,

  calculateFinalPrice

};
