import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import PageHeader from "../components/PageHeader";
import { translateDynamicContent, translateArray } from "../services/translationService";
import { useAgriAI } from "../context/AgriAIContext";
import "./DiseaseRisk.css";

function DiseaseRisk() {
  const { t } = useTranslation();
  const { openChatWithContext } = useAgriAI();
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
  const [fetchingWeather, setFetchingWeather] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const fetchWeatherByCoords = async (latitude, longitude) => {
    try {
      const res = await fetch(`${API_URL}/api/weather?lat=${latitude}&lon=${longitude}`);
      const data = await res.json();
      if (data.success && data.current) {
        setFormData((prev) => ({
          ...prev,
          temperature: data.current.temperature.toString(),
          humidity: data.current.humidity.toString(),
          rainfall: data.current.rainfall.toString()
        }));
      } else {
        alert("Failed to fetch weather data for autofill.");
      }
    } catch (err) {
      alert("Error fetching weather data.");
    } finally {
      setFetchingWeather(false);
    }
  };

  const fallbackToIpLocation = async () => {
    try {
      const ipRes = await fetch("https://ipapi.co/json/");
      const ipData = await ipRes.json();
      if (ipData && ipData.latitude && ipData.longitude) {
        await fetchWeatherByCoords(ipData.latitude, ipData.longitude);
      } else {
        alert("Location access denied or failed. Please enter weather data manually.");
        setFetchingWeather(false);
      }
    } catch (error) {
      alert("Location access denied or failed. Please enter weather data manually.");
      setFetchingWeather(false);
    }
  };

  const handleAutofillWeather = () => {
    setFetchingWeather(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          // If browser location is denied, fallback to IP location
          fallbackToIpLocation();
        },
        { timeout: 5000 }
      );
    } else {
      fallbackToIpLocation();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/api/disease-risk/predict`, {
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
      if (!response.ok) throw new Error(data.message || t("diseaseRisk.errorBackend"));
      
      const translatedRisk = await translateDynamicContent(data.risk.risk_level);
      
      setResult({
        ...data.risk,
        risk_level_translated: translatedRisk
      });
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
        title={t("sidebar.diseaseRisk")} 
        description={t("diseaseRisk.pageDescription")} 
      />

      <div className="content-card">
        <form onSubmit={handleSubmit} className="risk-form">
          <div className="section-header">
            <span className="section-icon">🌦️</span>
            <h3>{t("diseaseRisk.sectionTitle")}</h3>
          </div>
          <p className="section-desc">{t("diseaseRisk.sectionDesc")}</p>
          
          <button type="button" className="btn-secondary" onClick={handleAutofillWeather} disabled={fetchingWeather} style={{ marginBottom: "15px" }}>
            {fetchingWeather ? "Fetching Weather..." : "📍 Autofill with Current Weather"}
          </button>

          <div className="input-grid">
            <div className="input-group">
              <label>{t("diseaseRisk.temperature")}</label>
              <input type="number" step="any" name="temperature" value={formData.temperature} onChange={handleChange} placeholder="e.g. 28.5" required />
            </div>

            <div className="input-group">
              <label>{t("diseaseRisk.humidity")}</label>
              <input type="number" step="any" name="humidity" value={formData.humidity} onChange={handleChange} min="0" max="100" placeholder="e.g. 82.5" required />
            </div>

            <div className="input-group">
              <label>{t("diseaseRisk.rainfall")}</label>
              <input type="number" step="any" name="rainfall" value={formData.rainfall} onChange={handleChange} min="0" placeholder="e.g. 15.2" required />
            </div>

            <div className="input-group">
              <label>{t("diseaseRisk.leafWetness")}</label>
              <input type="number" step="any" name="leaf_wetness" value={formData.leaf_wetness} onChange={handleChange} min="0" placeholder="e.g. 4.5" required />
            </div>

            <div className="input-group">
              <label>{t("diseaseRisk.cropAge")}</label>
              <input type="number" name="crop_age_days" value={formData.crop_age_days} onChange={handleChange} min="1" placeholder="e.g. 30" required />
            </div>
          </div>

          {error && <div className="error-alert">❌ {error}</div>}

          <div className="form-actions">
            <button type="submit" className="btn-primary btn-large" disabled={loading}>
              {loading ? t("diseaseRisk.analyzingBtn") : t("diseaseRisk.analyzeBtn")}
            </button>
          </div>
        </form>
      </div>

      {result && (
        <div className="result-container">
          <h2 className="result-heading">{t("diseaseRisk.dashboardTitle")}</h2>

          <div className={`risk-dashboard-card ${getRiskClass(result.risk_level)}`}>
            <div className="risk-indicator">
              <span className="risk-icon-large">
                {result.risk_level === "High" ? "🔴" : result.risk_level === "Medium" ? "🟡" : "🟢"}
              </span>
              <div className="risk-level-text">
                <span className="risk-label">{t("diseaseRisk.currentRiskLevel")}</span>
                <h2 className="risk-value">{result.risk_level_translated.toUpperCase()}</h2>
              </div>
            </div>
            
            <div className="confidence-display">
              <span className="confidence-label">{t("diseaseRisk.aiConfidence")}</span>
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
            <h3>{t("diseaseRisk.analyzedFactors")}</h3>
            <div className="factors-grid">
              <div className="factor-item">
                <span className="factor-icon">🌡️</span>
                <div className="factor-info">
                  <small>{t("diseaseRisk.tempText")}</small>
                  <strong>{result.conditions.temperature} °C</strong>
                </div>
              </div>
              <div className="factor-item">
                <span className="factor-icon">💧</span>
                <div className="factor-info">
                  <small>{t("diseaseRisk.humText")}</small>
                  <strong>{result.conditions.humidity} %</strong>
                </div>
              </div>
              <div className="factor-item">
                <span className="factor-icon">🌧️</span>
                <div className="factor-info">
                  <small>{t("diseaseRisk.rainText")}</small>
                  <strong>{result.conditions.rainfall} mm</strong>
                </div>
              </div>
              <div className="factor-item">
                <span className="factor-icon">🍃</span>
                <div className="factor-info">
                  <small>{t("diseaseRisk.leafText")}</small>
                  <strong>{result.conditions.leaf_wetness} hrs</strong>
                </div>
              </div>
              <div className="factor-item">
                <span className="factor-icon">🌱</span>
                <div className="factor-info">
                  <small>{t("diseaseRisk.ageText")}</small>
                  <strong>{result.conditions.crop_age_days} days</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="action-section" style={{display: 'flex', gap: '10px', justifyContent: 'center'}}>
            <button className="btn-primary" style={{background: '#2ecc71', borderColor: '#2ecc71'}} onClick={() => openChatWithContext({
                module: 'disease_risk',
                riskLevel: result.risk_level_translated
            })}>
                🌱 How can I reduce this risk?
            </button>
            <button className="btn-secondary" onClick={handleReset}>{t("diseaseRisk.checkAnotherBtn")}</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DiseaseRisk;
