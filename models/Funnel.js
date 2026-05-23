// ======================================
// models/Funnel.js
// ======================================

const mongoose =
require("mongoose");

const funnelSchema =
new mongoose.Schema({

  name:String,

  trigger:String,

  steps:[{

    title:String,

    delay:Number,

    action:String

  }],

  active:{
    type:Boolean,
    default:true
  }

},{
  timestamps:true
});

module.exports =
mongoose.model(
  "Funnel",
  funnelSchema
);
