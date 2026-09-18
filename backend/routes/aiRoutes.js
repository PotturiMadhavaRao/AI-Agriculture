const express = require("express");
const multer = require("multer");

const {
  predictDisease,
} = require("../controllers/aiController");

const router = express.Router();

// Store uploaded image in memory
const upload = multer({
  storage: multer.memoryStorage(),
});

// POST /api/ai/predict
router.post(
  "/predict",
  upload.single("file"),
  predictDisease
);

module.exports = router;
