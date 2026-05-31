// ======================================
// utils/recommendationEngine.js
// Layboka AI Recommendation Engine
// Memory + Cart + Intent Based
// Updated 1Jun, 2026
// ======================================

const {
  getUserLearning
} = require("./learningAI");

// ======================================
// SMART RECOMMENDATIONS
// ======================================

async function smartRecommendations({

  visitorId = null,

  viewed = [],

  cart = [],

  products = [],

  limit = 4

}){

  try{

    // ====================================
    // LOAD AI MEMORY
    // ====================================

    let memory = null;

    if(visitorId){

      memory =
        await getUserLearning(
          visitorId
        );

    }

    // ====================================
    // MERGE HISTORY
    // ====================================

    const viewedProducts = [

      ...viewed,

      ...(memory?.viewedProducts || [])

    ];

    const cartProducts = [

      ...cart,

      ...(memory?.cartProducts || [])

    ];

    const keywords = [

      ...viewedProducts,

      ...cartProducts

    ]

    .filter(Boolean)

    .map((x)=>

      String(x)
      .toLowerCase()

    );

    // ====================================
    // SCORE PRODUCTS
    // ====================================

    const scoredProducts =

      products.map((product)=>{

        let score = 0;

        const title =

          (
            product.title || ""
          )
          .toLowerCase();

        const description =

          (
            product.description || ""
          )
          .toLowerCase();

        // ===============================
        // KEYWORD MATCH
        // ===============================

        keywords.forEach((keyword)=>{

          if(

            title.includes(keyword)

          ){

            score += 50;

          }

          if(

            description.includes(
              keyword
            )

          ){

            score += 20;

          }

        });

        // ===============================
        // TRENDING
        // ===============================

        if(

          product.tags &&

          product.tags.includes(
            "trending"
          )

        ){

          score += 40;

        }

        // ===============================
        // BEST SELLER
        // ===============================

        if(product.sales){

          score += product.sales;

        }

        // ===============================
        // HIGH INTENT
        // ===============================

        if(

          memory?.purchaseIntent >

          70

        ){

          if(product.price > 100){

            score += 50;

          }

        }

        return {

          ...product,

          score

        };

      });

    // ====================================
    // SORT
    // ====================================

    scoredProducts.sort(

      (a,b)=>

        b.score - a.score

    );

    // ====================================
    // RETURN
    // ====================================

    return scoredProducts

      .slice(0,limit);

  }catch(err){

    console.log(

      "RECOMMENDATION ERROR:",

      err

    );

    return [];

  }

}

// ======================================
// EXPORTS
// ======================================

module.exports = {

  smartRecommendations

};
