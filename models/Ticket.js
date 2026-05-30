// ======================================
// models/Ticket.js
// ======================================

const mongoose = require("mongoose");

const TicketSchema = new mongoose.Schema({

  // =========================
  // CLIENT (STORE OWNER)
  // =========================

  clientId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Client",
    index:true
  },

  // =========================
  // CUSTOMER
  // =========================

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
    default:""
  },

  // =========================
  // SUBJECT
  // =========================

  subject:{
    type:String,
    default:"Support Request"
  },

  message:{
    type:String,
    default:""
  },

  // =========================
  // ORDER LINK
  // =========================

  orderId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Order"
  },

  orderNumber:{
    type:String,
    default:""
  },

  // =========================
  // STATUS
  // =========================

  status:{
    type:String,
    enum:[
      "open",
      "pending",
      "resolved",
      "closed"
    ],
    default:"open",
    index:true
  },

  // =========================
  // PRIORITY
  // =========================

  priority:{
    type:String,
    enum:[
      "low",
      "medium",
      "high",
      "urgent"
    ],
    default:"medium"
  },

  // =========================
  // AI SUPPORT
  // =========================

  aiHandled:{
    type:Boolean,
    default:false
  },

  aiResolved:{
    type:Boolean,
    default:false
  },

  escalatedToHuman:{
    type:Boolean,
    default:false
  },

  // =========================
  // CUSTOMER VALUE
  // =========================

  isVIP:{
    type:Boolean,
    default:false
  },

  totalCustomerSpend:{
    type:Number,
    default:0
  },

  totalOrders:{
    type:Number,
    default:0
  },

  // =========================
  // CONVERSATION THREAD
  // =========================

  messages:[

    {
      sender:{
        type:String,
        enum:[
          "customer",
          "ai",
          "admin"
        ],
        default:"customer"
      },

      message:{
        type:String,
        default:""
      },

      createdAt:{
        type:Date,
        default:Date.now
      }
    }

  ],

  // =========================
  // RESOLUTION
  // =========================

  resolvedAt:{
    type:Date
  },

  closedAt:{
    type:Date
  }

},{
  timestamps:true
});

module.exports =
mongoose.model(
  "Ticket",
  TicketSchema
);
