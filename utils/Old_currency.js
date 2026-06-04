// ======================================
// utils/currency.js
// Production Global Currency System
// USD BASED
// ======================================

require("dotenv").config();

const fetch = require("node-fetch");

// ======================================
// BASE CURRENCY
// ======================================

const BASE_CURRENCY = "USD";

// ======================================
// SUPPORTED CURRENCIES
// ======================================

const currencyMap = {

  US:"USD",
  GB:"GBP",
  CA:"CAD",
  AU:"AUD",

  // EUROPE
  FR:"EUR",
  DE:"EUR",
  ES:"EUR",
  IT:"EUR",
  NL:"EUR",

  // DEFAULT
  DEFAULT:"USD"

};

// ======================================
// SYMBOLS
// ======================================

const symbols = {

  USD:"$",
  GBP:"£",
  EUR:"€",
  CAD:"C$",
  AUD:"A$"

};

// ======================================
// STATIC FALLBACK RATES
// ======================================

const fallbackRates = {

  USD:1,

  GBP:0.79,

  EUR:0.92,

  CAD:1.36,

  AUD:1.52

};

// ======================================
// GET USER CURRENCY
// ======================================

function getCurrencyFromCountry(country){

  return (
    currencyMap[country]
    ||
    currencyMap.DEFAULT
  );

}

// ======================================
// SYMBOL
// ======================================

function getCurrencySymbol(currency){

  return symbols[currency] || "$";

}

// ======================================
// LIVE CONVERSION
// ======================================

async function convertPrice({

  amount,
  from = "USD",
  to = "USD"

}){

  try{

    if(from === to){

      return {

        success:true,
        amount,
        currency:to,
        symbol:getCurrencySymbol(to)

      };

    }

    // ======================================
    // FREE LIVE API
    // ======================================

    const response = await fetch(

      `https://open.er-api.com/v6/latest/${from}`

    );

    const data = await response.json();

    // ======================================
    // LIVE RATE
    // ======================================

    if(

      data &&
      data.rates &&
      data.rates[to]

    ){

      const rate = data.rates[to];

      const converted =
        amount * rate;

      return {

        success:true,

        amount:Number(
          converted.toFixed(2)
        ),

        currency:to,

        symbol:getCurrencySymbol(to)

      };

    }

    // ======================================
    // FALLBACK RATE
    // ======================================

    if(fallbackRates[to]){

      const converted =
        amount *
        fallbackRates[to];

      return {

        success:true,

        amount:Number(
          converted.toFixed(2)
        ),

        currency:to,

        symbol:getCurrencySymbol(to)

      };

    }

    return {

      success:false,
      amount,
      currency:from,
      symbol:getCurrencySymbol(from)

    };

  }catch(err){

    console.log(
      "❌ Currency Error:",
      err.message
    );

    // ======================================
    // FALLBACK
    // ======================================

    if(fallbackRates[to]){

      const converted =
        amount *
        fallbackRates[to];

      return {

        success:true,

        amount:Number(
          converted.toFixed(2)
        ),

        currency:to,

        symbol:getCurrencySymbol(to)

      };

    }

    return {

      success:false,
      amount,
      currency:from,
      symbol:getCurrencySymbol(from)

    };

  }

}

// ======================================
// FORMAT PRICE
// ======================================

function formatPrice({

  amount,
  currency

}){

  try{

    return new Intl.NumberFormat(

      "en-US",

      {

        style:"currency",

        currency

      }

    ).format(amount);

  }catch(err){

    return (
      getCurrencySymbol(currency)
      + amount
    );

  }

}

// ======================================
// PLAN PRICING
// ======================================

async function getPlanPricing(

  countryCode = "US"

){

  try{

    const currency =
      getCurrencyFromCountry(
        countryCode
      );

    // ======================================
    // USD BASE PRICES
    // ======================================

    const starterUSD = 19;

    const growthUSD = 49;

    const scaleUSD = 99;

    // ======================================
    // CONVERT
    // ======================================

    const starter =
      await convertPrice({

        amount:starterUSD,
        from:"USD",
        to:currency

      });

    const growth =
      await convertPrice({

        amount:growthUSD,
        from:"USD",
        to:currency

      });

    const scale =
      await convertPrice({

        amount:scaleUSD,
        from:"USD",
        to:currency

      });

    return {

      success:true,

      currency,

      starter:{

        raw:starter.amount,

        formatted:
          formatPrice({

            amount:starter.amount,
            currency

          })

      },

      growth:{

        raw:growth.amount,

        formatted:
          formatPrice({

            amount:growth.amount,
            currency

          })

      },

      scale:{

        raw:scale.amount,

        formatted:
          formatPrice({

            amount:scale.amount,
            currency

          })

      }

    };

  }catch(err){

    console.log(
      "❌ Pricing Error:",
      err.message
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

  BASE_CURRENCY,

  getCurrencyFromCountry,

  getCurrencySymbol,

  convertPrice,

  formatPrice,

  getPlanPricing

};
