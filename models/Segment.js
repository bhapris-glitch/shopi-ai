// ======================================
// models/Segment.js
// ======================================

const mongoose =
require("mongoose");

const segmentSchema =
new mongoose.Schema({

  customerId:String,

  email:String,

  totalSpent:{
    type:Number,
    default:0
  },

  totalOrders:{
    type:Number,
    default:0
  },

  segment:{
    type:String,
    default:"new"
  },

  country:String,

  tags:[String]

},{
  timestamps:true
});

module.exports =
mongoose.model(
  "Segment",
  segmentSchema
);
