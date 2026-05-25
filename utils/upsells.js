// ======================================
// utils/upsells.js
// Layboka AI Upsell Engine
// Real-Time AI Product Upsells
// GPT-4o-mini Optimized
// ======================================

const Product =
require("../models/Product");

// ======================================
// GET SMART UPSELLS
// ======================================

async function getUpsells({

  clientId,
  currentProductId = null,
  cartProducts = [],
  limit = 4

}){

  try{

    // ======================================
    // FETCH PRODUCTS
    // ======================================

    let products =
      await Product.find({

        clientId

      })

      .sort({
        sales:-1
      })

      .limit(20);

    if(!products.length){

      return [];

    }

    // ======================================
    // REMOVE CURRENT PRODUCT
    // ======================================

    if(currentProductId){

      products = products.filter(

        (p)=>

          p._id.toString() !==
          currentProductId.toString()

      );

    }

    // ======================================
    // REMOVE CART PRODUCTS
    // ======================================

    if(cartProducts.length){

      const cartIds =
        cartProducts.map(
          p => p.toString()
        );

      products = products.filter(

        (p)=>

          !cartIds.includes(
            p._id.toString()
          )

      );

    }

    // ======================================
    // SCORING ENGINE
    // ======================================

    const scoredProducts =
      products.map((product)=>{

        let score = 0;

        // ======================================
        // SALES BOOST
        // ======================================

        score +=
          product.sales || 0;

        // ======================================
        // HIGH RATING BOOST
        // ======================================

        if(product.rating){

          score +=
            product.rating * 10;

        }

        // ======================================
        // INVENTORY BOOST
        // ======================================

        if(product.inventory > 0){

          score += 20;

        }

        // ======================================
        // PREMIUM PRODUCTS BOOST
        // ======================================

        if(product.price > 100){

          score += 30;

        }

        // ======================================
        // TRENDING TAG BOOST
        // ======================================

        if(

          product.tags &&

          product.tags.includes(
            "trending"
          )

        ){

          score += 50;

        }

        return {

          ...product.toObject(),

          score

        };

      });

    // ======================================
    // SORT BY SCORE
    // ======================================

    scoredProducts.sort(

      (a,b)=> b.score - a.score

    );

    // ======================================
    // FINAL UPSSELLS
    // ======================================

    const finalUpsells =
      scoredProducts.slice(0,limit);

    return finalUpsells;

  }catch(err){

    console.log(

      "UPSELL ERROR:",
      err.message

    );

    return [];

  }

}

// ======================================
// AI CROSS SELL
// ======================================

async function getCrossSellText({

  customerMessage = "",
  productName = ""

}){

  try{

    const lower =
      customerMessage.toLowerCase();

    // ======================================
    // SIMPLE AI LOGIC
    // Avoid OpenAI cost
    // ======================================

    if(

      lower.includes("gift")

    ){

      return
`🎁 Customers also love adding ${productName} as a gift combo.`;

    }

    if(

      lower.includes("cheap") ||

      lower.includes("budget")

    ){

      return
`💡 ${productName} gives the best value for the price.`;

    }

    if(

      lower.includes("premium") ||

      lower.includes("best")

    ){

      return
`🔥 ${productName} is one of our premium best-sellers right now.`;

    }

    return
`⚡ ${productName} is trending with customers this week.`;

  }catch(err){

    console.log(err);

    return "";

  }

}

// ======================================
// BUNDLE SUGGESTIONS
// ======================================

function createBundle({

  mainProduct,
  suggestedProducts = []

}){

  try{

    if(!mainProduct){

      return null;

    }

    const bundleProducts =

      suggestedProducts.slice(0,2);

    let total = 0;

    total += mainProduct.price || 0;

    for(const item of bundleProducts){

      total += item.price || 0;

    }

    // ======================================
    // DISCOUNT
    // ======================================

    const discount = 10;

    const finalPrice =

      total -

      ((total * discount)/100);

    return {

      bundleName:
`Complete Your Setup Bundle`,

      products:[
        mainProduct,
        ...bundleProducts
      ],

      originalPrice:
        total.toFixed(2),

      finalPrice:
        finalPrice.toFixed(2),

      discount

    };

  }catch(err){

    console.log(err);

    return null;

  }

}

// ======================================
// EXPORTS
// ======================================

module.exports = {

  getUpsells,
  getCrossSellText,
  createBundle

};
