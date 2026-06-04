// ======================================
// models/Segment.js
// Layboka AI Customer Segmentation
// Updated 04 Jun 2026
// ======================================
const mongoose =
require("mongoose");

// ======================================
// SEGMENT SCHEMA
// ======================================

const SegmentSchema =
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

  name:{
    type:String,
    default:""
  },

  email:{
    type:String,
    lowercase:true,
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
    default:0
  },

  orderCount:{
    type:Number,
    default:0
  },

  averageOrderValue:{
    type:Number,
    default:0
  },

  lastPurchaseDate:{
    type:Date,
    default:null
  },

  // ====================================
  // CUSTOMER ACTIVITY
  // ====================================

  visits:{
    type:Number,
    default:0
  },

  chats:{
    type:Number,
    default:0
  },

  abandonedCarts:{
    type:Number,
    default:0
  },

  recoveredCarts:{
    type:Number,
    default:0
  },

  // ====================================
  // AI SEGMENT
  // ====================================

  segment:{
    type:String,
    enum:[
      "vip",
      "loyal",
      "returning",
      "new",
      "at_risk",
      "lost",
      "window_shopper"
    ],
    default:"new",
    index:true
  },

  // ====================================
  // AI SCORES
  // ====================================

  loyaltyScore:{
    type:Number,
    default:0
  },

  vipScore:{
    type:Number,
    default:0
  },

  churnRisk:{
    type:Number,
    default:0
  },

  predictedLifetimeValue:{
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
  }

},
{
  timestamps:true,
  versionKey:false
});

// ======================================
// INDEXES
// ======================================

SegmentSchema.index({
  email:1
});

SegmentSchema.index({
  segment:1
});

SegmentSchema.index({
  totalSpent:-1
});

SegmentSchema.index({
  loyaltyScore:-1
});

// ======================================
// EXPORT
// ======================================

module.exports =
mongoose.model(
  "Segment",
  SegmentSchema
);
