// ======================================
// models/Conversation.js
// Layboka AI Conversation Memory
// Production Ready
// updated 04 Jun 2026
// ======================================
const mongoose =
require("mongoose");

// ======================================
// MESSAGE
// ======================================

const MessageSchema =
new mongoose.Schema({

  sender:{
    type:String,
    enum:[
      "customer",
      "ai",
      "agent",
      "system"
    ],
    required:true
  },

  message:{
    type:String,
    required:true
  },

  platform:{
    type:String,
    enum:[
      "website",
      "shopify",
      "whatsapp",
      "telegram",
      "tiktok",
      "instagram",
      "facebook"
    ],
    default:"website"
  },

  agentName:{
    type:String,
    default:"Emma"
  },

  metadata:{
    type:Object,
    default:{}
  },

  createdAt:{
    type:Date,
    default:Date.now
  }

},
{
  _id:false
});

// ======================================
// CONVERSATION
// ======================================

const ConversationSchema =
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

  customerId:{
    type:String,
    default:"",
    index:true
  },

  customerName:{
    type:String,
    default:""
  },

  email:{
    type:String,
    default:"",
    index:true
  },

  phone:{
    type:String,
    default:"",
    index:true
  },

  // ====================================
  // CHANNEL
  // ====================================

  platform:{
    type:String,
    default:"website",
    index:true
  },

  // ====================================
  // MEMORY
  // ====================================

  memoryEnabled:{
    type:Boolean,
    default:true
  },

  summary:{
    type:String,
    default:""
  },

  tags:{
    type:[String],
    default:[]
  },

  sentiment:{
    type:String,
    enum:[
      "positive",
      "neutral",
      "negative"
    ],
    default:"neutral"
  },

  // ====================================
  // CHAT
  // ====================================

  messages:{
    type:[MessageSchema],
    default:[]
  },

  totalMessages:{
    type:Number,
    default:0
  },

  // ====================================
  // SALES
  // ====================================

  interestedProduct:{
    type:String,
    default:""
  },

  addedToCart:{
    type:Boolean,
    default:false
  },

  converted:{
    type:Boolean,
    default:false
  },

  orderValue:{
    type:Number,
    default:0
  },

  // ====================================
  // AI
  // ====================================

  aiHandled:{
    type:Boolean,
    default:true
  },

  escalatedToHuman:{
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

ConversationSchema.index({
  clientId:1,
  createdAt:-1
});

ConversationSchema.index({
  email:1
});

ConversationSchema.index({
  phone:1
});

ConversationSchema.index({
  customerId:1
});

// ======================================
// EXPORT
// ======================================

module.exports =
mongoose.model(
  "Conversation",
  ConversationSchema
);
