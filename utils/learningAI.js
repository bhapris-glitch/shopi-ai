// ======================================
// utils/learningAI.js
// Layboka AI Learning Engine
// Premium Persistent Memory
// Updated 1Jun, 2026
// ======================================

const Client =
require("../models/Client");

const ChatMemory =
require("../models/ChatMemory");

// ======================================
// MEMORY CACHE
// ======================================

const learningMemory = {};

// ======================================
// LOAD MEMORY
// ======================================

async function loadMemory(
  visitorId
){

  try{

    if(
      learningMemory[visitorId]
    ){

      return learningMemory[
        visitorId
      ];

    }

    const memory =
      await ChatMemory.findOne({

        sessionId:
          visitorId

      });

    if(!memory){

      return null;

    }

    const user = {

      viewedProducts:
        memory.viewedProducts || [],

      cartProducts:
        memory.cartItems || [],

      purchaseIntent:
        memory.purchaseIntent || 0,

      avgSpend:
        memory.avgSpend || 0,

      actions:
        memory.actions || [],

      lastSeen:
        memory.lastSeen || new Date()

    };

    learningMemory[
      visitorId
    ] = user;

    return user;

  }catch(err){

    console.log(
      "LOAD MEMORY ERROR:",
      err
    );

    return null;

  }

}

// ======================================
// SAVE LEARNING
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

      return {
        success:false
      };

    }

    let user =
      await loadMemory(
        visitorId
      );

    if(!user){

      user = {

        viewedProducts:[],

        cartProducts:[],

        purchaseIntent:0,

        avgSpend:0,

        actions:[],

        lastSeen:new Date()

      };

    }

    // ====================================
    // MESSAGE
    // ====================================

    if(message){

      user.actions.push({

        type:"message",

        value:message,

        at:new Date()

      });

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

    // ====================================
    // VIEW PRODUCT
    // ====================================

    if(

      action ===
      "view_product"

    ){

      if(product){

        user.viewedProducts.push(
          product
        );

      }

    }

    // ====================================
    // ADD TO CART
    // ====================================

    if(

      action ===
      "add_to_cart"

    ){

      if(product){

        user.cartProducts.push(
          product
        );

      }

      user.purchaseIntent += 20;

    }

    // ====================================
    // PURCHASE
    // ====================================

    if(

      action ===
      "purchase"

    ){

      user.purchaseIntent += 50;

      if(value){

        user.avgSpend =

          (
            user.avgSpend +
            Number(value)
          ) / 2;

      }

    }

    user.lastSeen =
      new Date();

    // ====================================
    // CACHE UPDATE
    // ====================================

    learningMemory[
      visitorId
    ] = user;

    // ====================================
    // DATABASE SAVE
    // ====================================

    await ChatMemory.findOneAndUpdate(

      {

        sessionId:
          visitorId

      },

      {

        sessionId:
          visitorId,

        clientId:
          clientId || "",

        viewedProducts:
          user.viewedProducts,

        cartItems:
          user.cartProducts,

        actions:
          user.actions,

        purchaseIntent:
          user.purchaseIntent,

        avgSpend:
          user.avgSpend,

        lastSeen:
          user.lastSeen,

        $push:{
          messages:{
            role:"user",
            content:
              message || ""
          }
        }

      },

      {

        upsert:true,

        new:true

      }

    );

    // ====================================
    // CLIENT ANALYTICS
    // ====================================

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

async function getUserLearning(

  visitorId

){

  try{

    const user =
      await loadMemory(
        visitorId
      );

    return user;

  }catch(err){

    return null;

  }

}

// ======================================
// SEGMENTATION
// ======================================

async function detectSegment(

  visitorId

){

  try{

    const user =
      await loadMemory(
        visitorId
      );

    if(!user){

      return "new";

    }

    if(

      user.avgSpend > 300

    ){

      return "vip";

    }

    if(

      user.purchaseIntent > 70

    ){

      return "hot_buyer";

    }

    if(

      user.cartProducts.length > 0

    ){

      return "cart_user";

    }

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
// CLEAR MEMORY
// ======================================

async function clearMemory(

  visitorId

){

  try{

    delete learningMemory[
      visitorId
    ];

    await ChatMemory.deleteOne({

      sessionId:
        visitorId

    });

    return true;

  }catch(err){

    return false;

  }

}

// ======================================
// EXPORTS
// ======================================

module.exports = {

  saveLearning,

  getUserLearning,

  detectSegment,

  clearMemory

};
