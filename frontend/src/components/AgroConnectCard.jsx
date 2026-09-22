import React from 'react';
import './DashboardComponents.css';

function AgroConnectCard({ icon, title, description, link, image, buttonText = "Open AgroConnect →" }) {
    const handleOpenExternal = () => {
        window.open(link, "_blank", "noopener,noreferrer");
    };

    return (
        <div className="feature-card feature-card-agroconnect" onClick={handleOpenExternal} style={{ cursor: 'pointer' }}>
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
                <button className="feature-btn" style={{ background: '#2196F3', color: 'white', borderColor: '#2196F3' }}>{buttonText}</button>
            </div>
        </div>
    );
}

export default AgroConnectCard;
