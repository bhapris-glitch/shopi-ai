// ======================================
// routes/storeInsights.js
// AI Store Insights API
// ======================================

const express =
require("express");

const router =
express.Router();

const {

  generateInsights

} = require(
  "../utils/storeInsights"
);

// ======================================
// GET INSIGHTS
// ======================================

router.post(

  "/store-insights",

  async(req,res)=>{

    try{

      const {

        orders,

        chats,

        revenue,

        visitors

      } = req.body;

      const insights =
        generateInsights({

          orders,

          chats,

          revenue,

          visitors

        });

      res.json(insights);

    }catch(err){

      console.log(
        "STORE INSIGHTS ERROR:",
        err
      );

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

  "/store-insights/test",

  async(req,res)=>{

    const insights =
      generateInsights({

        orders:[
          { total:120 },
          { total:220 },
          { total:180 }
        ],

        chats:350,

        revenue:12500,

        visitors:4000

      });

    res.json(insights);

  }

);

module.exports = router;
