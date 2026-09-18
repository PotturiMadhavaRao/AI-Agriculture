const axios = require("axios");

const predictYield = async (req, res) => {
    try {
        // ==========================================
        // 1. Get data from React request
        // ==========================================

        const {
            Area,
            Item,
            Year,
            average_rain_fall_mm_per_year,
            pesticides_tonnes,
            avg_temp,
        } = req.body;


        // ==========================================
        // 2. Validate required fields
        // ==========================================

        if (
            !Area ||
            !Item ||
            Year === undefined ||
            average_rain_fall_mm_per_year === undefined ||
            pesticides_tonnes === undefined ||
            avg_temp === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "All yield prediction fields are required",
            });
        }


        // ==========================================
        // 3. Send data to FastAPI
        // ==========================================

        const aiResponse = await axios.post(
            "http://127.0.0.1:8000/predict-yield",
            {
                Area: Area,
                Item: Item,
                Year: Number(Year),

                average_rain_fall_mm_per_year:
                    Number(average_rain_fall_mm_per_year),

                pesticides_tonnes:
                    Number(pesticides_tonnes),

                avg_temp:
                    Number(avg_temp),
            }
        );


        // ==========================================
        // 4. Get AI prediction
        // ==========================================

        const prediction = aiResponse.data;

        console.log(
            "Yield Prediction:",
            prediction
        );


        // ==========================================
        // 5. Send response to React
        // ==========================================

        res.json({
            success: true,

            prediction: prediction.prediction,
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