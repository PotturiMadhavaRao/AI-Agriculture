import { createContext, useState, useContext } from 'react';

const AgriAIContext = createContext();

export const useAgriAI = () => useContext(AgriAIContext);

export const AgriAIProvider = ({ children }) => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const [contextData, setContextData] = useState(null);

    const openChatWithContext = (context) => {
        setContextData(context);
        setIsChatOpen(true);
    };

    const toggleChat = () => {
        setIsChatOpen((prev) => !prev);
    };
    
    const clearChat = () => {
        setChatHistory([]);
        setContextData(null);
    };

    return (
        <AgriAIContext.Provider value={{ 
            isChatOpen, 
            setIsChatOpen, 
            toggleChat, 
            chatHistory, 
            setChatHistory, 
            contextData, 
            setContextData,
            openChatWithContext,
            clearChat
        }}>
            {children}
        </AgriAIContext.Provider>
    );
};
