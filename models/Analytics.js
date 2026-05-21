const mongoose =
require("mongoose");

const AnalyticsSchema =
new mongoose.Schema({

  clientId:String,

  event:String,

  value:String,

  country:String,

  device:String,

  revenue:{
    type:Number,
    default:0
  }

},{
  timestamps:true
});

module.exports =
mongoose.model(
  "Analytics",
  AnalyticsSchema
);
