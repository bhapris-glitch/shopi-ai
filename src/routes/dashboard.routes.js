// ======================================
// routes/dashboard.routes.js
// Layboka AI
// Dashboard Routes
// Production Ready
// ======================================

const express =
require("express");

const router =
express.Router();

const DashboardController =
require("../controllers/dashboard.controller");

// ======================================
// OVERVIEW
// GET /api/dashboard/overview
// ======================================

router.get(

    "/overview",

    DashboardController.overview

);

// ======================================
// HEALTH
// GET /api/dashboard/health
// ======================================

router.get(

    "/health",

    (req,res)=>{

        res.json({

            success:true,

            service:"Dashboard",

            status:"running",

            timestamp:new Date()

        });

    }

);

// ======================================
// EXPORT
// ======================================

module.exports =
router;
