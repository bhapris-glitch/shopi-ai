// ======================================
// models/Campaign.js
// ======================================

const mongoose =
require("mongoose");

const campaignSchema =
new mongoose.Schema({

  email:String,

  subject:String,

  content:String,

  status:{
    type:String,
    default:"draft"
  }

},{
  timestamps:true
});

module.exports =
mongoose.model(
  "Campaign",
  campaignSchema
);
