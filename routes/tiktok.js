// ======================================
// routes/tiktok.js
// Layboka AI TikTok Integration
// ======================================

const express =
require("express");

const router =
express.Router();

// ======================================
// TIKTOK WEBHOOK
// ======================================

router.post(

  "/tiktok/webhook",

  async(req,res)=>{

    try{

      const {

        username,
        message

      } = req.body;

      console.log(
        "TikTok Message:",
        username,
        message
      );

      // ==================================
      // AI REPLY PLACEHOLDER
      // ==================================

      const reply =
      "🔥 Thanks for messaging us on TikTok.";

      res.json({

        success:true,
        reply

      });

    }catch(err){

      console.log(
        "TIKTOK ERROR:",
        err
      );

      res.status(500).json({

        success:false

      });

    }

  }

);

module.exports = router;
