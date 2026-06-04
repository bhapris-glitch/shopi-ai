// ======================================
// utils/currency.js
// Layboka AI
// Enterprise Currency & Pricing Engine
// Updated 05Jun,2026
// ======================================

require("dotenv").config();

const fetch = require("node-fetch");

// ======================================
// CONFIG
// ======================================

const BASE_CURRENCY = "USD";

const CACHE_TTL_MS =
  60 * 60 * 1000; // 1 hour

const REQUEST_TIMEOUT_MS =
  5000;

// ======================================
// SUPPORTED COUNTRIES
// ======================================

const COUNTRY_CURRENCY_MAP =
  Object.freeze({

    US: "USD",
    GB: "GBP",
    CA: "CAD",
    AU: "AUD",
    IN: "INR",

    DEFAULT: "USD"

  });

// ======================================
// SYMBOLS
// ======================================

const CURRENCY_SYMBOLS =
  Object.freeze({

    USD: "$",
    GBP: "£",
    CAD: "C$",
    AUD: "A$",
    INR: "₹"

  });

// ======================================
// PLAN PRICES (USD BASE)
// ======================================

const PLAN_PRICES =
  Object.freeze({

    starter: Object.freeze({

      monthly: 19

    }),

    growth: Object.freeze({

      monthly: 49

    }),

    scale: Object.freeze({

      monthly: 99

    })

  });

// ======================================
// YEARLY DISCOUNT
// ======================================

const YEARLY_DISCOUNT_PERCENT =
  Number(
    process.env
      .YEARLY_DISCOUNT_PERCENT || 20
  );

// ======================================
// FALLBACK RATES
// ======================================

const FALLBACK_RATES =
  Object.freeze({

    USD: 1,
    GBP: 0.79,
    CAD: 1.36,
    AUD: 1.52,
    INR: 83.50

  });

// ======================================
// MEMORY CACHE
// ======================================

let ratesCache = {

  timestamp: 0,

  rates: FALLBACK_RATES

};

// ======================================
// HELPERS
// ======================================

function getCurrencyFromCountry(
  countryCode = "US"
) {

  return (
    COUNTRY_CURRENCY_MAP[
      String(countryCode)
        .toUpperCase()
    ] ||
    COUNTRY_CURRENCY_MAP.DEFAULT
  );

}

function getCurrencySymbol(
  currency
) {

  return (
    CURRENCY_SYMBOLS[currency] ||
    "$"
  );

}

// ======================================
// FORMAT PRICE
// ======================================

function formatPrice({

  amount,
  currency

}) {

  try {

    return new Intl.NumberFormat(

      "en-US",

      {

        style: "currency",

        currency

      }

    ).format(amount);

  } catch {

    return (
      getCurrencySymbol(currency) +
      amount
    );

  }

}

// ======================================
// FETCH RATES
// ======================================

async function fetchExchangeRates() {

  const now = Date.now();

  if (

    ratesCache.rates &&
    (
      now -
      ratesCache.timestamp
    ) < CACHE_TTL_MS

  ) {

    return ratesCache.rates;

  }

  try {

    const controller =
      new AbortController();

    const timeout =
      setTimeout(() => {

        controller.abort();

      }, REQUEST_TIMEOUT_MS);

    const response =
      await fetch(

        `https://open.er-api.com/v6/latest/${BASE_CURRENCY}`,

        {

          signal:
            controller.signal

        }

      );

    clearTimeout(timeout);

    const data =
      await response.json();

    if (

      data &&
      data.rates &&
      typeof data.rates ===
        "object"

    ) {

      ratesCache = {

        timestamp:
          Date.now(),

        rates:
          data.rates

      };

      return data.rates;

    }

    return FALLBACK_RATES;

  } catch (err) {

    console.error(
      "[CURRENCY]",
      err.message
    );

    return FALLBACK_RATES;

  }

}

// ======================================
// CONVERT
// ======================================

async function convertAmount({

  amount,

  toCurrency = "USD"

}) {

  const rates =
    await fetchExchangeRates();

  const rate =
    rates[toCurrency];

  if (

    typeof rate !==
      "number" ||

    rate <= 0

  ) {

    return amount;

  }

  return Number(
    (amount * rate)
      .toFixed(2)
  );

}

// ======================================
// BUILD PRICE OBJECT
// ======================================

function createPriceObject({

  amount,

  currency

}) {

  return {

    raw: amount,

    formatted:
      formatPrice({

        amount,
        currency

      })

  };

}

// ======================================
// YEARLY PRICE
// ======================================

function calculateYearlyPrice(
  monthlyPrice
) {

  const fullYear =

    monthlyPrice * 12;

  const discount =

    fullYear *

    (
      YEARLY_DISCOUNT_PERCENT
      / 100
    );

  return Number(

    (
      fullYear -
      discount
    ).toFixed(2)

  );

}

// ======================================
// BUILD PLAN
// ======================================

async function buildPlanPricing({

  monthlyUSD,

  currency

}) {

  const yearlyUSD =
    calculateYearlyPrice(
      monthlyUSD
    );

  const monthly =
    await convertAmount({

      amount:
        monthlyUSD,

      toCurrency:
        currency

    });

  const yearly =
    await convertAmount({

      amount:
        yearlyUSD,

      toCurrency:
        currency

    });

  return {

    monthly:
      createPriceObject({

        amount:
          monthly,

        currency

      }),

    yearly:
      createPriceObject({

        amount:
          yearly,

        currency

      })

  };

}

// ======================================
// MAIN PRICING BUILDER
// ======================================

async function getPlanPricing(

  countryCode = "US"

) {

  const currency =
    getCurrencyFromCountry(
      countryCode
    );

  const starter =
    await buildPlanPricing({

      monthlyUSD:
        PLAN_PRICES
          .starter
          .monthly,

      currency

    });

  const growth =
    await buildPlanPricing({

      monthlyUSD:
        PLAN_PRICES
          .growth
          .monthly,

      currency

    });

  const scale =
    await buildPlanPricing({

      monthlyUSD:
        PLAN_PRICES
          .scale
          .monthly,

      currency

    });

  return {

    success: true,

    currency,

    yearlyDiscount:
      YEARLY_DISCOUNT_PERCENT,

    starter,

    growth,

    scale

  };

}

// ======================================
// EXPORTS
// ======================================

module.exports = {

  BASE_CURRENCY,

  PLAN_PRICES,

  YEARLY_DISCOUNT_PERCENT,

  getCurrencyFromCountry,

  getCurrencySymbol,

  formatPrice,

  convertAmount,

  getPlanPricing

};
