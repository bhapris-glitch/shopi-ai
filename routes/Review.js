// ======================================
// models/Review.js
// ======================================

const mongoose =
require("mongoose");

const reviewSchema =
new mongoose.Schema({

  customer:String,

  rating:Number,

  message:String,

  approved:{
    type:Boolean,
    default:false
  }

},{
  timestamps:true
});

module.exports =
mongoose.model(
  "Review",
  reviewSchema
);
