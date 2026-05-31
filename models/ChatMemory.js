// ====================================== 
// models/ChatMemory.js 
// Layboka AI
// Updated 1Jun,2026
// ===============================
const mongoose =
require("mongoose");

const ChatMemorySchema =
new mongoose.Schema({

  sessionId:{
    type:String,
    required:true,
    index:true
  },

  clientId:{
    type:String,
    default:""
  },

  messages:[

    {
      role:String,
      content:String,
      at:{
        type:Date,
        default:Date.now
      }
    }

  ],

  viewedProducts:{
    type:[String],
    default:[]
  },

  cartItems:{
    type:[Object],
    default:[]
  },

  actions:{
    type:[Object],
    default:[]
  },

  purchaseIntent:{
    type:Number,
    default:0
  },

  avgSpend:{
    type:Number,
    default:0
  },

  lastSeen:{
    type:Date,
    default:Date.now
  }

},
{
  timestamps:true
});

ChatMemorySchema.index({
  sessionId:1
});

ChatMemorySchema.index({
  clientId:1
});

module.exports =
mongoose.model(
  "ChatMemory",
  ChatMemorySchema
);
