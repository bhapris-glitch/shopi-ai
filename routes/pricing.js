const express =
require("express");

const router =
express.Router();

const {
  detectCountry
} = require("../utils/geo");

const {
  buildPricing
} = require("../utils/pricing");

// ======================================
// GET LIVE PRICING
// ======================================

router.get(
  "/pricing",
  async(req,res)=>{

    try{

      const ip =

        req.headers[
          "x-forwarded-for"
        ] ||

        req.socket.remoteAddress ||

        "";

      const geo =
        await detectCountry(ip);

      const pricing =
        await buildPricing(
          geo.country
        );

      res.json(pricing);

    }catch(err){

      console.log(err);

      res.status(500).json({

        success:false

      });

    }

  }
);

module.exports =
router;
