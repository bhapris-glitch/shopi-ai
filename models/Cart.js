const mongoose =
require("mongoose");

const CartSchema =
new mongoose.Schema({

  clientId:String,

  email:String,

  name:String,

  cartId:String,

  products:Array,

  total:Number,

  currency:{
    type:String,
    default:"USD"
  },

  recovered:{
    type:Boolean,
    default:false
  },

  abandoned:{
    type:Boolean,
    default:false
  },

  reminderSent1h:{
    type:Boolean,
    default:false
  },

  reminderSent24h:{
    type:Boolean,
    default:false
  }

},{
  timestamps:true
});

module.exports =
mongoose.model(
  "Cart",
  CartSchema
);
