// ======================================
// utils/analytics.js
// Layboka AI Analytics Engine
// Production Version
// Updated 1Jun, 2026
// ======================================

const Client =
  require("../models/Client");

// ======================================
// SAVE EVENT
// ======================================

async function saveEvent({

  clientId,

  type,

  value = 0,

  product = "",

  country = "US",

  message = "",

  email = "",

  plan = ""

}){

  try{

    if(!clientId){

      return false;

    }

    const client =
      await Client.findById(
        clientId
      );

    if(!client){

      return false;

    }

    // ==================================
    // CREATE ANALYTICS ARRAY
    // ==================================

    if(!client.analytics){

      client.analytics = [];

    }

    client.analytics.push({

      type,

      value,

      product,

      country,

      message,

      email,

      plan,

      createdAt:
        new Date()

    });

    // ==================================
    // UPDATE DASHBOARD STATS
    // ==================================

    if(type === "chat"){

      client.messages =
        (client.messages || 0) + 1;

    }

    if(type === "sale"){

      client.orders =
        (client.orders || 0) + 1;

      client.revenue =
        Number(
          client.revenue || 0
        ) +
        Number(value || 0);

    }

    if(type === "abandoned_cart"){

      client.checkoutVisits =
        (client.checkoutVisits || 0) + 1;

    }

    if(type === "recovered_cart"){

      client.recoveredCarts =
        (client.recoveredCarts || 0) + 1;

      client.recoveredRevenue =
        Number(
          client.recoveredRevenue || 0
        ) +
        Number(value || 0);

    }

    await client.save();

    return true;

  }catch(err){

    console.log(
      "ANALYTICS SAVE ERROR:",
      err.message
    );

    return false;

  }

}

// ======================================
// GET ANALYTICS
// ======================================

async function getAnalytics(

  clientId

){

  try{

    const client =
      await Client.findById(
        clientId
      );

    if(!client){

      return null;

    }

    const analytics =
      client.analytics || [];

    let totalRevenue = 0;

    let totalOrders = 0;

    let totalChats = 0;

    let abandonedCarts = 0;

    let recoveredCarts = 0;

    const productMap = {};

    analytics.forEach(

      (item)=>{

        if(

          item.type === "sale"

        ){

          totalRevenue +=
            Number(
              item.value || 0
            );

          totalOrders++;

        }

        if(

          item.type === "chat"

        ){

          totalChats++;

        }

        if(

          item.type ===
          "abandoned_cart"

        ){

          abandonedCarts++;

        }

        if(

          item.type ===
          "recovered_cart"

        ){

          recoveredCarts++;

        }

        if(item.product){

          if(

            !productMap[
              item.product
            ]

          ){

            productMap[
              item.product
            ] = 0;

          }

          productMap[
            item.product
          ]++;

        }

      }

    );

    // ==================================
    // TOP PRODUCTS
    // ==================================

    const topProducts =

      Object.entries(
        productMap
      )

      .sort(
        (a,b)=>
          b[1] - a[1]
      )

      .slice(0,5)

      .map(
        ([name,count])=>({

          product:name,

          views:count

        })
      );

    // ==================================
    // CONVERSION RATE
    // ==================================

    const conversionRate =

      totalChats > 0

      ?

      Number(

        (
          (
            totalOrders /
            totalChats
          ) * 100
        )
        .toFixed(2)

      )

      :

      0;

    // ==================================
    // RETURN
    // ==================================

    return {

      totalRevenue,

      totalOrders,

      totalChats,

      abandonedCarts,

      recoveredCarts,

      conversionRate,

      topProducts,

      dashboard:{

        messages:
          client.messages || 0,

        revenue:
          client.revenue || 0,

        orders:
          client.orders || 0,

        recoveredRevenue:
          client.recoveredRevenue || 0,

        recoveredCarts:
          client.recoveredCarts || 0,

        aiInfluencedRevenue:
          client.aiInfluencedRevenue || 0

      }

    };

  }catch(err){

    console.log(
      "ANALYTICS FETCH ERROR:",
      err.message
    );

    return null;

  }

}

// ======================================
// EXPORTS
// ======================================

module.exports = {

  saveEvent,

  getAnalytics

};
