import React, { useState } from "react";
import PageHeader from "../components/PageHeader";
import "./CropRecommendation.css";

function CropRecommendation() {
    const [formData, setFormData] = useState({
        N: "",
        P: "",
        K: "",
        ph: "",
        temperature: "",
        humidity: "",
        rainfall: "",
    });

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");
        setResult(null);

        try {
            const response = await fetch("http://localhost:5000/api/crop-recommendation/recommend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Crop recommendation failed");
            setResult(data);
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
    };

    const formatCropName = (name) => {
        if (!name) return "";
        return name.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
    };

    return (
        <div className="page-container">
            <PageHeader 
                title="Crop Recommendation" 
                description="Find the most suitable crop for your farm based on soil nutrients and weather conditions." 
            />

            <div className="content-card">
                <form onSubmit={handleSubmit} className="crop-form">
                    
                    <div className="form-section">
                        <div className="section-header">
                            <span className="section-icon">🌱</span>
                            <h3>Step 1: Soil Information</h3>
                        </div>
                        <p className="section-desc">Enter the nutrient values from your soil test.</p>
                        
                        <div className="input-grid">
                            <div className="input-group">
                                <label>Nitrogen (N)</label>
                                <input type="number" name="N" value={formData.N} onChange={handleChange} placeholder="e.g. 90" required />
                            </div>
                            <div className="input-group">
                                <label>Phosphorus (P)</label>
                                <input type="number" name="P" value={formData.P} onChange={handleChange} placeholder="e.g. 42" required />
                            </div>
                            <div className="input-group">
                                <label>Potassium (K)</label>
                                <input type="number" name="K" value={formData.K} onChange={handleChange} placeholder="e.g. 43" required />
                            </div>
                            <div className="input-group">
                                <label>Soil pH</label>
                                <input type="number" step="0.1" name="ph" value={formData.ph} onChange={handleChange} placeholder="e.g. 6.5" required />
                            </div>
                        </div>
                    </div>

                    <hr className="form-divider" />

                    <div className="form-section">
                        <div className="section-header">
                            <span className="section-icon">⛅</span>
                            <h3>Step 2: Weather Information</h3>
                        </div>
                        <p className="section-desc">Enter current or average weather conditions.</p>
                        
                        <div className="input-grid">
                            <div className="input-group">
                                <label>Temperature (°C)</label>
                                <input type="number" step="0.1" name="temperature" value={formData.temperature} onChange={handleChange} placeholder="e.g. 21.0" required />
                            </div>
                            <div className="input-group">
                                <label>Humidity (%)</label>
                                <input type="number" step="0.1" name="humidity" value={formData.humidity} onChange={handleChange} placeholder="e.g. 82.0" required />
                            </div>
                            <div className="input-group">
                                <label>Rainfall (mm)</label>
                                <input type="number" step="0.1" name="rainfall" value={formData.rainfall} onChange={handleChange} placeholder="e.g. 203.0" required />
                            </div>
                        </div>
                    </div>

                    {error && <div className="error-alert">❌ {error}</div>}

                    <div className="form-actions">
                        <button type="submit" className="btn-primary btn-large" disabled={loading}>
                            {loading ? "🤖 Finding Best Crop..." : "🌾 Recommend Crop"}
                        </button>
                    </div>

                </form>
            </div>

            {result && result.recommendation && (
                <div className="result-container">
                    <h2 className="result-heading">Recommendation Result</h2>

                    <div className="primary-recommendation">
                        <div className="recommended-crop-info">
                            <span className="result-badge">Top Match</span>
                            <h2 className="recommended-crop-name">{formatCropName(result.recommendation.recommended_crop)}</h2>
                        </div>
                        
                        <div className="confidence-display">
                            <span className="confidence-label">AI Confidence</span>
                            <span className="confidence-value">{result.recommendation.confidence}%</span>
                        </div>
                    </div>

                    {result.cropInfo && (
                        <div className="crop-details">
                            <h3>📖 About {result.cropInfo.name}</h3>
                            <p className="crop-scientific">({result.cropInfo.scientificName})</p>
                            <p className="crop-description-text">{result.cropInfo.description}</p>
                            
                            <div className="crop-requirements-grid">
                                <div className="req-item">
                                    <span className="req-icon">🌦️</span>
                                    <div className="req-text">
                                        <small>Season</small>
                                        <strong>{result.cropInfo.season}</strong>
                                    </div>
                                </div>
                                <div className="req-item">
                                    <span className="req-icon">💧</span>
                                    <div className="req-text">
                                        <small>Water</small>
                                        <strong>{result.cropInfo.waterRequirement}</strong>
                                    </div>
                                </div>
                                <div className="req-item">
                                    <span className="req-icon">🌱</span>
                                    <div className="req-text">
                                        <small>Soil Types</small>
                                        <strong>{result.cropInfo.soilTypes?.join(", ")}</strong>
                                    </div>
                                </div>
                                <div className="req-item">
                                    <span className="req-icon">📅</span>
                                    <div className="req-text">
                                        <small>Growth Duration</small>
                                        <strong>{result.cropInfo.growthDuration}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {result.recommendation.top_recommendations?.length > 1 && (
                        <div className="other-recommendations">
                            <h3>Other Suitable Crops</h3>
                            <div className="other-crops-list">
                                {result.recommendation.top_recommendations.slice(1).map((item, index) => (
                                    <div className="other-crop-item" key={item.crop}>
                                        <div className="other-crop-name">
                                            <span className="rank-badge">#{index + 2}</span>
                                            {formatCropName(item.crop)}
                                        </div>
                                        <div className="other-crop-confidence">
                                            <div className="confidence-bar-bg">
                                                <div className="confidence-bar-fill" style={{ width: `${item.confidence}%` }}></div>
                                            </div>
                                            <span>{item.confidence}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="action-section">
                        <button className="btn-secondary" onClick={resetForm}>🔄 Try Another Farm</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CropRecommendation;