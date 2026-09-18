const express = require("express");

const Crop = require("../models/Crop");

const router = express.Router();


// GET all crops
router.get("/", async (req, res) => {
  try {
    const crops = await Crop.find();

    res.json(crops);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch crops",
      error: error.message,
    });
  }
});


// GET single crop
router.get("/:id", async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({
        message: "Crop not found",
      });
    }

    res.json(crop);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch crop",
      error: error.message,
    });
  }
});


// CREATE crop
router.post("/", async (req, res) => {
  try {
    const crop = await Crop.create(req.body);

    res.status(201).json(crop);
  } catch (error) {
    res.status(400).json({
      message: "Failed to create crop",
      error: error.message,
    });
  }
});


module.exports = router;
