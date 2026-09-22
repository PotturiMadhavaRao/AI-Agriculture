import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import PageHeader from "../components/PageHeader";
import { translateDynamicContent, translateArray } from "../services/translationService";
import { useAgriAI } from "../context/AgriAIContext";
import "./CropRecommendation.css";

function CropRecommendation() {
    const { t } = useTranslation();
    const { openChatWithContext } = useAgriAI();
    
    // UI Modes
    const [mode, setMode] = useState("farmer"); // "farmer" or "advanced"
    const [step, setStep] = useState(1);
    
    // Form Data (shared by both modes to send to backend)
    const [formData, setFormData] = useState({
        N: "",
        P: "",
        K: "",
        ph: "",
        temperature: "",
        humidity: "",
        rainfall: "",
    });

    // Farmer Mode - Weather & Location State
    const [locationInput, setLocationInput] = useState("");
    const [recommendations, setRecommendations] = useState([]);
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [weatherData, setWeatherData] = useState(null);
    const [weatherLoading, setWeatherLoading] = useState(false);
    
    // Farmer Mode - Soil State
    const [soilOption, setSoilOption] = useState(""); // "upload" | "unknown"
    const [soilType, setSoilType] = useState("");
    const [ocrLoading, setOcrLoading] = useState(false);
    const [ocrFile, setOcrFile] = useState(null);
    const fileInputRef = useRef(null);
    
    // Labs Search
    const [labs, setLabs] = useState([]);
    const [labsLoading, setLabsLoading] = useState(false);
    const [coords, setCoords] = useState(null);

    // API Result State
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [dataQuality, setDataQuality] = useState(""); // "high" | "medium"

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    // --- WEATHER & LOCATION LOGIC ---
    
    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (locationInput.trim().length >= 3 && mode === "farmer" && step === 1) {
                try {
                    const geoRes = await fetch(`${API_URL}/api/weather/geocode?city=${encodeURIComponent(locationInput)}`);
                    const geoData = await geoRes.json();
                    if (geoData.success && geoData.locations?.length > 0) {
                        setRecommendations(geoData.locations);
                        setShowRecommendations(true);
                    } else {
                        setRecommendations([]);
                        setShowRecommendations(true);
                    }
                } catch (err) {
                    console.error("Location search error:", err);
                }
            } else {
                setShowRecommendations(false);
            }
        }, 400);
        return () => clearTimeout(timeoutId);
    }, [locationInput, mode, step]);

    const handleSelectLocation = async (loc) => {
        const displayName = loc.name + (loc.state ? `, ${loc.state}` : '');
        setLocationInput(displayName);
        setShowRecommendations(false);
        setCoords({ lat: loc.lat, lon: loc.lon });
        
        // Fetch real weather using coordinates
        setWeatherLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/weather?lat=${loc.lat}&lon=${loc.lon}`);
            const data = await response.json();
            if (data.success) {
                setWeatherData(data);
                setFormData(prev => ({
                    ...prev,
                    temperature: data.current.temperature,
                    humidity: data.current.humidity,
                    rainfall: data.current.rainfall > 0 ? data.current.rainfall * 30 : 100 // Approximation if no daily rain
                }));
            }
        } catch (err) {
            console.error("Weather fetch error:", err);
            setError("Could not load weather. Please enter values manually in Advanced Mode.");
        } finally {
            setWeatherLoading(false);
        }
    };

    const fetchCurrentLocation = () => {
        if ("geolocation" in navigator) {
            setWeatherLoading(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    handleSelectLocation({ name: "Current Location", lat, lon });
                },
                (err) => {
                    alert("Location access denied. Please search manually.");
                    setWeatherLoading(false);
                }
            );
        }
    };

    // --- SOIL & LABS LOGIC ---

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setOcrFile(file);
        setOcrLoading(true);
        
        const formDataObj = new FormData();
        formDataObj.append("image", file);

        try {
            const response = await fetch(`${API_URL}/api/crop-recommendation/ocr`, {
                method: "POST",
                body: formDataObj
            });
            const data = await response.json();
            if (data.success) {
                setFormData(prev => ({
                    ...prev,
                    N: data.data.N,
                    P: data.data.P,
                    K: data.data.K,
                    ph: data.data.ph
                }));
                setDataQuality("high");
            } else {
                throw new Error("OCR Failed");
            }
        } catch (err) {
            alert("Could not extract data. Please try Advanced Mode.");
        } finally {
            setOcrLoading(false);
        }
    };

    const handleSoilTypeSelect = (type) => {
        setSoilType(type);
        setDataQuality("medium");
        // Estimate basic NPK based on Indian soil types for fallback
        const estimates = {
            black: { N: 60, P: 40, K: 50, ph: 7.5 },
            red: { N: 40, P: 30, K: 40, ph: 6.0 },
            alluvial: { N: 80, P: 45, K: 50, ph: 7.0 },
            sandy: { N: 30, P: 20, K: 20, ph: 6.5 },
            loamy: { N: 70, P: 50, K: 45, ph: 6.8 }
        };
        const est = estimates[type];
        if (est) {
            setFormData(prev => ({ ...prev, ...est }));
        }
    };

    const findNearbyLabs = async () => {
        if (!coords) return alert("Please set your location first.");
        setLabsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/crop-recommendation/labs?lat=${coords.lat}&lon=${coords.lon}`);
            const data = await response.json();
            if (data.success) setLabs(data.labs);
        } catch (err) {
            console.error(err);
        } finally {
            setLabsLoading(false);
        }
    };

    // --- FORM SUBMISSION ---

    const handleChange = (event) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    };

    const handleSubmit = async (event) => {
        if (event) event.preventDefault();
        setLoading(true);
        setError("");
        setResult(null);

        // Ensure all are present
        const { N, P, K, ph, temperature, humidity, rainfall } = formData;
        if (!N || !P || !K || !ph || !temperature || !humidity || !rainfall) {
            setError("Please fill all required values.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/crop-recommendation/recommend`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || t("common.error"));

            if (data.success && data.recommendation) {
                data.recommendation.recommended_crop = await translateDynamicContent(data.recommendation.recommended_crop);
                if (data.cropInfo) {
                    data.cropInfo.description = await translateDynamicContent(data.cropInfo.description);
                    data.cropInfo.season = await translateDynamicContent(data.cropInfo.season);
                    data.cropInfo.waterRequirement = await translateDynamicContent(data.cropInfo.waterRequirement);
                    data.cropInfo.growthDuration = await translateDynamicContent(data.cropInfo.growthDuration);
                }
            }

            setResult(data);
            if (mode === "advanced") setDataQuality("high");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ N: "", P: "", K: "", ph: "", temperature: "", humidity: "", rainfall: "" });
        setResult(null);
        setError("");
        setStep(1);
        setWeatherData(null);
        setLocationInput("");
        setSoilOption("");
        setSoilType("");
    };

    const formatCropName = (name) => name ? name.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) : "";

    return (
        <div className="page-container">
            <PageHeader title={t("sidebar.cropRecommendation")} description="Discover the best crop to plant based on intelligent analysis." />

            <div className="mode-toggle">
                <button className={`mode-btn ${mode === "farmer" ? "active" : ""}`} onClick={() => setMode("farmer")}>🌾 Farmer Mode</button>
                <button className={`mode-btn ${mode === "advanced" ? "active" : ""}`} onClick={() => setMode("advanced")}>⚙️ Advanced Mode</button>
            </div>

            <div className="content-card">
                {!result ? (
                    <>
                        {mode === "farmer" && (
                            <div className="wizard-container">
                                {step === 1 && (
                                    <div className="wizard-step">
                                        <h2>📍 Where is your farm?</h2>
                                        <p>We'll automatically check the weather for your location.</p>
                                        
                                        <div className="location-form-container">
                                            <input 
                                                type="text" 
                                                placeholder="Search for your village or city..." 
                                                value={locationInput}
                                                onChange={(e) => setLocationInput(e.target.value)}
                                                className="location-input-field"
                                            />
                                            {showRecommendations && recommendations.length > 0 && (
                                                <div className="recommendations-dropdown">
                                                    {recommendations.map((loc, idx) => (
                                                        <div key={idx} className="recommendation-item" onClick={() => handleSelectLocation(loc)}>
                                                            📍 {loc.name} {loc.state ? `, ${loc.state}` : ''}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <button className="btn-secondary mt-2" onClick={fetchCurrentLocation}>
                                            📍 Use my current location
                                        </button>

                                        {weatherLoading && <p className="loading-text mt-3">Fetching weather data...</p>}
                                        
                                        {weatherData && (
                                            <div className="weather-preview mt-4">
                                                <h4>🌦️ Weather Data Retrieved</h4>
                                                <div className="weather-grid">
                                                    <div><strong>Temp:</strong> {Math.round(formData.temperature)}°C</div>
                                                    <div><strong>Humidity:</strong> {formData.humidity}%</div>
                                                    <div><strong>Rainfall:</strong> ~{formData.rainfall} mm</div>
                                                </div>
                                                <button className="btn-primary btn-large mt-4" onClick={() => setStep(2)}>Next Step ➡️</button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="wizard-step">
                                        <h2>📄 Do you know your soil information?</h2>
                                        
                                        <div className="soil-options">
                                            <button className={`soil-btn ${soilOption === 'upload' ? 'active' : ''}`} onClick={() => setSoilOption('upload')}>
                                                📷 Upload Soil Health Card
                                            </button>
                                            <button className={`soil-btn ${soilOption === 'unknown' ? 'active' : ''}`} onClick={() => setSoilOption('unknown')}>
                                                🤷 I don't know my exact values
                                            </button>
                                        </div>

                                        {soilOption === 'upload' && (
                                            <div className="ocr-upload-section">
                                                <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
                                                <button className="btn-secondary" onClick={() => fileInputRef.current.click()}>
                                                    {ocrLoading ? "Extracting Data..." : "Choose Image File"}
                                                </button>
                                                {formData.N && !ocrLoading && (
                                                    <div className="extracted-data mt-3">
                                                        <h4>Extracted Soil Values:</h4>
                                                        <div className="extracted-grid">
                                                            <div>N: <strong>{formData.N}</strong></div>
                                                            <div>P: <strong>{formData.P}</strong></div>
                                                            <div>K: <strong>{formData.K}</strong></div>
                                                            <div>pH: <strong>{formData.ph}</strong></div>
                                                        </div>
                                                        <button className="btn-primary btn-large mt-4" onClick={handleSubmit}>Get Recommendation 🌾</button>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {soilOption === 'unknown' && (
                                            <div className="unknown-soil-section">
                                                <label>Select your soil type for an estimated recommendation:</label>
                                                <div className="soil-type-grid">
                                                    {['black', 'red', 'alluvial', 'sandy', 'loamy'].map(type => (
                                                        <button key={type} className={`soil-type-btn ${soilType === type ? 'active' : ''}`} onClick={() => handleSoilTypeSelect(type)}>
                                                            {type.charAt(0).toUpperCase() + type.slice(1)} Soil
                                                        </button>
                                                    ))}
                                                </div>

                                                <div className="lab-search-section mt-4">
                                                    <p>For a highly accurate recommendation, get your soil tested.</p>
                                                    <button className="btn-secondary" onClick={findNearbyLabs}>
                                                        {labsLoading ? "Searching..." : "🔍 Find Nearby Soil Testing Labs"}
                                                    </button>
                                                    {labs.length > 0 && (
                                                        <div className="labs-list mt-3">
                                                            {labs.map(lab => (
                                                                <div key={lab.id} className="lab-card">
                                                                    <h4>{lab.name}</h4>
                                                                    <p>{lab.address} ({lab.distance})</p>
                                                                    <a href={lab.directions} target="_blank" rel="noreferrer">Get Directions</a>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {soilType && (
                                                    <button className="btn-primary btn-large mt-4" onClick={handleSubmit}>
                                                        Get Estimated Recommendation 🌾
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        <button className="btn-text mt-4" onClick={() => setStep(1)}>⬅️ Back</button>
                                    </div>
                                )}
                            </div>
                        )}

                        {mode === "advanced" && (
                            <form onSubmit={handleSubmit} className="crop-form">
                                <h3>⚙️ Advanced Manual Entry</h3>
                                <div className="input-grid">
                                    <div className="input-group"><label>Nitrogen (N)</label><input type="number" name="N" value={formData.N} onChange={handleChange} placeholder="e.g. 90" required /></div>
                                    <div className="input-group"><label>Phosphorus (P)</label><input type="number" name="P" value={formData.P} onChange={handleChange} placeholder="e.g. 42" required /></div>
                                    <div className="input-group"><label>Potassium (K)</label><input type="number" name="K" value={formData.K} onChange={handleChange} placeholder="e.g. 43" required /></div>
                                    <div className="input-group"><label>Soil pH</label><input type="number" step="any" name="ph" value={formData.ph} onChange={handleChange} placeholder="e.g. 6.5" required /></div>
                                    <div className="input-group"><label>Temperature (°C)</label><input type="number" step="any" name="temperature" value={formData.temperature} onChange={handleChange} placeholder="e.g. 25.5" required /></div>
                                    <div className="input-group"><label>Humidity (%)</label><input type="number" step="any" name="humidity" value={formData.humidity} onChange={handleChange} placeholder="e.g. 82" required /></div>
                                    <div className="input-group"><label>Rainfall (mm)</label><input type="number" step="any" name="rainfall" value={formData.rainfall} onChange={handleChange} placeholder="e.g. 200.5" required /></div>
                                </div>
                                <button type="submit" className="btn-primary btn-large mt-4" disabled={loading}>
                                    {loading ? "Analyzing..." : "Get Recommendation 🌾"}
                                </button>
                            </form>
                        )}
                        
                        {error && <div className="error-alert mt-4">❌ {error}</div>}
                    </>
                ) : (
                    <div className="result-container">
                        <div className="result-header-row">
                            <h2 className="result-heading">Recommendation Result</h2>
                            {dataQuality === "high" && <span className="quality-badge high">🟢 High Data Quality</span>}
                            {dataQuality === "medium" && <span className="quality-badge medium">🟡 Medium Data Quality (Estimated Soil)</span>}
                        </div>

                        <div className="primary-recommendation">
                            <div className="recommended-crop-info">
                                <span className="result-badge">Top Match</span>
                                <h2 className="recommended-crop-name">🌾 {formatCropName(result.recommendation.recommended_crop)}</h2>
                            </div>
                            <div className="confidence-display">
                                <span className="confidence-label">Suitability Score</span>
                                <span className="confidence-value">{result.recommendation.confidence}%</span>
                            </div>
                        </div>

                        <div className="explanation-section mt-4">
                            <h3>Why this crop?</h3>
                            <ul className="explanation-list">
                                <li>✓ Temperature ({Math.round(formData.temperature)}°C) is highly suitable.</li>
                                <li>✓ Rainfall pattern (~{Math.round(formData.rainfall)} mm) matches crop requirements.</li>
                                {dataQuality === "high" ? (
                                    <li>✓ Laboratory soil measurements align with optimal crop growth.</li>
                                ) : (
                                    <li>✓ Estimated {soilType} soil parameters fall within the acceptable range.</li>
                                )}
                            </ul>
                        </div>

                        {result.cropInfo && (
                            <div className="crop-details mt-4">
                                <h3>About {result.cropInfo.name}</h3>
                                <p className="crop-description-text">{result.cropInfo.description}</p>
                                <div className="crop-requirements-grid">
                                    <div className="req-item"><span className="req-icon">🌦️</span><div className="req-text"><small>Season</small><strong>{result.cropInfo.season}</strong></div></div>
                                    <div className="req-item"><span className="req-icon">💧</span><div className="req-text"><small>Water</small><strong>{result.cropInfo.waterRequirement}</strong></div></div>
                                </div>
                            </div>
                        )}

                        <div style={{display: 'flex', gap: '10px', marginTop: '1rem'}}>
                            <button className="btn-primary" style={{background: '#2ecc71', borderColor: '#2ecc71'}} onClick={() => openChatWithContext({
                                module: 'crop_recommendation',
                                recommended_crop: result.recommendation.recommended_crop,
                                confidence: result.recommendation.confidence
                            })}>
                                🌱 Ask AgriAI about this crop
                            </button>
                            <button className="btn-secondary" onClick={resetForm}>Start Over</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CropRecommendation;