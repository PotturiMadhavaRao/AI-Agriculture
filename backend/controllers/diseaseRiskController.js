const axios = require("axios");

const predictDiseaseRisk = async (req, res) => {
    try {
        const {
            temperature,
            humidity,
            rainfall,
            leaf_wetness,
            crop_age_days,
        } = req.body;

        // Check required fields
        if (
            temperature === undefined ||
            humidity === undefined ||
            rainfall === undefined ||
            leaf_wetness === undefined ||
            crop_age_days === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "All disease risk fields are required",
            });
        }

        // Send data to FastAPI
        const aiResponse = await axios.post(
            "http://127.0.0.1:8000/predict-disease-risk",
            {
                temperature: Number(temperature),
                humidity: Number(humidity),
                rainfall: Number(rainfall),
                leaf_wetness: Number(leaf_wetness),
                crop_age_days: Number(crop_age_days),
            }
        );

        const prediction = aiResponse.data;

        console.log(
            "Disease Risk Prediction:",
            prediction
        );

        // Send result back to React
        res.json({
            success: true,
            risk: prediction,
        });

    } catch (error) {

        console.error(
            "Disease risk prediction error:",
            error.response?.data || error.message
        );

        res.status(500).json({
            success: false,
            message: "Disease risk prediction failed",
            error:
                error.response?.data ||
                error.message,
        });
    }
};

module.exports = {
    predictDiseaseRisk,
};