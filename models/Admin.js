// ======================================
// models/Admin.js
// Layboka AI Admin Model
// ======================================

const mongoose =
require("mongoose");

// ======================================
// ADMIN SCHEMA
// ======================================

const adminSchema =
new mongoose.Schema({

  name:{
    type:String,
    required:true
  },

  email:{
    type:String,
    required:true,
    unique:true
  },

  password:{
    type:String,
    required:true
  },

  role:{
    type:String,
    default:"admin"
  },

  permissions:[

    {
      type:String
    }

  ],

  active:{
    type:Boolean,
    default:true
  },

  lastLogin:{
    type:Date
  },

  createdAt:{
    type:Date,
    default:Date.now
  }

});

// ======================================
// EXPORT
// ======================================

module.exports =
mongoose.model(
  "Admin",
  adminSchema
);
