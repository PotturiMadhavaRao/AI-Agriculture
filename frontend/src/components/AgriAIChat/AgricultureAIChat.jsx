import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAgriAI } from '../../context/AgriAIContext';
import SuggestedQuestions from './SuggestedQuestions';
import './AgricultureAIChat.css';

const AgricultureAIChat = () => {
    const { isChatOpen, toggleChat, chatHistory, setChatHistory, contextData, clearChat } = useAgriAI();
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory, isLoading]);

    // Add welcome message if chat is opened and history is empty
    useEffect(() => {
        if (isChatOpen && chatHistory.length === 0) {
            setChatHistory([{
                role: 'model',
                content: "👋 Hello! I'm AgriAI Assistant.\n\nI can help you with crop diseases, crop selection, farming practices, soil, irrigation, fertilizers, pests, yield improvement and more.\n\nHow can I help you today?",
                isWelcome: true
            }]);
        }
    }, [isChatOpen, chatHistory, setChatHistory]);

    // Handle context injected from other modules
    useEffect(() => {
        if (contextData && isChatOpen) {
            let contextMessage = "I have context from the application:\n";
            if (contextData.module === 'disease_detection') {
                contextMessage += `Disease Detected: **${contextData.disease}** in ${contextData.crop} (${contextData.confidence}% confidence).`;
            } else if (contextData.module === 'crop_recommendation') {
                contextMessage += `Recommended Crop: **${contextData.recommended_crop}** (${contextData.confidence}% confidence).`;
            } else if (contextData.module === 'yield_prediction') {
                contextMessage += `Predicted Yield: **${contextData.predicted_yield_tonnes_per_ha}** tonnes/ha for ${contextData.crop}.`;
            } else if (contextData.module === 'disease_risk') {
                contextMessage += `Disease Risk Level: **${contextData.riskLevel}**.`;
            } else if (contextData.module === 'crop_lifecycle') {
                contextMessage += `Viewing Crop: **${contextData.crop}**.`;
            }
            
            // Check if this context is already the latest message
            const lastMsg = chatHistory[chatHistory.length - 1];
            if (lastMsg && lastMsg.isContextInfo && lastMsg.content === contextMessage) {
                return;
            }

            // Add as a special user message to show what the context is
            const newHistory = [...chatHistory, { role: 'user', content: contextMessage, isContextInfo: true }];
            setChatHistory(newHistory);
            
            // Immediately ask a follow up related to it.
            const queryMap = {
                'disease_detection': "Can you explain the symptoms, causes, and how to control this disease?",
                'crop_recommendation': "Why is this crop recommended and what are the general cultivation requirements?",
                'yield_prediction': "What factors affect this yield and how can I improve it?",
                'disease_risk': "How can I mitigate this disease risk?",
                'crop_lifecycle': "Tell me about the life cycle stages for this crop."
            };
            
            const autoQuery = queryMap[contextData.module] || "Can you give me more information about this?";
            handleSendMessage(autoQuery, newHistory);
        }
    }, [contextData, isChatOpen]); 

    const handleSendMessage = async (text = inputValue, currentHistory = chatHistory) => {
        if (!text.trim() || isLoading) return;

        const userMessage = { role: 'user', content: text };
        const newHistory = [...currentHistory, userMessage];
        setChatHistory(newHistory);
        setInputValue("");
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/agriculture-ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    history: currentHistory.filter(msg => !msg.isContextInfo && !msg.isWelcome), // Exclude system context and welcome messages from history array sent to API
                    context: contextData
                })
            });

            const data = await response.json();

            if (data.success) {
                setChatHistory([...newHistory, { role: 'model', content: data.reply }]);
            } else {
                setChatHistory([...newHistory, { role: 'model', content: data.message || "An error occurred.", isError: true }]);
            }
        } catch (error) {
            setChatHistory([...newHistory, { 
                role: 'model', 
                content: "🌱 I'm having trouble connecting right now. Please try again in a moment.", 
                isError: true 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isChatOpen) {
        return (
            <div className="agri-ai-chat-wrapper">
                <button className="agri-ai-floating-btn" onClick={toggleChat}>
                    <span role="img" aria-label="sprout">🌱</span> AgriAI
                </button>
            </div>
        );
    }

    return (
        <div className="agri-ai-chat-wrapper">
            <div className="agri-ai-chat-panel">
                <div className="agri-ai-header">
                    <div className="agri-ai-title-wrapper">
                        <h3 className="agri-ai-title">AgriAI Assistant</h3>
                        <p className="agri-ai-subtitle">Your intelligent farming companion</p>
                    </div>
                    <div className="header-actions">
                        <button className="agri-ai-clear-btn" onClick={clearChat} title="Clear Chat">
                            🧹
                        </button>
                        <button className="agri-ai-close-btn" onClick={toggleChat} title="Close">
                            ✕
                        </button>
                    </div>
                </div>

                <div className="agri-ai-messages">
                    {chatHistory.map((msg, idx) => (
                        <div key={idx} className={`agri-ai-message ${msg.role} ${msg.isError ? 'error' : ''}`}>
                            {msg.role === 'model' ? (
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                            ) : (
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                            )}
                        </div>
                    ))}
                    
                    {chatHistory.length === 1 && chatHistory[0].role === 'model' && (
                        <SuggestedQuestions onSelect={(q) => handleSendMessage(q)} />
                    )}

                    {isLoading && (
                        <div className="typing-indicator">
                            <div className="typing-dot"></div>
                            <div className="typing-dot"></div>
                            <div className="typing-dot"></div>
                            <span style={{marginLeft: '8px', fontSize: '12px', color: '#666'}}>AgriAI is thinking...</span>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="agri-ai-input-area">
                    <input 
                        type="text" 
                        className="agri-ai-input" 
                        placeholder="Ask about crops, diseases..." 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        disabled={isLoading}
                    />
                    <button 
                        className="agri-ai-send-btn" 
                        onClick={() => handleSendMessage()}
                        disabled={isLoading || !inputValue.trim()}
                    >
                        ➤
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AgricultureAIChat;
