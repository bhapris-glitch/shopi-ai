// ======================================
// utils/geo.js
// Detect Visitor Country
// Production Ready
// updated 1 Jun 2026
// =======================
===============

const fetch =
  require("node-fetch");

// ======================================
// DETECT COUNTRY
// ======================================

async function detectCountry(ip){

  try{

    // ====================================
    // LOCALHOST
    // ====================================

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

    // ====================================
    // CLEAN IP
    // ====================================

    ip =
      ip.replace(
        "::ffff:",
        ""
      );

    // ====================================
    // GEOLOOKUP
    // ====================================

    const response =
      await fetch(

        `https://ipapi.co/${ip}/json/`

      );

    const data =
      await response.json();

    if(data?.country_code){

      return {

        success:true,

        country:
          data.country_code

      };

    }

    return {

      success:false,

      country:"US"

    };

  }catch(err){

    console.log(

      "GEO ERROR:",

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
