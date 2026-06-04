// ======================================
// models/Product.js
// Layboka AI Products Model
//updated 4 Jun 2026
// ======================================
const mongoose = require("mongoose");

// ======================================
// VARIANT SCHEMA
// ======================================

const VariantSchema = new mongoose.Schema(
{
  id:{
    type:String,
    default:""
  },

  title:{
    type:String,
    default:""
  },

  sku:{
    type:String,
    default:""
  },

  price:{
    type:Number,
    default:0
  },

  compareAtPrice:{
    type:Number,
    default:0
  },

  inventory:{
    type:Number,
    default:0
  }
},
{
  _id:false
}
);

// ======================================
// PRODUCT SCHEMA
// ======================================

const ProductSchema = new mongoose.Schema({

  // ====================================
  // CLIENT
  // ====================================

  clientId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Client",
    required:true,
    index:true
  },

  shop:{
    type:String,
    default:"",
    index:true
  },

  // ====================================
  // SHOPIFY
  // ====================================

  productId:{
    type:String,
    required:true,
    index:true
  },

  handle:{
    type:String,
    default:"",
    index:true
  },

  // ====================================
  // PRODUCT DATA
  // ====================================

  title:{
    type:String,
    default:"",
    index:true
  },

  description:{
    type:String,
    default:""
  },

  image:{
    type:String,
    default:""
  },

  vendor:{
    type:String,
    default:""
  },

  productType:{
    type:String,
    default:"",
    index:true
  },

  tags:{
    type:[String],
    default:[]
  },

  // ====================================
  // PRICE
  // ====================================

  price:{
    type:Number,
    default:0
  },

  currency:{
    type:String,
    default:"USD"
  },

  variants:{
    type:[VariantSchema],
    default:[]
  },

  // ====================================
  // STATUS
  // ====================================

  active:{
    type:Boolean,
    default:true
  },

  featured:{
    type:Boolean,
    default:false
  },

  inventory:{
    type:Number,
    default:0
  },

  // ====================================
  // AI ENGINE
  // ====================================

  recommended:{
    type:Boolean,
    default:false
  },

  upsellScore:{
    type:Number,
    default:0
  },

  crossSellScore:{
    type:Number,
    default:0
  },

  popularityScore:{
    type:Number,
    default:0
  },

  conversionScore:{
    type:Number,
    default:0
  },

  aiBoost:{
    type:Boolean,
    default:false
  },

  // ====================================
  // ANALYTICS
  // ====================================

  views:{
    type:Number,
    default:0
  },

  clicks:{
    type:Number,
    default:0
  },

  addToCart:{
    type:Number,
    default:0
  },

  purchases:{
    type:Number,
    default:0
  },

  revenue:{
    type:Number,
    default:0
  },

  // ====================================
  // SYNC
  // ====================================

  syncedAt:{
    type:Date,
    default:null
  }

},
{
  timestamps:true
}
);

// ======================================
// INDEXES
// ======================================

ProductSchema.index({
  clientId:1,
  productId:1
},{
  unique:true
});

ProductSchema.index({
  title:"text",
  description:"text",
  vendor:"text",
  productType:"text"
});

// ======================================
// EXPORT
// ======================================

module.exports =
mongoose.model(
  "Product",
  ProductSchema
);
