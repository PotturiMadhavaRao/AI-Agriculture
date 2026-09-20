import React, { useState } from "react";
import PageHeader from "../components/PageHeader";
import "./YieldPrediction.css";

function YieldPrediction() {
  const [formData, setFormData] = useState({
    Area: "India",
    Item: "Wheat",
    Year: 2013,
    average_rain_fall_mm_per_year: 800,
    pesticides_tonnes: 40000,
    avg_temp: 22,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("http://localhost:5000/api/yield-prediction/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Yield prediction failed");
      setResult(data);
    } catch (error) {
      console.error("Yield prediction error:", error);
      setError(error.message || "Unable to predict crop yield. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      Area: "India",
      Item: "Wheat",
      Year: 2013,
      average_rain_fall_mm_per_year: 800,
      pesticides_tonnes: 40000,
      avg_temp: 22,
    });
    setResult(null);
    setError("");
  };

  return (
    <div className="page-container">
      <PageHeader 
        title="Yield Prediction" 
        description="Estimate expected crop yield using agricultural and environmental data." 
      />

      <div className="content-card">
        <form onSubmit={handleSubmit} className="yield-form">
          <div className="section-header">
            <span className="section-icon">📈</span>
            <h3>Farm & Environment Information</h3>
          </div>
          <p className="section-desc">Enter the details below to get an AI-based estimate of your crop production.</p>

          <div className="input-grid">
            <div className="input-group">
              <label>🌍 Location / Country</label>
              <input type="text" name="Area" value={formData.Area} onChange={handleChange} placeholder="e.g. India" required />
            </div>

            <div className="input-group">
              <label>🌾 Crop</label>
              <select name="Item" value={formData.Item} onChange={handleChange} required>
                <option value="Wheat">Wheat</option>
                <option value="Maize">Maize</option>
                <option value="Rice, paddy">Rice, paddy</option>
                <option value="Sorghum">Sorghum</option>
                <option value="Soybeans">Soybeans</option>
                <option value="Potatoes">Potatoes</option>
                <option value="Cassava">Cassava</option>
                <option value="Sweet potatoes">Sweet potatoes</option>
                <option value="Plantains and others">Plantains and others</option>
                <option value="Yams">Yams</option>
              </select>
            </div>

            <div className="input-group">
              <label>📅 Year (1990-2013 dataset)</label>
              <input type="number" name="Year" value={formData.Year} onChange={handleChange} min="1990" max="2013" required />
            </div>

            <div className="input-group">
              <label>🌧️ Average Rainfall (mm)</label>
              <input type="number" step="0.1" name="average_rain_fall_mm_per_year" value={formData.average_rain_fall_mm_per_year} onChange={handleChange} required />
            </div>

            <div className="input-group">
              <label>🌡️ Average Temp (°C)</label>
              <input type="number" step="0.1" name="avg_temp" value={formData.avg_temp} onChange={handleChange} required />
            </div>

            <div className="input-group">
              <label>🧪 Pesticide Usage (tonnes)</label>
              <input type="number" step="0.1" name="pesticides_tonnes" value={formData.pesticides_tonnes} onChange={handleChange} required />
            </div>
          </div>

          {error && <div className="error-alert">❌ {error}</div>}

          <div className="form-actions">
            <button type="submit" className="btn-primary btn-large" disabled={loading}>
              {loading ? "🔄 Predicting..." : "🔮 Predict Yield"}
            </button>
          </div>
        </form>
      </div>

      {result && result.prediction && (
        <div className="result-container">
          <h2 className="result-heading">Estimated Yield Result</h2>
          
          <div className="primary-yield-card">
            <span className="yield-badge">AI Estimate</span>
            <div className="yield-value-group">
              <h2 className="yield-number">{result.prediction.yield_tonnes_per_ha}</h2>
              <span className="yield-unit">tonnes / hectare</span>
            </div>
            <p className="yield-summary">
              Estimated production of <strong>{result.prediction.crop}</strong> in <strong>{result.prediction.area}</strong> for the year {result.prediction.year}.
            </p>
          </div>

          <div className="yield-disclaimer">
            <h3>💡 What does this mean?</h3>
            <p>This is an AI-based estimate calculated using historical data. The actual harvest may vary depending on unexpected weather changes, diseases, and local farm practices.</p>
          </div>

          <div className="action-section">
            <button className="btn-secondary" onClick={handleReset}>🔄 Try Another Prediction</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default YieldPrediction;
