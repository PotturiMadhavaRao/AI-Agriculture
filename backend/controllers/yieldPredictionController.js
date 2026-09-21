const axios = require("axios");

const predictYield = async (req, res) => {
    try {
        // ==========================================
        // 1. Get data from React request
        // ==========================================

        const {
            Country,
            Crop,
            FarmLandArea,
            Irrigation,
            SoilType
        } = req.body;


        // ==========================================
        // 2. Validate required fields
        // ==========================================

        if (
            !Country ||
            !Crop ||
            !FarmLandArea
        ) {
            return res.status(400).json({
                success: false,
                message: "Country, Crop, and Farm Land Area fields are required",
            });
        }


        // ==========================================
        // 3. Send data to FastAPI
        // ==========================================

        const aiResponse = await axios.post(
            "http://127.0.0.1:8000/predict-yield",
            {
                Country: Country,
                Crop: Crop,
                Year: 2024
            }
        );


        // ==========================================
        // 4. Get AI prediction
        // ==========================================

        const prediction = aiResponse.data.prediction;

        console.log(
            "Yield Prediction:",
            prediction
        );

        // Calculate total production
        const areaHa = parseFloat(FarmLandArea);
        const totalProduction = (prediction.yield_tonnes_per_ha * areaHa).toFixed(2);

        // ==========================================
        // 5. Send response to React
        // ==========================================

        res.json({
            success: true,
            country: prediction.country,
            crop: prediction.crop,
            predicted_yield_kg_per_ha: prediction.yield_kg_per_ha,
            predicted_yield_tonnes_per_ha: prediction.yield_tonnes_per_ha,
            farm_area_hectares: areaHa,
            estimated_total_production_tonnes: Number(totalProduction)
        });


    } catch (error) {

        console.error(
            "Yield prediction error:",
            error.response?.data || error.message
        );


        res.status(500).json({
            success: false,
            message: "Yield prediction failed",

            error:
                error.response?.data ||
                error.message,
        });
    }
};


module.exports = {
    predictYield,
};