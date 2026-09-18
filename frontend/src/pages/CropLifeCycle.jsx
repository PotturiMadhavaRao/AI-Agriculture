import { useEffect, useState } from "react";
import "./CropLifeCycle.css";

const API_URL = "http://localhost:5000/api/crop-life-cycle";

function CropLifeCycle() {
  const [crops, setCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState("");
  const [crop, setCrop] = useState(null);

  const [loadingCrops, setLoadingCrops] = useState(true);
  const [loadingLifeCycle, setLoadingLifeCycle] = useState(false);
  const [error, setError] = useState("");

  // Fetch available crops
  useEffect(() => {
    const fetchCrops = async () => {
      try {
        setLoadingCrops(true);
        setError("");

        const response = await fetch(`${API_URL}/`);

        if (!response.ok) {
          throw new Error(
            `Server returned ${response.status}`
          );
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(
            data.message || "Failed to fetch crops"
          );
        }

        setCrops(data.crops);

        if (data.crops.length > 0) {
          setSelectedCrop(data.crops[0].name);
        }
      } catch (err) {
        console.error("Crop fetch error:", err);

        setError(
          "Unable to connect to the server. Make sure the backend is running on port 5000."
        );
      } finally {
        setLoadingCrops(false);
      }
    };

    fetchCrops();
  }, []);

  // Fetch selected crop lifecycle
  useEffect(() => {
    if (!selectedCrop) return;

    const fetchLifeCycle = async () => {
      try {
        setLoadingLifeCycle(true);
        setError("");
        setCrop(null);

        const response = await fetch(
          `${API_URL}/${encodeURIComponent(selectedCrop)}`
        );

        if (!response.ok) {
          throw new Error(
            `Server returned ${response.status}`
          );
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(
            data.message || "Failed to fetch life cycle"
          );
        }

        setCrop(data.crop);
      } catch (err) {
        console.error("Life cycle fetch error:", err);

        setError(
          "Unable to load the selected crop life cycle."
        );
      } finally {
        setLoadingLifeCycle(false);
      }
    };

    fetchLifeCycle();
  }, [selectedCrop]);

  return (
    <div className="life-cycle-page">

      <div className="life-cycle-header">
        <h1>🌱 Crop Life Cycle</h1>

        <p>
          Understand the different growth stages of your crop
          from seed to harvest.
        </p>
      </div>

      {/* Crop Selector */}
      <div className="crop-selector">
        <label htmlFor="crop-select">
          Select Crop
        </label>

        {loadingCrops ? (
          <p>🌱 Loading crops...</p>
        ) : crops.length === 0 ? (
          <p>No crops available.</p>
        ) : (
          <select
            id="crop-select"
            value={selectedCrop}
            onChange={(e) =>
              setSelectedCrop(e.target.value)
            }
          >
            {crops.map((item) => (
              <option
                key={item._id}
                value={item.name}
              >
                {item.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {/* Loading */}
      {loadingLifeCycle && (
        <div className="loading-message">
          🌱 Loading crop life cycle...
        </div>
      )}

      {/* Crop Information */}
      {crop && !loadingLifeCycle && (
        <>
          <div className="crop-summary">
            <h2>{crop.name}</h2>

            <p>
              <strong>Scientific Name:</strong>{" "}
              {crop.scientificName}
            </p>

            <p>
              <strong>Total Growth Duration:</strong>{" "}
              {crop.growthDuration}
            </p>
          </div>

          {/* Timeline */}
          <div className="timeline">

            {crop.lifeCycle?.map((stage, index) => (
              <div
                className="timeline-item"
                key={index}
              >
                <div className="timeline-number">
                  {index + 1}
                </div>

                <div className="timeline-content">

                  <h3>{stage.stage}</h3>

                  <p className="stage-duration">
                    ⏱ {stage.duration}
                  </p>

                  <p>
                    {stage.description}
                  </p>

                  {/* Farmer Actions */}
                  {stage.farmerActions?.length > 0 && (
                    <div className="stage-section">
                      <h4>
                        🌾 Farmer Actions
                      </h4>

                      <ul>
                        {stage.farmerActions.map(
                          (action, actionIndex) => (
                            <li
                              key={actionIndex}
                            >
                              {action}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Monitoring */}
                  {stage.monitoring?.length > 0 && (
                    <div className="stage-section">
                      <h4>
                        🔍 Monitoring
                      </h4>

                      <ul>
                        {stage.monitoring.map(
                          (
                            item,
                            monitorIndex
                          ) => (
                            <li
                              key={
                                monitorIndex
                              }
                            >
                              {item}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                </div>
              </div>
            ))}

          </div>

          {/* General Care */}
          <div className="care-tips">
            <h2>🌿 General Crop Care Tips</h2>

            <ul>
              <li>
                Monitor soil moisture regularly.
              </li>

              <li>
                Provide appropriate irrigation.
              </li>

              <li>
                Check plants regularly for pests
                and diseases.
              </li>

              <li>
                Maintain proper soil nutrition.
              </li>

              <li>
                Follow recommended crop management
                practices.
              </li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="disclaimer">
            <strong>Note:</strong> Crop growth duration
            and stages can vary depending on variety,
            climate, soil, farming practices, and
            environmental conditions.
          </div>
        </>
      )}

    </div>
  );
}

export default CropLifeCycle;