// ======================================
// utils/pricing.js
// Enterprise SaaS Pricing Engine
// ======================================

const {
  getPlanPricing
} = require("./currency");

// ======================================
// PLAN CONFIG
// ======================================

const PLAN_CONFIG = Object.freeze({

  starter: Object.freeze({

    name: "Starter",

    popular: false,

    sortOrder: 1,

    limits: Object.freeze({

      chats: 1000,
      stores: 1,
      teamMembers: 1

    }),

    billing: Object.freeze({

      stripePriceIdMonthly:
        process.env.STRIPE_STARTER_MONTHLY || "",

      stripePriceIdYearly:
        process.env.STRIPE_STARTER_YEARLY || "",

      razorpayPlanIdMonthly:
        process.env.RAZORPAY_STARTER_MONTHLY || "",

      razorpayPlanIdYearly:
        process.env.RAZORPAY_STARTER_YEARLY || ""

    }),

    features: Object.freeze([

      "AI Chatbot",
      "Product Recommendations",
      "Currency Detection",
      "Basic Analytics",
      "1000 Monthly Chats"

    ])

  }),

  growth: Object.freeze({

    name: "Growth",

    popular: true,

    sortOrder: 2,

    limits: Object.freeze({

      chats: 10000,
      stores: 1,
      teamMembers: 5

    }),

    billing: Object.freeze({

      stripePriceIdMonthly:
        process.env.STRIPE_GROWTH_MONTHLY || "",

      stripePriceIdYearly:
        process.env.STRIPE_GROWTH_YEARLY || "",

      razorpayPlanIdMonthly:
        process.env.RAZORPAY_GROWTH_MONTHLY || "",

      razorpayPlanIdYearly:
        process.env.RAZORPAY_GROWTH_YEARLY || ""

    }),

    features: Object.freeze([

      "Everything in Starter",
      "Real Shopify Product Sync",
      "AI Upsells",
      "Cart Recovery",
      "Email Reminders",
      "10000 Monthly Chats"

    ])

  }),

  scale: Object.freeze({

    name: "Scale",

    popular: false,

    sortOrder: 3,

    limits: Object.freeze({

      chats: -1,
      stores: 5,
      teamMembers: 25

    }),

    billing: Object.freeze({

      stripePriceIdMonthly:
        process.env.STRIPE_SCALE_MONTHLY || "",

      stripePriceIdYearly:
        process.env.STRIPE_SCALE_YEARLY || "",

      razorpayPlanIdMonthly:
        process.env.RAZORPAY_SCALE_MONTHLY || "",

      razorpayPlanIdYearly:
        process.env.RAZORPAY_SCALE_YEARLY || ""

    }),

    features: Object.freeze([

      "Everything in Growth",
      "Unlimited Chats",
      "Priority Support",
      "Multi Store",
      "Advanced AI Analytics",
      "VIP Customer Tracking"

    ])

  })

});

// ======================================
// VALIDATION
// ======================================

function validatePricing(pricing) {

  const plans = Object.keys(PLAN_CONFIG);

  for (const plan of plans) {

    if (!pricing[plan]) {

      throw new Error(
        `Missing pricing for ${plan}`
      );

    }

    if (
      pricing[plan].monthly === undefined ||
      pricing[plan].yearly === undefined
    ) {

      throw new Error(
        `Invalid pricing structure for ${plan}`
      );

    }

  }

  return true;

}

// ======================================
// BUILD PLAN
// ======================================

function buildPlan(
  planId,
  config,
  pricingData
) {

  return {

    id: planId,

    name: config.name,

    popular: config.popular,

    sortOrder: config.sortOrder,

    features: [...config.features],

    limits: {

      ...config.limits

    },

    billing: {

      ...config.billing

    },

    pricing: {

      monthly: {

        formatted:
          pricingData.monthly.formatted,

        raw:
          pricingData.monthly.raw

      },

      yearly: {

        formatted:
          pricingData.yearly.formatted,

        raw:
          pricingData.yearly.raw

      }

    }

  };

}

// ======================================
// MAIN BUILDER
// ======================================

async function buildPricing(country = "US") {

  try {

    const pricing =
      await getPlanPricing(country);

    validatePricing(pricing);

    const plans = Object.entries(
      PLAN_CONFIG
    )
      .sort(
        ([, a], [, b]) =>
          a.sortOrder - b.sortOrder
      )
      .map(
        ([planId, config]) =>
          buildPlan(
            planId,
            config,
            pricing[planId]
          )
      );

    return {

      success: true,

      country,

      currency:
        pricing.currency,

      plans

    };

  } catch (error) {

    console.error(
      "[PRICING ENGINE]",
      error
    );

    return {

      success: false,

      country,

      message:
        "Unable to load pricing",

      plans: []

    };

  }

}

// ======================================
// GET SINGLE PLAN
// ======================================

async function getPlan(
  planId,
  country = "US"
) {

  const result =
    await buildPricing(country);

  if (!result.success)
    return null;

  return (
    result.plans.find(
      plan => plan.id === planId
    ) || null
  );

}

// ======================================
// PLAN EXISTENCE
// ======================================

function planExists(planId) {

  return Boolean(
    PLAN_CONFIG[planId]
  );

}

// ======================================
// GET PLAN LIMITS
// ======================================

function getPlanLimits(planId) {

  return (
    PLAN_CONFIG[planId]?.limits ||
    null
  );

}

// ======================================
// GET FEATURES
// ======================================

function getPlanFeatures(planId) {

  return (
    PLAN_CONFIG[planId]?.features ||
    []
  );

}

// ======================================
// EXPORTS
// ======================================

module.exports = {

  buildPricing,

  getPlan,

  getPlanLimits,

  getPlanFeatures,

  planExists,

  PLAN_CONFIG

};
