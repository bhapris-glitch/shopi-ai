// ======================================
// utils/bundles.js
// AI Product Bundle Engine
// Production Ready
// ======================================

// ======================================
// CREATE BUNDLES
// ======================================

function generateBundles({

  products = [],

  country = "US",

  customerType = "new"

}){

  try{

    // ====================================
    // VALIDATION
    // ====================================

    if(!products.length){

      return [];

    }

    // ====================================
    // AI BUNDLE RULES
    // ====================================

    const bundles = [];

    // ====================================
    // PAIR PRODUCTS
    // ====================================

    for(let i=0;i<products.length;i+=2){

      const first =
        products[i];

      const second =
        products[i+1];

      if(!first || !second){

        continue;

      }

      // ==================================
      // PRICES
      // ==================================

      const firstPrice =
        Number(first.price || 0);

      const secondPrice =
        Number(second.price || 0);

      const originalPrice =

        firstPrice +
        secondPrice;

      // ==================================
      // DISCOUNT
      // ==================================

      let discount = 10;

      if(customerType === "vip"){

        discount = 15;

      }

      if(country === "GB"){

        discount += 2;

      }

      if(country === "CA"){

        discount += 1;

      }

      // ==================================
      // FINAL PRICE
      // ==================================

      const saved =

        (originalPrice * discount)
        / 100;

      const bundlePrice =

        originalPrice - saved;

      // ==================================
      // BUNDLE OBJECT
      // ==================================

      bundles.push({

        id:
          `bundle_${Date.now()}_${i}`,

        title:
          `${first.title} + ${second.title}`,

        products:[

          {

            id:first.id,

            title:first.title,

            image:first.image,

            price:firstPrice

          },

          {

            id:second.id,

            title:second.title,

            image:second.image,

            price:secondPrice

          }

        ],

        originalPrice:
          Number(
            originalPrice.toFixed(2)
          ),

        bundlePrice:
          Number(
            bundlePrice.toFixed(2)
          ),

        saved:
          Number(
            saved.toFixed(2)
          ),

        discount,

        badge:
          getBundleBadge(discount),

        urgency:
          getUrgency(saved)

      });

    }

    // ====================================
    // SORT BEST BUNDLES
    // ====================================

    bundles.sort((a,b)=>{

      return b.saved - a.saved;

    });

    return bundles;

  }catch(err){

    console.log(
      "BUNDLE ERROR:",
      err
    );

    return [];

  }

}

// ======================================
// BADGE
// ======================================

function getBundleBadge(discount){

  if(discount >= 20){

    return "🔥 Hot Bundle";

  }

  if(discount >= 15){

    return "⚡ Best Seller";

  }

  return "🎁 Bundle Deal";

}

// ======================================
// URGENCY
// ======================================

function getUrgency(saved){

  if(saved >= 50){

    return "Only today";

  }

  if(saved >= 20){

    return "Limited stock";

  }

  return "Popular choice";

}

// ======================================
// AI RECOMMENDATION
// ======================================

function recommendBundle({

  bundles = [],

  cartValue = 0

}){

  try{

    if(!bundles.length){

      return null;

    }

    // ====================================
    // HIGH VALUE CART
    // ====================================

    if(cartValue >= 200){

      return bundles.sort((a,b)=>{

        return b.bundlePrice -
        a.bundlePrice;

      })[0];

    }

    // ====================================
    // LOW CART
    // ====================================

    return bundles.sort((a,b)=>{

      return b.discount -
      a.discount;

    })[0];

  }catch(err){

    console.log(
      "RECOMMEND ERROR:",
      err
    );

    return null;

  }

}

// ======================================
// EXPORTS
// ======================================

module.exports = {

  generateBundles,

  recommendBundle

};
