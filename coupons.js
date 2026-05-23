// ======================================
// routes/coupons.js
// Layboka AI Coupons API
// ======================================

const express =
require("express");

const router =
express.Router();

const {

  createCoupon,

  calculateDiscount

} = require(
  "../utils/coupons"
);

// ======================================
// GENERATE COUPON
// ======================================

router.post(

  "/coupons/generate",

  async(req,res)=>{

    try{

      const {

        cartValue,

        customerType,

        country

      } = req.body;

      const coupon =
        createCoupon({

          cartValue,

          customerType,

          country

        });

      res.json(coupon);

    }catch(err){

      console.log(
        "COUPON ERROR:",
        err
      );

      res.status(500).json({

        success:false

      });

    }

  }

);

// ======================================
// QUICK DISCOUNT CHECK
// ======================================

router.get(

  "/coupons/discount",

  async(req,res)=>{

    try{

      const {

        cartValue,

        customerType,

        country

      } = req.query;

      const discount =
        calculateDiscount({

          cartValue:
            Number(cartValue || 0),

          customerType,

          country

        });

      res.json({

        success:true,

        discount

      });

    }catch(err){

      console.log(err);

      res.status(500).json({

        success:false

      });

    }

  }

);

// ======================================
// TEST API
// ======================================

router.get(

  "/coupons/test",

  async(req,res)=>{

    const coupon =
      createCoupon({

        cartValue:320,

        customerType:"vip",

        country:"US"

      });

    res.json({

      success:true,

      coupon

    });

  }

);

module.exports = router;
