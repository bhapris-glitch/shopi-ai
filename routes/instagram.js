// ======================================
// routes/instagram.js
// ======================================

const express = require("express");

const router = express.Router();

const {
  generateAIReply
} = require("../utils/aiReply");

router.post(
  "/instagram/webhook",
  async(req,res)=>{

    try{

      const text =
        req.body.message || "";

      const reply =
        await generateAIReply({

          message:text,

          platform:"Instagram"

        });

      res.json({

        success:true,
        reply

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
