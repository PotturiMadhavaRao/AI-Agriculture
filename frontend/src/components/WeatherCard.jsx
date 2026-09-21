import React, { useState, useEffect } from 'react';
import './DashboardComponents.css';

function WeatherCard({ coords }) {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    useEffect(() => {
        const fetchWeather = async () => {
            // Use provided coords or fallback to a default location (e.g. Nagpur)
            const lat = coords?.lat || 21.1458;
            const lon = coords?.lon || 79.0882;

            try {
                const response = await fetch(`${API_URL}/api/weather?lat=${lat}&lon=${lon}`);
                const data = await response.json();
                if (data.success) {
                    setWeather(data.current);
                } else {
                    setError("Failed to fetch");
                }
            } catch (err) {
                setError(err.message || "Error loading weather");
            } finally {
                setLoading(false);
            }
        };
        fetchWeather();
    }, [coords]);

    if (loading) return <div className="weather-card"><p>Loading weather...</p></div>;
    if (error || !weather) return <div className="weather-card"><p>{error || "Weather unavailable"}</p></div>;

    return (
        <div className="weather-card">
            <h3 className="weather-header">Current Weather</h3>
            <div className="weather-main">
                <div className="weather-temp">
                    <img src={`https://openweathermap.org/img/wn/${weather.icon}.png`} alt="icon" style={{width: '50px'}} />
                    <span className="temp-value">{Math.round(weather.temperature)}°C</span>
                </div>
                <div className="weather-desc">{weather.condition}</div>
            </div>
            
            <div className="weather-details">
                <div className="weather-detail-item">
                    <span className="detail-label">Humidity</span>
                    <span className="detail-value">{weather.humidity}%</span>
                </div>
                <div className="weather-detail-item">
                    <span className="detail-label">Wind</span>
                    <span className="detail-value">{Math.round(weather.windSpeed)} km/h</span>
                </div>
                <div className="weather-detail-item">
                    <span className="detail-label">Rainfall</span>
                    <span className="detail-value">{weather.rainfall} mm</span>
                </div>
            </div>
        </div>
    );
}

export default WeatherCard;
