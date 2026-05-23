// ======================================
// routes/discord.js
// Layboka AI Discord Integration
// ======================================

const express =
require("express");

const router =
express.Router();

// ======================================
// DISCORD BOT MESSAGE
// ======================================

router.post(

  "/discord/message",

  async(req,res)=>{

    try{

      const {

        username,
        message

      } = req.body;

      console.log(
        "Discord:",
        username,
        message
      );

      res.json({

        success:true,

        reply:
        "🚀 Layboka AI Discord assistant active."

      });

    }catch(err){

      console.log(
        "DISCORD ERROR:",
        err
      );

      res.status(500).json({

        success:false

      });

    }

  }

);

module.exports = router;
