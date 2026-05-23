// ======================================
// models/Ticket.js
// ======================================

const mongoose =
require("mongoose");

const ticketSchema =
new mongoose.Schema({

  name:String,

  email:String,

  message:String,

  status:{
    type:String,
    default:"open"
  }

},{
  timestamps:true
});

module.exports =
mongoose.model(
  "Ticket",
  ticketSchema
);
