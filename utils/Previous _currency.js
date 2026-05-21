// ======================================
// utils/currency.js
// Real-Time Currency Helper
// Production Ready
// ======================================

require("dotenv").config();

const fetch =
  require("node-fetch");

// ======================================
// CURRENCY SYMBOLS
// ======================================

const symbols = {

  INR:"₹",

  USD:"$",

  EUR:"€",

  GBP:"£",

  AED:"د.إ",

  AUD:"A$",

  CAD:"C$"

};

// ======================================
// COUNTRY TO CURRENCY
// ======================================

const countryCurrency = {

  IN:"INR",

  US:"USD",

  GB:"GBP",

  AE:"AED",

  AU:"AUD",

  CA:"CAD",

  DE:"EUR",

  FR:"EUR",

  IT:"EUR",

  ES:"EUR"

};

// ======================================
// GET USER CURRENCY
// ======================================

function getCurrencyFromCountry(

  countryCode

){

  return (

    countryCurrency[countryCode]

    ||

    "USD"

  );

}

// ======================================
// GET SYMBOL
// ======================================

function getCurrencySymbol(

  currency

){

  return (

    symbols[currency]

    ||

    "$"

  );

}

// ======================================
// CONVERT PRICE
// ======================================

async function convertPrice({

  amount,

  from = "INR",

  to = "USD"

}){

  try{

    if(from === to){

      return {

        success:true,

        amount,

        currency:to,

        symbol:
          getCurrencySymbol(to)

      };

    }

    // =========================
    // FREE API
    // =========================

    const response =
      await fetch(

`https://open.er-api.com/v6/latest/${from}`

      );

    const data =
      await response.json();

    if(
      !data.rates ||
      !data.rates[to]
    ){

      throw new Error(
        "Rate not found"
      );

    }

    const rate =
      data.rates[to];

    const converted =
      amount * rate;

    return {

      success:true,

      amount:
        Number(
          converted.toFixed(2)
        ),

      currency:to,

      symbol:
        getCurrencySymbol(to)

    };

  }catch(err){

    console.log(
      "❌ Currency Error:",
      err.message
    );

    return {

      success:false,

      amount,

      currency:from,

      symbol:
        getCurrencySymbol(from)

    };

  }

}

    // ======================================
    // SAME CURRENCY
    // ======================================

    if(from === to){

      return {

        success:true,

        amount,

        currency:to,

        symbol:
          getCurrencySymbol(to)

      };

    }

    // ======================================
    // API CALL
    // ======================================

    const url =

      `https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`;

    const response =
      await fetch(url);

    const data =
      await response.json();

    // ======================================
    // RESULT
    // ======================================

    if(data.result){

      return {

        success:true,

        amount:
          Number(
            data.result.toFixed(2)
          ),

        currency:to,

        symbol:
          getCurrencySymbol(to)

      };

    }

    // ======================================
    // FALLBACK
    // ======================================

    return {

      success:false,

      amount,

      currency:from,

      symbol:
        getCurrencySymbol(from)

    };

  }catch(err){

    console.log(
      "❌ Currency Error:",
      err.message
    );

    return {

      success:false,

      amount,

      currency:from,

      symbol:
        getCurrencySymbol(from)

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

      +

      amount

    );

  }

}

// ======================================
// PLAN PRICES
// ======================================

async function getPlanPricing(

  countryCode = "US"

){

  try{

    // ======================================
    // BASE INR PRICE
    // ======================================

    const starterINR = 399;

    const premiumINR = 799;

    const currency =
      getCurrencyFromCountry(
        countryCode
      );

    // ======================================
    // CONVERT
    // ======================================

    const starter =
      await convertPrice({

        amount:starterINR,

        from:"INR",

        to:currency

      });

    const premium =
      await convertPrice({

        amount:premiumINR,

        from:"INR",

        to:currency

      });

    return {

      success:true,

      currency,

      starter:{

        raw:
          starter.amount,

        formatted:
          formatPrice({

            amount:
              starter.amount,

            currency
          })

      },

      premium:{

        raw:
          premium.amount,

        formatted:
          formatPrice({

            amount:
              premium.amount,

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

  getCurrencyFromCountry,

  getCurrencySymbol,

  convertPrice,

  formatPrice,

  getPlanPricing

};
