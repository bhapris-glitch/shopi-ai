// ======================================
// models/Product.js
// Layboka AI Products Model
// ======================================

const mongoose =
  require("mongoose");

const ProductSchema =
  new mongoose.Schema({

    clientId:{
      type:
        mongoose.Schema.Types.ObjectId,

      ref:"Client",

      required:true
    },

    shop:{
      type:String,

      required:true
    },

    productId:{
      type:String,

      required:true
    },

    title:{
      type:String,

      default:""
    },

    description:{
      type:String,

      default:""
    },

    image:{
      type:String,

      default:""
    },

    handle:{
      type:String,

      default:""
    },

    vendor:{
      type:String,

      default:""
    },

    productType:{
      type:String,

      default:""
    },

    tags:[String],

    variants:[
      {

        id:String,

        title:String,

        price:Number,

        compareAtPrice:Number,

        inventory:Number,

        sku:String

      }
    ],

    price:{
      type:Number,

      default:0
    },

    currency:{
      type:String,

      default:"USD"
    },

    active:{
      type:Boolean,

      default:true
    },

    syncedAt:{
      type:Date,

      default:Date.now
    }

  },

  {
    timestamps:true
  }

);

module.exports =
  mongoose.model(
    "Product",
    ProductSchema
  );
