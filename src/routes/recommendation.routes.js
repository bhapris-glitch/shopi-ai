// ======================================
// routes/recommendation.routes.js
// Layboka AI
// Recommendation Routes
// Production Ready
// ======================================

const express =
require("express");

const router =
express.Router();

const RecommendationController =
require("../controllers/recommendation.controller");

// ======================================
// LIST
// GET /api/recommendations
// ======================================

router.get(

    "/",

    RecommendationController.list

);

// ======================================
// GENERATE
// POST /api/recommendations/generate
// ======================================

router.post(

    "/generate",

    RecommendationController.generate

);

// ======================================
// UPDATE
// PUT /api/recommendations/:id
// ======================================

router.put(

    "/:id",

    RecommendationController.update

);

// ======================================
// DELETE
// DELETE /api/recommendations/:id
// ======================================

router.delete(

    "/:id",

    RecommendationController.remove

);

// ======================================
// ANALYTICS
// GET /api/recommendations/analytics
// ======================================

router.get(

    "/analytics",

    RecommendationController.analytics

);

// ======================================
// HEALTH
// GET /api/recommendations/health
// ======================================

router.get(

    "/health",

    RecommendationController.health

);

// ======================================
// EXPORT
// ======================================

module.exports =
router;
