import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import FeatureCard from '../components/FeatureCard';
import WeatherCard from '../components/WeatherCard';
import QuickTips from '../components/QuickTips';
import LatestUpdates from '../components/LatestUpdates';
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
                    <span className="hero-subtitle">🌱 SMART AGRICULTURE PLATFORM</span>
                    <h1 className="hero-title">Welcome to <span className="text-green">AgriAI</span></h1>
                    <p className="hero-description">
                        Your smart farming assistant for healthier crops, better decisions and higher yields.
                    </p>
                    <div className="hero-actions">
                        <button className="btn-primary" onClick={() => window.location.href = '/disease-detection'}>
                            🔍 Disease Detection →
                        </button>
                        <button className="btn-secondary" onClick={() => window.location.href = '/crop-recommendation'}>
                            🌱 Crop Recommendation →
                        </button>
                    </div>
                </div>
                <div className="hero-visuals">
                    <div className="positive-badge">
                        <span>Better Farming</span>
                        <span>Brighter Future</span>
                    </div>
                    <img src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=400&q=80" alt="Farmer in field" className="hero-farmer-img" />
                </div>
            </div>

            {/* Main Layout Grid */}
            <div className="dashboard-layout">
                {/* Left Column: Features */}
                <div className="dashboard-main">
                    <h2 className="section-title">{t("dashboard.exploreFeatures")}</h2>
                    <p className="section-subtitle">Use AI-powered tools to understand crop health and make informed agricultural decisions.</p>
                    
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
                            icon="🤖" 
                            title={t("sidebar.researchAssistant")} 
                            description={t("dashboard.features.researchAssistant")} 
                            link="/research" 
                            image="/ResearchAssistant.jpeg"
                        />
                        <FeatureCard 
                            icon="⚠️" 
                            title={t("sidebar.diseaseRisk")} 
                            description={t("dashboard.features.diseaseRisk")} 
                            link="/disease-risk" 
                            image="https://images.unsplash.com/photo-1592982537447-6f2334f55333?auto=format&fit=crop&w=400&q=80"
                        />
                        <FeatureCard 
                            icon="🌱" 
                            title={t("sidebar.cropLifeCycle")} 
                            description={t("dashboard.features.cropLifeCycle")} 
                            link="/crop-life-cycle" 
                            image="https://images.unsplash.com/photo-1595841696677-6479ff3f62eb?auto=format&fit=crop&w=400&q=80"
                        />
                        <FeatureCard 
                            icon="⛅" 
                            title={t("sidebar.weatherAdvisory")} 
                            description={t("dashboard.features.weatherAdvisory")} 
                            link="/weather" 
                            image="https://images.unsplash.com/photo-1530908295418-a12e326966ba?auto=format&fit=crop&w=400&q=80"
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
                <span className="strip-text">Small steps in farming, make a big difference in life!</span>
                <span className="strip-icon">✨</span>
            </div>
        </div>
    );
}

export default Dashboard;
