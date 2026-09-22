const express = require("express");
const router = express.Router();
const agricultureAIController = require("../controllers/agricultureAIController");

router.post("/chat", agricultureAIController.chat);

module.exports = router;
