// ======================================
// utils/storeInsights.js
// AI Store Insights Engine
// ======================================

// ======================================
// GENERATE INSIGHTS
// ======================================

function generateInsights({

  orders = [],

  chats = 0,

  revenue = 0,

  visitors = 0

}){

  try{

    const insights = [];

    // ====================================
    // CONVERSION
    // ====================================

    const conversionRate =

      visitors > 0

      ? ((orders.length / visitors) * 100)

      : 0;

    // ====================================
    // AVG ORDER VALUE
    // ====================================

    const avgOrderValue =

      orders.length > 0

      ? revenue / orders.length

      : 0;

    // ====================================
    // AI ANALYSIS
    // ====================================

    if(conversionRate < 2){

      insights.push({

        type:"conversion",

        priority:"high",

        message:
        "⚠️ Your conversion rate is low. Enable AI upsells and cart recovery."

      });

    }

    if(avgOrderValue < 80){

      insights.push({

        type:"upsell",

        priority:"medium",

        message:
        "🎁 Bundle offers can increase average order value."

      });

    }

    if(chats > 100){

      insights.push({

        type:"chatbot",

        priority:"high",

        message:
        "🤖 Your chatbot engagement is strong. Enable AI automation flows."

      });

    }

    if(revenue > 10000){

      insights.push({

        type:"vip",

        priority:"high",

        message:
        "👑 Create VIP loyalty rewards for repeat buyers."

      });

    }

    // ====================================
    // SALES TREND
    // ====================================

    insights.push({

      type:"sales",

      priority:"medium",

      message:
      `📈 Revenue analyzed: $${revenue}`

    });

    return {

      success:true,

      metrics:{

        revenue,

        orders:
          orders.length,

        chats,

        visitors,

        conversionRate:
          Number(
            conversionRate.toFixed(2)
          ),

        avgOrderValue:
          Number(
            avgOrderValue.toFixed(2)
          )

      },

      insights

    };

  }catch(err){

    console.log(
      "INSIGHTS ERROR:",
      err
    );

    return {

      success:false

    };

  }

}

// ======================================
// EXPORTS
// ======================================

module.exports = {

  generateInsights

};
