// ======================================
// utils/productAI.js
// Real Shopify Product Detection
// updated 1 Jun 2026
// ======================================

const Product =
require("../models/Product");

// ======================================
// FIND PRODUCTS FROM MESSAGE
// ======================================

async function findProductsFromMessage({

  clientId,

  message = ""

}){

  try{

    if(!clientId){

      return [];

    }

    const products =

      await Product.find({

        clientId,

        active:true

      })

      .limit(200);

    const lowerMessage =

      message.toLowerCase();

    const matches =

      products.filter((product)=>{

        const title =

          (product.title || "")
          .toLowerCase();

        const words =

          title.split(" ");

        return words.some((word)=>{

          return (

            word.length > 2 &&

            lowerMessage.includes(word)

          );

        });

      });

    return matches.slice(0,5);

  }catch(err){

    console.log(

      "PRODUCT AI ERROR:",

      err

    );

    return [];

  }

}

// ======================================
// EXPORTS
// ======================================

module.exports = {

  findProductsFromMessage

};
