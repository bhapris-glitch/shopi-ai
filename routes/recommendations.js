// ======================================
// routes/recommendations.js
// ======================================

const express =
require("express");

const {
  smartRecommendations
} = require(
  "../utils/recommendationEngine"
);

const router =
express.Router();

// ======================================
// RECOMMEND
// ======================================

router.post(
  "/recommendations",
  async(req,res)=>{

    try{

      const result =
        smartRecommendations(
          req.body
        );

      res.json({

        success:true,
        recommendations:result

      });

    }catch(err){

      console.log(err);

      res.status(500).json({

        success:false

      });

    }

  }
);

module.exports = router;
