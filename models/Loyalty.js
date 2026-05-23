// ======================================
// models/Loyalty.js
// Layboka AI Loyalty System
// ======================================

const mongoose = require("mongoose");

const LoyaltySchema = new mongoose.Schema({

  clientId:{
    type:String,
    required:true
  },

  customerEmail:{
    type:String,
    required:true,
    lowercase:true
  },

  customerName:{
    type:String,
    default:""
  },

  points:{
    type:Number,
    default:0
  },

  totalSpent:{
    type:Number,
    default:0
  },

  orders:{
    type:Number,
    default:0
  },

  tier:{
    type:String,
    enum:[
      "bronze",
      "silver",
      "gold",
      "vip"
    ],
    default:"bronze"
  },

  rewards:[

    {

      code:String,

      discount:Number,

      used:{
        type:Boolean,
        default:false
      },

      createdAt:{
        type:Date,
        default:Date.now
      }

    }

  ],

  lastPurchase:{
    type:Date
  },

  createdAt:{
    type:Date,
    default:Date.now
  }

});

module.exports =
  mongoose.model(
    "Loyalty",
    LoyaltySchema
  );
