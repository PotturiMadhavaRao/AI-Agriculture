const express = require("express");
const Disease = require("../models/Disease");
const Crop = require("../models/Crop");
const Treatment = require("../models/Treatment");

const router = express.Router();


// POST /api/research/ask
router.post("/ask", async (req, res) => {
    try {
        const { question } = req.body;

        if (!question || question.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Please enter a question",
            });
        }

        const query = question.toLowerCase();

        // Find diseases
        const diseases = await Disease.find()
            .populate("crop", "name scientificName");

        // Find matching disease
        let matchedDisease = null;

        for (const disease of diseases) {
            const diseaseName = disease.name.toLowerCase();
            const cropName = disease.crop?.name?.toLowerCase() || "";

            if (
                query.includes(diseaseName) ||
                query.includes(cropName)
            ) {
                matchedDisease = disease;
                break;
            }
        }

        // If disease found
        if (matchedDisease) {

            const treatments = await Treatment.find({
                disease: matchedDisease._id,
            });

            return res.json({
                success: true,
                type: "disease_information",

                question,

                answer: {
                    title: matchedDisease.name,

                    crop: matchedDisease.crop?.name,

                    description: matchedDisease.description,

                    cause: matchedDisease.cause,

                    symptoms: matchedDisease.symptoms,

                    favorableConditions:
                        matchedDisease.favorableConditions,

                    prevention:
                        matchedDisease.prevention,

                    treatments: treatments.map((treatment) => ({
                        type: treatment.treatmentType,
                        recommendation:
                            treatment.recommendation,
                        activeIngredient:
                            treatment.activeIngredient,
                        safetyPrecautions:
                            treatment.safetyPrecautions,
                    })),
                },
            });
        }

        // If no disease matched
        return res.json({
            success: true,
            type: "general",

            question,

            answer: {
                title: "Agricultural Research Assistant",

                message:
                    "I could not find a specific disease matching your question in the current agricultural knowledge database.",

                suggestion:
                    "Try asking about a crop or disease available in the system, such as Tomato, Rice, Maize, Late Blight, or Early Blight.",
            },
        });

    } catch (error) {

        console.error(
            "Research assistant error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to process research question",
            error: error.message,
        });
    }
});


module.exports = router;