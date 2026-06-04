// ======================================
// models/Notification.js
// Layboka AI Notification Logs
// Production Ready
// ======================================

const mongoose = require("mongoose");

// ======================================
// NOTIFICATION SCHEMA
// ======================================

const NotificationSchema =
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

  customerEmail:{
    type:String,
    default:"",
    index:true
  },

  customerPhone:{
    type:String,
    default:"",
    index:true
  },

  // ====================================
  // TYPE
  // ====================================

  channel:{
    type:String,
    enum:[
      "email",
      "whatsapp",
      "sms",
      "telegram",
      "tiktok",
      "push",
      "voice"
    ],
    required:true,
    index:true
  },

  // ====================================
  // PURPOSE
  // ====================================

  category:{
    type:String,
    enum:[
      "abandoned_cart",
      "cart_recovery",
      "sale",
      "broadcast",
      "renewal",
      "order",
      "support",
      "ai_followup",
      "marketing",
      "other"
    ],
    default:"other",
    index:true
  },

  // ====================================
  // CONTENT
  // ====================================

  title:{
    type:String,
    default:""
  },

  message:{
    type:String,
    default:""
  },

  // ====================================
  // DELIVERY
  // ====================================

  status:{
    type:String,
    enum:[
      "queued",
      "sent",
      "delivered",
      "read",
      "failed"
    ],
    default:"queued",
    index:true
  },

  provider:{
    type:String,
    default:""
  },

  providerMessageId:{
    type:String,
    default:""
  },

  errorMessage:{
    type:String,
    default:""
  },

  // ====================================
  // ORDER
  // ====================================

  orderId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Order"
  },

  orderNumber:{
    type:String,
    default:""
  },

  // ====================================
  // AI
  // ====================================

  aiGenerated:{
    type:Boolean,
    default:false
  },

  // ====================================
  // TIMESTAMPS
  // ====================================

  sentAt:{
    type:Date
  },

  deliveredAt:{
    type:Date
  },

  readAt:{
    type:Date
  }

},
{
  timestamps:true,
  versionKey:false
});

// ======================================
// INDEXES
// ======================================

NotificationSchema.index({
  clientId:1,
  createdAt:-1
});

NotificationSchema.index({
  channel:1,
  status:1
});

NotificationSchema.index({
  category:1
});

// ======================================
// EXPORT
// ======================================

module.exports =
mongoose.model(
  "Notification",
  NotificationSchema
);
