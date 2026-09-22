import { useTranslation } from "react-i18next";
import "./Home.css";

function Home() {
  const { t } = useTranslation();
  return (
    <div className="home">

      {/* Hero Section */}
      <section className="hero">

        <div className="hero-content">

          <p className="welcome">🌾 {t("home.welcome")}</p>

          <h1>
            {t("home.heroTitle1")}
            <span> {t("home.heroTitle2")}</span>
          </h1>

          <p className="hero-description">
            {t("home.heroDesc")}
          </p>

          <div className="hero-buttons">
            <button className="primary-btn">
              🔍 {t("home.detectBtn")}
            </button>

            <button className="secondary-btn">
              🌱 {t("home.recommendBtn")}
            </button>
          </div>

        </div>

      </section>


      {/* Features Section */}
      <section className="features">

        <div className="section-title">
          <p>{t("home.smartAgriculture")}</p>

          <h2>
            {t("home.betterManagement1")}
            <span> {t("home.betterManagement2")}</span>
          </h2>

          <p>
            {t("home.platformDesc")}
          </p>
        </div>


        <div className="feature-grid">

          {/* Disease Detection */}
          <div className="feature-card">
            <div className="feature-icon">🔬</div>
            <h3>{t("home.features.disease.title")}</h3>
            <p>{t("home.features.disease.desc")}</p>
            <button>{t("home.features.disease.btn")} →</button>
          </div>

          {/* Crop Recommendation */}
          <div className="feature-card">
            <div className="feature-icon">🌱</div>
            <h3>{t("home.features.recommend.title")}</h3>
            <p>{t("home.features.recommend.desc")}</p>
            <button>{t("home.features.recommend.btn")} →</button>
          </div>

          {/* Yield Prediction */}
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>{t("home.features.yield.title")}</h3>
            <p>{t("home.features.yield.desc")}</p>
            <button>{t("home.features.yield.btn")} →</button>
          </div>

          {/* Disease Risk */}
          <div className="feature-card">
            <div className="feature-icon">⚠️</div>
            <h3>{t("home.features.risk.title")}</h3>
            <p>{t("home.features.risk.desc")}</p>
            <button>{t("home.features.risk.btn")} →</button>
          </div>

          {/* Crop Lifecycle */}
          <div className="feature-card">
            <div className="feature-icon">🌿</div>
            <h3>{t("home.features.lifecycle.title")}</h3>
            <p>{t("home.features.lifecycle.desc")}</p>
            <button>{t("home.features.lifecycle.btn")} →</button>
          </div>

          {/* Research */}
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>{t("home.features.research.title")}</h3>
            <p>{t("home.features.research.desc")}</p>
            <button>{t("home.features.research.btn")} →</button>
          </div>

        </div>

      </section>

    </div>
  );
}

export default Home;
