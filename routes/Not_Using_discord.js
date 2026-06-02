// ======================================
// routes/discord.js
// Layboka AI Discord Integration
// Production Ready
// updated 2 Jun, 2926 
// NOT IN USE
// ======================================

require("dotenv").config();

const express = require("express");
const axios = require("axios");

const router = express.Router();

// ======================================
// SEND MESSAGE TO DISCORD WEBHOOK
// ======================================

async function sendDiscordMessage({

  username = "Layboka AI",
  message,
  embed = null

}){

  try{

    if(!process.env.DISCORD_WEBHOOK_URL){

      throw new Error(
        "DISCORD_WEBHOOK_URL missing"
      );

    }

    const payload = {

      username,

      content: message || ""

    };

    if(embed){

      payload.embeds = [embed];

    }

    await axios.post(

      process.env.DISCORD_WEBHOOK_URL,

      payload

    );

    return {

      success:true

    };

  }catch(err){

    console.log(

      "Discord Send Error:",

      err.message

    );

    return {

      success:false,

      error:err.message

    };

  }

}

// ======================================
// SEND SIMPLE MESSAGE
// ======================================

router.post(

  "/discord/message",

  async(req,res)=>{

    try{

      const {

        username,

        message

      } = req.body;

      if(!message){

        return res.status(400).json({

          success:false,

          message:
            "Message is required"

        });

      }

      const result =

        await sendDiscordMessage({

          username,

          message

        });

      if(!result.success){

        return res.status(500).json({

          success:false,

          error:result.error

        });

      }

      res.json({

        success:true,

        message:
          "Discord message sent"

      });

    }catch(err){

      console.log(

        "Discord Route Error:",

        err.message

      );

      res.status(500).json({

        success:false,

        error:
          "Failed to send Discord message"

      });

    }

  }

);

// ======================================
// SEND EMBED MESSAGE
// ======================================

router.post(

  "/discord/embed",

  async(req,res)=>{

    try{

      const {

        title,

        description,

        color,

        username

      } = req.body;

      const embed = {

        title:
          title || "Layboka AI",

        description:
          description || "",

        color:
          color || 5763719,

        timestamp:
          new Date()

      };

      const result =

        await sendDiscordMessage({

          username,

          embed

        });

      if(!result.success){

        return res.status(500).json({

          success:false,

          error:result.error

        });

      }

      res.json({

        success:true,

        message:
          "Discord embed sent"

      });

    }catch(err){

      console.log(

        "Discord Embed Error:",

        err.message

      );

      res.status(500).json({

        success:false

      });

    }

  }

);

// ======================================
// TEST WEBHOOK
// ======================================

router.get(

  "/discord/test",

  async(req,res)=>{

    try{

      const result =

        await sendDiscordMessage({

          message:
            "✅ Layboka AI Discord integration working"

        });

      res.json({

        success:
          result.success

      });

    }catch(err){

      res.status(500).json({

        success:false

      });

    }

  }

);

// ======================================
// EXPORTS
// ======================================

module.exports = router;
