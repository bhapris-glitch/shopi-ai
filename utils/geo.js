// ======================================
// utils/geo.js
// Detect User Country
// ======================================

const fetch =
  require("node-fetch");

async function detectCountry(ip){

  try{

    // localhost fallback
    if(
      !ip ||
      ip === "::1" ||
      ip.includes("127.0.0.1")
    ){

      return "US";

    }

    const response =
      await fetch(

        `http://ip-api.com/json/${ip}`

      );

    const data =
      await response.json();

    return (
      data.countryCode || "US"
    );

  }catch(err){

    console.log(
      "❌ GEO ERROR:",
      err.message
    );

    return "US";

  }

}

module.exports = {
  detectCountry
};
