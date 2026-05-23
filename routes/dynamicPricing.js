// ======================================
// routes/dynamicPricing.js
// AI Dynamic Pricing API
// Production Ready
// ======================================

const express =
require("express");

const router =
express.Router();

const {

  generateDynamicOffer,

  calculateFinalPrice

} = require(
  "../utils/dynamicPricing"
);

// ======================================
// GET DYNAMIC OFFER
// ======================================

router.post(

  "/dynamic-pricing",

  async(req,res)=>{

    try{

      const {

        country,

        cartValue,

        customerType,

        conversionScore,

        abandonedCart,

        viewedProducts,

        totalOrders

      } = req.body;

      // ================================
      // GENERATE OFFER
      // ================================

      const offer =

        generateDynamicOffer({

          country,

          cartValue,

          customerType,

          conversionScore,

          abandonedCart,

          viewedProducts,

          totalOrders

        });

      res.json({

        success:true,

        offer

      });

    }catch(err){

      console.log(
        "DYNAMIC API ERROR:",
        err
      );

      res.status(500).json({

        success:false,

        error:
          "Dynamic pricing failed"

      });

    }

  }

);

// ======================================
// FINAL PRICE API
// ======================================

router.post(

  "/calculate-price",

  async(req,res)=>{

    try{

      const {

        originalPrice,

        discount

      } = req.body;

      const pricing =

        calculateFinalPrice({

          originalPrice,

          discount

        });

      res.json({

        success:true,

        pricing

      });

    }catch(err){

      console.log(
        "PRICE API ERROR:",
        err
      );

      res.status(500).json({

        success:false

      });

    }

  }

);

// ======================================
// TEST ROUTE
// ======================================

router.get(

  "/dynamic-pricing/test",

  (req,res)=>{

    const sample =

      generateDynamicOffer({

        country:"US",

        cartValue:350,

        customerType:"gold",

        conversionScore:82,

        abandonedCart:true,

        viewedProducts:7,

        totalOrders:8

      });

    res.json({

      success:true,

      sample

    });

  }

);

module.exports = router;
