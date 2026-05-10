// ======================================
// utils/geo.js
// Real-Time Geo Detection
// Production Ready
// ======================================

require("dotenv").config();

const fetch =
  require("node-fetch");

// ======================================
// GET CLIENT IP
// ======================================

function getClientIP(req){

  return (

    req.headers["x-forwarded-for"]

    ||

    req.connection.remoteAddress

    ||

    req.socket.remoteAddress

    ||

    req.ip

    ||

    ""

  )

  .split(",")[0]

  .trim();

}

// ======================================
// GET GEO LOCATION
// ======================================

async function getGeoData(ip){

  try{

    // ======================================
    // LOCALHOST FALLBACK
    // ======================================

    if(

      ip === "::1" ||

      ip === "127.0.0.1" ||

      ip.includes("192.168")

    ){

      return {

        success:true,

        country:"IN",

        country_name:"India",

        city:"Lucknow",

        currency:"INR",

        timezone:
          "Asia/Kolkata"

      };

    }

    // ======================================
    // API REQUEST
    // ======================================

    const url =

      `https://ipapi.co/${ip}/json/`;

    const response =
      await fetch(url);

    const data =
      await response.json();

    // ======================================
    // RESULT
    // ======================================

    return {

      success:true,

      ip,

      city:
        data.city || "",

      region:
        data.region || "",

      country:
        data.country || "US",

      country_name:
        data.country_name || "",

      currency:
        data.currency || "USD",

      timezone:
        data.timezone || "UTC",

      latitude:
        data.latitude,

      longitude:
        data.longitude,

      org:
        data.org || ""

    };

  }catch(err){

    console.log(
      "❌ Geo Error:",
      err.message
    );

    return {

      success:false,

      country:"US",

      currency:"USD",

      timezone:"UTC"

    };

  }

}

// ======================================
// GET COUNTRY FLAG
// ======================================

function getCountryFlag(

  countryCode = "US"

){

  try{

    return countryCode

      .toUpperCase()

      .replace(

        /./g,

        char =>

          String.fromCodePoint(

            127397 +

            char.charCodeAt()

          )

      );

  }catch(err){

    return "🌍";

  }

}

// ======================================
// IS INDIA USER
// ======================================

function isIndianUser(

  countryCode

){

  return (

    countryCode === "IN"

  );

}

// ======================================
// GET LANGUAGE
// ======================================

function detectLanguage(

  countryCode

){

  const map = {

    IN:"en",

    US:"en",

    GB:"en",

    FR:"fr",

    DE:"de",

    ES:"es",

    IT:"it",

    AE:"ar"

  };

  return map[countryCode]

    ||

    "en";

}

// ======================================
// EXPORTS
// ======================================

module.exports = {

  getClientIP,

  getGeoData,

  getCountryFlag,

  isIndianUser,

  detectLanguage

};
