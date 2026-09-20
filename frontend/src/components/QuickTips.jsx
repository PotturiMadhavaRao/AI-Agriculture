import React from 'react';
import './DashboardComponents.css';

const tips = [
    { icon: '🌱', text: 'Check your crop leaves regularly for unusual spots.' },
    { icon: '💧', text: 'Avoid overwatering crops, ensure proper drainage.' },
    { icon: '🌦️', text: 'Check rainfall forecasts before applying irrigation.' },
    { icon: '🧪', text: 'Maintain proper soil nutrients through regular testing.' },
];

function QuickTips() {
    return (
        <div className="quick-tips-card">
            <h3 className="card-header">Quick Tips</h3>
            <div className="tips-list">
                {tips.map((tip, index) => (
                    <div className="tip-item" key={index}>
                        <span className="tip-icon">{tip.icon}</span>
                        <span className="tip-text">{tip.text}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default QuickTips;
