const express = require("express");

const Treatment = require("../models/Treatment");

const router = express.Router();


// GET all treatments
router.get("/", async (req, res) => {
  try {
    const treatments = await Treatment.find()
      .populate("disease", "name");

    res.json(treatments);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch treatments",
      error: error.message,
    });
  }
});


// GET treatment by disease
router.get("/disease/:diseaseId", async (req, res) => {
  try {
    const treatments = await Treatment.find({
      disease: req.params.diseaseId,
    });

    res.json(treatments);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch treatments",
      error: error.message,
    });
  }
});


// CREATE treatment
router.post("/", async (req, res) => {
  try {
    const treatment = await Treatment.create(req.body);

    res.status(201).json(treatment);
  } catch (error) {
    res.status(400).json({
      message: "Failed to create treatment",
      error: error.message,
    });
  }
});


module.exports = router;
