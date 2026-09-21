const weatherService = require('../services/weatherService');

const getWeather = async (req, res) => {
    try {
        const { lat, lon } = req.query;

        if (!lat || !lon) {
            return res.status(400).json({
                success: false,
                message: "Latitude (lat) and Longitude (lon) are required."
            });
        }

        const weatherData = await weatherService.getWeatherByCoordinates(lat, lon);
        res.json(weatherData);

    } catch (error) {
        console.error("Weather Controller Error (getWeather):", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve weather data",
        });
    }
};

const geocodeLocation = async (req, res) => {
    try {
        const { city } = req.query;

        if (!city) {
            return res.status(400).json({
                success: false,
                message: "City name is required."
            });
        }

        const locationData = await weatherService.geocodeCity(city);
        
        res.json({
            success: true,
            locations: locationData
        });

    } catch (error) {
        console.error("Weather Controller Error (geocodeLocation):", error);
        res.status(500).json({
            success: false,
            message: "Failed to geocode location",
        });
    }
};

module.exports = {
    getWeather,
    geocodeLocation
};
