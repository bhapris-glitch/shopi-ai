// ======================================
// controllers/analytics.controller.js
// Layboka AI
// Analytics Controller
// Production Ready
// PART 1
// ======================================

const Analytics =
require("../models/Analytics");

const Conversation =
require("../models/Conversation");

const Customer =
require("../models/Customer");

const Recommendation =
require("../models/Recommendation");

// ======================================
// OVERVIEW
// ======================================

exports.overview =
async(req,res)=>{

    try{

       
