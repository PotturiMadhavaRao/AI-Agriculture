import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../components/PageHeader';
import './HelpSupport.css';

function HelpSupport() {
    const { t } = useTranslation();
    const [openFaq, setOpenFaq] = useState(null);

    const toggleFaq = (index) => {
        if (openFaq === index) {
            setOpenFaq(null);
        } else {
            setOpenFaq(index);
        }
    };

    const faqs = [
        {
            question: "How do I upload a crop image for disease detection?",
            answer: "Go to the 'Disease Detection' page from the menu. Click on the upload area to select a photo of the diseased leaf from your phone or computer, or drag and drop it into the box. Ensure the image is clear and well-lit. Then click 'Analyze Crop'."
        },
        {
            question: "How does crop recommendation work?",
            answer: "The Crop Recommendation tool uses Artificial Intelligence to suggest the best crop to plant based on your specific soil nutrients (Nitrogen, Phosphorus, Potassium), soil pH, and local weather conditions (Temperature, Humidity, Rainfall). Entering accurate data provides the most reliable recommendations."
        },
        {
            question: "How accurate is the Yield Prediction?",
            answer: "The Yield Prediction tool provides an estimate based on historical agricultural data, typical weather patterns, and pesticide usage for specific regions. It is a decision-support tool, not a guarantee. Actual yields depend on many unpredictable field conditions."
        },
        {
            question: "How do I change the language?",
            answer: "You can change the language at any time by clicking the language dropdown menu (🌐) located at the top right of the screen next to your profile. Select your preferred language (e.g., Telugu, Hindi) and the entire application will update immediately."
        },
        {
            question: "Is my farm data secure?",
            answer: "Yes, we prioritize your privacy. Any images or data you input are only used to provide you with immediate predictions and recommendations. We do not sell your personal farm information to third parties."
        }
    ];

    return (
        <div className="page-container">
            <PageHeader 
                title={t("sidebar.helpSupport")} 
                description="Find answers to common questions and learn how to use AgriAI effectively." 
            />

            <div className="help-layout">
                <div className="faq-section">
                    <h2 className="section-title">Frequently Asked Questions</h2>
                    
                    <div className="faq-list">
                        {faqs.map((faq, index) => (
                            <div 
                                key={index} 
                                className={`faq-item ${openFaq === index ? 'open' : ''}`}
                            >
                                <button 
                                    className="faq-question" 
                                    onClick={() => toggleFaq(index)}
                                    aria-expanded={openFaq === index}
                                >
                                    <span>{faq.question}</span>
                                    <span className="faq-icon">
                                        {openFaq === index ? '−' : '+'}
                                    </span>
                                </button>
                                <div className="faq-answer">
                                    <p>{faq.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="contact-section">
                    <div className="contact-card">
                        <h3>📞 Need more help?</h3>
                        <p>Our agricultural experts are ready to assist you.</p>
                        
                        <div className="contact-methods">
                            <div className="contact-method">
                                <strong>Kisan Call Center:</strong>
                                <span>1800-180-1551</span>
                                <small>(Toll Free - 6:00 AM to 10:00 PM)</small>
                            </div>
                            
                            <div className="contact-method">
                                <strong>Email Support:</strong>
                                <span>support@agriai.example.com</span>
                            </div>
                        </div>

                        <button className="btn-primary contact-action-btn">
                            Send us a message
                        </button>
                    </div>

                    <div className="emergency-card">
                        <h3>⚠️ Emergency Services</h3>
                        <p>For urgent agricultural or rural emergencies, please contact your local authorities or dialect the national emergency number.</p>
                        <strong>112</strong>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HelpSupport;
