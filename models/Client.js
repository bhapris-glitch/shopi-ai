const mongoose = require("mongoose");

const ClientSchema = new mongoose.Schema({

  // =========================
  // STORE
  // =========================
  store:{
    type:String,
    required:true
  },

  token:{
    type:String,
    default:""
  },

  // =========================
  // PLAN
  // =========================
  plan:{
    type:String,
    default:"starter"
  },

  // =========================
  // PAYMENT STATUS
  // =========================
  paid:{
    type:Boolean,
    default:false
  },

  paymentProvider:{
    type:String,
    default:""
  },

  subscriptionId:{
    type:String,
    default:""
  },

  status:{
    type:String,
    default:"trial"
  },

  // =========================
  // TRIAL
  // =========================
  trialEnds:{
    type:Number,
    default:()=>Date.now() + (3*24*60*60*1000)
  },

  // =========================
  // AUTO RENEW
  // =========================
  renewalDate:{
    type:Number,
    default:0
  },

  // =========================
  // ANALYTICS
  // =========================
  messages:{
    type:Number,
    default:0
  },

  opens:{
    type:Number,
    default:0
  },

  conversions:{
    type:Number,
    default:0
  },

  recoveredCarts:{
    type:Number,
    default:0
  },

  revenue:{
    type:Number,
    default:0
  },

  // =========================
  // FEATURES
  // =========================
  whatsappRecovery:{
    type:Boolean,
    default:false
  },

  abandonedCartAI:{
    type:Boolean,
    default:false
  },

  checkoutCloser:{
    type:Boolean,
    default:false
  },

  premiumUI:{
    type:Boolean,
    default:false
  },

  // =========================
  // CONTACT
  // =========================
  email:{
    type:String,
    default:""
  },

  phone:{
    type:String,
    default:""
  },

  // =========================
  // CREATED
  // =========================
  createdAt:{
    type:Date,
    default:Date.now
  }

});

module.exports =
  mongoose.model("Client", ClientSchema);
