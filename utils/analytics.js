// ======================================
// utils/analytics.js
// Real-Time AI Analytics Engine
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
  country = "US"

}){

  try{

    const client =
      await Client.findById(clientId);

    if(!client){
      return;
    }

    if(!client.analytics){

      client.analytics = [];

    }

    client.analytics.push({

      type,
      value,
      product,
      country,
      createdAt:new Date()

    });

    await client.save();

  }catch(err){

    console.log(
      "Analytics Error:",
      err.message
    );

  }

}

// ======================================
// GET ANALYTICS
// ======================================

async function getAnalytics(clientId){

  try{

    const client =
      await Client.findById(clientId);

    if(!client){

      return null;

    }

    const analytics =
      client.analytics || [];

    let totalRevenue = 0;

    let totalOrders = 0;

    let totalChats = 0;

    let abandonedCarts = 0;

    const productMap = {};

    analytics.forEach((item)=>{

      if(item.type === "sale"){

        totalRevenue +=
          Number(item.value || 0);

        totalOrders++;

      }

      if(item.type === "chat"){

        totalChats++;

      }

      if(item.type === "abandoned_cart"){

        abandonedCarts++;

      }

      if(item.product){

        if(!productMap[item.product]){

          productMap[item.product] = 0;

        }

        productMap[item.product]++;

      }

    });

    const topProducts =
      Object.entries(productMap)

      .sort((a,b)=>b[1]-a[1])

      .slice(0,5);

    return {

      totalRevenue:
        totalRevenue.toFixed(2),

      totalOrders,

      totalChats,

      abandonedCarts,

      conversionRate:

        totalChats > 0

        ?

        (
          totalOrders /
          totalChats
        ) * 100

        :

        0,

      topProducts

    };

  }catch(err){

    console.log(err);

    return null;

  }

}

module.exports = {

  saveEvent,
  getAnalytics

};
