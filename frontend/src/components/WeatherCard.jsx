import React from 'react';
import './DashboardComponents.css';

function WeatherCard() {
    return (
        <div className="weather-card">
            <h3 className="weather-header">Current Weather</h3>
            <div className="weather-main">
                <div className="weather-temp">
                    <span className="weather-icon">⛅</span>
                    <span className="temp-value">28°C</span>
                </div>
                <div className="weather-desc">Partly Cloudy</div>
            </div>
            
            <div className="weather-details">
                <div className="weather-detail-item">
                    <span className="detail-label">Humidity</span>
                    <span className="detail-value">76%</span>
                </div>
                <div className="weather-detail-item">
                    <span className="detail-label">Wind</span>
                    <span className="detail-value">12 km/h</span>
                </div>
                <div className="weather-detail-item">
                    <span className="detail-label">UV Index</span>
                    <span className="detail-value">Moderate</span>
                </div>
            </div>
        </div>
    );
}

export default WeatherCard;
