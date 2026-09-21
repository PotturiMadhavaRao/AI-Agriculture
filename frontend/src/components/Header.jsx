import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import './Header.css';

function Header({ toggleSidebar }) {
    const location = useLocation();
    const { t } = useTranslation();

    const getPageTitle = (pathname) => {
        switch (pathname) {
            case '/': return t("sidebar.home");
            case '/disease-detection': return t("sidebar.diseaseDetection");
            case '/crop-recommendation': return t("sidebar.cropRecommendation");
            case '/yield-prediction': return t("sidebar.yieldPrediction");
            case '/crop-life-cycle': return t("sidebar.cropLifeCycle");
            case '/disease-risk': return t("sidebar.diseaseRisk");
            case '/research': return t("sidebar.researchAssistant");
            case '/weather': return t("sidebar.weatherAdvisory");
            case '/help': return t("sidebar.helpSupport");
            default: return 'AgriAI';
        }
    };

    const pageTitle = getPageTitle(location.pathname);

    return (
        <header className="app-header">
            <div className="header-left">
                <button className="menu-toggle" onClick={toggleSidebar}>
                    ☰
                </button>
            </div>
            
            <div className="header-right">
                <LanguageSelector />


                <div className="user-profile">
                    <div className="avatar">👨‍🌾</div>
                    <div className="user-info">
                        <span className="welcome-text">{t("header.welcome")}</span>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
