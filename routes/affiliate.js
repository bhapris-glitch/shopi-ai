// ======================================
// routes/affiliate.js
// Layboka AI Affiliate APIs
// ======================================

const express =
require("express");

const crypto =
require("crypto");

const Affiliate =
require("../models/Affiliate");

const router =
express.Router();

// ======================================
// GENERATE REFERRAL CODE
// ======================================

function generateCode(){

  return (

    "LAY-" +

    crypto
    .randomBytes(3)
    .toString("hex")
    .toUpperCase()

  );

}

// ======================================
// CREATE AFFILIATE
// ======================================

router.post(

  "/affiliate/create",

  async(req,res)=>{

    try{

      const {

        name,
        email,
        payoutEmail

      } = req.body;

      // ================================
      // CHECK EXISTING
      // ================================

      const existing =
        await Affiliate.findOne({
          email
        });

      if(existing){

        return res.json({

          success:false,

          message:
          "Affiliate already exists"

        });

      }

      // ================================
      // CREATE
      // ================================

      const affiliate =
        await Affiliate.create({

          name,
          email,
          payoutEmail,

          referralCode:
            generateCode()

        });

      res.json({

        success:true,

        affiliate

      });

    }catch(err){

      console.log(
        "AFFILIATE ERROR:",
        err
      );

      res.status(500).json({

        success:false

      });

    }

  }

);

// ======================================
// TRACK CLICK
// ======================================

router.post(

  "/affiliate/click",

  async(req,res)=>{

    try{

      const {

        referralCode

      } = req.body;

      const affiliate =
        await Affiliate.findOne({

          referralCode

        });

      if(!affiliate){

        return res.json({

          success:false

        });

      }

      affiliate.clicks += 1;

      await affiliate.save();

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

// ======================================
// TRACK CONVERSION
// ======================================

router.post(

  "/affiliate/conversion",

  async(req,res)=>{

    try{

      const {

        referralCode,
        amount

      } = req.body;

      const affiliate =
        await Affiliate.findOne({

          referralCode

        });

      if(!affiliate){

        return res.json({

          success:false

        });

      }

      affiliate.conversions += 1;

      // ================================
      // COMMISSION
      // ================================

      const commission =

        (amount *
        affiliate.commissionRate)

        / 100;

      affiliate.earnings +=
        commission;

      await affiliate.save();

      res.json({

        success:true,

        commission

      });

    }catch(err){

      console.log(err);

      res.status(500).json({

        success:false

      });

    }

  }

);

// ======================================
// GET AFFILIATES
// ======================================

router.get(

  "/affiliate/all",

  async(req,res)=>{

    try{

      const affiliates =
        await Affiliate.find();

      res.json({

        success:true,

        affiliates

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
