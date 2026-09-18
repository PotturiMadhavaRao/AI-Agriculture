

const axios = require("axios");
const Crop = require("../models/Crop");

const recommendCrop = async (req, res) => {
    try {
        const {
            N,
            P,
            K,
            temperature,
            humidity,
            ph,
            rainfall,
        } = req.body;

        // Check that all required values are present
        if (
            N === undefined ||
            P === undefined ||
            K === undefined ||
            temperature === undefined ||
            humidity === undefined ||
            ph === undefined ||
            rainfall === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "All crop recommendation fields are required",
            });
        }

        // Send data to FastAPI
        const aiResponse = await axios.post(
            "http://127.0.0.1:8000/recommend-crop",
            {
                N: Number(N),
                P: Number(P),
                K: Number(K),
                temperature: Number(temperature),
                humidity: Number(humidity),
                ph: Number(ph),
                rainfall: Number(rainfall),
            }
        );

        const prediction = aiResponse.data;

        console.log("Crop Recommendation:", prediction);

        const recommendedCrop = prediction.recommended_crop;

        const crop = await Crop.findOne({
            name: {
                $regex: new RegExp(`^${recommendedCrop}$`, "i"),
            },
        });

        let cropInfo = null;

        if (crop) {
            cropInfo = {
                id: crop._id,
                name: crop.name,
                scientificName: crop.scientificName,
                season: crop.season,
                soilTypes: crop.soilTypes,
                waterRequirement: crop.waterRequirement,
                growthDuration: crop.growthDuration,
                description: crop.description,
            };
        }

        res.json({
            success: true,

            recommendation: {
                recommended_crop: prediction.recommended_crop,
                confidence: prediction.confidence,
                top_recommendations: prediction.top_recommendations,
            },

            cropInfo,
        });

    } catch (error) {
        console.error(
            "Crop recommendation error:",
            error.response?.data || error.message
        );

        res.status(500).json({
            success: false,
            message: "Crop recommendation failed",
            error: error.response?.data || error.message,
        });
    }
};

module.exports = {
    recommendCrop,
};