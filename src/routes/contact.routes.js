const express = require("express");
const router = express.Router();
const controller = require("../controllers/contact.controller");
const { authMiddleware, adminMiddleware } = require("../../middleware/authMiddleware");

router.get("/health", controller.health);
router.post("/", controller.submit);                 // public
router.get("/", authMiddleware, adminMiddleware, controller.list); // admin only

module.exports = router;
