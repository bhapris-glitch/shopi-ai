// ======================================
// utils/upsells.js
// AI Upsell Engine
// ======================================

function generateUpsell(products){

  if(!products?.length){

    return null;

  }

  const first =
    products[0];

  return {

    title:
      "Complete Your Bundle",

    message:
      `Customers who bought "${first.title}" also added premium accessories.`,

    recommendation:
      "Add matching accessories for better value."

  };

}

module.exports = {

  generateUpsell

};
