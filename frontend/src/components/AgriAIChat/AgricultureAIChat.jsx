import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAgriAI } from '../../context/AgriAIContext';
import SuggestedQuestions from './SuggestedQuestions';
import { useTranslation } from 'react-i18next';
import './AgricultureAIChat.css';

const speechLanguages = {
    en: "en-IN",
    te: "te-IN",
    hi: "hi-IN",
    ta: "ta-IN",
    kn: "kn-IN",
    ml: "ml-IN",
    bn: "bn-IN"
};

const AgricultureAIChat = () => {
    const { isChatOpen, toggleChat, chatHistory, setChatHistory, contextData, clearChat } = useAgriAI();
    const { i18n } = useTranslation();
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Voice Input State
    const [isListening, setIsListening] = useState(false);
    const [voiceSupported, setVoiceSupported] = useState(false);
    const [interimTranscript, setInterimTranscript] = useState("");
    const [voiceError, setVoiceError] = useState("");
    const [speakingMessageId, setSpeakingMessageId] = useState(null);
    const recognitionRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory, isLoading, interimTranscript, voiceError]);

    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            setVoiceSupported(true);
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;

            recognition.onresult = (event) => {
                let final = "";
                let interim = "";
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        final += transcript;
                    } else {
                        interim += transcript;
                    }
                }
                if (interim) setInterimTranscript(interim);
                if (final) {
                    setInputValue((prev) => prev ? `${prev} ${final}`.trim() : final.trim());
                    setInterimTranscript("");
                }
            };

            recognition.onerror = (event) => {
                let msg = "🎤 I couldn't hear you. Please try again.";
                if (event.error === 'not-allowed') msg = "🎤 Please allow microphone access to use voice input.";
                if (event.error === 'network') msg = "🎤 Network error occurred during speech recognition.";
                setVoiceError(msg);
                setIsListening(false);
                setInterimTranscript("");
                setTimeout(() => setVoiceError(""), 5000);
            };

            recognition.onend = () => {
                setIsListening(false);
                setInterimTranscript("");
            };

            recognitionRef.current = recognition;
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const startVoiceRecognition = () => {
        if (!recognitionRef.current) return;
        
        // Stop any ongoing speech response when microphone is activated
        if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            setSpeakingMessageId(null);
        }
        
        setVoiceError("");
        const langCode = speechLanguages[i18n.language] || "en-IN";
        recognitionRef.current.lang = langCode;
        setIsListening(true);
        try {
            recognitionRef.current.start();
        } catch (e) {
            console.error(e);
        }
    };

    const stopVoiceRecognition = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsListening(false);
        setInterimTranscript("");
    };

    const handleVoiceToggle = () => {
        if (isListening) stopVoiceRecognition();
        else startVoiceRecognition();
    };

    const handleSpeakResponse = (text, idx) => {
        if (!('speechSynthesis' in window)) return;

        if (speakingMessageId === idx && window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            setSpeakingMessageId(null);
            return;
        }

        window.speechSynthesis.cancel(); // Stop any ongoing speech
        const utterance = new SpeechSynthesisUtterance(text);
        const langCode = speechLanguages[i18n.language] || "en-IN";
        utterance.lang = langCode;

        utterance.onstart = () => setSpeakingMessageId(idx);
        utterance.onend = () => setSpeakingMessageId(null);
        utterance.onerror = () => setSpeakingMessageId(null);

        window.speechSynthesis.speak(utterance);
    };

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
            
            const lastMsg = chatHistory[chatHistory.length - 1];
            if (lastMsg && lastMsg.isContextInfo && lastMsg.content === contextMessage) return;

            const newHistory = [...chatHistory, { role: 'user', content: contextMessage, isContextInfo: true }];
            setChatHistory(newHistory);
            
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
        setInterimTranscript("");
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/agriculture-ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    history: currentHistory.filter(msg => !msg.isContextInfo && !msg.isWelcome),
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

    const languageDisplayNames = {
        en: "English", te: "Telugu", hi: "Hindi", ta: "Tamil", kn: "Kannada"
    };

    return (
        <div className="agri-ai-chat-wrapper">
            <div className="agri-ai-chat-panel">
                <div className="agri-ai-header">
                    <div className="agri-ai-title-wrapper">
                        <h3 className="agri-ai-title">AgriAI Assistant</h3>
                        <p className="agri-ai-subtitle">Your intelligent farming companion</p>
                    </div>
                    <div className="header-actions">
                        <button className="agri-ai-clear-btn" onClick={clearChat} title="Clear Chat">🧹</button>
                        <button className="agri-ai-close-btn" onClick={toggleChat} title="Close">✕</button>
                    </div>
                </div>

                <div className="agri-ai-messages">
                    {chatHistory.map((msg, idx) => (
                        <div key={idx} className={`agri-ai-message ${msg.role} ${msg.isError ? 'error' : ''}`}>
                            <div className="message-content-wrapper">
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                                {msg.role === 'model' && !msg.isWelcome && !msg.isError && (
                                    <button 
                                        className="tts-listen-btn" 
                                        onClick={() => handleSpeakResponse(msg.content, idx)}
                                        title={speakingMessageId === idx ? "Stop speaking" : "Listen to response"}
                                        aria-label={speakingMessageId === idx ? "Stop speaking" : "Listen to response"}
                                    >
                                        {speakingMessageId === idx ? "⏹️ Stop" : "🔊 Listen"}
                                    </button>
                                )}
                            </div>
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

                <div className="agri-ai-input-container">
                    {voiceError && <div className="voice-error-msg">{voiceError}</div>}
                    {isListening && (
                        <div className="voice-listening-indicator">
                            🎙️ Listening in {languageDisplayNames[i18n.language] || "English"}...
                        </div>
                    )}
                    
                    <div className="agri-ai-input-area">
                        <input 
                            type="text" 
                            className="agri-ai-input" 
                            placeholder="Ask about crops, diseases..." 
                            value={inputValue + (interimTranscript ? ` ${interimTranscript}` : "")}
                            onChange={(e) => {
                                setInputValue(e.target.value);
                                setInterimTranscript("");
                            }}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            disabled={isLoading}
                        />
                        
                        {voiceSupported && (
                            <button 
                                className={`voice-input-btn ${isListening ? 'listening' : ''}`}
                                onClick={handleVoiceToggle}
                                disabled={isLoading}
                                title={isListening ? "Stop listening" : "Speak to AgriAI"}
                                aria-label={isListening ? "Stop listening" : "Speak to AgriAI"}
                            >
                                {isListening ? "🔴" : "🎤"}
                            </button>
                        )}

                        <button 
                            className="agri-ai-send-btn" 
                            onClick={() => handleSendMessage()}
                            disabled={isLoading || (!inputValue.trim() && !interimTranscript.trim())}
                        >
                            ➤
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgricultureAIChat;
