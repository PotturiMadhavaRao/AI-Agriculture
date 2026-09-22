const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_INSTRUCTION = `
You are AgriAI Assistant, an AI agricultural advisor integrated into an agricultural management application.

Your main purpose is to help farmers and agricultural users with practical agriculture-related questions.

Focus on:

- Crop cultivation
- Plant diseases
- Pest management
- Soil
- Irrigation
- Fertilizers
- NPK and nutrients
- Crop recommendation
- Crop life cycle
- Yield improvement
- Disease prevention
- Sustainable farming
- Organic farming
- Agricultural research

Give answers in simple, farmer-friendly language.

If the user asks about a disease, explain:
1. Possible disease or cause
2. Symptoms
3. What the farmer can check
4. General management practices
5. Prevention
6. When to contact an agricultural expert

Do not claim that an image definitely has a disease unless the application's Disease Detection model has provided that prediction.

If the user asks about pesticides or chemicals, do not invent product names, dosages, or application rates. Encourage following approved product labels and local agricultural authority recommendations.

Do not fabricate real-time weather, market prices, government announcements, or agricultural statistics.

If the user asks in Telugu, respond in Telugu.
If the user asks in Hindi, respond in Hindi.
If the user asks in English, respond in English.

Keep the assistant primarily focused on agriculture.

Be practical, clear, concise and helpful.
`;

async function getChatResponse(message, history = [], context = {}) {
    try {
        const model = genAI.getGenerativeModel({
            model: process.env.GEMINI_MODEL || "gemini-3.6-flash",
            systemInstruction: SYSTEM_INSTRUCTION,
        });

        // ---------------------------------------------------------
        // Clean and validate conversation history
        // ---------------------------------------------------------

        let cleanHistory = [];

        if (Array.isArray(history)) {
            cleanHistory = history
                .filter((item) => {
                    return (
                        item &&
                        (item.role === "user" || item.role === "model") &&
                        Array.isArray(item.parts) &&
                        item.parts.length > 0 &&
                        item.parts.some(
                            (part) =>
                                part &&
                                typeof part.text === "string" &&
                                part.text.trim() !== ""
                        )
                    );
                })
                .map((item) => ({
                    role: item.role,
                    parts: item.parts
                        .filter(
                            (part) =>
                                part &&
                                typeof part.text === "string" &&
                                part.text.trim() !== ""
                        )
                        .map((part) => ({
                            text: part.text.trim(),
                        })),
                }));
        }

        // ---------------------------------------------------------
        // Gemini requires the first history item to be USER
        // ---------------------------------------------------------

        while (
            cleanHistory.length > 0 &&
            cleanHistory[0].role !== "user"
        ) {
            cleanHistory.shift();
        }

        // ---------------------------------------------------------
        // Make sure history alternates correctly
        // ---------------------------------------------------------

        const normalizedHistory = [];

        for (const item of cleanHistory) {
            const last = normalizedHistory[normalizedHistory.length - 1];

            // Skip duplicate consecutive roles
            if (last && last.role === item.role) {
                // Merge consecutive messages of the same role
                last.parts.push(...item.parts);
            } else {
                normalizedHistory.push({
                    role: item.role,
                    parts: item.parts,
                });
            }
        }

        // ---------------------------------------------------------
        // Add agricultural context if available
        // ---------------------------------------------------------

        let finalMessage = message;

        if (
            context &&
            typeof context === "object" &&
            Object.keys(context).length > 0
        ) {
            finalMessage = `
User question:
${message}

Agricultural application context:
${JSON.stringify(context, null, 2)}

Use the provided agricultural context when it is relevant.
Do not change or override the original ML prediction.
`;
        }

        // ---------------------------------------------------------
        // Create Gemini chat
        // ---------------------------------------------------------

        const chat = model.startChat({
            history: normalizedHistory,
        });

        const result = await chat.sendMessage(finalMessage);

        const response = result.response.text();

        return response;

    } catch (error) {
        console.error("Gemini API Error:", error);

        throw new Error(
            "Agricultural AI Assistant is temporarily unavailable."
        );
    }
}

module.exports = {
    getChatResponse,
};