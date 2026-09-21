import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardComponents.css';

function FeatureCard({ icon, title, description, link, image, buttonText = "Open →", type = "default" }) {
    const navigate = useNavigate();

    return (
        <div className={`feature-card feature-card-${type}`} onClick={() => navigate(link)}>
            {image && (
                <div className="feature-image-container">
                    <img src={image} alt={title} className="feature-image" loading="lazy" />
                </div>
            )}
            <div className="feature-content-container">
                <div className="feature-header-row">
                    <div className="feature-icon">{icon}</div>
                    <h3 className="feature-title">{title}</h3>
                </div>
                <p className="feature-description">{description}</p>
                <button className="feature-btn">{buttonText}</button>
            </div>
        </div>
    );
}

export default FeatureCard;
