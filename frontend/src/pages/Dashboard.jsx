import React from 'react';
import { useTranslation } from 'react-i18next';
import FeatureCard from '../components/FeatureCard';
import WeatherCard from '../components/WeatherCard';
import QuickTips from '../components/QuickTips';
import LatestUpdates from '../components/LatestUpdates';
import './Dashboard.css';

function Dashboard() {
    const { t } = useTranslation();

    return (
        <div className="dashboard-container">
            {/* Hero Section */}
            <div className="hero-banner">
                <div className="hero-content">
                    <span className="hero-subtitle">🌱 SMART AGRICULTURE PLATFORM</span>
                    <h1 className="hero-title">{t("dashboard.welcomeTitle")}</h1>
                    <p className="hero-description">
                        {t("dashboard.welcomeDesc")}
                    </p>
                    <div className="hero-actions">
                        <button className="btn-primary" onClick={() => window.location.href = '/disease-detection'}>🌿 {t("sidebar.diseaseDetection")}</button>
                        <button className="btn-secondary" onClick={() => window.location.href = '/crop-recommendation'}>🌾 {t("sidebar.cropRecommendation")}</button>
                    </div>
                </div>
                <div className="hero-image">
                    {/* Abstract crop icon or image representation */}
                    <div className="abstract-crop">🌾</div>
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
                        />
                        <FeatureCard 
                            icon="🌾" 
                            title={t("sidebar.cropRecommendation")} 
                            description={t("dashboard.features.cropRecommendation")} 
                            link="/crop-recommendation" 
                        />
                        <FeatureCard 
                            icon="📈" 
                            title={t("sidebar.yieldPrediction")} 
                            description={t("dashboard.features.yieldPrediction")} 
                            link="/yield-prediction" 
                        />
                        <FeatureCard 
                            icon="🤖" 
                            title={t("sidebar.researchAssistant")} 
                            description={t("dashboard.features.researchAssistant")} 
                            link="/research" 
                        />
                        <FeatureCard 
                            icon="⚠️" 
                            title={t("sidebar.diseaseRisk")} 
                            description={t("dashboard.features.diseaseRisk")} 
                            link="/disease-risk" 
                        />
                        <FeatureCard 
                            icon="🌱" 
                            title={t("sidebar.cropLifeCycle")} 
                            description={t("dashboard.features.cropLifeCycle")} 
                            link="/crop-life-cycle" 
                        />
                        <FeatureCard 
                            icon="⛅" 
                            title={t("sidebar.weatherAdvisory")} 
                            description={t("dashboard.features.weatherAdvisory")} 
                            link="/weather" 
                        />
                    </div>
                </div>

                {/* Right Column: Widgets */}
                <div className="dashboard-sidebar">
                    <WeatherCard />
                    <QuickTips />
                    <LatestUpdates />
                </div>
            </div>

            {/* Bottom Banner */}
            <div className="bottom-banner">
                <div className="bottom-banner-content">
                    <h2>Better Information → Better Decisions → Higher Yields</h2>
                    <p>Your AI-powered farming partner</p>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
