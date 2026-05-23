// ======================================
// models/Workflow.js
// ======================================

const mongoose =
require("mongoose");

const workflowSchema =
new mongoose.Schema({

  name:String,

  trigger:String,

  action:String,

  enabled:{
    type:Boolean,
    default:true
  }

},{
  timestamps:true
});

module.exports =
mongoose.model(
  "Workflow",
  workflowSchema
);
