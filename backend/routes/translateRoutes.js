const express = require('express');
const router = express.Router();
const { translateText } = require('../services/geminiService');

router.post('/', async (req, res) => {
    try {
        const { text, targetLanguage } = req.body;
        
        if (!text || !targetLanguage) {
            return res.status(400).json({ message: "Text and targetLanguage are required" });
        }
        
        if (targetLanguage === 'en') {
            return res.json({ translatedText: text });
        }

        // Use Gemini API for real agricultural translation
        const translatedText = await translateText(text, targetLanguage);

        res.json({ translatedText });
    } catch (error) {
        console.error("Translation error:", error);
        // Fallback to returning the original text on error
        res.json({ translatedText: req.body.text || "" });
    }
});

module.exports = router;
