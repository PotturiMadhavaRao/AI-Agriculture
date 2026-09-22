import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import FeatureCard from '../components/FeatureCard';
import WeatherCard from '../components/WeatherCard';
import QuickTips from '../components/QuickTips';
import LatestUpdates from '../components/LatestUpdates';
import AgroConnectCard from '../components/AgroConnectCard';
import './Dashboard.css';

function Dashboard() {
    const { t } = useTranslation();
    const [coords, setCoords] = useState(null);

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCoords({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                },
                (err) => {
                    console.log("Geolocation denied or failed in Dashboard.", err);
                },
                { timeout: 5000 }
            );
        }
    }, []);

    return (
        <div className="dashboard-container">
            {/* Hero Section */}
            <div className="hero-banner">
                <div className="hero-content">
                    <span className="hero-subtitle">🌱 {t("dashboard.heroSubtitle")}</span>
                    <h1 className="hero-title">{t("dashboard.welcomeTitle1")} <span className="text-green">AgriAI</span></h1>
                    <p className="hero-description">
                        {t("dashboard.welcomeDesc")}
                    </p>
                    <div className="hero-actions">
                        <button className="btn-primary" onClick={() => window.location.href = '/disease-detection'}>
                            🔍 {t("sidebar.diseaseDetection")} →
                        </button>
                        <button className="btn-secondary" onClick={() => window.location.href = '/crop-recommendation'}>
                            🌱 {t("sidebar.cropRecommendation")} →
                        </button>
                    </div>
                </div>
                <div className="hero-visuals">
                    <div className="positive-badge">
                        <span>{t("dashboard.badgeLine1")}</span>
                        <span>{t("dashboard.badgeLine2")}</span>
                    </div>
                    <img src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=400&q=80" alt="Farmer in field" className="hero-farmer-img" />
                </div>
            </div>

            {/* Main Layout Grid */}
            <div className="dashboard-layout">
                {/* Left Column: Features */}
                <div className="dashboard-main">
                    <h2 className="section-title">{t("dashboard.exploreFeatures")}</h2>
                    <p className="section-subtitle">{t("dashboard.sectionSubtitle")}</p>
                    
                    <div className="features-grid">
                        <FeatureCard 
                            icon="🌿" 
                            title={t("sidebar.diseaseDetection")} 
                            description={t("dashboard.features.diseaseDetection")} 
                            link="/disease-detection" 
                            type="disease"
                            image="/DiseaseDetection.jpeg"
                        />
                        <FeatureCard 
                            icon="🌾" 
                            title={t("sidebar.cropRecommendation")} 
                            description={t("dashboard.features.cropRecommendation")} 
                            link="/crop-recommendation" 
                            type="crop"
                            image="/CropRecommendation.jpeg"
                        />
                        <FeatureCard 
                            icon="📈" 
                            title={t("sidebar.yieldPrediction")} 
                            description={t("dashboard.features.yieldPrediction")} 
                            link="/yield-prediction" 
                            image="/YieldPrediction.jpeg"
                        />

                        <FeatureCard 
                            icon="⚠️" 
                            title={t("sidebar.diseaseRisk")} 
                            description={t("dashboard.features.diseaseRisk")} 
                            link="/disease-risk" 
                            image="/disease_risk.jpeg"
                        />
                        <FeatureCard 
                            icon="🌱" 
                            title={t("sidebar.cropLifeCycle")} 
                            description={t("dashboard.features.cropLifeCycle")} 
                            link="/crop-life-cycle" 
                            image="/crop_cycle.jpeg"
                        />
                        <FeatureCard 
                            icon="⛅" 
                            title={t("sidebar.weatherAdvisory")} 
                            description={t("dashboard.features.weatherAdvisory")} 
                            link="/weather" 
                            image="https://images.unsplash.com/photo-1530908295418-a12e326966ba?auto=format&fit=crop&w=400&q=80"
                        />
                        <AgroConnectCard 
                            icon="🤝" 
                            title={t("sidebar.agroConnect")} 
                            description={t("dashboard.features.agroConnect")} 
                            link="https://agro-connect-using-mern.vercel.app/" 
                            image="/connect_farmer_buyer.jpeg"
                        />
                    </div>
                </div>

                {/* Right Column: Widgets */}
                <div className="dashboard-sidebar">
                    <WeatherCard coords={coords} />
                    <QuickTips />
                    <LatestUpdates />
                </div>
            </div>

            {/* Motivational Strip */}
            <div className="motivational-strip">
                <span className="strip-icon">🌱</span>
                <span className="strip-text">{t("dashboard.motivationalStrip")}</span>
                <span className="strip-icon">✨</span>
            </div>
        </div>
    );
}

export default Dashboard;
