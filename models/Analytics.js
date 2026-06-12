// ======================================
// models/Analytics.js
// Layboka AI Analytics Model
// Production Ready
// updated 12 Jun 2026 - Approved 
// ======================================
const mongoose =
require("mongoose");

// ======================================
// ANALYTICS SCHEMA
// ======================================

const AnalyticsSchema =
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

  store:{
    type:String,
    default:"",
    index:true
  },

  // ====================================
  // DATE
  // ====================================

  date:{
    type:Date,
    required:true,
    index:true
  },

  // ====================================
  // TRAFFIC
  // ====================================

  visitors:{
    type:Number,
    default:0
  },

  uniqueVisitors:{
    type:Number,
    default:0
  },

  pageViews:{
    type:Number,
    default:0
  },

  // ====================================
  // SALES FUNNEL
  // ====================================

  productViews:{
    type:Number,
    default:0
  },

  addToCart:{
    type:Number,
    default:0
  },

  checkoutStarted:{
    type:Number,
    default:0
  },

  orders:{
    type:Number,
    default:0
  },

  // ====================================
  // REVENUE
  // ====================================

  revenue:{
    type:Number,
    default:0
  },

  recoveredRevenue:{
    type:Number,
    default:0
  },

  aiRevenue:{
    type:Number,
    default:0
  },

  averageOrderValue:{
    type:Number,
    default:0
  },

  // ====================================
  // AI CHATBOT
  // ====================================

  chats:{
    type:Number,
    default:0
  },

  aiReplies:{
    type:Number,
    default:0
  },

  aiConversions:{
    type:Number,
    default:0
  },

  // ====================================
  // RECOVERY
  // ====================================

  abandonedCarts:{
    type:Number,
    default:0
  },

  recoveredCarts:{
    type:Number,
    default:0
  },

  recoveryRate:{
    type:Number,
    default:0
  },

  // ====================================
  // EMAIL
  // ====================================

  emailsSent:{
    type:Number,
    default:0
  },

  emailOpens:{
    type:Number,
    default:0
  },

  emailClicks:{
    type:Number,
    default:0
  },

  // ====================================
  // SMS
  // ====================================

  smsSent:{
    type:Number,
    default:0
  },

  smsClicks:{
    type:Number,
    default:0
  },

  // ====================================
  // WHATSAPP
  // ====================================

  whatsappSent:{
    type:Number,
    default:0
  },

  whatsappReplies:{
    type:Number,
    default:0
  }

},
{
  timestamps:true,
  versionKey:false
});

// ======================================
// INDEXES
// ======================================

AnalyticsSchema.index({
  clientId:1,
  date:-1
});

AnalyticsSchema.index({
  store:1,
  date:-1
});

// ======================================
// EXPORT
// ======================================

module.exports =
mongoose.model(
  "Analytics",
  AnalyticsSchema
);
