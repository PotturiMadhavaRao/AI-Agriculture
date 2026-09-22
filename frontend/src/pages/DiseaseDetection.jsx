import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import PageHeader from "../components/PageHeader";
import { translateDynamicContent, translateArray } from "../services/translationService";
import { useAgriAI } from "../context/AgriAIContext";
import "./DiseaseDetection.css";

function DiseaseDetection() {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { openChatWithContext } = useAgriAI();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(t("diseaseDetection.errorImage"));
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError("");
  };

  const handlePredict = async () => {
    if (!selectedFile) {
        setError(t("diseaseDetection.errorSelect"));
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
        
        if (aiData.valid_image === false) {
             setResult(aiData);
             return;
        }
        
        if (aiData.status === "uncertain") {
             setResult(aiData);
             return;
        }

        const predictedDisease = aiData.prediction;

        if (predictedDisease && predictedDisease !== "healthy") {
            let diseaseName = predictedDisease;
            if (predictedDisease === "early_blight") diseaseName = "Early Blight";
            else if (predictedDisease === "late_blight") diseaseName = "Late Blight";

            const diseaseResponse = await fetch(
                `http://localhost:5000/api/diseases/name/${encodeURIComponent(diseaseName)}/details`
            );

            if (diseaseResponse.ok) {
                const diseaseData = await diseaseResponse.json();

                // Dynamically translate the details
                diseaseData.disease = await translateDynamicContent(diseaseData.disease);
                diseaseData.crop = await translateDynamicContent(diseaseData.crop);
                diseaseData.cause = await translateDynamicContent(diseaseData.cause);

                if (diseaseData.symptoms) diseaseData.symptoms = await translateArray(diseaseData.symptoms);
                if (diseaseData.prevention) diseaseData.prevention = await translateArray(diseaseData.prevention);
                
                if (diseaseData.treatments) {
                    for (let t of diseaseData.treatments) {
                        t.treatmentType = await translateDynamicContent(t.treatmentType);
                        t.recommendation = await translateDynamicContent(t.recommendation);
                        if (t.activeIngredient) t.activeIngredient = await translateDynamicContent(t.activeIngredient);
                        if (t.safetyPrecautions) t.safetyPrecautions = await translateArray(t.safetyPrecautions);
                    }
                }

                setResult({
                    ...aiData,
                    disease: diseaseData,
                    treatments: diseaseData.treatments,
                });
                return;
            }
        }
        setResult(aiData);
    } catch (error) {
        console.error("Disease detection error:", error);
        setError(t("diseaseDetection.errorBackend"));
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
    if (!result?.prediction) return "Unknown";
    const disease = result.prediction;
    if (disease === "early_blight") return "Early Blight";
    if (disease === "late_blight") return "Late Blight";
    if (disease === "healthy") return "Healthy Crop";
    return disease;
  };

  const getResultStatus = () => {
    if (result?.status === "invalid_image" || result?.valid_image === false) return "Invalid Image";
    if (result?.status === "uncertain") return "Uncertain";
    return result?.prediction === "healthy" ? t("diseaseDetection.healthy", "Healthy Tomato Plant") : t("diseaseDetection.diseaseDetected", "Disease Detected");
  };

  return (
    <div className="page-container">
      <PageHeader 
        title={t("sidebar.diseaseDetection")} 
        description={t("diseaseDetection.pageDescription")} 
      />

      <div className="content-card">
        {!preview ? (
          <div className="upload-section">
            <label className="upload-box">
              <div className="upload-icon-large">📸</div>
              <h3>{t("diseaseDetection.uploadInstruction", "Take a clear photo of the crop leaf and upload it for analysis.")}</h3>
              <p>{t("diseaseDetection.uploadSubInstruction", "🌿 Please upload a clear leaf image first.")}</p>
              <span className="btn-primary">{t("diseaseDetection.chooseImage")}</span>
              <input type="file" accept="image/*" onChange={handleFileChange} hidden />
            </label>
          </div>
        ) : (
          <div className="preview-section">
            <img src={preview} alt="Tomato leaf preview" className="image-preview" />
            <div className="preview-actions">
              <p className="file-name">{selectedFile?.name}</p>
              <button className="btn-secondary" onClick={handleReset}>{t("diseaseDetection.changeImage")}</button>
            </div>
          </div>
        )}

        {error && <div className="error-alert">⚠️ {error}</div>}

        {selectedFile && !result && (
          <div className="action-section">
            <button className="btn-primary btn-large" onClick={handlePredict} disabled={loading}>
              {loading ? t("diseaseDetection.analyzingBtn") : t("diseaseDetection.analyzeBtn")}
            </button>
          </div>
        )}
      </div>

      {result && (
        <div className="result-container">
          <h2 className="result-heading">{t("diseaseDetection.resultHeading")}</h2>
          
          {(result.valid_image === false || result.status === "invalid_image" || result.status === "uncertain") ? (
             <div className="status-card danger">
               <div className="status-header">
                 <span className="status-icon">⚠️</span>
                 <div className="status-info">
                   <span className="status-label">{t("diseaseDetection.status", "Status")}</span>
                   <h3 className="status-value">{getResultStatus()}</h3>
                 </div>
               </div>
               <div className="info-block" style={{ marginTop: '15px' }}>
                 <p style={{ fontSize: '18px', fontWeight: '500' }}>{result.message}</p>
               </div>
             </div>
          ) : (
            <>
              <div className={`status-card ${result?.prediction === 'healthy' ? 'healthy' : 'danger'}`}>
                <div className="status-header">
                  <span className="status-icon">{result?.prediction === 'healthy' ? '🌿' : '⚠️'}</span>
                  <div className="status-info">
                    <span className="status-label">{t("diseaseDetection.status")}</span>
                    <h3 className="status-value">
                        {result?.prediction === 'healthy' ? t("diseaseDetection.healthyText", "Healthy Crop") : t("diseaseDetection.diseaseDetected", "Disease Detected")}
                    </h3>
                  </div>
                </div>
                <div className="confidence-badge">
                  {result.prediction === 'healthy' ? 'Healthy' : getDiseaseName()}
                </div>
                <div className="confidence-badge" style={{marginTop: "10px"}}>
                  {result.confidence}% {t("diseaseDetection.confidence", "Confidence")}
                </div>
              </div>

              {result?.prediction !== 'healthy' && (
                <div className="disease-details-card">
                  <h3 className="detail-title">{t("diseaseDetection.detectedCondition", "Disease Detected")}: {getDiseaseName()}</h3>
                  {result.disease?.cause && <p className="detail-cause"><strong>{t("diseaseDetection.cause")}:</strong> {result.disease.cause}</p>}
                </div>
              )}

              {result.prediction === 'healthy' && (
                <div className="info-block healthy-block">
                  <h3 style={{ color: 'var(--color-primary)' }}>{t("diseaseDetection.keepPlantHealthy", "🌱 Keep the plant healthy")}</h3>
                  <p>{t("diseaseDetection.healthyMessage", "Your tomato leaf appears healthy and no supported tomato disease was detected.")}</p>
                  <ul>
                    <li>{t("diseaseDetection.healthyTips1", "Maintain proper irrigation.")}</li>
                    <li>{t("diseaseDetection.healthyTips2", "Maintain good air circulation.")}</li>
                    <li>{t("diseaseDetection.healthyTips3", "Monitor leaves regularly.")}</li>
                    <li>{t("diseaseDetection.healthyTips4", "Remove severely damaged plant material.")}</li>
                    <li>{t("diseaseDetection.healthyTips5", "Watch for new symptoms.")}</li>
                  </ul>
                  <p style={{ fontWeight: '600', marginTop: '15px' }}>
                    {t("diseaseDetection.continueMonitoring", "🔍 Continue monitoring your crop.")}
                  </p>
                </div>
              )}

              {result.prediction !== 'healthy' && result.disease?.symptoms?.length > 0 && (
                <div className="info-block">
                  <h3>{t("diseaseDetection.symptoms", "🌿 Symptoms")}</h3>
                  <ul>
                    {result.disease.symptoms.map((symptom, idx) => <li key={idx}>{symptom}</li>)}
                  </ul>
                </div>
              )}

              {result.prediction !== 'healthy' && result.disease?.favorableConditions?.length > 0 && (
                <div className="info-block">
                  <h3>{t("diseaseDetection.favorableConditions", "🌦️ Favorable Conditions")}</h3>
                  <ul>
                    {result.disease.favorableConditions.map((item, idx) => <li key={idx}>{item}</li>)}
                  </ul>
                </div>
              )}

              {result.prediction !== 'healthy' && result.disease?.prevention?.length > 0 && (
                <div className="info-block">
                  <h3>{t("diseaseDetection.prevention", "🛡️ Prevention")}</h3>
                  <ul>
                    {result.disease.prevention.map((item, idx) => <li key={idx}>{item}</li>)}
                  </ul>
                </div>
              )}

              {result.prediction !== 'healthy' && result.treatments?.length > 0 && (
                <div className="info-block">
                  <h3>{t("diseaseDetection.management", "💊 Treatment & Management")}</h3>
                  <div className="treatments-grid">
                    {result.treatments.map((treatment) => (
                      <div className="treatment-item" key={treatment.id}>
                        <span className="treatment-badge">{treatment.treatmentType}</span>
                        <p>{treatment.recommendation}</p>
                        {treatment.activeIngredient && <p><strong>{t("diseaseDetection.activeIngredient")}:</strong> {treatment.activeIngredient}</p>}
                        {treatment.safetyPrecautions?.length > 0 && (
                          <div className="safety-warning">
                            <strong>{t("diseaseDetection.safetyPrecautions")}</strong>
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

              {result.prediction !== 'healthy' && (
                <div className="ai-warning-box">
                  <strong>⚠️ {t("diseaseDetection.important", "Important")}</strong>
                  <p>{t("diseaseDetection.aiWarning", "This is an AI-assisted screening result. Confirm serious cases with a local agricultural expert.")}</p>
                </div>
              )}
            </>
          )}
          
          <div className="action-section">
            {result?.prediction && result.prediction !== 'healthy' && result.status !== "invalid_image" && result.status !== "uncertain" && result.valid_image !== false && (
              <button 
                className="btn-primary" 
                style={{marginRight: '10px', background: '#2ecc71', borderColor: '#2ecc71'}}
                onClick={() => openChatWithContext({
                  module: 'disease_detection',
                  crop: 'Tomato', 
                  disease: getDiseaseName(),
                  confidence: result.confidence
                })}
              >
                🌱 Ask AgriAI about this disease
              </button>
            )}
            <button className="btn-secondary" onClick={handleReset}>{t("diseaseDetection.analyzeAnotherBtn")}</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DiseaseDetection;
