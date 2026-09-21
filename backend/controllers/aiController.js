const axios = require("axios");
const FormData = require("form-data");

const Disease = require("../models/Disease");
const Treatment = require("../models/Treatment");

const predictDisease = async (req, res) => {
  try {
    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image",
      });
    }

    // Create FormData for FastAPI
    const formData = new FormData();

    formData.append(
      "file",
      req.file.buffer,
      {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      }
    );

    // Send image to FastAPI
    const aiResponse = await axios.post(
      "http://127.0.0.1:8000/predict",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
      }
    );

    const prediction = aiResponse.data;

    console.log("AI Prediction:", prediction);

    // If image is invalid or uncertain, return immediately passing all properties
    if (prediction.valid_image === false || prediction.status === "invalid_image" || prediction.status === "uncertain") {
      return res.json(prediction);
    }

    // Convert AI class name to database disease name
    const diseaseNameMap = {
      early_blight: "Early Blight",
      late_blight: "Late Blight",
    };

    const databaseDiseaseName =
      diseaseNameMap[prediction.prediction];

    // Healthy plant does not need disease lookup
    if (!databaseDiseaseName) {
      return res.json({
        ...prediction,
        success: true,
        treatments: [],
      });
    }

    // Find disease in MongoDB
    const disease = await Disease.findOne({
      name: databaseDiseaseName,
    }).populate(
      "crop",
      "name scientificName season soilTypes"
    );

    if (!disease) {
      return res.json({
        ...prediction,
        success: true,
        treatments: [],
        message: "Disease prediction found, but disease information is not in the database yet.",
      });
    }

    // Find treatments
    const treatments = await Treatment.find({
      disease: disease._id,
    });

    // Send final response
    res.json({
      ...prediction,
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
    console.error(
      "AI prediction error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      success: false,
      message: "AI prediction failed",
      error: error.response?.data || error.message,
    });
  }
};

module.exports = {
  predictDisease,
};
