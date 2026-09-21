import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Sidebar.css';

function Sidebar({ isOpen, toggleSidebar }) {
    const { t } = useTranslation();

    const navItems = [
        { id: 'home', path: '/', label: t("sidebar.home"), icon: '🏠' },
        { id: 'disease-detect', path: '/disease-detection', label: t("sidebar.diseaseDetection"), icon: '🔍' },
        { id: 'crop-rec', path: '/crop-recommendation', label: t("sidebar.cropRecommendation"), icon: '🌱' },
        { id: 'yield-pred', path: '/yield-prediction', label: t("sidebar.yieldPrediction"), icon: '📊' },
        { id: 'disease-risk', path: '/disease-risk', label: t("sidebar.diseaseRisk"), icon: '⚠️' },
        { id: 'crop-life', path: '/crop-life-cycle', label: t("sidebar.cropLifeCycle"), icon: '🔄' },
        { id: 'research', path: '/research', label: t("sidebar.researchAssistant"), icon: '🤖' },
        { id: 'weather', path: '/weather', label: t("sidebar.weatherAdvisory"), icon: '⛅' },
        { id: 'help', path: '/help', label: t("sidebar.helpSupport"), icon: '❓' },
    ];

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <div className="logo-container">
                    <span className="logo-icon">🌱</span>
                    <div className="logo-text-group">
                        <span className="logo-text">AgriAI</span>
                        <span className="logo-subtitle">Healthy Crops • Prosperous Farmers</span>
                    </div>
                </div>
                <button className="close-btn" onClick={toggleSidebar}>✖</button>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item, index) => (
                    <NavLink 
                        to={item.path} 
                        className={({ isActive }) => `nav-item nav-${item.id} ${isActive ? 'active' : ''}`}
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
                    <div className="support-avatar">👨‍🌾</div>
                    <p className="support-title">{t("sidebar.farmerSupport")}</p>
                    <p className="support-phone">📞 1800-180-1551</p>
                    <p className="support-subtitle">Toll Free | 24x7</p>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
