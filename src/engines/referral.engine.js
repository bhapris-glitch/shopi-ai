// ======================================
// src/engines/referral.engine.js
// Layboka AI
// Referral Business Engine
// Production Ready
// ======================================

const Client = require("../../models/Client");
const Subscription = require("../../models/Subscription");

const MINIMUM_ACTIVE_DAYS = 15;

// ======================================
// APPLY REFERRAL
// ======================================

async function applyReferral({

  clientId,
  referralCode

}){

  //
