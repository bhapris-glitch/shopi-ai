// routes/client.routes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/client.controller");
const { authMiddleware } = require("../../middleware/authMiddleware");

router.get("/health", controller.health);
router.get("/me", authMiddleware, controller.me);
router.put("/settings", authMiddleware, controller.updateSettings);
router.post("/onboard", authMiddleware, controller.onboard);
router.get("/analytics", authMiddleware, controller.analytics);
router.get("/billing", authMiddleware, controller.billing);

// ==== ADD THESE 3 LINES BELOW ====
router.get("/chatbot", authMiddleware, controller.getChatbotSettings);
router.put("/chatbot", authMiddleware, controller.saveChatbotSettings);
router.post("/chatbot/apikey", authMiddleware, controller.rotateApiKey);
// =================================

module.exports = router;
