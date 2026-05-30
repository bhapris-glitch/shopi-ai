// ==========================================
// utils/referralRewards.js
// Layboka AI
// Referral Reward Engine
// Production Ready
// ==========================================

const Referral = require("../models/Referral");
const Client = require("../models/Client");

// ==========================================
// REWARD CONSTANTS
// ==========================================

const REWARDS = {

  STARTER: {
    referrals: 2,
    days: 40,
    campaign: "LAY2R40",
    rewardType: "starter_2_months",
    title: "2 Months Free Starter",
    value: "Save $38"
  },

  GROWTH: {
    referrals: 2,
    days: 30,
    campaign: "LAY2R30",
    rewardType: "growth_premium",
    title: "1 Month Premium Free",
    value: "Worth $99"
  },

  PREMIUM: {
    referrals: 2,
    days: 40,
    campaign: "LAY2R40P",
    rewardType: "premium_free_month",
    title: "Next Month FREE",
    value: "Save $99"
  }

};

// ==========================================
// FILTER VALID REFERRALS
// ==========================================

function filterValidReferrals(
  referrals,
  plan,
  days
){

  const now = Date.now();

  return referrals.filter((r)=>{

    if(!r.paid){
      return false;
    }

    if(r.fraudFlagged){
      return false;
    }

    const diff =
      now -
      new Date(r.createdAt).getTime();

    return (

      r.referredPlan === plan &&

      diff <=
      days * 24 * 60 * 60 * 1000

    );

  });

}

// ==========================================
// UNLOCK REWARD
// ==========================================

async function unlockReward(
  client,
  referrals,
  rewardConfig
){

  const alreadyRewarded =
    referrals.some(
      r => r.rewarded === true
    );

  if(alreadyRewarded){

    return null;

  }

  if(
    referrals.length <
    rewardConfig.referrals
  ){

    return null;

  }

  await Referral.updateMany(

    {
      _id:{
        $in: referrals.map(
          r => r._id
        )
      }
    },

    {
      rewarded:true,
      rewardUnlocked:true,
      rewardUnlockedAt:new Date(),
      rewardType:
        rewardConfig.rewardType
    }

  );

  return {

    unlocked:true,

    type:
      rewardConfig.rewardType,

    title:
      rewardConfig.title,

    value:
      rewardConfig.value

  };

}

// ==========================================
// MAIN ENGINE
// ==========================================

async function calculateReferralRewards(
  clientId
){

  const client =
    await Client.findById(
      clientId
    );

  if(!client){

    return null;

  }

  const referrals =
    await Referral.find({

      referrerClientId:
        clientId,

      paid:true

    });

  // ======================================
  // COUNTS
  // ======================================

  const starterReferrals =
    filterValidReferrals(

      referrals,

      "starter",

      REWARDS.STARTER.days

    );

  const growthReferrals =
    filterValidReferrals(

      referrals,

      "growth",

      REWARDS.GROWTH.days

    );

  const premiumReferrals =
    filterValidReferrals(

      referrals,

      "premium",

      REWARDS.PREMIUM.days

    );

  let reward = null;

  // ======================================
  // STARTER PLAN
  // ======================================

  if(
    client.plan === "starter"
  ){

    reward =
      await unlockReward(

        client,

        starterReferrals,

        REWARDS.STARTER

      );

  }

  // ======================================
  // GROWTH PLAN
  // ======================================

  if(
    client.plan === "growth"
  ){

    reward =
      await unlockReward(

        client,

        growthReferrals,

        REWARDS.GROWTH

      );

  }

  // ======================================
  // PREMIUM PLAN
  // ======================================

  if(
    client.plan === "premium"
  ){

    reward =
      await unlockReward(

        client,

        premiumReferrals,

        REWARDS.PREMIUM

      );

  }

  // ======================================
  // PROGRESS
  // ======================================

  let target = 2;
  let current = 0;

  if(client.plan === "starter"){

    current =
      starterReferrals.length;

  }

  if(client.plan === "growth"){

    current =
      growthReferrals.length;

  }

  if(client.plan === "premium"){

    current =
      premiumReferrals.length;

  }

  const progress =
    Math.min(
      100,
      Math.round(
        (current / target) * 100
      )
    );

  // ======================================
  // RESULT
  // ======================================

  return {

    totalReferrals:
      referrals.length,

    starterReferrals:
      starterReferrals.length,

    growthReferrals:
      growthReferrals.length,

    premiumReferrals:
      premiumReferrals.length,

    progress,

    reward,

    campaigns: {

      starter:
        REWARDS.STARTER.campaign,

      growth:
        REWARDS.GROWTH.campaign,

      premium:
        REWARDS.PREMIUM.campaign

    }

  };

}

// ==========================================
// EXPORTS
// ==========================================

module.exports = {

  calculateReferralRewards,

  REWARDS

};
