import { useState } from "react";
import "./DiseaseDetection.css";

function DiseaseDetection() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError("");
  };

  const handlePredict = async () => {
    if (!selectedFile) {
        setError("Please select a tomato leaf image first.");
        return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
        // Step 1: Send image to AI
        const formData = new FormData();
        formData.append("file", selectedFile);

        const aiResponse = await fetch(
            "http://localhost:5000/api/ai/predict",
            {
                method: "POST",
                body: formData,
            }
        );

        if (!aiResponse.ok) {
            throw new Error("Prediction request failed");
        }

        const aiData = await aiResponse.json();

        // Step 2: Get predicted disease name
        const predictedDisease = aiData.prediction?.disease;

        // Healthy plant does not need disease treatment lookup
        if (
            predictedDisease &&
            predictedDisease !== "healthy"
        ) {
            let diseaseName = predictedDisease;

            // Convert AI class name to MongoDB disease name
            if (predictedDisease === "early_blight") {
                diseaseName = "Early Blight";
            } else if (predictedDisease === "late_blight") {
                diseaseName = "Late Blight";
            }

            // Step 3: Fetch disease information from MongoDB
            const diseaseResponse = await fetch(
                `http://localhost:5000/api/diseases/name/${encodeURIComponent(
                    diseaseName
                )}/details`
            );

            if (diseaseResponse.ok) {
                const diseaseData = await diseaseResponse.json();

                // Combine AI result + MongoDB information
                setResult({
                    ...aiData,
                    disease: diseaseData.disease,
                    crop: diseaseData.crop,
                    treatments: diseaseData.treatments,
                });

                return;
            }
        }

        // Healthy result or no database information
        setResult(aiData);

    } catch (error) {
        console.error("Disease detection error:", error);

        setError(
            "Unable to analyze the image. Please make sure the backend and AI service are running."
        );
    } finally {
        setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError("");
  };

  const getDiseaseName = () => {
    if (!result?.prediction?.disease) {
      return "Unknown";
    }

    const disease = result.prediction.disease;

    if (disease === "early_blight") {
      return "Early Blight";
    }

    if (disease === "late_blight") {
      return "Late Blight";
    }

    if (disease === "healthy") {
      return "Healthy Tomato Plant";
    }

    return disease;
  };

  const getResultStatus = () => {
    if (result?.prediction?.disease === "healthy") {
      return "Healthy";
    }

    return "Disease Detected";
  };

  return (
    <div className="disease-page">

      {/* Header */}
      <header className="disease-header">
        <div>
          <h1>🌱 AgriAI</h1>
          <p>Smart Agriculture Assistant</p>
        </div>

        <div className="header-badge">
          AI Disease Detection
        </div>
      </header>

      {/* Main Content */}
      <main className="disease-container">

        {/* Page Introduction */}
        <section className="page-intro">
          <span className="intro-icon">🌿</span>

          <div>
            <h2>Detect Crop Disease</h2>

            <p>
              Upload a clear photo of your tomato leaf.
              Our AI model will analyze the image and
              provide disease information and management
              recommendations.
            </p>
          </div>
        </section>

        {/* Upload Section */}
        <section className="upload-card">

          <div className="section-title">
            <h3>📷 Upload Leaf Image</h3>

            <p>
              Choose a clear image of the affected leaf.
            </p>
          </div>

          {!preview ? (
            <label className="upload-area">

              <div className="upload-icon">
                📸
              </div>

              <h3>
                Select a Tomato Leaf Image
              </h3>

              <p>
                JPG, JPEG or PNG images
              </p>

              <span className="upload-button">
                Choose Image
              </span>

              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                hidden
              />

            </label>
          ) : (
            <div className="preview-section">

              <div className="image-container">

                <img
                  src={preview}
                  alt="Selected tomato leaf"
                />

              </div>

              <div className="file-info">

                <h4>Selected Image</h4>

                <p>
                  {selectedFile?.name}
                </p>

                <button
                  className="change-button"
                  onClick={handleReset}
                >
                  Choose Another Image
                </button>

              </div>

            </div>
          )}

          {/* Analyze Button */}
          {selectedFile && !result && (
            <button
              className="analyze-button"
              onClick={handlePredict}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Analyzing Leaf...
                </>
              ) : (
                <>
                  🔍 Analyze Leaf
                </>
              )}
            </button>
          )}

          {/* Error */}
          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

        </section>

        {/* Results */}
        {result && (
          <section className="results-section">

            {/* Result Header */}
            <div className="result-header">

              <div>
                <p className="result-label">
                  AI ANALYSIS RESULT
                </p>

                <h2>
                  {getResultStatus()}
                </h2>
              </div>

              <div className="confidence-card">

                <span>
                  Confidence
                </span>

                <strong>
                  {result.prediction?.confidence}%
                </strong>

              </div>

            </div>

            {/* Disease Result */}
            <div className="disease-result-card">

              <div className="result-icon">
                {result.prediction?.disease === "healthy"
                  ? "✅"
                  : "🦠"}
              </div>

              <div>

                <p className="small-label">
                  DETECTED CONDITION
                </p>

                <h2>
                  {getDiseaseName()}
                </h2>

                {result.disease?.cause && (
                  <p>
                    <strong>Cause:</strong>{" "}
                    {result.disease.cause}
                  </p>
                )}

              </div>

            </div>

            {/* Crop Information */}
            {result.crop && (
              <div className="info-card">

                <h3>🌾 Crop Information</h3>

                <div className="info-grid">

                  <div>
                    <span>Crop</span>
                    <strong>
                      {result.crop.name}
                    </strong>
                  </div>

                  <div>
                    <span>Scientific Name</span>
                    <strong>
                      {result.crop.scientificName}
                    </strong>
                  </div>

                  {result.crop.season && (
                    <div>
                      <span>Season</span>
                      <strong>
                        {result.crop.season}
                      </strong>
                    </div>
                  )}

                </div>

              </div>
            )}

            {/* Symptoms */}
            {result.disease?.symptoms?.length > 0 && (
              <div className="info-card">

                <h3>🔎 Symptoms</h3>

                <ul className="info-list">

                  {result.disease.symptoms.map(
                    (symptom, index) => (
                      <li key={index}>
                        {symptom}
                      </li>
                    )
                  )}

                </ul>

              </div>
            )}

            {/* Favorable Conditions */}
            {result.disease?.favorableConditions?.length > 0 && (
              <div className="info-card">

                <h3>🌦️ Favorable Conditions</h3>

                <ul className="info-list">

                  {result.disease.favorableConditions.map(
                    (condition, index) => (
                      <li key={index}>
                        {condition}
                      </li>
                    )
                  )}

                </ul>

              </div>
            )}

            {/* Prevention */}
            {result.disease?.prevention?.length > 0 && (
              <div className="info-card">

                <h3>🛡️ Prevention</h3>

                <ul className="info-list">

                  {result.disease.prevention.map(
                    (item, index) => (
                      <li key={index}>
                        {item}
                      </li>
                    )
                  )}

                </ul>

              </div>
            )}

            {/* Treatment */}
            <div className="info-card">

              <h3>💊 Management & Treatment</h3>

              {result.treatments?.length > 0 ? (

                result.treatments.map(
                  (treatment) => (

                    <div
                      className="treatment-card"
                      key={treatment.id}
                    >

                      <span className="treatment-type">
                        {treatment.treatmentType}
                      </span>

                      <p>
                        <strong>
                          Recommendation:
                        </strong>
                      </p>

                      <p>
                        {treatment.recommendation}
                      </p>

                      {treatment.activeIngredient && (
                        <p>
                          <strong>
                            Active Ingredient:
                          </strong>{" "}
                          {treatment.activeIngredient}
                        </p>
                      )}

                      {treatment.safetyPrecautions?.length > 0 && (
                        <div>

                          <h4>
                            ⚠️ Safety Precautions
                          </h4>

                          <ul className="info-list">

                            {treatment.safetyPrecautions.map(
                              (precaution, index) => (
                                <li key={index}>
                                  {precaution}
                                </li>
                              )
                            )}

                          </ul>

                        </div>
                      )}

                    </div>

                  )
                )

              ) : (

                <p>
                  No treatment information is currently
                  available in the database.
                </p>

              )}

            </div>

            {/* Disclaimer */}
            <div className="disclaimer">

              ⚠️ <strong>Important:</strong> This AI result
              is for agricultural decision support. Always
              follow locally approved agricultural guidance
              and product labels when using crop protection
              products.

            </div>

            {/* Reset */}
            <button
              className="reset-button"
              onClick={handleReset}
            >
              🔄 Analyze Another Image
            </button>

          </section>
        )}

      </main>

    </div>
  );
}

export default DiseaseDetection;

