// ======================================
// utils/recommendationEngine.js
// ======================================

function smartRecommendations({

  viewed = [],

  cart = [],

  products = []

}){

  // ====================================
  // MATCH CATEGORY
  // ====================================

  const keywords = [

    ...viewed,
    ...cart

  ].map((x)=>
    x.toLowerCase()
  );

  const recommendations =

    products.filter((p)=>{

      return keywords.some((k)=>

        p.title
        .toLowerCase()
        .includes(k)

      );

    });

  return recommendations
  .slice(0,4);

}

module.exports = {
  smartRecommendations
};
