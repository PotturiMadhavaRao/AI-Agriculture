import { useState } from "react";
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
        "http://localhost:5000/api/yield-prediction/predict",
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
          data.message || "Yield prediction failed"
        );
      }

      setResult(data);
    } catch (error) {
      console.error("Yield prediction error:", error);

      setError(
        error.message ||
          "Unable to predict crop yield. Please try again."
      );
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
    <div className="yield-page">

      {/* Header */}
      <section className="yield-header">
        <span className="yield-badge">
          🌾 AI Yield Prediction
        </span>

        <h1>
          Predict Your Crop Yield
        </h1>

        <p>
          Enter your agricultural and environmental
          information to estimate the expected crop yield.
        </p>
      </section>


      {/* Main Container */}
      <section className="yield-container">

        {/* Form Card */}
        <div className="yield-form-card">

          <h2>🌱 Farm Information</h2>

          <p className="form-description">
            Enter the details of your farm below.
          </p>

          <form onSubmit={handleSubmit}>

            {/* Area */}
            <div className="form-group">
              <label>
                🌍 Area / Country
              </label>

              <input
                type="text"
                name="Area"
                value={formData.Area}
                onChange={handleChange}
                placeholder="Example: India"
                required
              />
            </div>


            {/* Crop */}
            <div className="form-group">
              <label>
                🌾 Crop
              </label>

              <select
                name="Item"
                value={formData.Item}
                onChange={handleChange}
                required
              >
                <option value="Wheat">Wheat</option>
                <option value="Maize">Maize</option>
                <option value="Rice, paddy">
                  Rice, paddy
                </option>
                <option value="Sorghum">Sorghum</option>
                <option value="Soybeans">
                  Soybeans
                </option>
                <option value="Potatoes">
                  Potatoes
                </option>
                <option value="Cassava">
                  Cassava
                </option>
                <option value="Sweet potatoes">
                  Sweet potatoes
                </option>
                <option value="Plantains and others">
                  Plantains and others
                </option>
                <option value="Yams">Yams</option>
              </select>
            </div>


            {/* Year */}
            <div className="form-group">
              <label>
                📅 Year
              </label>

              <input
                type="number"
                name="Year"
                value={formData.Year}
                onChange={handleChange}
                min="1990"
                max="2013"
                required
              />

              <small>
                Dataset-supported years: 1990–2013
              </small>
            </div>


            {/* Rainfall */}
            <div className="form-group">
              <label>
                🌧️ Average Rainfall (mm/year)
              </label>

              <input
                type="number"
                name="average_rain_fall_mm_per_year"
                value={
                  formData.average_rain_fall_mm_per_year
                }
                onChange={handleChange}
                step="0.01"
                min="0"
                required
              />
            </div>


            {/* Pesticides */}
            <div className="form-group">
              <label>
                🧪 Pesticides Used (tonnes)
              </label>

              <input
                type="number"
                name="pesticides_tonnes"
                value={formData.pesticides_tonnes}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
              />
            </div>


            {/* Temperature */}
            <div className="form-group">
              <label>
                🌡️ Average Temperature (°C)
              </label>

              <input
                type="number"
                name="avg_temp"
                value={formData.avg_temp}
                onChange={handleChange}
                step="0.01"
                required
              />
            </div>


            {/* Buttons */}
            <div className="yield-buttons">

              <button
                type="submit"
                className="predict-button"
                disabled={loading}
              >
                {loading
                  ? "🔄 Predicting..."
                  : "🔮 Predict Yield"}
              </button>

              <button
                type="button"
                className="reset-button"
                onClick={handleReset}
              >
                ↺ Reset
              </button>

            </div>

          </form>
        </div>


        {/* Result Section */}
        <div className="yield-result-card">

          {!result && !loading && !error && (
            <div className="result-placeholder">

              <div className="placeholder-icon">
                🌾
              </div>

              <h2>
                Your Prediction Will Appear Here
              </h2>

              <p>
                Enter your farm information and click
                <strong> Predict Yield </strong>
                to get an AI-based yield estimate.
              </p>

            </div>
          )}


          {/* Loading */}
          {loading && (
            <div className="result-placeholder">

              <div className="loading-spinner"></div>

              <h2>
                Analyzing Your Farm...
              </h2>

              <p>
                Our AI model is calculating the
                expected crop yield.
              </p>

            </div>
          )}


          {/* Error */}
          {error && (
            <div className="error-box">

              <h2>⚠️ Prediction Failed</h2>

              <p>{error}</p>

            </div>
          )}


          {/* Result */}
          {result && result.prediction && (
            <div className="prediction-result">

              <div className="success-label">
                ✓ Prediction Completed
              </div>

              <h2>
                🌾 Estimated Crop Yield
              </h2>


              {/* Main Yield */}
              <div className="main-yield">

                <span className="yield-number">
                  {
                    result.prediction
                      .yield_tonnes_per_ha
                  }
                </span>

                <span className="yield-unit">
                  tonnes / hectare
                </span>

              </div>


              {/* Prediction Details */}
              <div className="prediction-details">

                <div className="detail-item">
                  <span>🌱 Crop</span>
                  <strong>
                    {result.prediction.crop}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>🌍 Area</span>
                  <strong>
                    {result.prediction.area}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>📅 Year</span>
                  <strong>
                    {result.prediction.year}
                  </strong>
                </div>

              </div>


              {/* Farm Conditions */}
              <div className="farm-conditions">

                <h3>
                  🌦️ Farm & Environmental Conditions
                </h3>

                <div className="condition-grid">

                  <div className="condition-item">
                    <span>🌧️ Rainfall</span>

                    <strong>
                      {formData.average_rain_fall_mm_per_year} mm/year
                    </strong>
                  </div>


                  <div className="condition-item">
                    <span>🌡️ Temperature</span>

                    <strong>
                      {formData.avg_temp} °C
                    </strong>
                  </div>


                  <div className="condition-item">
                    <span>🧪 Pesticides</span>

                    <strong>
                      {formData.pesticides_tonnes} tonnes
                    </strong>
                  </div>


                  <div className="condition-item">
                    <span>📊 Yield</span>

                    <strong>
                      {result.prediction.yield_hg_per_ha} hg/ha
                    </strong>
                  </div>

                </div>

              </div>


              {/* Information */}
              <div className="yield-note">

                <h3>
                  💡 What does this mean?
                </h3>

                <p>
                  The model estimates approximately{" "}
                  <strong>
                    {
                      result.prediction
                        .yield_tonnes_per_ha
                    }{" "}
                    tonnes
                  </strong>{" "}
                  of {result.prediction.crop} yield
                  per hectare based on the information
                  provided.
                </p>

              </div>


              <p className="disclaimer">
                ⚠️ This is an AI-based estimate and
                should be used as decision-support
                information, not as a guaranteed harvest
                result.
              </p>

            </div>
          )}

        </div>

      </section>

    </div>
  );
}

export default YieldPrediction;
