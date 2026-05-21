// ======================================
// utils/geo.js
// Detect Visitor Country
// ======================================

const fetch = require("node-fetch");

// ======================================
// COUNTRY DETECTION
// ======================================

async function detectCountry(ip){

  try{

    // ======================================
    // LOCALHOST
    // ======================================

    if(

      !ip ||

      ip.includes("127.0.0.1") ||

      ip.includes("localhost")

    ){

      return {

        success:true,

        country:"US"

      };

    }

    // ======================================
    // CLEAN IP
    // ======================================

    ip = ip.replace("::ffff:","");

    // ======================================
    // GEO API
    // ======================================

    const response =
      await fetch(

        `http://ip-api.com/json/${ip}`

      );

    const data =
      await response.json();

    // ======================================
    // RESULT
    // ======================================

    if(data?.countryCode){

      return {

        success:true,

        country:data.countryCode

      };

    }

    return {

      success:false,

      country:"US"

    };

  }catch(err){

    console.log(
      "❌ GEO ERROR:",
      err.message
    );

    return {

      success:false,

      country:"US"

    };

  }

}

// ======================================
// EXPORTS
// ======================================

module.exports = {

  detectCountry

};
