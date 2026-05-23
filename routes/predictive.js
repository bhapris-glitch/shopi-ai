// ======================================
// routes/predictive.js
// ======================================

const express =
require("express");

const {
  predictNextPurchase
} = require(
  "../utils/predictiveSales"
);

const router =
express.Router();

// ======================================
// PREDICT
// ======================================

router.post(
  "/predict",
  async(req,res)=>{

    try{

      const result =
        predictNextPurchase(
          req.body
        );

      res.json({

        success:true,
        prediction:result

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
