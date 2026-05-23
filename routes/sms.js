// ======================================
// routes/sms.js
// Layboka AI SMS Automation
// ======================================

const express =
require("express");

const router =
express.Router();

// ======================================
// SEND SMS
// ======================================

router.post(

  "/sms/send",

  async(req,res)=>{

    try{

      const {

        phone,
        message

      } = req.body;

      console.log(
        "SMS TO:",
        phone
      );

      console.log(
        "MESSAGE:",
        message
      );

      // ==================================
      // TWILIO PLACEHOLDER
      // ==================================

      res.json({

        success:true,

        status:"SMS queued"

      });

    }catch(err){

      console.log(
        "SMS ERROR:",
        err
      );

      res.status(500).json({

        success:false

      });

    }

  }

);

module.exports = router;
