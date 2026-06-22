// ======================================
// routes/knowledge.routes.js
// Layboka AI
// Knowledge Routes
// Production Ready
// ======================================

const express =
require("express");

const router =
express.Router();

const KnowledgeController =
require("../controllers/knowledge.controller");

// ======================================
// LIST
// GET /api/knowledge
// ======================================

router.get(

    "/",

    KnowledgeController.list

);

// ======================================
// SEARCH
// GET /api/knowledge/search
// ======================================

router.get(

    "/search",

    KnowledgeController.search

);

// ======================================
// CREATE
// POST /api/knowledge
// ======================================

router.post(

    "/",

    KnowledgeController.create

);

// ======================================
// UPDATE
// PUT /api/knowledge/:id
// ======================================

router.put(

    "/:id",

    KnowledgeController.update

);

// ======================================
// DELETE
// DELETE /api/knowledge/:id
// ======================================

router.delete(

    "/:id",

    KnowledgeController.remove

);

// ======================================
// HEALTH
// GET /api/knowledge/health
// ======================================

router.get(

    "/health",

    KnowledgeController.health

);

// ======================================
// EXPORT
// ======================================

module.exports =
router;
