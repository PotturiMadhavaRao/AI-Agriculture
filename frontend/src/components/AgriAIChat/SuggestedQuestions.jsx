import React from 'react';
import './AgricultureAIChat.css';

const questions = [
    "🌱 Which crop is suitable for my soil?",
    "🦠 How can I control tomato diseases?",
    "💧 How often should I irrigate my crop?",
    "🌾 How can I improve crop yield?",
    "🐛 How do I control common pests?",
    "🧪 What does NPK mean?",
    "🌿 Tell me about organic farming",
    "📚 Explain the crop life cycle"
];

const SuggestedQuestions = ({ onSelect }) => {
    return (
        <div className="suggested-questions">
            {questions.map((q, index) => (
                <button 
                    key={index} 
                    className="suggested-btn"
                    onClick={() => onSelect(q)}
                >
                    {q}
                </button>
            ))}
        </div>
    );
};

export default SuggestedQuestions;
