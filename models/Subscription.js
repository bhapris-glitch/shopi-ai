// ======================================
// models/Subscription.js
// Layboka AI Stripe Subscription
// ======================================

const mongoose =
require("mongoose");

const subscriptionSchema =
new mongoose.Schema({

  clientId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Client"
  },

  store:String,

  customerId:String,

  subscriptionId:String,

  plan:{
    type:String,
    default:"starter"
  },

  status:{
    type:String,
    default:"inactive"
  },

  amount:Number,

  currency:{
    type:String,
    default:"USD"
  },

  interval:{
    type:String,
    default:"month"
  },

  renewDate:Date,

  cancelAtPeriodEnd:{
    type:Boolean,
    default:false
  }

},{
  timestamps:true
});

module.exports =
mongoose.model(
  "Subscription",
  subscriptionSchema
);
