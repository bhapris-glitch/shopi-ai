const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({

  clientId:String,

  shopifyId:String,

  title:String,

  description:String,

  image:String,

  price:Number,

  currency:{
    type:String,
    default:"USD"
  },

  url:String,

  synced:{
    type:Boolean,
    default:false
  }

},{
  timestamps:true
});

module.exports =
mongoose.model(
  "Product",
  ProductSchema
);
