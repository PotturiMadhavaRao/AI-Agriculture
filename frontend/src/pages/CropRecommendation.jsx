import { useState } from "react";
import "./CropRecommendation.css";

function CropRecommendation() {
    const [formData, setFormData] = useState({
        N: "",
        P: "",
        K: "",
        temperature: "",
        humidity: "",
        ph: "",
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
            const response = await fetch(
                "http://localhost:5000/api/crop-recommendation/recommend",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Crop recommendation failed"
                );
            }

            setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            N: "",
            P: "",
            K: "",
            temperature: "",
            humidity: "",
            ph: "",
            rainfall: "",
        });

        setResult(null);
        setError("");
    };

    const formatCropName = (name) => {
        if (!name) return "";

        return name
            .replace(/_/g, " ")
            .replace(/\b\w/g, (letter) => letter.toUpperCase());
    };

    return (
        <div className="crop-recommendation-page">

            {/* Header */}
            <div className="crop-header">
                <span className="crop-badge">
                    🌾 AI Crop Recommendation
                </span>

                <h1>
                    Find the Right Crop for Your Farm
                </h1>

                <p>
                    Enter your soil and weather conditions.
                    Our AI model will recommend a suitable crop.
                </p>
            </div>

            {/* Form */}
            <div className="crop-form-card">

                <h2>🌱 Farm Conditions</h2>

                <p className="form-description">
                    Enter the values available from your soil test
                    and local weather conditions.
                </p>

                <form onSubmit={handleSubmit}>

                    <div className="input-grid">

                        <div className="input-group">
                            <label>Nitrogen (N)</label>
                            <input
                                type="number"
                                name="N"
                                value={formData.N}
                                onChange={handleChange}
                                placeholder="Example: 90"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Phosphorus (P)</label>
                            <input
                                type="number"
                                name="P"
                                value={formData.P}
                                onChange={handleChange}
                                placeholder="Example: 42"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Potassium (K)</label>
                            <input
                                type="number"
                                name="K"
                                value={formData.K}
                                onChange={handleChange}
                                placeholder="Example: 43"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Temperature (°C)</label>
                            <input
                                type="number"
                                step="0.01"
                                name="temperature"
                                value={formData.temperature}
                                onChange={handleChange}
                                placeholder="Example: 21"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Humidity (%)</label>
                            <input
                                type="number"
                                step="0.01"
                                name="humidity"
                                value={formData.humidity}
                                onChange={handleChange}
                                placeholder="Example: 82"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Soil pH</label>
                            <input
                                type="number"
                                step="0.01"
                                name="ph"
                                value={formData.ph}
                                onChange={handleChange}
                                placeholder="Example: 6.5"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Rainfall (mm)</label>
                            <input
                                type="number"
                                step="0.01"
                                name="rainfall"
                                value={formData.rainfall}
                                onChange={handleChange}
                                placeholder="Example: 203"
                                required
                            />
                        </div>

                    </div>

                    <button
                        type="submit"
                        className="recommend-button"
                        disabled={loading}
                    >
                        {loading
                            ? "🤖 Analyzing..."
                            : "🌾 Recommend Crop"}
                    </button>

                </form>

            </div>

            {/* Error */}
            {error && (
                <div className="crop-error">
                    ❌ {error}
                </div>
            )}

            {/* Result */}
            {result && result.recommendation && (
                <div className="crop-result">

                    {/* Main Recommendation */}
                    <div className="recommended-card">

                        <span className="result-label">
                            🤖 AI Recommendation
                        </span>

                        <h2>
                            {formatCropName(
                                result.recommendation.recommended_crop
                            )}
                        </h2>

                        <p>
                            AI Confidence:{" "}
                            <strong>
                                {result.recommendation.confidence}%
                            </strong>
                        </p>

                        <div className="confidence-bar">
                            <div
                                className="confidence-fill"
                                style={{
                                    width: `${result.recommendation.confidence}%`,
                                }}
                            ></div>
                        </div>

                    </div>

                    {/* Crop Information */}
                    {result.cropInfo && (
                        <div className="crop-info-card">

                            <div className="crop-info-header">
                                <span>🌱</span>

                                <div>
                                    <h2>
                                        {result.cropInfo.name}
                                    </h2>

                                    <p>
                                        {result.cropInfo.scientificName}
                                    </p>
                                </div>
                            </div>

                            <div className="crop-info-grid">

                                <div className="info-item">
                                    <span>🌦️</span>
                                    <div>
                                        <small>Season</small>
                                        <strong>
                                            {result.cropInfo.season}
                                        </strong>
                                    </div>
                                </div>

                                <div className="info-item">
                                    <span>💧</span>
                                    <div>
                                        <small>Water Requirement</small>
                                        <strong>
                                            {result.cropInfo.waterRequirement}
                                        </strong>
                                    </div>
                                </div>

                                <div className="info-item">
                                    <span>🌱</span>
                                    <div>
                                        <small>Suitable Soil</small>
                                        <strong>
                                            {result.cropInfo.soilTypes?.join(", ")}
                                        </strong>
                                    </div>
                                </div>

                                <div className="info-item">
                                    <span>📅</span>
                                    <div>
                                        <small>Growth Duration</small>
                                        <strong>
                                            {result.cropInfo.growthDuration}
                                        </strong>
                                    </div>
                                </div>

                            </div>

                            <div className="crop-description">
                                <h3>📖 About This Crop</h3>

                                <p>
                                    {result.cropInfo.description}
                                </p>
                            </div>

                        </div>
                    )}

                    {/* Top Recommendations */}
                    {result.recommendation.top_recommendations &&
                        result.recommendation.top_recommendations.length > 0 && (
                            <div className="top-recommendations">

                                <h2>🌾 Top AI Recommendations</h2>

                                {result.recommendation.top_recommendations.map(
                                    (item, index) => (
                                        <div
                                            className="recommendation-row"
                                            key={item.crop}
                                        >

                                            <span className="rank">
                                                #{index + 1}
                                            </span>

                                            <span className="crop-name">
                                                {formatCropName(item.crop)}
                                            </span>

                                            <div className="small-confidence-bar">
                                                <div
                                                    style={{
                                                        width: `${item.confidence}%`,
                                                    }}
                                                ></div>
                                            </div>

                                            <span className="percentage">
                                                {item.confidence}%
                                            </span>

                                        </div>
                                    )
                                )}

                            </div>
                        )}

                    {/* Reset */}
                    <button
                        className="reset-button"
                        onClick={resetForm}
                    >
                        🔄 Try Another Recommendation
                    </button>

                </div>
            )}

        </div>
    );
}

export default CropRecommendation;