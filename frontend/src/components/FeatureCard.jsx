import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardComponents.css';

function FeatureCard({ icon, title, description, link, buttonText = "Open →" }) {
    const navigate = useNavigate();

    return (
        <div className="feature-card" onClick={() => navigate(link)}>
            <div className="feature-icon">{icon}</div>
            <h3 className="feature-title">{title}</h3>
            <p className="feature-description">{description}</p>
            <button className="feature-btn">{buttonText}</button>
        </div>
    );
}

export default FeatureCard;
