const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

const enTranslationPath = path.join(__dirname, '../../frontend/src/locales/en/translation.json');
const localesPath = path.join(__dirname, '../../frontend/src/locales');

const targetLanguages = {
    'te': 'Telugu',
    'hi': 'Hindi',
    'ta': 'Tamil',
    'kn': 'Kannada',
    'ml': 'Malayalam',
    'bn': 'Bengali'
};

function getMissingKeys(enObj, targetObj) {
    const missing = {};
    for (const key in enObj) {
        if (typeof enObj[key] === 'object' && enObj[key] !== null) {
            if (!targetObj[key] || typeof targetObj[key] !== 'object') {
                missing[key] = enObj[key]; // Entire object is missing
            } else {
                const nestedMissing = getMissingKeys(enObj[key], targetObj[key]);
                if (Object.keys(nestedMissing).length > 0) {
                    missing[key] = nestedMissing;
                }
            }
        } else {
            // Check if string is same as english (meaning it failed to translate) or missing entirely
            if (!targetObj[key] || targetObj[key] === enObj[key]) {
                missing[key] = enObj[key];
            }
        }
    }
    return missing;
}

function mergeTranslations(targetObj, translatedObj) {
    for (const key in translatedObj) {
        if (typeof translatedObj[key] === 'object' && translatedObj[key] !== null) {
            if (!targetObj[key]) targetObj[key] = {};
            mergeTranslations(targetObj[key], translatedObj[key]);
        } else {
            targetObj[key] = translatedObj[key];
        }
    }
}

async function translateJSON(jsonObj, languageName) {
    if (Object.keys(jsonObj).length === 0) return {};
    
    const prompt = `You are a professional agricultural translator. 
Translate the values in this JSON object into ${languageName}.
IMPORTANT RULES:
1. Return ONLY valid JSON.
2. Keep the JSON keys exactly the same.
3. Translate ONLY the string values.
4. Keep all placeholder variables, HTML elements (if any), and emojis unchanged.
5. Use proper agricultural terminology in ${languageName} that farmers would understand.
6. Do NOT wrap the response in markdown code blocks like \`\`\`json. Just return the raw JSON string.

JSON to translate:
${JSON.stringify(jsonObj, null, 2)}
`;

    try {
        const result = await model.generateContent(prompt);
        let text = result.response.text().trim();
        if (text.startsWith('```json')) text = text.replace(/```json/g, '');
        if (text.startsWith('```')) text = text.replace(/```/g, '');
        return JSON.parse(text);
    } catch (error) {
        console.error(`Failed to translate for ${languageName}:`, error);
        return jsonObj; // Fallback to English
    }
}

async function run() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.log("Please specify a language code (te, hi, ta, kn, ml, bn) or 'all'");
        process.exit(1);
    }

    const enData = JSON.parse(fs.readFileSync(enTranslationPath, 'utf8'));
    
    let langsToProcess = [];
    if (args[0] === 'all') {
        langsToProcess = Object.keys(targetLanguages);
    } else if (targetLanguages[args[0]]) {
        langsToProcess = [args[0]];
    } else {
        console.error("Invalid language code.");
        process.exit(1);
    }

    for (const code of langsToProcess) {
        console.log(`Checking ${targetLanguages[code]} (${code})...`);
        const targetDir = path.join(localesPath, code);
        const targetFilePath = path.join(targetDir, 'translation.json');
        
        let targetData = {};
        if (fs.existsSync(targetFilePath)) {
            try {
                targetData = JSON.parse(fs.readFileSync(targetFilePath, 'utf8'));
            } catch(e) {}
        }
        
        const missing = getMissingKeys(enData, targetData);
        
        if (Object.keys(missing).length > 0) {
            console.log(`Translating ${Object.keys(missing).length} missing root keys for ${code}...`);
            const translatedMissing = await translateJSON(missing, targetLanguages[code]);
            mergeTranslations(targetData, translatedMissing);
            
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }
            
            fs.writeFileSync(
                targetFilePath,
                JSON.stringify(targetData, null, 4),
                'utf8'
            );
            console.log(`✅ Updated ${code}/translation.json`);
            
            // Wait briefly to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 5000));
        } else {
            console.log(`✅ ${code}/translation.json is up to date.`);
        }
    }
}

run();
