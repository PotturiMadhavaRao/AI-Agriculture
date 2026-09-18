const express = require("express");

const Disease = require("../models/Disease");

const router = express.Router();


// GET all diseases
router.get("/", async (req, res) => {
  try {
    const diseases = await Disease.find()
      .populate("crop", "name scientificName");

    res.json(diseases);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch diseases",
      error: error.message,
    });
  }
});


// GET disease details by disease name
router.get("/name/:diseaseName/details", async (req, res) => {
  try {
    const diseaseName = decodeURIComponent(req.params.diseaseName);

    const disease = await Disease.findOne({
      name: {
        $regex: new RegExp(`^${diseaseName}$`, "i"),
      },
    }).populate(
      "crop",
      "name scientificName season soilTypes waterRequirement growthDuration"
    );

    if (!disease) {
      return res.status(404).json({
        success: false,
        message: "Disease not found",
      });
    }

    const Treatment = require("../models/Treatment");

    const treatments = await Treatment.find({
      disease: disease._id,
    });

    res.json({
      success: true,

      disease: {
        id: disease._id,
        name: disease.name,
        cause: disease.cause,
        symptoms: disease.symptoms,
        favorableConditions: disease.favorableConditions,
        prevention: disease.prevention,
        description: disease.description,
      },

      crop: disease.crop,

      treatments: treatments.map((treatment) => ({
        id: treatment._id,
        treatmentType: treatment.treatmentType,
        recommendation: treatment.recommendation,
        activeIngredient: treatment.activeIngredient,
        safetyPrecautions: treatment.safetyPrecautions,
      })),
    });
  } catch (error) {
    console.error("Disease details by name error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch disease details",
      error: error.message,
    });
  }
});


// GET disease details by ID
router.get("/:id/details", async (req, res) => {
  try {
    const disease = await Disease.findById(req.params.id)
      .populate("crop", "name scientificName season soilTypes");

    if (!disease) {
      return res.status(404).json({
        message: "Disease not found",
      });
    }

    const Treatment = require("../models/Treatment");

    const treatments = await Treatment.find({
      disease: disease._id,
    });

    res.json({
      disease: {
        id: disease._id,
        name: disease.name,
        cause: disease.cause,
        symptoms: disease.symptoms,
        favorableConditions: disease.favorableConditions,
        prevention: disease.prevention,
        description: disease.description,
      },

      crop: disease.crop,

      treatments: treatments.map((treatment) => ({
        id: treatment._id,
        treatmentType: treatment.treatmentType,
        recommendation: treatment.recommendation,
        activeIngredient: treatment.activeIngredient,
        safetyPrecautions: treatment.safetyPrecautions,
      })),
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch disease details",
      error: error.message,
    });
  }
});


// GET disease by ID
router.get("/:id", async (req, res) => {
  try {
    const disease = await Disease.findById(req.params.id)
      .populate("crop", "name scientificName");

    if (!disease) {
      return res.status(404).json({
        message: "Disease not found",
      });
    }

    res.json(disease);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch disease",
      error: error.message,
    });
  }
});


// CREATE disease
router.post("/", async (req, res) => {
  try {
    const disease = await Disease.create(req.body);

    res.status(201).json(disease);
  } catch (error) {
    res.status(400).json({
      message: "Failed to create disease",
      error: error.message,
    });
  }
});


module.exports = router;
