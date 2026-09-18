
import { Link } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard-page">

      {/* Hero Section */}
      <section className="dashboard-hero">

        <div className="hero-content">

          <p className="hero-tag">
            🌱 SMART AGRICULTURE PLATFORM
          </p>

          <h1>
            Welcome to <span>AgriAI</span>
          </h1>

          <p className="hero-description">
            Your AI-powered agricultural assistant for
            crop health, disease detection, crop planning
            and farming decisions.
          </p>

          <div className="hero-buttons">

            <Link
              to="/disease-detection"
              className="primary-button"
            >
              🌿 Analyze Crop
            </Link>

            <Link
              to="/crop-recommendation"
              className="secondary-button"
            >
              🌾 Recommend Crop
            </Link>

          </div>

        </div>

        <div className="hero-visual">
          🌾
        </div>

      </section>


      {/* Quick Stats */}
      <section className="stats-section">

        <div className="stat-card">
          <span>🌿</span>
          <div>
            <strong>AI Disease</strong>
            <p>Detection</p>
          </div>
        </div>

        <div className="stat-card">
          <span>🌾</span>
          <div>
            <strong>Smart Crop</strong>
            <p>Recommendation</p>
          </div>
        </div>

        <div className="stat-card">
          <span>📈</span>
          <div>
            <strong>Yield</strong>
            <p>Prediction</p>
          </div>
        </div>

        <div className="stat-card">
          <span>🤖</span>
          <div>
            <strong>AI Research</strong>
            <p>Assistant</p>
          </div>
        </div>

      </section>


      {/* Features */}
      <section className="features-section">

        <div className="section-heading">

          <p>AI AGRICULTURE TOOLS</p>

          <h2>
            Everything you need for smarter farming
          </h2>

          <span>
            Use AI-powered tools to understand crop
            health and make informed agricultural decisions.
          </span>

        </div>


        <div className="feature-grid">

          {/* Disease Detection */}
          <Link
            to="/disease-detection"
            className="feature-card"
          >

            <div className="feature-icon">
              🌿
            </div>

            <h3>
              Disease Detection
            </h3>

            <p>
              Upload a crop leaf image and let the AI
              model identify possible diseases.
            </p>

            <span className="feature-link">
              Analyze Leaf →
            </span>

          </Link>


          {/* Crop Recommendation */}
          <Link
            to="/crop-recommendation"
            className="feature-card"
          >

            <div className="feature-icon">
              🌾
            </div>

            <h3>
              Crop Recommendation
            </h3>

            <p>
              Find suitable crops based on soil,
              season and environmental conditions.
            </p>

            <span className="feature-link">
              Recommend Crop →
            </span>

          </Link>


          {/* Yield Prediction */}
          <Link
            to="/yield-prediction"
            className="feature-card"
          >

            <div className="feature-icon">
              📈
            </div>

            <h3>
              Yield Prediction
            </h3>

            <p>
              Estimate expected crop production using
              agricultural and environmental data.
            </p>

            <span className="feature-link">
              Predict Yield →
            </span>

          </Link>


          {/* Disease Risk */}
          <Link
            to="/disease-risk"
            className="feature-card"
          >

            <div className="feature-icon">
              ⚠️
            </div>

            <h3>
              Disease Risk
            </h3>

            <p>
              Analyze environmental conditions that may
              increase crop disease risk.
            </p>

            <span className="feature-link">
              Check Risk →
            </span>

          </Link>


          {/* Crop Life Cycle */}
          <Link
            to="/crop-life-cycle"
            className="feature-card"
          >

            <div className="feature-icon">
              🌱
            </div>

            <h3>
              Crop Life Cycle
            </h3>

            <p>
              Explore crop growth stages from planting
              through harvesting.
            </p>

            <span className="feature-link">
              Explore Cycle →
            </span>

          </Link>


          {/* Research Assistant */}
          <Link
            to="/research"
            className="feature-card"
          >

            <div className="feature-icon">
              🤖
            </div>

            <h3>
              Research Assistant
            </h3>

            <p>
              Ask questions about crops, diseases,
              farming practices and agriculture.
            </p>

            <span className="feature-link">
              Ask AI →
            </span>

          </Link>

        </div>

      </section>


      {/* How It Works */}
      <section className="how-section">

        <div className="section-heading">

          <p>HOW AGRIAI WORKS</p>

          <h2>
            From crop image to useful information
          </h2>

        </div>


        <div className="steps-grid">

          <div className="step-card">

            <div className="step-number">
              01
            </div>

            <h3>
              Upload
            </h3>

            <p>
              Upload a clear image of your crop leaf.
            </p>

          </div>


          <div className="step-card">

            <div className="step-number">
              02
            </div>

            <h3>
              Analyze
            </h3>

            <p>
              Our AI model analyzes the image.
            </p>

          </div>


          <div className="step-card">

            <div className="step-number">
              03
            </div>

            <h3>
              Understand
            </h3>

            <p>
              View the predicted disease and confidence.
            </p>

          </div>


          <div className="step-card">

            <div className="step-number">
              04
            </div>

            <h3>
              Act
            </h3>

            <p>
              Get prevention and management information.
            </p>

          </div>

        </div>

      </section>


      {/* Footer Message */}
      <section className="dashboard-footer">

        <h2>
          🌱 Smarter decisions. Healthier crops.
        </h2>

        <p>
          AgriAI combines artificial intelligence and
          agricultural knowledge to support better crop
          management.
        </p>

      </section>

    </div>
  );
}

export default Dashboard;
