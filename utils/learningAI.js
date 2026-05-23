// ======================================
// utils/learningAI.js
// Layboka AI Learning Engine
// Real-Time AI Learning System
// ======================================

const Client =
require("../models/Client");

// ======================================
// LEARNING MEMORY
// ======================================

const learningMemory = {};

// ======================================
// SAVE USER BEHAVIOR
// ======================================

async function saveLearning({

  clientId,
  visitorId,
  message,
  action,
  product,
  value

}){

  try{

    if(!visitorId){
      return;
    }

    // ================================
    // INIT MEMORY
    // ================================

    if(
      !learningMemory[visitorId]
    ){

      learningMemory[
        visitorId
      ] = {

        interests:[],

        viewedProducts:[],

        cartProducts:[],

        purchaseIntent:0,

        avgSpend:0,

        actions:[],

        lastSeen:new Date()

      };

    }

    const user =
      learningMemory[
        visitorId
      ];

    // ================================
    // SAVE MESSAGE
    // ================================

    if(message){

      user.actions.push({

        type:"message",

        value:message,

        at:new Date()

      });

      // ================================
      // BUY INTENT KEYWORDS
      // ================================

      const keywords = [

        "buy",
        "price",
        "discount",
        "offer",
        "shipping",
        "checkout",
        "payment",
        "best"

      ];

      keywords.forEach((k)=>{

        if(

          message
          .toLowerCase()
          .includes(k)

        ){

          user.purchaseIntent += 10;

        }

      });

    }

    // ================================
    // PRODUCT VIEW
    // ================================

    if(action === "view_product"){

      user.viewedProducts.push(
        product
      );

    }

    // ================================
    // CART
    // ================================

    if(action === "add_to_cart"){

      user.cartProducts.push(
        product
      );

      user.purchaseIntent += 20;

    }

    // ================================
    // PURCHASE
    // ================================

    if(action === "purchase"){

      user.purchaseIntent += 50;

      if(value){

        user.avgSpend =

          (
            user.avgSpend +
            value
          ) / 2;

      }

    }

    // ================================
    // UPDATE LAST SEEN
    // ================================

    user.lastSeen =
      new Date();

    // ================================
    // SAVE CLIENT LEARNING
    // ================================

    if(clientId){

      await Client.findByIdAndUpdate(

        clientId,

        {

          $inc:{
            messages:1
          }

        }

      );

    }

    return {

      success:true,

      learning:user

    };

  }catch(err){

    console.log(
      "LEARNING AI ERROR:",
      err
    );

    return {

      success:false

    };

  }

}

// ======================================
// GET USER PROFILE
// ======================================

function getUserLearning(

  visitorId

){

  try{

    return (

      learningMemory[
        visitorId
      ] ||

      null

    );

  }catch(err){

    return null;
  }

}

// ======================================
// AI SEGMENTATION
// ======================================

function detectSegment(

  visitorId

){

  try{

    const user =
      learningMemory[
        visitorId
      ];

    if(!user){

      return "new";

    }

    // ================================
    // VIP
    // ================================

    if(
      user.avgSpend > 300
    ){

      return "vip";

    }

    // ================================
    // HIGH BUYER
    // ================================

    if(
      user.purchaseIntent > 70
    ){

      return "hot_buyer";

    }

    // ================================
    // CART USER
    // ================================

    if(
      user.cartProducts.length > 0
    ){

      return "cart_user";

    }

    // ================================
    // BROWSER
    // ================================

    if(
      user.viewedProducts.length > 5
    ){

      return "browser";

    }

    return "normal";

  }catch(err){

    return "unknown";
  }

}

// ======================================
// EXPORTS
// ======================================

module.exports = {

  saveLearning,

  getUserLearning,

  detectSegment

};
