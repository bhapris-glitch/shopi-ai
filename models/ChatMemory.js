const mongoose =
require("mongoose");

const ChatMemorySchema =
new mongoose.Schema({

  sessionId:String,

  clientId:String,

  messages:[

    {
      role:String,
      content:String
    }

  ],

  viewedProducts:[String],

  cartItems:[Object]

},{
  timestamps:true
});

module.exports =
mongoose.model(
  "ChatMemory",
  ChatMemorySchema
);
