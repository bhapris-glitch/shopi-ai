const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const Client = require("../models/Client");
const Referral = require("../models/Referral");

const {
  calculateReferralRewards
} = require("../utils/referralRewards");

// ======================================
// GENERATE REFERRAL CODE
// ======================================

router.get(
  "/referral/me",
  auth,
  async(req,res)=>{

    try{

      const client = await Client.findById(
        req.user.id
      );

      if(!client){

        return res.status(404).json({
          success:false
        });

      }

      if(!client.referralCode){

        const code =
          "LAY" +
          Math.random()
          .toString(36)
          .substring(2,8)
          .toUpperCase();

        client.referralCode = code;

        await client.save();

      }

      const rewards =
        await calculateReferralRewards(
          client._id
        );

      res.json({

        success:true,

        referralCode:
          client.referralCode,

        referralLink:
          `${process.env.BASE_URL}/signup.html?ref=${client.referralCode}`,

        rewards

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
// APPLY REFERRAL
// ======================================

router.post(
  "/referral/apply",
  async(req,res)=>{

    try{

      const {
        referralCode,
        referredClientId,
        referredStore,
        referredPlan,
        amount
      } = req.body;

      const referrer =
        await Client.findOne({
          referralCode
        });

      if(!referrer){

        return res.json({
          success:false,
          message:"Invalid referral code"
        });

      }

      const exists =
        await Referral.findOne({
          referredClientId
        });

      if(exists){

        return res.json({
          success:false,
          message:"Referral already used"
        });

      }

      await Referral.create({

        referrerClientId:
          referrer._id,

        referredClientId,

        referredStore,

        referredPlan,

        referralCode,

        amount,

        paid:true

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
