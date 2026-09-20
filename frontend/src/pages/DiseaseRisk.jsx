import React, { useState } from "react";
import PageHeader from "../components/PageHeader";
import "./DiseaseRisk.css";

function DiseaseRisk() {
  const [formData, setFormData] = useState({
    temperature: "",
    humidity: "",
    rainfall: "",
    leaf_wetness: "",
    crop_age_days: "",
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
      const response = await fetch("http://localhost:5000/api/disease-risk/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          temperature: Number(formData.temperature),
          humidity: Number(formData.humidity),
          rainfall: Number(formData.rainfall),
          leaf_wetness: Number(formData.leaf_wetness),
          crop_age_days: Number(formData.crop_age_days),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Disease risk prediction failed");
      setResult(data.risk);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({ temperature: "", humidity: "", rainfall: "", leaf_wetness: "", crop_age_days: "" });
    setResult(null);
    setError("");
  };

  const getRiskClass = (risk) => {
    if (risk === "High") return "high";
    if (risk === "Medium") return "medium";
    return "low";
  };

  const getRiskAdvice = (riskLevel) => {
    if (riskLevel === "High") {
      return {
        title: "High Risk Detected",
        message: "Current environmental conditions are highly favorable for disease development. Immediate preventive measures are recommended.",
        actions: [
          "Inspect leaves daily for spots or yellowing.",
          "Improve air circulation between plants if possible.",
          "Avoid overhead irrigation to keep leaves dry.",
          "Apply preventive treatments following local agricultural guidelines."
        ],
      };
    }

    if (riskLevel === "Medium") {
      return {
        title: "Moderate Risk",
        message: "Conditions may support disease development. Continue monitoring the crop carefully.",
        actions: [
          "Inspect the crop regularly.",
          "Monitor humidity and rainfall closely.",
          "Remove any visibly infected plant material.",
        ],
      };
    }

    return {
      title: "Low Risk",
      message: "Current environmental conditions indicate lower disease risk. Normal farming routines can continue.",
      actions: [
        "Continue regular crop inspection once a week.",
        "Maintain good field sanitation.",
        "Avoid excessive irrigation.",
      ],
    };
  };

  return (
    <div className="page-container">
      <PageHeader 
        title="Disease Risk" 
        description="Check the risk level for diseases in your crop based on current weather conditions." 
      />

      <div className="content-card">
        <form onSubmit={handleSubmit} className="risk-form">
          <div className="section-header">
            <span className="section-icon">🌦️</span>
            <h3>Current Farm Conditions</h3>
          </div>
          <p className="section-desc">Enter the recent weather and crop details to assess the risk of disease outbreak.</p>

          <div className="input-grid">
            <div className="input-group">
              <label>🌡️ Temperature (°C)</label>
              <input type="number" step="0.1" name="temperature" value={formData.temperature} onChange={handleChange} required />
            </div>

            <div className="input-group">
              <label>💧 Humidity (%)</label>
              <input type="number" step="0.1" name="humidity" value={formData.humidity} onChange={handleChange} min="0" max="100" required />
            </div>

            <div className="input-group">
              <label>🌧️ Rainfall (mm)</label>
              <input type="number" step="0.1" name="rainfall" value={formData.rainfall} onChange={handleChange} min="0" required />
            </div>

            <div className="input-group">
              <label>🍃 Leaf Wetness (hrs)</label>
              <input type="number" step="0.1" name="leaf_wetness" value={formData.leaf_wetness} onChange={handleChange} min="0" required />
            </div>

            <div className="input-group">
              <label>🌱 Crop Age (days)</label>
              <input type="number" name="crop_age_days" value={formData.crop_age_days} onChange={handleChange} min="1" required />
            </div>
          </div>

          {error && <div className="error-alert">❌ {error}</div>}

          <div className="form-actions">
            <button type="submit" className="btn-primary btn-large" disabled={loading}>
              {loading ? "🔄 Analyzing Risk..." : "🔍 Check Risk Level"}
            </button>
          </div>
        </form>
      </div>

      {result && (
        <div className="result-container">
          <h2 className="result-heading">Disease Risk Dashboard</h2>

          <div className={`risk-dashboard-card ${getRiskClass(result.risk_level)}`}>
            <div className="risk-indicator">
              <span className="risk-icon-large">
                {result.risk_level === "High" ? "🔴" : result.risk_level === "Medium" ? "🟡" : "🟢"}
              </span>
              <div className="risk-level-text">
                <span className="risk-label">Current Risk Level</span>
                <h2 className="risk-value">{result.risk_level.toUpperCase()} RISK</h2>
              </div>
            </div>
            
            <div className="confidence-display">
              <span className="confidence-label">AI Confidence</span>
              <span className="confidence-value">{result.confidence}%</span>
            </div>
          </div>

          {(() => {
            const advice = getRiskAdvice(result.risk_level);
            return (
              <div className="advice-card">
                <h3>🛡️ {advice.title}</h3>
                <p className="advice-message">{advice.message}</p>
                <div className="actions-list">
                  <h4>Recommended Preventive Actions:</h4>
                  <ul>
                    {advice.actions.map((action, idx) => <li key={idx}>{action}</li>)}
                  </ul>
                </div>
              </div>
            );
          })()}

          <div className="analyzed-conditions">
            <h3>🌦️ Analyzed Factors</h3>
            <div className="factors-grid">
              <div className="factor-item">
                <span className="factor-icon">🌡️</span>
                <div className="factor-info">
                  <small>Temperature</small>
                  <strong>{result.conditions.temperature} °C</strong>
                </div>
              </div>
              <div className="factor-item">
                <span className="factor-icon">💧</span>
                <div className="factor-info">
                  <small>Humidity</small>
                  <strong>{result.conditions.humidity} %</strong>
                </div>
              </div>
              <div className="factor-item">
                <span className="factor-icon">🌧️</span>
                <div className="factor-info">
                  <small>Rainfall</small>
                  <strong>{result.conditions.rainfall} mm</strong>
                </div>
              </div>
              <div className="factor-item">
                <span className="factor-icon">🍃</span>
                <div className="factor-info">
                  <small>Leaf Wetness</small>
                  <strong>{result.conditions.leaf_wetness} hrs</strong>
                </div>
              </div>
              <div className="factor-item">
                <span className="factor-icon">🌱</span>
                <div className="factor-info">
                  <small>Crop Age</small>
                  <strong>{result.conditions.crop_age_days} days</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="action-section">
            <button className="btn-secondary" onClick={handleReset}>🔄 Check Another Field</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DiseaseRisk;
