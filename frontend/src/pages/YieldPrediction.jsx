import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import PageHeader from "../components/PageHeader";
import { translateDynamicContent } from "../services/translationService";
import { useAgriAI } from "../context/AgriAIContext";
import "./YieldPrediction.css";

function YieldPrediction() {
  const { t } = useTranslation();
  const { openChatWithContext } = useAgriAI();
  const [formData, setFormData] = useState({
    Country: "India",
    Crop: "Wheat",
    FarmLandArea: "",
    Irrigation: "Rainfed",
    SoilType: "Black Soil"
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
      if (!response.ok) throw new Error(data.message || t("common.error"));

      if (data.success && data.prediction) {
          data.prediction.crop = await translateDynamicContent(data.prediction.crop);
          data.prediction.country = await translateDynamicContent(data.prediction.country);
      }

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
      Country: "India",
      Crop: "Wheat",
      FarmLandArea: "",
      Irrigation: "Rainfed",
      SoilType: "Black Soil"
    });
    setResult(null);
    setError("");
  };

  return (
    <div className="page-container">
      <PageHeader 
        title={t("sidebar.yieldPrediction")} 
        description={t("yieldPrediction.pageDescription")} 
      />

      <div className="content-card">
        <form onSubmit={handleSubmit} className="yield-form">
          <div className="section-header">
            <span className="section-icon">📈</span>
            <h3>{t("yieldPrediction.sectionTitle")}</h3>
          </div>
          <p className="section-desc">{t("yieldPrediction.sectionDesc")}</p>

          <div className="input-grid">
            <div className="input-group">
              <label>{t("yieldPrediction.location")}</label>
              <input type="text" name="Country" value={formData.Country} onChange={handleChange} placeholder="e.g. India" required />
            </div>

            <div className="input-group">
              <label>{t("yieldPrediction.crop")}</label>
              <select name="Crop" value={formData.Crop} onChange={handleChange} required>
                <option value="Rice">Rice</option>
                <option value="Wheat">Wheat</option>
                <option value="Maize">Maize</option>
                <option value="Sorghum">Sorghum</option>
                <option value="Soybean">Soybean</option>
                <option value="Potato">Potato</option>
                <option value="Sweet Potato">Sweet Potato</option>
                <option value="Cassava">Cassava</option>
                <option value="Plantain">Plantain</option>
                <option value="Yams">Yams</option>
              </select>
            </div>

            <div className="input-group">
              <label>Farm Land Area (hectares)</label>
              <input type="number" name="FarmLandArea" value={formData.FarmLandArea} onChange={handleChange} min="0.01" step="0.01" placeholder="e.g. 2.5" required />
            </div>

            <div className="input-group">
              <label>Irrigation</label>
              <select name="Irrigation" value={formData.Irrigation} onChange={handleChange}>
                <option value="Rainfed">Rainfed</option>
                <option value="Drip Irrigation">Drip Irrigation</option>
                <option value="Sprinkler Irrigation">Sprinkler Irrigation</option>
                <option value="Canal Irrigation">Canal Irrigation</option>
                <option value="Borewell">Borewell</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="input-group">
              <label>Soil Type</label>
              <select name="SoilType" value={formData.SoilType} onChange={handleChange}>
                <option value="Black Soil">Black Soil</option>
                <option value="Red Soil">Red Soil</option>
                <option value="Alluvial Soil">Alluvial Soil</option>
                <option value="Loamy Soil">Loamy Soil</option>
                <option value="Sandy Soil">Sandy Soil</option>
                <option value="Clay Soil">Clay Soil</option>
                <option value="Other">Other</option>
                <option value="Unknown / Not sure">Unknown / Not sure</option>
              </select>
            </div>
          </div>

          {error && <div className="error-alert">❌ {error}</div>}

          <div className="form-actions">
            <button type="submit" className="btn-primary btn-large" disabled={loading}>
              {loading ? t("yieldPrediction.predictingBtn") : t("yieldPrediction.predictBtn")}
            </button>
          </div>
        </form>
      </div>

      {result && result.success && (
        <div className="result-container">
          <h2 className="result-heading">{t("yieldPrediction.resultHeading")}</h2>
          
          <div className="primary-yield-card">
            <span className="yield-badge">{t("yieldPrediction.aiEstimate")}</span>
            <div className="yield-value-group">
              <h2 className="yield-number">{result.predicted_yield_tonnes_per_ha}</h2>
              <span className="yield-unit">tonnes / hectare</span>
            </div>
            <p className="yield-summary">
              Estimated yield of <strong>{result.crop}</strong> in <strong>{result.country}</strong>.
            </p>
            
            {result.estimated_total_production_tonnes && (
              <div className="total-production-box" style={{ marginTop: '20px', padding: '15px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '10px' }}>
                <h3>Estimated Total Production for {result.farm_area_hectares} hectares:</h3>
                <h2 style={{ fontSize: '2rem', color: '#4CAF50', margin: '10px 0' }}>{result.estimated_total_production_tonnes} tonnes</h2>
              </div>
            )}
          </div>

          <div className="yield-disclaimer">
            <h3>{t("yieldPrediction.disclaimerTitle")}</h3>
            <p>{t("yieldPrediction.disclaimerText")}</p>
          </div>

          <div className="action-section" style={{display: 'flex', gap: '10px', justifyContent: 'center'}}>
            <button className="btn-primary" style={{background: '#2ecc71', borderColor: '#2ecc71'}} onClick={() => openChatWithContext({
                module: 'yield_prediction',
                crop: result.crop,
                predicted_yield_tonnes_per_ha: result.predicted_yield_tonnes_per_ha
            })}>
                🌱 How can I improve this yield?
            </button>
            <button className="btn-secondary" onClick={handleReset}>{t("yieldPrediction.tryAnotherBtn")}</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default YieldPrediction;
