// ======================================
// utils/pricing.js
// Global SaaS Pricing Engine
// ======================================

const {
  getPlanPricing
} = require("./currency");

// ======================================
// FEATURES
// ======================================

const PLAN_FEATURES = {

  starter:[

    "AI Chatbot",
    "Product Recommendations",
    "Currency Detection",
    "Basic Analytics",
    "1000 Monthly Chats"

  ],

  growth:[

    "Everything in Starter",
    "Real Shopify Product Sync",
    "AI Upsells",
    "Cart Recovery",
    "Email Reminders",
    "10000 Monthly Chats"

  ],

  scale:[

    "Everything in Growth",
    "Unlimited Chats",
    "Priority Support",
    "Multi Store",
    "Advanced AI Analytics",
    "VIP Customer Tracking"

  ]

};

// ======================================
// GET PRICING
// ======================================

async function buildPricing(country){

  const pricing =
    await getPlanPricing(country);

  return {

    success:true,

    currency:
      pricing.currency,

    plans:[

      {

        id:"starter",

        name:"Starter",

        price:
          pricing.starter.formatted,

        raw:
          pricing.starter.raw,

        popular:false,

        features:
          PLAN_FEATURES.starter

      },

      {

        id:"growth",

        name:"Growth",

        price:
          pricing.growth.formatted,

        raw:
          pricing.growth.raw,

        popular:true,

        features:
          PLAN_FEATURES.growth

      },

      {

        id:"scale",

        name:"Scale",

        price:
          pricing.scale.formatted,

        raw:
          pricing.scale.raw,

        popular:false,

        features:
          PLAN_FEATURES.scale

      }

    ]

  };

}

module.exports = {

  buildPricing

};
