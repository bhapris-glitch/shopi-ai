const Referral = require("../models/Referral");
const Client = require("../models/Client");

async function calculateReferralRewards(clientId){

  const now = Date.now();

  const referrals = await Referral.find({
    referrerClientId:clientId,
    paid:true
  });

  const client = await Client.findById(clientId);

  if(!client){
    return null;
  }

  const starterReferrals = referrals.filter(r=>{

    const diff =
      now - new Date(r.createdAt).getTime();

    return (
      r.referredPlan === "starter" &&
      diff <= 40*24*60*60*1000
    );

  });

  const growthReferrals = referrals.filter(r=>{

    const diff =
      now - new Date(r.createdAt).getTime();

    return (
      r.referredPlan === "growth" &&
      diff <= 30*24*60*60*1000
    );

  });

  const premiumReferrals = referrals.filter(r=>{

    const diff =
      now - new Date(r.createdAt).getTime();

    return (
      r.referredPlan === "premium" &&
      diff <= 40*24*60*60*1000
    );

  });

  let reward = null;

  // ======================================
  // STARTER REWARD
  // ======================================

if(
    client.plan === "starter" &&
    starterReferrals.length >= 2
  ){

    reward = {
      type:"starter_2_months",
      title:"2 Months Free Starter",
      value:"Save $38"
    };

  }

  // ======================================
  // GROWTH REWARD
  // ======================================

  if(
    client.plan === "growth" &&
    growthReferrals.length >= 2
  ){

    reward = {
      type:"growth_premium",
      title:"1 Month Premium Free",
      value:"Worth $99"
    };

  }

  // ======================================
  // PREMIUM REWARD
  // ======================================

  if(
    client.plan === "premium" &&
    premiumReferrals.length >= 2
  ){

    reward = {
      type:"premium_free_month",
      title:"Next Month FREE",
      value:"Save $99"
    };

  }

  return {
    total:referrals.length,
    starterReferrals:starterReferrals.length,
    growthReferrals:growthReferrals.length,
    premiumReferrals:premiumReferrals.length,
    reward
  };

}

module.exports = {
  calculateReferralRewards
};
