import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Sidebar.css';

function Sidebar({ isOpen, toggleSidebar }) {
    const { t } = useTranslation();

    const navItems = [
        { path: '/', label: t("sidebar.home"), icon: '🏠' },
        { path: '/disease-detection', label: t("sidebar.diseaseDetection"), icon: '🔍' },
        { path: '/crop-recommendation', label: t("sidebar.cropRecommendation"), icon: '🌱' },
        { path: '/yield-prediction', label: t("sidebar.yieldPrediction"), icon: '📊' },
        { path: '/disease-risk', label: t("sidebar.diseaseRisk"), icon: '⚠️' },
        { path: '/crop-life-cycle', label: t("sidebar.cropLifeCycle"), icon: '🔄' },
        { path: '/research', label: t("sidebar.researchAssistant"), icon: '🤖' },
        { path: '/weather', label: t("sidebar.weatherAdvisory"), icon: '⛅' },
        { path: '/help', label: t("sidebar.helpSupport"), icon: '❓' },
    ];

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <div className="logo-container">
                    <span className="logo-icon">🌱</span>
                    <span className="logo-text">AgriAI</span>
                </div>
                <button className="close-btn" onClick={toggleSidebar}>✖</button>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item, index) => (
                    <NavLink 
                        to={item.path} 
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        key={index}
                        onClick={toggleSidebar}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="support-card">
                    <p className="support-title">{t("sidebar.farmerSupport")}</p>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
