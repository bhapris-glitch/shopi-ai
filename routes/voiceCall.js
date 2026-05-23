// ======================================
// routes/voiceCall.js
// Layboka AI Voice Calls
// ======================================

const express =
require("express");

const router =
express.Router();

// ======================================
// CREATE AI CALL
// ======================================

router.post(

  "/voice/call",

  async(req,res)=>{

    try{

      const {

        phone,
        customerName

      } = req.body;

      console.log(
        "VOICE CALL:",
        phone
      );

      res.json({

        success:true,

        message:
        `📞 AI call initiated for ${customerName}`

      });

    }catch(err){

      console.log(
        "VOICE CALL ERROR:",
        err
      );

      res.status(500).json({

        success:false

      });

    }

  }

);

module.exports = router;
