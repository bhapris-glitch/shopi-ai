// ======================================
// routes/emailMarketing.js
// Email Campaign Management
// updated 2 Jun, 2026
// ======================================

const express = require("express");

const router = express.Router();

const Campaign =
require("../models/Campaign");

const sendEmail =
require("../services/email");

// ======================================
// SEND CAMPAIGN
// ======================================

router.post(
  "/email/send",
  async (req,res)=>{

    try{

      const {
        email,
        subject,
        content
      } = req.body;

      if(
        !email ||
        !subject ||
        !content
      ){

        return res.status(400).json({

          success:false,

          message:
          "Missing required fields"

        });

      }

      // ===============================
      // SEND EMAIL
      // ===============================

      await sendEmail({

        to:email,

        subject,

        html:content

      });

      // ===============================
      // SAVE CAMPAIGN LOG
      // ===============================

      await Campaign.create({

        email,

        subject,

        content,

        status:"sent"

      });

      return res.json({

        success:true,

        message:
        "Campaign sent"

      });

    }catch(err){

      console.log(
        "EMAIL CAMPAIGN ERROR:",
        err
      );

      return res.status(500).json({

        success:false,

        message:
        "Campaign failed"

      });

    }

  }
);

// ======================================
// EXPORT
// ======================================

module.exports = router;
