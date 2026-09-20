import React, { useState } from "react";
import PageHeader from "../components/PageHeader";
import "./DiseaseDetection.css";

function DiseaseDetection() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

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
        setError("Please select a crop image first.");
        return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const aiResponse = await fetch("http://localhost:5000/api/ai/predict", {
            method: "POST",
            body: formData,
        });

        if (!aiResponse.ok) throw new Error("Prediction request failed");
        const aiData = await aiResponse.json();
        const predictedDisease = aiData.prediction?.disease;

        if (predictedDisease && predictedDisease !== "healthy") {
            let diseaseName = predictedDisease;
            if (predictedDisease === "early_blight") diseaseName = "Early Blight";
            else if (predictedDisease === "late_blight") diseaseName = "Late Blight";

            const diseaseResponse = await fetch(
                `http://localhost:5000/api/diseases/name/${encodeURIComponent(diseaseName)}/details`
            );

            if (diseaseResponse.ok) {
                const diseaseData = await diseaseResponse.json();
                setResult({
                    ...aiData,
                    disease: diseaseData.disease,
                    crop: diseaseData.crop,
                    treatments: diseaseData.treatments,
                });
                return;
            }
        }
        setResult(aiData);
    } catch (error) {
        console.error("Disease detection error:", error);
        setError("Unable to analyze the image. Please make sure the backend is running.");
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
    if (!result?.prediction?.disease) return "Unknown";
    const disease = result.prediction.disease;
    if (disease === "early_blight") return "Early Blight";
    if (disease === "late_blight") return "Late Blight";
    if (disease === "healthy") return "Healthy Crop";
    return disease;
  };

  const getResultStatus = () => {
    return result?.prediction?.disease === "healthy" ? "Healthy" : "Disease Detected";
  };

  return (
    <div className="page-container">
      <PageHeader 
        title="Disease Detection" 
        description="Upload a clear image of your crop leaf to identify diseases and get treatment recommendations." 
      />

      <div className="content-card">
        {!preview ? (
          <div className="upload-section">
            <label className="upload-box">
              <div className="upload-icon-large">📸</div>
              <h3>Upload Crop Image</h3>
              <p>JPG, JPEG or PNG format</p>
              <span className="btn-primary">Choose Image</span>
              <input type="file" accept="image/*" onChange={handleFileChange} hidden />
            </label>
          </div>
        ) : (
          <div className="preview-section">
            <img src={preview} alt="Crop leaf preview" className="image-preview" />
            <div className="preview-actions">
              <p className="file-name">{selectedFile?.name}</p>
              <button className="btn-secondary" onClick={handleReset}>Change Image</button>
            </div>
          </div>
        )}

        {error && <div className="error-alert">⚠️ {error}</div>}

        {selectedFile && !result && (
          <div className="action-section">
            <button className="btn-primary btn-large" onClick={handlePredict} disabled={loading}>
              {loading ? "🔄 Analyzing..." : "🔍 Analyze Disease"}
            </button>
          </div>
        )}
      </div>

      {result && (
        <div className="result-container">
          <h2 className="result-heading">Prediction Result</h2>
          
          <div className={`status-card ${result?.prediction?.disease === 'healthy' ? 'healthy' : 'danger'}`}>
            <div className="status-header">
              <span className="status-icon">{result?.prediction?.disease === 'healthy' ? '✅' : '🦠'}</span>
              <div className="status-info">
                <span className="status-label">Status</span>
                <h3 className="status-value">{getResultStatus()}</h3>
              </div>
            </div>
            <div className="confidence-badge">
              {result.prediction?.confidence}% Confidence
            </div>
          </div>

          {result?.prediction?.disease !== 'healthy' && (
            <div className="disease-details-card">
              <h3 className="detail-title">Detected Condition: {getDiseaseName()}</h3>
              {result.disease?.cause && <p className="detail-cause"><strong>Cause:</strong> {result.disease.cause}</p>}
            </div>
          )}

          {result.disease?.symptoms?.length > 0 && (
            <div className="info-block">
              <h3>🔎 Symptoms</h3>
              <ul>
                {result.disease.symptoms.map((symptom, idx) => <li key={idx}>{symptom}</li>)}
              </ul>
            </div>
          )}

          {result.disease?.prevention?.length > 0 && (
            <div className="info-block">
              <h3>🛡️ Prevention</h3>
              <ul>
                {result.disease.prevention.map((item, idx) => <li key={idx}>{item}</li>)}
              </ul>
            </div>
          )}

          {result.treatments?.length > 0 && (
            <div className="info-block">
              <h3>💊 Management & Treatment</h3>
              <div className="treatments-grid">
                {result.treatments.map((treatment) => (
                  <div className="treatment-item" key={treatment.id}>
                    <span className="treatment-badge">{treatment.treatmentType}</span>
                    <p>{treatment.recommendation}</p>
                    {treatment.activeIngredient && <p><strong>Active Ingredient:</strong> {treatment.activeIngredient}</p>}
                    {treatment.safetyPrecautions?.length > 0 && (
                      <div className="safety-warning">
                        <strong>⚠️ Safety Precautions</strong>
                        <ul>
                          {treatment.safetyPrecautions.map((precaution, idx) => <li key={idx}>{precaution}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="action-section">
            <button className="btn-secondary" onClick={handleReset}>🔄 Analyze Another Image</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DiseaseDetection;
