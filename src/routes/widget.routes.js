// routes/widget.routes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/widget.controller");

router.get("/health", controller.health);
router.get("/bootstrap", controller.bootstrap);   // GET /api/widget/bootstrap?shop=...&key=...
router.post("/bootstrap", controller.bootstrap);   // accept POST too

module.exports = router;
