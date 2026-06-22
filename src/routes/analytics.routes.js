// ======================================
// routes/analytics.routes.js
// Layboka AI
// Analytics Routes
// Production Ready
// ======================================

const express =
require("express");

const router =
express.Router();

const AnalyticsController =
require("../controllers/analytics.controller");

// ======================================
// ANALYTICS OVERVIEW
// GET /api/analytics/overview
// ======================================

router.get(

    "/overview",

    AnalyticsController.overview

);

// ======================================
// HEALTH
// GET /api/analytics/health
// ======================================

router.get(

    "/health",

    (req,res)=>{

        return res.json({

            success:true,

            service:"Analytics",

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
