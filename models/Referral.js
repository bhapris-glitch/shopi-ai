const mongoose = require("mongoose");

const referralSchema = new mongoose.Schema({

  referrerClientId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Client",
    required:true,
    index:true
  },

  referredClientId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Client"
  },

  referralCode:{
    type:String,
    required:true,
    index:true
  },

  referredStore:{
    type:String,
    default:""
  },

  referredPlan:{
    type:String,
    enum:["starter","growth","premium"],
    default:"starter"
  },

  amount:{
    type:Number,
    default:0
  },

  paid:{
    type:Boolean,
    default:false
  },

  rewarded:{
    type:Boolean,
    default:false
  },

  rewardType:{
    type:String,
    default:""
  },

  createdAt:{
    type:Date,
    default:Date.now,
    index:true
  }

});

module.exports = mongoose.model(
  "Referral",
  referralSchema
);
