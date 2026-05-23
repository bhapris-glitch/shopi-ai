// ======================================
// routes/emailSequences.js
// ======================================

const express =
require("express");

const {
  generateSequence
} = require(
  "../utils/emailSequences"
);

const router =
express.Router();

// ======================================
// GENERATE
// ======================================

router.post(
  "/email-sequence",
  async(req,res)=>{

    try{

      const sequence =
        generateSequence(
          req.body
        );

      res.json({

        success:true,
        sequence

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
