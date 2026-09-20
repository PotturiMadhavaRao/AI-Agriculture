import React, { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import "./CropLifeCycle.css";

const API_URL = "http://localhost:5000/api/crop-life-cycle";

const stageIcons = {
  "Seed": "🌰",
  "Germination": "🌱",
  "Vegetative Growth": "🌿",
  "Flowering": "🌸",
  "Fruit/Grain Formation": "🍅",
  "Harvest": "🚜",
  "default": "🪴"
};

function CropLifeCycle() {
  const [crops, setCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState("");
  const [crop, setCrop] = useState(null);

  const [loadingCrops, setLoadingCrops] = useState(true);
  const [loadingLifeCycle, setLoadingLifeCycle] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        setLoadingCrops(true);
        setError("");
        const response = await fetch(`${API_URL}/`);
        if (!response.ok) throw new Error(`Server returned ${response.status}`);
        const data = await response.json();
        if (!data.success) throw new Error(data.message || "Failed to fetch crops");
        
        setCrops(data.crops);
        if (data.crops.length > 0) setSelectedCrop(data.crops[0].name);
      } catch (err) {
        console.error("Crop fetch error:", err);
        setError("Unable to connect to the server. Make sure the backend is running.");
      } finally {
        setLoadingCrops(false);
      }
    };
    fetchCrops();
  }, []);

  useEffect(() => {
    if (!selectedCrop) return;

    const fetchLifeCycle = async () => {
      try {
        setLoadingLifeCycle(true);
        setError("");
        setCrop(null);

        const response = await fetch(`${API_URL}/${encodeURIComponent(selectedCrop)}`);
        if (!response.ok) throw new Error(`Server returned ${response.status}`);
        const data = await response.json();
        if (!data.success) throw new Error(data.message || "Failed to fetch life cycle");
        
        setCrop(data.crop);
      } catch (err) {
        console.error("Life cycle fetch error:", err);
        setError("Unable to load the selected crop life cycle.");
      } finally {
        setLoadingLifeCycle(false);
      }
    };
    fetchLifeCycle();
  }, [selectedCrop]);

  const getStageIcon = (stageName) => {
    for (const key in stageIcons) {
      if (stageName.includes(key)) return stageIcons[key];
    }
    return stageIcons["default"];
  };

  return (
    <div className="page-container">
      <PageHeader 
        title="Crop Life Cycle" 
        description="Learn crop growth stages and important farming activities from seed to harvest." 
      />

      <div className="content-card selector-card">
        <div className="selector-content">
          <div className="selector-icon">🌱</div>
          <div className="selector-text">
            <h3>Select a Crop to View its Life Cycle</h3>
            <p>Choose from the available crops in our database.</p>
          </div>
        </div>

        <div className="selector-dropdown">
          {loadingCrops ? (
            <p className="loading-text">Loading crops...</p>
          ) : crops.length === 0 ? (
            <p>No crops available.</p>
          ) : (
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="crop-select-input"
            >
              {crops.map((item) => (
                <option key={item._id} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {error && <div className="error-alert">❌ {error}</div>}
      {loadingLifeCycle && <div className="loading-alert">🔄 Loading life cycle data...</div>}

      {crop && !loadingLifeCycle && (
        <div className="lifecycle-container">
          <div className="lifecycle-header">
            <h2 className="crop-title">{crop.name}</h2>
            <div className="crop-meta">
              <span className="meta-badge">🧬 {crop.scientificName}</span>
              <span className="meta-badge">⏱️ Duration: {crop.growthDuration}</span>
            </div>
          </div>

          <div className="visual-timeline">
            {crop.lifeCycle?.map((stage, index) => (
              <div className="timeline-card" key={index}>
                <div className="stage-icon-container">
                  <span className="stage-icon-large">{getStageIcon(stage.stage)}</span>
                  <div className="stage-connector"></div>
                </div>
                
                <div className="stage-content">
                  <div className="stage-header">
                    <span className="stage-number">Stage {index + 1}</span>
                    <h3 className="stage-name">{stage.stage}</h3>
                  </div>
                  
                  <div className="stage-timing">
                    <span className="timing-icon">⏱</span>
                    <span>{stage.duration}</span>
                  </div>
                  
                  <p className="stage-description">{stage.description}</p>
                  
                  <div className="stage-details-grid">
                    {stage.farmerActions?.length > 0 && (
                      <div className="detail-box actions-box">
                        <h4>🚜 Important Care Tips</h4>
                        <ul>
                          {stage.farmerActions.map((action, idx) => (
                            <li key={idx}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {stage.monitoring?.length > 0 && (
                      <div className="detail-box monitor-box">
                        <h4>🔍 What to Monitor</h4>
                        <ul>
                          {stage.monitoring.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="general-care-card">
            <div className="care-icon">🌾</div>
            <div className="care-content">
              <h3>General Farming Advice</h3>
              <ul className="care-list">
                <li>Monitor soil moisture regularly and provide appropriate irrigation.</li>
                <li>Check plants frequently for early signs of pests and diseases.</li>
                <li>Maintain proper soil nutrition based on periodic soil testing.</li>
                <li>Keep the field clear of weeds that compete for nutrients.</li>
              </ul>
              <p className="care-disclaimer">
                <strong>Note:</strong> Growth duration and specific stages may vary based on the local climate, soil type, and farming practices.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CropLifeCycle;