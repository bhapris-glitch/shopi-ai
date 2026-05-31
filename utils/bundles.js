// ======================================
// utils/bundles.js
// Layboka AI Bundle Engine
// Production Version
// Updated 1Jun, 2026
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

    if(!Array.isArray(products)){

      return [];

    }

    if(products.length < 2){

      return [];

    }

    const bundles = [];

    for(

      let i = 0;

      i < products.length - 1;

      i += 2

    ){

      const first =
        products[i];

      const second =
        products[i + 1];

      if(

        !first ||
        !second

      ){

        continue;

      }

      const firstPrice =
        Number(
          first.price || 0
        );

      const secondPrice =
        Number(
          second.price || 0
        );

      const originalPrice =

        firstPrice +
        secondPrice;

      let discount = 10;

      // ==========================
      // VIP BOOST
      // ==========================

      if(

        customerType === "vip"

      ){

        discount = 15;

      }

      if(country === "GB"){

        discount += 2;

      }

      if(country === "CA"){

        discount += 1;

      }

      if(country === "AU"){

        discount += 1;

      }

      const saved =

        (
          originalPrice *
          discount
        ) / 100;

      const bundlePrice =

        originalPrice -
        saved;

      bundles.push({

        id:
          `bundle_${Date.now()}_${i}`,

        title:
          `${first.title} + ${second.title}`,

        products:[

          {

            id:
              first._id ||
              first.id,

            title:
              first.title || "",

            image:
              first.image || "",

            price:
              firstPrice

          },

          {

            id:
              second._id ||
              second.id,

            title:
              second.title || "",

            image:
              second.image || "",

            price:
              secondPrice

          }

        ],

        originalPrice:

          Number(
            originalPrice
            .toFixed(2)
          ),

        bundlePrice:

          Number(
            bundlePrice
            .toFixed(2)
          ),

        saved:

          Number(
            saved
            .toFixed(2)
          ),

        discount,

        badge:
          getBundleBadge(
            discount
          ),

        urgency:
          getUrgency(saved)

      });

    }

    bundles.sort(

      (a,b)=>

        b.saved -
        a.saved

    );

    return bundles;

  }catch(err){

    console.log(

      "BUNDLE ERROR:",

      err.message

    );

    return [];

  }

}

// ======================================
// BADGE
// ======================================

function getBundleBadge(

  discount

){

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

function getUrgency(

  saved

){

  if(saved >= 50){

    return "Only today";

  }

  if(saved >= 20){

    return "Limited stock";

  }

  return "Popular choice";

}

// ======================================
// RECOMMEND BEST BUNDLE
// ======================================

function recommendBundle({

  bundles = [],

  cartValue = 0

}){

  try{

    if(

      !Array.isArray(bundles) ||

      !bundles.length

    ){

      return null;

    }

    // ==========================
    // HIGH VALUE CUSTOMER
    // ==========================

    if(cartValue >= 200){

      return bundles

      .sort(

        (a,b)=>

          b.bundlePrice -
          a.bundlePrice

      )[0];

    }

    // ==========================
    // NORMAL CUSTOMER
    // ==========================

    return bundles

    .sort(

      (a,b)=>

        b.discount -
        a.discount

    )[0];

  }catch(err){

    console.log(

      "BUNDLE RECOMMEND ERROR:",

      err.message

    );

    return null;

  }

}

// ======================================
// CALCULATE BUNDLE SAVINGS
// ======================================

function calculateBundleSavings(

  bundle

){

  try{

    if(!bundle){

      return 0;

    }

    return Number(

      (
        bundle.originalPrice -
        bundle.bundlePrice
      )
      .toFixed(2)

    );

  }catch(err){

    return 0;

  }

}

// ======================================
// EXPORTS
// ======================================

module.exports = {

  generateBundles,

  recommendBundle,

  calculateBundleSavings

};
