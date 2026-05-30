// ==========================================
// routes/referral.js
// Layboka AI
// Referral System
// Production Version
// ==========================================

const express = require("express");
const crypto = require("crypto");

const router = express.Router();

const auth = require("../middleware/auth");

const Client = require("../models/Client");
const Referral = require("../models/Referral");

const {
  calculateReferralRewards
} = require("../utils/referralRewards");

// ==========================================
// GENERATE REFERRAL CODE
// ==========================================

function generateReferralCode() {

  return (
    "LAY" +
    crypto
      .randomBytes(3)
      .toString("hex")
      .toUpperCase()
  );

}

// ==========================================
// MY REFERRAL DASHBOARD
// ==========================================

router.get(
  "/referral/me",
  auth,
  async (req, res) => {

    try {

      const client =
        await Client.findById(
          req.user.id
        );

      if (!client) {

        return res.status(404).json({
          success: false,
          message: "Client not found"
        });

      }

      // ======================
      // CREATE CODE
      // ======================

      if (!client.referralCode) {

        client.referralCode =
          generateReferralCode();

        await client.save();

      }

      const rewards =
        await calculateReferralRewards(
          client._id
        );

      res.json({

        success: true,

        referralCode:
          client.referralCode,

        referralLink:
          `${process.env.BASE_URL}/signup.html?ref=${client.referralCode}`,

        rewards

      });

    } catch (err) {

      console.log(err);

      res.status(500).json({
        success: false
      });

    }

  }
);

// ==========================================
// REFERRAL STATS
// ==========================================

router.get(
  "/referral/stats",
  auth,
  async (req, res) => {

    try {

      const rewards =
        await calculateReferralRewards(
          req.user.id
        );

      res.json({
        success: true,
        rewards
      });

    } catch (err) {

      console.log(err);

      res.status(500).json({
        success: false
      });

    }

  }
);

// ==========================================
// APPLY REFERRAL
// ==========================================

router.post(
  "/referral/apply",
  async (req, res) => {

    try {

      const {

        referralCode,
        referredClientId,
        referredStore,
        referredPlan,
        amount

      } = req.body;

      if (!referralCode) {

        return res.json({

          success: false,
          message: "Referral code required"

        });

      }

      const referrer =
        await Client.findOne({

          referralCode

        });

      if (!referrer) {

        return res.json({

          success: false,
          message: "Invalid referral code"

        });

      }

      // ======================
      // SELF REFERRAL BLOCK
      // ======================

      if (
        referredClientId &&
        String(referrer._id) ===
        String(referredClientId)
      ) {

        return res.json({

          success: false,
          message:
            "Self referral not allowed"

        });

      }

      // ======================
      // DUPLICATE CLIENT
      // ======================

      const existingReferral =
        await Referral.findOne({

          referredClientId

        });

      if (existingReferral) {

        return res.json({

          success: false,
          message:
            "Referral already used"

        });

      }

      // ======================
      // DUPLICATE STORE
      // ======================

      const duplicateStore =
        await Referral.findOne({

          referredStore

        });

      if (
        duplicateStore &&
        referredStore
      ) {

        return res.json({

          success: false,
          message:
            "Store already referred"

        });

      }

      // ======================
      // SAVE REFERRAL
      // ======================

      await Referral.create({

        referrerClientId:
          referrer._id,

        referredClientId,

        referredStore,

        referredPlan,

        referralCode,

        amount: amount || 0,

        paid: true,

        rewarded: false

      });

      // ======================
      // UPDATE COUNTER
      // ======================

      await Client.findByIdAndUpdate(

        referrer._id,

        {
          $inc: {
            referralCount: 1
          }
        }

      );

      res.json({

        success: true,

        message:
          "Referral recorded"

      });

    } catch (err) {

      console.log(err);

      res.status(500).json({

        success: false

      });

    }

  }
);

// ==========================================
// CLAIM REWARD
// ==========================================

router.post(
  "/referral/claim",
  auth,
  async (req, res) => {

    try {

      const rewards =
        await calculateReferralRewards(
          req.user.id
        );

      if (
        !rewards ||
        !rewards.reward
      ) {

        return res.json({

          success: false,

          message:
            "Reward not unlocked"

        });

      }

      res.json({

        success: true,

        reward:
          rewards.reward

      });

    } catch (err) {

      console.log(err);

      res.status(500).json({

        success: false

      });

    }

  }
);

// ==========================================
// REFERRAL LEADERBOARD
// FUTURE MULTI AGENT
// ==========================================

router.get(
  "/referral/leaderboard",
  async (req, res) => {

    try {

      const top =
        await Client.find()

        .sort({
          referralCount: -1
        })

        .limit(10)

        .select(
          "store referralCount plan"
        );

      res.json({

        success: true,

        leaderboard: top

      });

    } catch (err) {

      console.log(err);

      res.status(500).json({

        success: false

      });

    }

  }
);

// ==========================================
// EXPORT
// ==========================================

module.exports = router;
