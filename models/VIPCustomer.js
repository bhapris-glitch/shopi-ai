// ======================================
// models/VIPCustomer.js
// ======================================

const mongoose =
require("mongoose");

const vipSchema =
new mongoose.Schema({

  customerId:String,

  email:String,

  totalSpent:Number,

  country:String,

  notes:String,

  priority:{
    type:String,
    default:"gold"
  }

},{
  timestamps:true
});

module.exports =
mongoose.model(
  "VIPCustomer",
  vipSchema
);
