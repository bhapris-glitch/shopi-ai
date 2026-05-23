// ======================================
// routes/telegram.js
// Layboka AI Telegram Bot
// ======================================

const express =
require("express");

const router =
express.Router();

// ======================================
// TELEGRAM MESSAGE
// ======================================

router.post(

  "/telegram/webhook",

  async(req,res)=>{

    try{

      const message =

        req.body?.message
        ?.text || "";

      const user =

        req.body?.message
        ?.from?.username || "User";

      console.log(
        "Telegram:",
        user,
        message
      );

      const reply =
      "🤖 Layboka AI received your Telegram message.";

      res.json({

        success:true,
        reply

      });

    }catch(err){

      console.log(
        "TELEGRAM ERROR:",
        err
      );

      res.status(500).json({

        success:false

      });

    }

  }

);

module.exports = router;
