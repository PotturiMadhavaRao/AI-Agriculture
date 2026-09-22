const geminiService = require("../services/geminiService");

const chat = async (req, res) => {
    try {
        const {
            message,
            history = [],
            context = {}
        } = req.body;

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
        console.error("Agriculture AI Controller Error:", error);

        return res.status(500).json({
            success: false,
            message:
                "Agricultural AI Assistant is temporarily unavailable. Please try again."
        });
    }
};

module.exports = {
    chat
};
