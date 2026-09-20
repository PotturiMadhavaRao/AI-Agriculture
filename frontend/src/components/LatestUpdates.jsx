import React from 'react';
import './DashboardComponents.css';

const updates = [
    { icon: '⚠️', title: 'Tomato disease info updated', date: 'Today' },
    { icon: '🌱', title: 'New crop varieties added', date: 'Yesterday' },
    { icon: '⛅', title: 'Weather advisory available', date: '2 days ago' },
    { icon: '🤖', title: 'New agricultural research added', date: 'Last week' },
];

function LatestUpdates() {
    return (
        <div className="latest-updates-card">
            <h3 className="card-header">Latest Updates</h3>
            <div className="updates-list">
                {updates.map((update, index) => (
                    <div className="update-item" key={index}>
                        <div className="update-icon">{update.icon}</div>
                        <div className="update-content">
                            <h4 className="update-title">{update.title}</h4>
                            <span className="update-date">{update.date}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default LatestUpdates;
