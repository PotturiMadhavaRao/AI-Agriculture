const geminiService = require("../services/geminiService");
const Disease = require("../models/Disease");
const Crop = require("../models/Crop");

const chat = async (req, res) => {
    const {
        message,
        history = [],
        context = {}
    } = req.body;

    try {
        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Please enter an agricultural question."
            });
        }

        const reply = await geminiService.getChatResponse(
            message,
            history,
            context
        );

        return res.status(200).json({
            success: true,
            reply
        });

    } catch (error) {
        // Safe logging of the exact backend error category
        console.error(`[Agriculture AI Controller] Error Category: ${error.category || 'unknown'}`);
        console.error(error);

        const category = error.category || "server_error";
        
        // MongoDB Fallback Mechanism
        // Try to answer using the database if external AI fails
        try {
            const queryWords = message.toLowerCase().split(/\s+/).filter(w => w.length > 3);
            if (queryWords.length > 0) {
                // Search for any disease matching the keywords
                const regexQuery = { $regex: queryWords.join('|'), $options: 'i' };
                const disease = await Disease.findOne({
                    $or: [
                        { name: regexQuery },
                        { cause: regexQuery },
                        { symptoms: regexQuery }
                    ]
                }).populate('crop');

                if (disease) {
                    const fallbackReply = `**${disease.name}**\n\n` +
                        (disease.cause ? `**Cause:** ${disease.cause}\n` : "") +
                        (disease.symptoms && disease.symptoms.length > 0 ? `**Symptoms:** ${disease.symptoms.join(', ')}\n` : "") +
                        (disease.prevention && disease.prevention.length > 0 ? `**Prevention:** ${disease.prevention.join(', ')}\n` : "") +
                        (disease.description ? `\n${disease.description}` : "");
                    
                    console.log("[Agriculture AI Controller] Served from MongoDB Fallback");
                    return res.status(200).json({
                        success: true,
                        reply: fallbackReply,
                        isFallback: true
                    });
                }
            }
        } catch (dbError) {
            console.error("[Agriculture AI Controller] Fallback DB Query failed:", dbError);
        }

        // If fallback fails or doesn't find a match, return the error category
        // Ensure message string doesn't leak raw API quota logs to frontend
        let friendlyMessage = "AI Assistant is temporarily unavailable. Please try again later.";
        if (error.message && !error.message.includes("quota") && !error.message.includes("429") && !error.message.includes("API_KEY") && !error.message.includes("fetch")) {
            friendlyMessage = error.message;
        }

        return res.status(500).json({
            success: false,
            errorCategory: category,
            message: friendlyMessage
        });
    }
};

module.exports = {
    chat
};
