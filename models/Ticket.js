// ======================================
// models/Ticket.js
// Layboka AI Support Ticket Model
// Updated 04 Jun 2026
// ======================================
const mongoose =
require("mongoose");

// ======================================
// MESSAGE SCHEMA
// ======================================

const MessageSchema =
new mongoose.Schema({

  sender:{
    type:String,
    enum:[
      "customer",
      "ai",
      "agent",
      "admin"
    ],
    default:"customer"
  },

  message:{
    type:String,
    required:true
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
// TICKET SCHEMA
// ======================================

const TicketSchema =
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
    lowercase:true,
    index:true
  },

  customerPhone:{
    type:String,
    default:""
  },

  // ====================================
  // TICKET
  // ====================================

  subject:{
    type:String,
    default:"Support Request"
  },

  message:{
    type:String,
    default:""
  },

  orderNumber:{
    type:String,
    default:"",
    index:true
  },

  // ====================================
  // STATUS
  // ====================================

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

  // ====================================
  // AI
  // ====================================

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

  // ====================================
  // CONVERSATION
  // ====================================

  messages:{
    type:[MessageSchema],
    default:[]
  },

  // ====================================
  // ASSIGNMENT
  // ====================================

  assignedTo:{
    type:String,
    default:""
  },

  // ====================================
  // DATES
  // ====================================

  closedAt:{
    type:Date,
    default:null
  }

},
{
  timestamps:true,
  versionKey:false
});

// ======================================
// INDEXES
// ======================================

TicketSchema.index({
  clientId:1,
  status:1
});

TicketSchema.index({
  customerEmail:1
});

TicketSchema.index({
  orderNumber:1
});

TicketSchema.index({
  createdAt:-1
});

// ======================================
// EXPORT
// ======================================

module.exports =
mongoose.model(
  "Ticket",
  TicketSchema
);
