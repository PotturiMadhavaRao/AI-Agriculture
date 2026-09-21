const axios = require('axios');

const getOpenWeatherApiKey = () => {
    const key = process.env.OPENWEATHER_API_KEY;
    if (!key) {
        throw new Error("OPENWEATHER_API_KEY is not defined in environment variables");
    }
    return key;
};

const getWeatherByCoordinates = async (lat, lon) => {
    const apiKey = getOpenWeatherApiKey();
    
    // We will use the One Call API 3.0 or the standard Current Weather + Forecast APIs if One Call is not available.
    // Since we don't know the subscription level, we will use the free Current Weather Data and 5 day / 3 hour Forecast APIs.
    
    try {
        const [currentResponse, forecastResponse] = await Promise.all([
            axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`),
            axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
        ]);

        const currentData = currentResponse.data;
        const forecastData = forecastResponse.data;

        // Process forecast to get daily min/max (OpenWeather 5-day forecast returns data every 3 hours)
        const dailyForecasts = processForecast(forecastData.list);

        return {
            success: true,
            location: {
                name: currentData.name,
                latitude: currentData.coord.lat,
                longitude: currentData.coord.lon
            },
            current: {
                temperature: currentData.main.temp,
                feelsLike: currentData.main.feels_like,
                humidity: currentData.main.humidity,
                pressure: currentData.main.pressure,
                windSpeed: currentData.wind.speed * 3.6, // Convert m/s to km/h
                windDirection: currentData.wind.deg,
                rainfall: currentData.rain ? currentData.rain['1h'] || 0 : 0,
                cloudiness: currentData.clouds.all,
                visibility: currentData.visibility,
                condition: currentData.weather[0].main,
                weatherCode: currentData.weather[0].id,
                icon: currentData.weather[0].icon
            },
            forecast: dailyForecasts,
            lastUpdated: new Date().toISOString()
        };
    } catch (error) {
        console.error("OpenWeather API Error:", error.response?.data || error.message);
        throw new Error("Failed to fetch weather data from provider");
    }
};

const geocodeCity = async (query) => {
    const apiKey = getOpenWeatherApiKey();
    try {
        let url;
        // Check if query is a 6-digit Indian PIN code
        const isPinCode = /^\d{6}$/.test(query.trim());
        
        if (isPinCode) {
            url = `http://api.openweathermap.org/geo/1.0/zip?zip=${query.trim()},in&appid=${apiKey}`;
        } else {
            url = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${apiKey}`;
        }

        const response = await axios.get(url);
        
        // OpenWeather zip API returns a single object instead of an array
        const results = Array.isArray(response.data) ? response.data : [response.data];
        
        if (results && results.length > 0) {
            return results.map(loc => ({
                name: loc.name,
                lat: loc.lat,
                lon: loc.lon,
                state: loc.state || "",
                country: loc.country || "IN",
                zip: loc.zip || null
            }));
        } else {
            return []; // No locations found
        }
    } catch (error) {
        // 404 from zip api means not found, return empty array instead of crashing
        if (error.response && error.response.status === 404) {
             return [];
        }
        console.error("OpenWeather Geocoding Error:", error.response?.data || error.message);
        throw new Error("Failed to geocode location");
    }
};

// Helper function to group 3-hour forecasts into daily forecasts
const processForecast = (list) => {
    const dailyData = {};

    list.forEach(item => {
        // 'dt_txt' is formatted as "YYYY-MM-DD HH:MM:SS"
        const date = item.dt_txt.split(' ')[0];
        
        if (!dailyData[date]) {
            dailyData[date] = {
                date: date,
                minTemp: item.main.temp_min,
                maxTemp: item.main.temp_max,
                rainfall: item.rain ? item.rain['3h'] || 0 : 0,
                conditions: [],
                icons: []
            };
        } else {
            dailyData[date].minTemp = Math.min(dailyData[date].minTemp, item.main.temp_min);
            dailyData[date].maxTemp = Math.max(dailyData[date].maxTemp, item.main.temp_max);
            dailyData[date].rainfall += item.rain ? item.rain['3h'] || 0 : 0;
        }
        dailyData[date].conditions.push(item.weather[0].main);
        dailyData[date].icons.push(item.weather[0].icon);
    });

    // Determine the most frequent condition/icon for the day and return an array
    return Object.values(dailyData).slice(0, 7).map(day => {
        return {
            date: day.date,
            minTemp: Math.round(day.minTemp),
            maxTemp: Math.round(day.maxTemp),
            rainfall: Math.round(day.rainfall * 10) / 10,
            condition: getMostFrequent(day.conditions),
            icon: getMostFrequent(day.icons)
        };
    });
};

const getMostFrequent = (arr) => {
    const counts = {};
    let maxCount = 0;
    let mostFrequent = null;
    for (const item of arr) {
        counts[item] = (counts[item] || 0) + 1;
        if (counts[item] > maxCount) {
            maxCount = counts[item];
            mostFrequent = item;
        }
    }
    return mostFrequent;
};

module.exports = {
    getWeatherByCoordinates,
    geocodeCity
};
