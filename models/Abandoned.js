// ======================================
// models/Abandoned.js
// Layboka AI Abandoned Cart Model
// Updated 04 Jun 2026
// ======================================
const mongoose =
require("mongoose");

// ======================================
// PRODUCT SCHEMA
// ======================================

const ProductSchema =
new mongoose.Schema({

  productId:{
    type:String,
    default:""
  },

  title:{
    type:String,
    default:""
  },

  price:{
    type:Number,
    default:0
  },

  image:{
    type:String,
    default:""
  },

  url:{
    type:String,
    default:""
  }

},
{
  _id:false
});

// ======================================
// ABANDONED CART SCHEMA
// ======================================

const AbandonedSchema =
new mongoose.Schema({

  // ====================================
  // CLIENT
  // ====================================

  clientId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Client",
    required:true,
    index:true
  },

  // ====================================
  // CUSTOMER
  // ====================================

  customerName:{
    type:String,
    default:""
  },

  email:{
    type:String,
    lowercase:true,
    default:"",
    index:true
  },

  phone:{
    type:String,
    default:""
  },

  // ====================================
  // PRODUCT
  // ====================================

  product:{
    type:ProductSchema,
    default:{}
  },

  // ====================================
  // CART
  // ====================================

  cartValue:{
    type:Number,
    default:0
  },

  itemCount:{
    type:Number,
    default:1
  },

  checkoutUrl:{
    type:String,
    default:""
  },

  // ====================================
  // RECOVERY
  // ====================================

  recovered:{
    type:Boolean,
    default:false,
    index:true
  },

  recoveredAt:{
    type:Date,
    default:null
  },

  recoveredRevenue:{
    type:Number,
    default:0
  },

  // ====================================
  // AUTOMATION
  // ====================================

  emailSent:{
    type:Boolean,
    default:false
  },

  smsSent:{
    type:Boolean,
    default:false
  },

  whatsappSent:{
    type:Boolean,
    default:false
  },

  reminder1Sent:{
    type:Boolean,
    default:false
  },

  reminder2Sent:{
    type:Boolean,
    default:false
  },

  // ====================================
  // AI
  // ====================================

  aiRecoveryAttempted:{
    type:Boolean,
    default:false
  }

},
{
  timestamps:true,
  versionKey:false
});

// ======================================
// INDEXES
// ======================================

AbandonedSchema.index({
  clientId:1,
  recovered:1
});

AbandonedSchema.index({
  email:1
});

AbandonedSchema.index({
  phone:1
});

AbandonedSchema.index({
  createdAt:-1
});

// ======================================
// EXPORT
// ======================================

module.exports =
mongoose.model(
  "Abandoned",
  AbandonedSchema
);
