import "./Home.css";

function Home() {
  return (
    <div className="home">

      {/* Hero Section */}
      <section className="hero">

        <div className="hero-content">

          <p className="welcome">🌾 Welcome to AgriAI</p>

          <h1>
            AI-Powered Agricultural
            <span> Disease Detection</span>
          </h1>

          <p className="hero-description">
            Detect crop diseases, understand their causes,
            predict risks, and get intelligent agricultural
            recommendations using Artificial Intelligence.
          </p>

          <div className="hero-buttons">
            <button className="primary-btn">
              🔍 Detect Disease
            </button>

            <button className="secondary-btn">
              🌱 Recommend Crop
            </button>
          </div>

        </div>

      </section>


      {/* Features Section */}
      <section className="features">

        <div className="section-title">
          <p>SMART AGRICULTURE</p>

          <h2>
            Everything You Need for
            <span> Better Crop Management</span>
          </h2>

          <p>
            One intelligent platform for disease detection,
            prediction and agricultural decision support.
          </p>
        </div>


        <div className="feature-grid">

          {/* Disease Detection */}
          <div className="feature-card">

            <div className="feature-icon">
              🔬
            </div>

            <h3>AI Disease Detection</h3>

            <p>
              Upload a crop or leaf image and use AI
              to identify possible diseases.
            </p>

            <button>
              Detect Disease →
            </button>

          </div>


          {/* Crop Recommendation */}
          <div className="feature-card">

            <div className="feature-icon">
              🌱
            </div>

            <h3>Crop Recommendation</h3>

            <p>
              Get suitable crop recommendations based
              on soil, weather and environmental conditions.
            </p>

            <button>
              Recommend Crop →
            </button>

          </div>


          {/* Yield Prediction */}
          <div className="feature-card">

            <div className="feature-icon">
              📈
            </div>

            <h3>Yield Prediction</h3>

            <p>
              Estimate expected crop yield using
              agricultural and environmental data.
            </p>

            <button>
              Predict Yield →
            </button>

          </div>


          {/* Disease Risk */}
          <div className="feature-card">

            <div className="feature-icon">
              ⚠️
            </div>

            <h3>Disease Risk Prediction</h3>

            <p>
              Predict disease risk using weather,
              crop conditions and historical information.
            </p>

            <button>
              Check Risk →
            </button>

          </div>


          {/* Crop Lifecycle */}
          <div className="feature-card">

            <div className="feature-icon">
              🌿
            </div>

            <h3>Crop Life Cycle</h3>

            <p>
              Learn about crop growth stages,
              requirements and common diseases.
            </p>

            <button>
              Explore Crops →
            </button>

          </div>


          {/* Research */}
          <div className="feature-card">

            <div className="feature-icon">
              📚
            </div>

            <h3>Agricultural Research</h3>

            <p>
              Explore agricultural research,
              disease information and modern farming knowledge.
            </p>

            <button>
              Research →
            </button>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Home;
