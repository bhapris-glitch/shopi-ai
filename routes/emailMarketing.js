// ======================================
// routes/emailMarketing.js
// ======================================

const express = require("express");
const nodemailer = require("nodemailer");

const Campaign =
require("../models/Campaign");

const router =
  express.Router();

// ======================================
// TRANSPORT
// ======================================

const transporter =
  nodemailer.createTransport({

    service:"gmail",

    auth:{
      user:
        process.env.EMAIL_USER,

      pass:
        process.env.EMAIL_PASS
    }

  });

// ======================================
// SEND CAMPAIGN
// ======================================

router.post(
  "/email/send",
  async(req,res)=>{

    try{

      const {
        email,
        subject,
        content
      } = req.body;

      await transporter.sendMail({

        from:
          process.env.EMAIL_USER,

        to:email,

        subject,

        html:content

      });

      await Campaign.create({

        email,
        subject,
        content,
        status:"sent"

      });

      res.json({

        success:true

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
