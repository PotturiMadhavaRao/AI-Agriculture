import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import PageHeader from "../components/PageHeader";
import { translateDynamicContent, translateArray } from "../services/translationService";
import "./ResearchAssistant.css";

const API_URL = "http://localhost:5000/api/research/ask";

function ResearchAssistant() {
    const { t, i18n } = useTranslation();
    const [question, setQuestion] = useState("");
    const [result, setResult] = useState(null);
    const [conversation, setConversation] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    
    // Voice Assistant states
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const recognitionRef = useRef(null);
    
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [conversation, loading]);

    useEffect(() => {
        // Cleanup speech synthesis and recognition on unmount
        return () => {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    // Speech-to-Text (Voice Input)
    const handleVoiceInput = () => {
        if (isListening) {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            setIsListening(false);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError("Voice input is not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        
        // Map i18n language to speech language
        const langMap = {
            "en": "en-IN",
            "te": "te-IN",
            "hi": "hi-IN"
        };
        const currentLang = i18n.language || "en";
        recognition.lang = langMap[currentLang] || "en-IN";

        recognition.onstart = () => {
            setIsListening(true);
            setError("");
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setQuestion(prev => (prev ? prev + " " + transcript : transcript));
            setIsListening(false);
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            if (event.error === 'not-allowed') {
                setError("Microphone permission is required.");
            } else if (event.error !== 'aborted') {
                setError("Could not understand the speech. Please try again.");
            }
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    // Text-to-Speech (Voice Output)
    const selectPreferredMaleVoice = (lang) => {
        const voices = window.speechSynthesis.getVoices();
        if (!voices || voices.length === 0) return null;

        const targetLang = lang.substring(0, 2);
        
        // Filter by language
        const langVoices = voices.filter(v => v.lang.startsWith(targetLang));
        const availableVoices = langVoices.length > 0 ? langVoices : voices;

        // Try to find a male voice
        const maleKeywords = ["male", "man", "david", "george", "daniel", "ravi", "boy"];
        for (const voice of availableVoices) {
            const lowerName = voice.name.toLowerCase();
            if (maleKeywords.some(kw => lowerName.includes(kw))) {
                return voice;
            }
        }

        // Fallback to first available
        return availableVoices[0] || voices[0];
    };

    const getSpeakableAnswer = (resData) => {
        if (!resData || !resData.answer) return "";
        const answer = resData.answer;
        let speakableText = "";

        if (answer.title) speakableText += answer.title + ". ";

        if (resData.type === "focused_answer") {
            if (answer.heading) speakableText += answer.heading + ". ";
            if (answer.items?.length > 0) {
                speakableText += answer.items.join(". ") + ". ";
            }
            if (answer.value) speakableText += answer.value + ". ";
            if (answer.treatments?.length > 0) {
                answer.treatments.forEach(t => {
                    if (t.type) speakableText += t.type + ". ";
                    if (t.recommendation) speakableText += t.recommendation + ". ";
                });
            }
        } else if (resData.type === "combined_answer") {
            if (answer.symptoms?.length > 0) {
                speakableText += "Symptoms include: " + answer.symptoms.join(". ") + ". ";
            }
            if (answer.prevention?.length > 0) {
                speakableText += "Prevention: " + answer.prevention.join(". ") + ". ";
            }
            if (answer.conditions?.length > 0) {
                speakableText += "Favorable conditions: " + answer.conditions.join(". ") + ". ";
            }
        } else if (resData.type === "general") {
            if (answer.message) speakableText += answer.message + ". ";
            if (answer.suggestion) speakableText += answer.suggestion + ". ";
        } else if (resData.type === "disease_information") {
            if (answer.description) speakableText += answer.description + ". ";
            if (answer.cause) speakableText += "Cause: " + answer.cause + ". ";
            if (answer.symptoms?.length > 0) speakableText += "Symptoms: " + answer.symptoms.join(". ") + ". ";
        } else if (resData.type === "crop_information") {
            if (answer.description) speakableText += answer.description + ". ";
            if (answer.season) speakableText += "Season: " + answer.season + ". ";
            if (answer.waterRequirement) speakableText += "Water requirement: " + answer.waterRequirement + ". ";
            if (answer.growthDuration) speakableText += "Growth duration: " + answer.growthDuration + ". ";
        }

        // Clean up text
        return speakableText.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "").replace(/\s+/g, ' ').trim();
    };

    const handleSpeak = (resData) => {
        if (!window.speechSynthesis) {
            setError("Voice output is not supported in this browser.");
            return;
        }

        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        window.speechSynthesis.cancel(); // Stop any ongoing speech

        const textToSpeak = getSpeakableAnswer(resData);
        if (!textToSpeak) return;

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        
        const langMap = {
            "en": "en-IN",
            "te": "te-IN",
            "hi": "hi-IN"
        };
        const currentLang = i18n.language || "en";
        utterance.lang = langMap[currentLang] || "en-IN";

        // This ensures voices are loaded before selecting (mainly for some browsers)
        if (window.speechSynthesis.getVoices().length === 0) {
            window.speechSynthesis.onvoiceschanged = () => {
                const voice = selectPreferredMaleVoice(utterance.lang);
                if (voice) utterance.voice = voice;
                startSpeech(utterance);
            };
        } else {
            const voice = selectPreferredMaleVoice(utterance.lang);
            if (voice) utterance.voice = voice;
            startSpeech(utterance);
        }
    };

    const startSpeech = (utterance) => {
        utterance.rate = 0.9;
        utterance.pitch = 0.9;
        
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (e) => {
            console.error("Speech synthesis error", e);
            setIsSpeaking(false);
        };

        window.speechSynthesis.speak(utterance);
    };

    const handleAsk = async () => {
        if (!question.trim()) {
            setError(t("researchAssistant.errorEmpty"));
            return;
        }

        setLoading(true);
        setError("");
        setResult(null);

        const currentQuestion = question.trim();
        setQuestion(""); // clear input early for better UX

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: currentQuestion }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to get answer");
            
            if (data.answer) {
                data.answer.title = await translateDynamicContent(data.answer.title);
                if (data.answer.heading) data.answer.heading = await translateDynamicContent(data.answer.heading);
                if (data.answer.value) data.answer.value = await translateDynamicContent(data.answer.value);
                if (data.answer.message) data.answer.message = await translateDynamicContent(data.answer.message);
                if (data.answer.suggestion) data.answer.suggestion = await translateDynamicContent(data.answer.suggestion);
                if (data.answer.description) data.answer.description = await translateDynamicContent(data.answer.description);
                if (data.answer.cause) data.answer.cause = await translateDynamicContent(data.answer.cause);
                if (data.answer.items) data.answer.items = await translateArray(data.answer.items);
                if (data.answer.symptoms) data.answer.symptoms = await translateArray(data.answer.symptoms);
                if (data.answer.prevention) data.answer.prevention = await translateArray(data.answer.prevention);
                if (data.answer.conditions) data.answer.conditions = await translateArray(data.answer.conditions);
                if (data.answer.treatments) {
                    for (let tr of data.answer.treatments) {
                        if (tr.type) tr.type = await translateDynamicContent(tr.type);
                        if (tr.recommendation) tr.recommendation = await translateDynamicContent(tr.recommendation);
                        if (tr.activeIngredient) tr.activeIngredient = await translateDynamicContent(tr.activeIngredient);
                        if (tr.safetyPrecautions) tr.safetyPrecautions = await translateArray(tr.safetyPrecautions);
                    }
                }
            }

            setResult(data);
            setConversation((prev) => [...prev, { question: currentQuestion, result: data }]);
        } catch (error) {
            console.error("Research assistant error:", error);
            setError(t("researchAssistant.errorBackend"));
            // Add failed question to conversation so user can see it failed
            setConversation((prev) => [...prev, { question: currentQuestion, error: true }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleAsk();
        }
    };

    const handleRelatedQuestion = async (relatedQuestion) => {
        setQuestion(relatedQuestion);
        setError("");
        setLoading(true);
        setResult(null);

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: relatedQuestion }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to get answer");

            if (data.answer) {
                data.answer.title = await translateDynamicContent(data.answer.title);
                if (data.answer.heading) data.answer.heading = await translateDynamicContent(data.answer.heading);
                if (data.answer.value) data.answer.value = await translateDynamicContent(data.answer.value);
                if (data.answer.message) data.answer.message = await translateDynamicContent(data.answer.message);
                if (data.answer.suggestion) data.answer.suggestion = await translateDynamicContent(data.answer.suggestion);
                if (data.answer.description) data.answer.description = await translateDynamicContent(data.answer.description);
                if (data.answer.cause) data.answer.cause = await translateDynamicContent(data.answer.cause);
                if (data.answer.items) data.answer.items = await translateArray(data.answer.items);
                if (data.answer.symptoms) data.answer.symptoms = await translateArray(data.answer.symptoms);
                if (data.answer.prevention) data.answer.prevention = await translateArray(data.answer.prevention);
                if (data.answer.conditions) data.answer.conditions = await translateArray(data.answer.conditions);
                if (data.answer.treatments) {
                    for (let tr of data.answer.treatments) {
                        if (tr.type) tr.type = await translateDynamicContent(tr.type);
                        if (tr.recommendation) tr.recommendation = await translateDynamicContent(tr.recommendation);
                        if (tr.activeIngredient) tr.activeIngredient = await translateDynamicContent(tr.activeIngredient);
                        if (tr.safetyPrecautions) tr.safetyPrecautions = await translateArray(tr.safetyPrecautions);
                    }
                }
            }

            setResult(data);
            setConversation((prev) => [...prev, { question: relatedQuestion, result: data }]);
            setQuestion("");
        } catch (error) {
            console.error("Related question error:", error);
            setError(t("researchAssistant.errorBackend"));
            setConversation((prev) => [...prev, { question: relatedQuestion, error: true }]);
        } finally {
            setLoading(false);
        }
    };

    const getRelatedQuestions = (ansData) => {
        if (!ansData) return [];
        const answer = ansData.answer;
        const title = answer?.title;
        if (!title) return [];

        if (ansData.type === "focused_answer") {
            switch(ansData.intent) {
                case "symptoms": return [`How can I prevent ${title}?`, `How can I treat ${title}?`, `What conditions favor ${title}?`];
                case "prevention": return [`What are the symptoms of ${title}?`, `How can I treat ${title}?`, `What conditions favor ${title}?`];
                case "conditions": return [`What are the symptoms of ${title}?`, `How can I prevent ${title}?`, `How can I treat ${title}?`];
                case "treatment": return [`What are the symptoms of ${title}?`, `How can I prevent ${title}?`, `What conditions favor ${title}?`];
                case "soil": return [`How much water does ${title} need?`, `What season is best for ${title}?`, `How long does ${title} take to grow?`];
                case "water": return [`What soil is suitable for ${title}?`, `What season is best for ${title}?`, `How long does ${title} take to grow?`];
                case "season": return [`What soil is suitable for ${title}?`, `How much water does ${title} need?`, `How long does ${title} take to grow?`];
                case "duration": return [`What soil is suitable for ${title}?`, `How much water does ${title} need?`, `What is the life cycle of ${title}?`];
                case "lifecycle": return [`What soil is suitable for ${title}?`, `How much water does ${title} need?`, `How long does ${title} take to grow?`];
                default: break;
            }
        } else if (ansData.type === "disease_information") {
            return [`What are the symptoms of ${title}?`, `How can I prevent ${title}?`, `How can I treat ${title}?`];
        } else if (ansData.type === "crop_information") {
            return [`What soil is suitable for ${title}?`, `How much water does ${title} need?`, `What is the life cycle of ${title}?`];
        }
        return [];
    };

    const renderAnswerContent = (resData) => {
        if (!resData || !resData.answer) return null;
        const answer = resData.answer;

        return (
            <div className="assistant-response-content">
                <div className="answer-header">
                    <div className="answer-title-group">
                        <h4>{answer.title}</h4>
                        {answer.crop && <span className="crop-tag">🌱 {answer.crop}</span>}
                    </div>
                    <button 
                        className={`speak-button ${isSpeaking ? 'speaking' : ''}`}
                        onClick={() => handleSpeak(resData)}
                        title={isSpeaking ? "Stop speaking" : "Listen to answer"}
                    >
                        {isSpeaking ? '⏹️ Stop' : '🔊 Listen'}
                    </button>
                </div>

                {resData.type === "focused_answer" && (
                    <div className="answer-body">
                        {answer.heading && (
                            <div className="content-block">
                                <h5>{answer.heading}</h5>
                                {answer.items?.length > 0 && <ul>{answer.items.map((item, idx) => <li key={idx}>{item}</li>)}</ul>}
                                {answer.value && <p>{answer.value}</p>}
                            </div>
                        )}
                        {/* More complex rendering omitted for brevity but standard sections applied */}
                        {answer.treatments?.length > 0 && (
                            <div className="content-block">
                                <h5>{t("researchAssistant.treatment")}</h5>
                                {answer.treatments.map((tItem, idx) => (
                                    <div key={idx} className="sub-card">
                                        <h6>{tItem.type}</h6>
                                        <p>{tItem.recommendation}</p>
                                        {tItem.activeIngredient && <p><strong>{t("researchAssistant.activeIngredient")}:</strong> {tItem.activeIngredient}</p>}
                                        {tItem.safetyPrecautions?.length > 0 && (
                                            <div className="safety-alert">
                                                <strong>{t("researchAssistant.safetyPrecautions")}</strong>
                                                <ul>{tItem.safetyPrecautions.map((p, pIdx) => <li key={pIdx}>{p}</li>)}</ul>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {resData.type === "combined_answer" && (
                    <div className="answer-body">
                        {answer.symptoms?.length > 0 && (
                            <div className="content-block">
                                <h5>{t("researchAssistant.symptoms")}</h5>
                                <ul>{answer.symptoms.map((item, idx) => <li key={idx}>{item}</li>)}</ul>
                            </div>
                        )}
                        {answer.prevention?.length > 0 && (
                            <div className="content-block">
                                <h5>{t("researchAssistant.prevention")}</h5>
                                <ul>{answer.prevention.map((item, idx) => <li key={idx}>{item}</li>)}</ul>
                            </div>
                        )}
                        {answer.conditions?.length > 0 && (
                            <div className="content-block">
                                <h5>{t("researchAssistant.conditions")}</h5>
                                <ul>{answer.conditions.map((item, idx) => <li key={idx}>{item}</li>)}</ul>
                            </div>
                        )}
                    </div>
                )}

                {resData.type === "general" && (
                    <div className="answer-body">
                        <p>{answer.message}</p>
                        {answer.suggestion && <div className="suggestion-alert">💡 {answer.suggestion}</div>}
                    </div>
                )}

                {resData.type === "disease_information" && (
                    <div className="answer-body">
                        {answer.description && <p>{answer.description}</p>}
                        {answer.cause && (
                            <div className="content-block">
                                <h5>{t("researchAssistant.cause")}</h5>
                                <p>{answer.cause}</p>
                            </div>
                        )}
                        {answer.symptoms?.length > 0 && (
                            <div className="content-block">
                                <h5>{t("researchAssistant.symptoms")}</h5>
                                <ul>{answer.symptoms.map((sym, idx) => <li key={idx}>{sym}</li>)}</ul>
                            </div>
                        )}
                    </div>
                )}

                {resData.type === "crop_information" && (
                    <div className="answer-body">
                        {answer.description && <p>{answer.description}</p>}
                        <div className="info-grid-small">
                            {answer.season && <div><small>Season</small><strong>{answer.season}</strong></div>}
                            {answer.waterRequirement && <div><small>Water</small><strong>{answer.waterRequirement}</strong></div>}
                            {answer.growthDuration && <div><small>Duration</small><strong>{answer.growthDuration}</strong></div>}
                        </div>
                    </div>
                )}

                {/* Related Questions */}
                {getRelatedQuestions(resData).length > 0 && (
                    <div className="related-questions-box">
                        <h5>{t("researchAssistant.relatedQuestions")}</h5>
                        <div className="related-chips">
                            {getRelatedQuestions(resData).map((rq, idx) => (
                                <button key={idx} onClick={() => handleRelatedQuestion(rq)} className="related-chip">
                                    {rq} →
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="page-container chat-layout">
            <PageHeader 
                title={t("sidebar.researchAssistant")} 
                description={t("researchAssistant.pageDescription")} 
            />

            <div className="chat-container">
                <div className="chat-history">
                    {conversation.length === 0 ? (
                        <div className="empty-chat-state">
                            <span className="empty-icon">🌾</span>
                            <h3>{t("researchAssistant.welcomeTitle")}</h3>
                            <p>{t("researchAssistant.welcomeSubtitle")}</p>
                            <div className="sample-questions">
                                <button onClick={() => setQuestion(t("researchAssistant.sampleQ1"))}>{t("researchAssistant.sampleQ1")}</button>
                                <button onClick={() => setQuestion(t("researchAssistant.sampleQ2"))}>{t("researchAssistant.sampleQ2")}</button>
                                <button onClick={() => setQuestion(t("researchAssistant.sampleQ3"))}>{t("researchAssistant.sampleQ3")}</button>
                            </div>
                        </div>
                    ) : (
                        <div className="messages-list">
                            {conversation.map((msg, index) => (
                                <div key={index} className="message-pair">
                                    <div className="message user-message">
                                        <div className="message-bubble">{msg.question}</div>
                                    </div>
                                    
                                    {msg.error ? (
                                        <div className="message assistant-message">
                                            <div className="assistant-avatar">🤖</div>
                                            <div className="message-bubble error-bubble">
                                                {t("researchAssistant.errorProcessing")}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="message assistant-message">
                                            <div className="assistant-avatar">🤖</div>
                                            <div className="message-bubble">
                                                {renderAnswerContent(msg.result)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            
                            {loading && (
                                <div className="message assistant-message loading-message">
                                    <div className="assistant-avatar">🤖</div>
                                    <div className="message-bubble loading-bubble">
                                        <span className="dot"></span><span className="dot"></span><span className="dot"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                <div className="chat-input-area">
                    {error && <div className="chat-error">⚠️ {error}</div>}
                    <div className="input-wrapper">
                        <button 
                            className={`mic-button ${isListening ? 'listening' : ''}`}
                            onClick={handleVoiceInput}
                            title={isListening ? "Stop listening" : "Speak your question"}
                        >
                            {isListening ? '🔴' : '🎤'}
                        </button>
                        <textarea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={t("researchAssistant.inputPlaceholder")}
                            rows="2"
                            disabled={loading}
                        />
                        <button 
                            className="send-button" 
                            onClick={handleAsk} 
                            disabled={loading || !question.trim()}
                            title="Send Question"
                        >
                            <span>➤</span>
                        </button>
                    </div>
                    <div className="chat-disclaimer">
                        {t("researchAssistant.disclaimer")}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ResearchAssistant;
