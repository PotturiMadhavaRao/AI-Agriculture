const express = require('express');
const router = express.Router();

// A simple translation map for demonstration if API keys are not available.
// In a real application, you would connect to Google Cloud Translation API or similar here.
const mockTranslations = {
    te: {
        "AI Confidence": "AI విశ్వాసం",
        "High Risk Detected": "అధిక ప్రమాదం కనుగొనబడింది",
        "Moderate Risk": "మితమైన ప్రమాదం",
        "Low Risk": "తక్కువ ప్రమాదం"
    }
};

router.post('/', async (req, res) => {
    try {
        const { text, targetLanguage } = req.body;
        
        if (!text || !targetLanguage) {
            return res.status(400).json({ message: "Text and targetLanguage are required" });
        }
        
        if (targetLanguage === 'en') {
            return res.json({ translatedText: text });
        }

        // Mock translation logic: Prefix the text with the language code to demonstrate it works
        // Example: If text="Hello", translatedText="[te] Hello"
        // And check if we have a direct mock match
        let translatedText = text;
        
        if (mockTranslations[targetLanguage] && mockTranslations[targetLanguage][text]) {
            translatedText = mockTranslations[targetLanguage][text];
        } else {
            // Very simple simulated translation for complex strings (just appending language code to show it changed dynamically)
            // Ideally, this calls `translate.translate(text, targetLanguage)` via Google Cloud
            if (typeof text === 'string') {
                translatedText = `[${targetLanguage.toUpperCase()}] ${text}`;
            }
        }

        res.json({ translatedText });
    } catch (error) {
        console.error("Translation error:", error);
        // Fallback to returning the original text on error
        res.json({ translatedText: req.body.text || "" });
    }
});

module.exports = router;
