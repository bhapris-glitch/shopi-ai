// ======================================
// models/VIPCustomer.js
// Layboka AI VIP Customers
// Updated 04 Jun 2026
// ======================================
const mongoose =
require("mongoose");

// ======================================
// VIP CUSTOMER SCHEMA
// ======================================

const VIPCustomerSchema =
new mongoose.Schema({

  // ====================================
  // CLIENT
  // ====================================

  clientId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Client",
    default:null,
    index:true
  },

  // ====================================
  // CUSTOMER
  // ====================================

  customerName:{
    type:String,
    required:true,
    trim:true
  },

  email:{
    type:String,
    required:true,
    lowercase:true,
    trim:true,
    index:true
  },

  phone:{
    type:String,
    default:""
  },

  // ====================================
  // PURCHASE DATA
  // ====================================

  totalSpent:{
    type:Number,
    default:0,
    index:true
  },

  totalOrders:{
    type:Number,
    default:0
  },

  averageOrderValue:{
    type:Number,
    default:0
  },

  lastOrderDate:{
    type:Date,
    default:null
  },

  // ====================================
  // VIP STATUS
  // ====================================

  vipTier:{
    type:String,
    enum:[
      "bronze",
      "silver",
      "gold",
      "platinum",
      "diamond"
    ],
    default:"bronze",
    index:true
  },

  vipScore:{
    type:Number,
    default:0
  },

  active:{
    type:Boolean,
    default:true
  },

  // ====================================
  // REWARDS
  // ====================================

  rewardPoints:{
    type:Number,
    default:0
  },

  lifetimeRewards:{
    type:Number,
    default:0
  },

  exclusiveDiscount:{
    type:Number,
    default:0
  },

  // ====================================
  // MARKETING
  // ====================================

  emailSubscribed:{
    type:Boolean,
    default:true
  },

  smsSubscribed:{
    type:Boolean,
    default:false
  },

  whatsappSubscribed:{
    type:Boolean,
    default:false
  },

  // ====================================
  // NOTES
  // ====================================

  notes:{
    type:String,
    default:""
  }

},
{
  timestamps:true,
  versionKey:false
});

// ======================================
// INDEXES
// ======================================

VIPCustomerSchema.index({
  totalSpent:-1
});

VIPCustomerSchema.index({
  vipTier:1
});

VIPCustomerSchema.index({
  email:1
});

// ======================================
// EXPORT
// ======================================

module.exports =
mongoose.model(
  "VIPCustomer",
  VIPCustomerSchema
);
