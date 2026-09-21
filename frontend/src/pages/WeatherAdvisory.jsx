import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../components/PageHeader';
import './WeatherAdvisory.css';

function WeatherAdvisory() {
    const { t } = useTranslation();
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [locationInput, setLocationInput] = useState("");
    const [recommendations, setRecommendations] = useState([]);
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    
    // Default coordinates for a central agricultural region (e.g., Nagpur, India)
    const [coords, setCoords] = useState({ lat: 21.1458, lon: 79.0882 });

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    const fetchWeather = async (lat, lon) => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch(`${API_URL}/api/weather?lat=${lat}&lon=${lon}`);
            
            if (!response.ok) {
                throw new Error("Failed to fetch weather data");
            }
            
            const data = await response.json();
            if (data.success) {
                setWeatherData(data);
            } else {
                throw new Error(data.message || "Failed to fetch weather data");
            }
        } catch (err) {
            console.error("Weather fetch error:", err);
            setError(err.message || "Could not load weather data. Please check your internet connection.");
        } finally {
            setLoading(false);
        }
    };

    const fetchCurrentLocation = (isManual = false) => {
        if ("geolocation" in navigator) {
            setLoading(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    setCoords({ lat, lon });
                    fetchWeather(lat, lon);
                    setLocationInput("");
                    setShowRecommendations(false);
                },
                (err) => {
                    console.log("Geolocation denied or failed.", err);
                    if (isManual) {
                        alert("Location access denied or failed. Please search manually.");
                        setLoading(false);
                    } else {
                        // Fallback to default coordinates on initial load
                        fetchWeather(coords.lat, coords.lon);
                    }
                },
                { timeout: 5000 }
            );
        } else {
            if (isManual) alert("Geolocation is not supported by your browser.");
            else fetchWeather(coords.lat, coords.lon);
        }
    };

    useEffect(() => {
        fetchCurrentLocation(false);
    }, []);

    // Debounced Search Effect
    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (locationInput.trim().length >= 3) {
                setSearchLoading(true);
                try {
                    const geoRes = await fetch(`${API_URL}/api/weather/geocode?city=${encodeURIComponent(locationInput)}`);
                    const geoData = await geoRes.json();
                    
                    if (geoData.success && geoData.locations && geoData.locations.length > 0) {
                        setRecommendations(geoData.locations);
                        setShowRecommendations(true);
                    } else {
                        setRecommendations([]);
                        setShowRecommendations(true);
                    }
                } catch (err) {
                    console.error("Failed to search location:", err);
                } finally {
                    setSearchLoading(false);
                }
            } else {
                setRecommendations([]);
                setShowRecommendations(false);
            }
        }, 400);

        return () => clearTimeout(timeoutId);
    }, [locationInput]);

    const handleSelectLocation = (loc) => {
        const displayName = loc.name + (loc.state ? `, ${loc.state}` : '');
        setLocationInput(displayName);
        setShowRecommendations(false);
        setCoords({ lat: loc.lat, lon: loc.lon });
        fetchWeather(loc.lat, loc.lon);
    };

    const getAdvisories = (current) => {
        if (!current) return [];
        const advisories = [];
        const temp = current.temperature;
        const rain = current.rainfall;
        const wind = current.windSpeed;
        const humidity = current.humidity;

        if (temp > 35) {
            advisories.push({ type: 'warning', icon: '🔥', title: 'Heat Advisory', text: 'High temperatures detected. Ensure adequate irrigation for crops to prevent heat stress.' });
        } else if (temp < 10) {
            advisories.push({ type: 'warning', icon: '❄️', title: 'Cold Advisory', text: 'Low temperatures may affect sensitive crops. Consider protective measures.' });
        }

        if (rain > 10) {
            advisories.push({ type: 'info', icon: '🌧️', title: 'Heavy Rainfall', text: 'Significant rainfall expected. Delay pesticide spraying and ensure proper field drainage.' });
        } else if (rain === 0 && temp > 30) {
            advisories.push({ type: 'info', icon: '💧', title: 'Irrigation Needed', text: 'Dry and hot conditions. Plan for scheduled irrigation today.' });
        }

        if (wind > 20) {
            advisories.push({ type: 'warning', icon: '💨', title: 'Strong Winds', text: 'High wind speeds detected. Delay any spraying activities to prevent chemical drift.' });
        }

        if (humidity > 85 && temp > 20) {
            advisories.push({ type: 'warning', icon: '🦠', title: 'Disease Risk', text: 'High humidity and warm temperatures increase the risk of fungal diseases. Monitor crops closely.' });
        }

        if (advisories.length === 0) {
            advisories.push({ type: 'success', icon: '✅', title: 'Favorable Conditions', text: 'Current weather conditions are favorable for normal agricultural activities.' });
        }

        return advisories;
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    };

    return (
        <div className="page-container">
            <PageHeader 
                title={t("sidebar.weatherAdvisory")} 
                description="Get current weather updates, forecasts, and smart agricultural advice for your area." 
            />

            <div className="weather-location-bar">
                <div className="location-form-container">
                    <input 
                        type="text" 
                        placeholder="Search for a city, village, or PIN code..." 
                        value={locationInput}
                        onChange={(e) => setLocationInput(e.target.value)}
                        className="location-input-field"
                    />
                    
                    {showRecommendations && locationInput.length >= 3 && (
                        <div className="recommendations-dropdown">
                            {searchLoading ? (
                                <div className="recommendation-item loading">Searching...</div>
                            ) : recommendations.length > 0 ? (
                                <>
                                    <div className="recommendations-header">Suggested locations:</div>
                                    {recommendations.map((loc, idx) => (
                                        <div 
                                            key={idx} 
                                            className="recommendation-item"
                                            onClick={() => handleSelectLocation(loc)}
                                        >
                                            <div className="rec-name">📍 {loc.name} {loc.zip ? `(${loc.zip})` : ''}</div>
                                            <div className="rec-sub">{loc.state ? `${loc.state}, ` : ''}{loc.country}</div>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <div className="recommendation-empty">
                                    No matching location found.
                                    <br/><br/>
                                    <small>Try a different spelling, your district, or your PIN code.</small>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <button type="button" className="btn-secondary location-btn" onClick={() => fetchCurrentLocation(true)}>
                    📍 Use my current location
                </button>
            </div>

            {error && <div className="error-alert">⚠️ {error}</div>}

            {loading && !weatherData ? (
                <div className="weather-loading">
                    <span className="weather-loader"></span>
                    <p>Fetching local weather data...</p>
                </div>
            ) : weatherData && weatherData.current ? (
                <div className="weather-content">
                    
                    {/* Current Conditions Card */}
                    <div className="current-weather-card">
                        <div className="current-weather-header">
                            <h3>Current Conditions: {weatherData.location?.name}</h3>
                            <div className="current-weather-main">
                                <img src={`https://openweathermap.org/img/wn/${weatherData.current.icon}@2x.png`} alt={weatherData.current.condition} />
                                <span className="current-temp">{Math.round(weatherData.current.temperature)}°C</span>
                                <span className="current-condition">{weatherData.current.condition}</span>
                            </div>
                        </div>
                        
                        <div className="current-metrics-grid">
                            <div className="metric-box">
                                <span className="metric-icon">🌡️</span>
                                <div className="metric-info">
                                    <span className="metric-label">Feels Like</span>
                                    <span className="metric-value">{Math.round(weatherData.current.feelsLike)}°C</span>
                                </div>
                            </div>
                            <div className="metric-box">
                                <span className="metric-icon">💧</span>
                                <div className="metric-info">
                                    <span className="metric-label">Humidity</span>
                                    <span className="metric-value">{weatherData.current.humidity}%</span>
                                </div>
                            </div>
                            <div className="metric-box">
                                <span className="metric-icon">🌧️</span>
                                <div className="metric-info">
                                    <span className="metric-label">Rainfall</span>
                                    <span className="metric-value">{weatherData.current.rainfall} mm</span>
                                </div>
                            </div>
                            <div className="metric-box">
                                <span className="metric-icon">💨</span>
                                <div className="metric-info">
                                    <span className="metric-label">Wind Speed</span>
                                    <span className="metric-value">{Math.round(weatherData.current.windSpeed)} km/h</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Agricultural Advisories */}
                    <div className="advisories-section">
                        <h3 className="section-title">🌾 Smart Agricultural Advisory</h3>
                        <div className="advisories-list">
                            {getAdvisories(weatherData.current).map((adv, index) => (
                                <div key={index} className={`advisory-card advisory-${adv.type}`}>
                                    <div className="advisory-icon">{adv.icon}</div>
                                    <div className="advisory-content">
                                        <h4>{adv.title}</h4>
                                        <p>{adv.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 7-Day Forecast */}
                    <div className="forecast-section">
                        <h3 className="section-title">📅 7-Day Forecast</h3>
                        <div className="forecast-grid">
                            {weatherData.forecast && weatherData.forecast.map((day, index) => (
                                <div key={index} className="forecast-card">
                                    <div className="forecast-date">{formatDate(day.date)}</div>
                                    <img src={`https://openweathermap.org/img/wn/${day.icon}.png`} alt={day.condition} className="forecast-icon"/>
                                    <div className="forecast-temps">
                                        <span className="temp-max">↑ {day.maxTemp}°</span>
                                        <span className="temp-min">↓ {day.minTemp}°</span>
                                    </div>
                                    <div className="forecast-rain">
                                        💧 {day.rainfall} mm
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="weather-disclaimer">
                        Weather data provided by OpenWeather. Advisories are AI-generated suggestions and should be verified with local agricultural authorities.
                    </div>

                </div>
            ) : null}
        </div>
    );
}

export default WeatherAdvisory;
