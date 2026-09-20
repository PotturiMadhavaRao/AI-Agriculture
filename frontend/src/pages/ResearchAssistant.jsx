import React, { useState, useRef, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import "./ResearchAssistant.css";

const API_URL = "http://localhost:5000/api/research/ask";

function ResearchAssistant() {
    const [question, setQuestion] = useState("");
    const [result, setResult] = useState(null);
    const [conversation, setConversation] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [conversation, loading]);

    const handleAsk = async () => {
        if (!question.trim()) {
            setError("Please enter an agricultural question.");
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

            setResult(data);
            setConversation((prev) => [...prev, { question: currentQuestion, result: data }]);
        } catch (error) {
            console.error("Research assistant error:", error);
            setError("Unable to get an answer. Please make sure the backend is running.");
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

            setResult(data);
            setConversation((prev) => [...prev, { question: relatedQuestion, result: data }]);
            setQuestion("");
        } catch (error) {
            console.error("Related question error:", error);
            setError("Unable to get an answer. Please make sure the backend is running.");
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
                    <h4>{answer.title}</h4>
                    {answer.crop && <span className="crop-tag">🌱 {answer.crop}</span>}
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
                                <h5>💊 Treatment & Management</h5>
                                {answer.treatments.map((t, idx) => (
                                    <div key={idx} className="sub-card">
                                        <h6>{t.type}</h6>
                                        <p>{t.recommendation}</p>
                                        {t.activeIngredient && <p><strong>Active Ingredient:</strong> {t.activeIngredient}</p>}
                                        {t.safetyPrecautions?.length > 0 && (
                                            <div className="safety-alert">
                                                <strong>⚠️ Safety Precautions</strong>
                                                <ul>{t.safetyPrecautions.map((p, pIdx) => <li key={pIdx}>{p}</li>)}</ul>
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
                                <h5>🔎 Symptoms</h5>
                                <ul>{answer.symptoms.map((item, idx) => <li key={idx}>{item}</li>)}</ul>
                            </div>
                        )}
                        {answer.prevention?.length > 0 && (
                            <div className="content-block">
                                <h5>🛡️ Prevention</h5>
                                <ul>{answer.prevention.map((item, idx) => <li key={idx}>{item}</li>)}</ul>
                            </div>
                        )}
                        {answer.conditions?.length > 0 && (
                            <div className="content-block">
                                <h5>🌦️ Favorable Conditions</h5>
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
                                <h5>🦠 Cause</h5>
                                <p>{answer.cause}</p>
                            </div>
                        )}
                        {answer.symptoms?.length > 0 && (
                            <div className="content-block">
                                <h5>🔎 Symptoms</h5>
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
                        <h5>💡 You might also want to know:</h5>
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
                title="AI Research Assistant" 
                description="Ask questions about crop diseases, symptoms, prevention, and general farm management." 
            />

            <div className="chat-container">
                <div className="chat-history">
                    {conversation.length === 0 ? (
                        <div className="empty-chat-state">
                            <span className="empty-icon">🌾</span>
                            <h3>How can I help you with your farm today?</h3>
                            <p>Try asking questions like:</p>
                            <div className="sample-questions">
                                <button onClick={() => setQuestion("How can I prevent late blight in tomato?")}>How can I prevent late blight in tomato?</button>
                                <button onClick={() => setQuestion("What are the symptoms of apple scab?")}>What are the symptoms of apple scab?</button>
                                <button onClick={() => setQuestion("How much water does wheat need?")}>How much water does wheat need?</button>
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
                                                ❌ Sorry, I couldn't process that question. Please try again.
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
                        <textarea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask a question about agriculture..."
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
                        ⚠️ This assistant provides agricultural decision-support information. Always follow locally approved agricultural guidance.
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ResearchAssistant;
