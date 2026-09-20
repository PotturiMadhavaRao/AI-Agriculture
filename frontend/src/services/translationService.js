import i18n from '../i18n';

const API_URL = "http://localhost:5000/api/translate";

// Simple in-memory cache to avoid repeated translations
const translationCache = {};

/**
 * Translates a given text to the currently selected language in i18next.
 * @param {string} text - The text to translate.
 * @returns {Promise<string>} The translated text.
 */
export const translateDynamicContent = async (text) => {
    if (!text || typeof text !== 'string') return text;
    
    const targetLanguage = i18n.language || 'en';
    
    // No translation needed for English (base language)
    if (targetLanguage === 'en') return text;

    const cacheKey = `${targetLanguage}:${text}`;
    if (translationCache[cacheKey]) {
        return translationCache[cacheKey];
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text, targetLanguage })
        });

        if (!response.ok) {
            throw new Error(`Translation API error: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Cache the result
        if (data.translatedText) {
            translationCache[cacheKey] = data.translatedText;
            return data.translatedText;
        }
        
        return text;
    } catch (error) {
        console.error("Failed to translate dynamic content:", error);
        return text; // Fallback to original text
    }
};

/**
 * Translates an array of strings.
 */
export const translateArray = async (arr) => {
    if (!arr || !Array.isArray(arr)) return arr;
    const targetLanguage = i18n.language || 'en';
    if (targetLanguage === 'en') return arr;

    const translatedArr = await Promise.all(arr.map(item => translateDynamicContent(item)));
    return translatedArr;
};
