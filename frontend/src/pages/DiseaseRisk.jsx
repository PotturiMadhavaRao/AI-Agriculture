import { useState } from "react";
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

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        "http://localhost:5000/api/disease-risk/predict",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            temperature: Number(formData.temperature),
            humidity: Number(formData.humidity),
            rainfall: Number(formData.rainfall),
            leaf_wetness: Number(formData.leaf_wetness),
            crop_age_days: Number(formData.crop_age_days),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Disease risk prediction failed"
        );
      }

      setResult(data.risk);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      temperature: "",
      humidity: "",
      rainfall: "",
      leaf_wetness: "",
      crop_age_days: "",
    });

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
        title: "High disease-risk conditions detected",
        message:
          "The current environmental conditions are favorable for disease development. Closely inspect the crop and take preventive measures.",
        actions: [
          "Inspect leaves regularly for spots, yellowing, or unusual growth.",
          "Improve air circulation between plants.",
          "Avoid unnecessary overhead irrigation.",
          "Reduce prolonged leaf wetness where possible.",
          "Follow locally approved agricultural guidance if symptoms appear.",
        ],
      };
    }

    if (riskLevel === "Medium") {
      return {
        title: "Moderate disease-risk conditions",
        message:
          "Environmental conditions may support disease development. Continue monitoring the crop carefully.",
        actions: [
          "Inspect the crop regularly.",
          "Monitor humidity and leaf wetness.",
          "Maintain proper spacing between plants.",
          "Remove visibly infected plant material appropriately.",
        ],
      };
    }

    return {
      title: "Low disease-risk conditions",
      message:
        "Current environmental conditions indicate lower disease risk, but regular monitoring is still recommended.",
      actions: [
        "Continue regular crop inspection.",
        "Maintain good field sanitation.",
        "Avoid excessive irrigation.",
        "Monitor changes in weather and crop conditions.",
      ],
    };
  };

  return (
    <div className="risk-page">

      {/* Header */}
      <div className="risk-header">

        <span className="risk-badge">
          🌱 AI Risk Analysis
        </span>

        <h1>
          Disease Risk Prediction
        </h1>

        <p>
          Analyze environmental conditions to estimate
          the risk of crop disease.
        </p>

      </div>


      {/* Main Container */}
      <div className="risk-container">

        {/* Form */}
        <div className="risk-card">

          <h2>
            🌦️ Farm Conditions
          </h2>

          <p className="card-description">
            Enter the current conditions of your farm.
          </p>


          <form onSubmit={handleSubmit}>

            <div className="risk-form-grid">

              {/* Temperature */}
              <div className="form-group">

                <label>
                  🌡️ Temperature (°C)
                </label>

                <input
                  type="number"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleChange}
                  placeholder="Example: 25"
                  step="0.1"
                  required
                />

              </div>


              {/* Humidity */}
              <div className="form-group">

                <label>
                  💧 Humidity (%)
                </label>

                <input
                  type="number"
                  name="humidity"
                  value={formData.humidity}
                  onChange={handleChange}
                  placeholder="Example: 85"
                  step="0.1"
                  min="0"
                  max="100"
                  required
                />

              </div>


              {/* Rainfall */}
              <div className="form-group">

                <label>
                  🌧️ Rainfall (mm)
                </label>

                <input
                  type="number"
                  name="rainfall"
                  value={formData.rainfall}
                  onChange={handleChange}
                  placeholder="Example: 15"
                  step="0.1"
                  min="0"
                  required
                />

              </div>


              {/* Leaf Wetness */}
              <div className="form-group">

                <label>
                  🍃 Leaf Wetness
                </label>

                <input
                  type="number"
                  name="leaf_wetness"
                  value={formData.leaf_wetness}
                  onChange={handleChange}
                  placeholder="Example: 8"
                  step="0.1"
                  min="0"
                  required
                />

              </div>


              {/* Crop Age */}
              <div className="form-group full-width">

                <label>
                  🌱 Crop Age (days)
                </label>

                <input
                  type="number"
                  name="crop_age_days"
                  value={formData.crop_age_days}
                  onChange={handleChange}
                  placeholder="Example: 45"
                  min="1"
                  required
                />

              </div>

            </div>


            {/* Buttons */}
            <div className="risk-buttons">

              <button
                type="submit"
                className="predict-risk-button"
                disabled={loading}
              >

                {loading
                  ? "Analyzing..."
                  : "🔍 Analyze Disease Risk"}

              </button>


              <button
                type="button"
                className="reset-risk-button"
                onClick={handleReset}
              >
                Reset
              </button>

            </div>

          </form>

        </div>


        {/* Error */}
        {error && (

          <div className="risk-error">
            ⚠️ {error}
          </div>

        )}


        {/* Result */}
        {result && (

          <div className="risk-result-card">

            <div className="result-heading">

              <span>
                Prediction Completed
              </span>

              <h2>
                Disease Risk Result
              </h2>

            </div>


            {/* Risk Level */}
            <div
              className={`risk-level ${getRiskClass(
                result.risk_level
              )}`}
            >

              <span className="risk-icon">

                {result.risk_level === "High"
                  ? "🔴"
                  : result.risk_level === "Medium"
                  ? "🟡"
                  : "🟢"}

              </span>

              <div>

                <span>
                  Current Risk Level
                </span>

                <strong>
                  {result.risk_level}
                </strong>

              </div>

            </div>


            {/* Confidence */}
            <div className="risk-confidence">

              <div className="confidence-header">

                <span>
                  AI Confidence
                </span>

                <strong>
                  {result.confidence}%
                </strong>

              </div>

              <div className="confidence-bar">

                <div
                  className="confidence-fill"
                  style={{
                    width: `${result.confidence}%`,
                  }}
                />

              </div>

            </div>


            {/* Conditions */}
            <div className="conditions-section">

              <h3>
                🌦️ Analyzed Conditions
              </h3>

              <div className="conditions-grid">

                <div className="condition-box">
                  <span>🌡️ Temperature</span>
                  <strong>
                    {result.conditions.temperature} °C
                  </strong>
                </div>

                <div className="condition-box">
                  <span>💧 Humidity</span>
                  <strong>
                    {result.conditions.humidity} %
                  </strong>
                </div>

                <div className="condition-box">
                  <span>🌧️ Rainfall</span>
                  <strong>
                    {result.conditions.rainfall} mm
                  </strong>
                </div>

                <div className="condition-box">
                  <span>🍃 Leaf Wetness</span>
                  <strong>
                    {result.conditions.leaf_wetness}
                  </strong>
                </div>

                <div className="condition-box">
                  <span>🌱 Crop Age</span>
                  <strong>
                    {result.conditions.crop_age_days} days
                  </strong>
                </div>

              </div>

            </div>


            {/* Risk Probabilities */}
            <div className="probability-section">

              <h3>
                📊 Risk Probabilities
              </h3>

              {result.risk_probabilities.map(
                (item) => (

                  <div
                    className="probability-item"
                    key={item.risk}
                  >

                    <div>

                      <span>
                        {item.risk}
                      </span>

                      <strong>
                        {item.confidence}%
                      </strong>

                    </div>

                    <div className="probability-bar">

                      <div
                        style={{
                          width: `${item.confidence}%`,
                        }}
                      />

                    </div>

                  </div>

                )
              )}

            </div>


            {/* Risk Advice */}

            {(() => {
              const advice = getRiskAdvice(
                result.risk_level
              );

              return (
                <div className="risk-advice">

                  <h3>
                    🛡️ {advice.title}
                  </h3>

                  <p>
                    {advice.message}
                  </p>

                  <h4>
                    Recommended Actions
                  </h4>

                  <ul>
                    {advice.actions.map(
                      (action, index) => (
                        <li key={index}>
                          {action}
                        </li>
                      )
                    )}
                  </ul>

                </div>
              );
            })()}


            {/* Disclaimer */}
            <div className="risk-disclaimer">

              <strong>
                ⚠️ Important:
              </strong>

              <p>
                This is an AI-based risk estimate for
                decision support. It is not a confirmed
                disease diagnosis. Follow local
                agricultural guidance before applying
                treatments.
              </p>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}

export default DiseaseRisk;
