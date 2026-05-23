// ======================================
// models/Affiliate.js
// Layboka AI Affiliate Model
// ======================================

const mongoose =
require("mongoose");

// ======================================
// AFFILIATE SCHEMA
// ======================================

const affiliateSchema =
new mongoose.Schema({

  name:{
    type:String,
    required:true
  },

  email:{
    type:String,
    required:true,
    unique:true
  },

  referralCode:{
    type:String,
    required:true,
    unique:true
  },

  clicks:{
    type:Number,
    default:0
  },

  conversions:{
    type:Number,
    default:0
  },

  earnings:{
    type:Number,
    default:0
  },

  commissionRate:{
    type:Number,
    default:20
  },

  status:{
    type:String,
    default:"active"
  },

  payoutEmail:{
    type:String
  },

  createdAt:{
    type:Date,
    default:Date.now
  }

});

// ======================================
// EXPORT
// ======================================

module.exports =
mongoose.model(
  "Affiliate",
  affiliateSchema
);
