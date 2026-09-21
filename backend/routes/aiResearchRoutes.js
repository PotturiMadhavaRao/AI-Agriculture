const express = require("express");
const OpenAI = require("openai");

const router = express.Router();

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "dummy-key-to-prevent-startup-crash",
});

router.post("/ask", async (req, res) => {
    try {
        const { question } = req.body;

        if (!question || question.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Please enter a question",
            });
        }

        const response = await client.responses.create({
            model: "gpt-5-mini",
            input: [
                {
                    role: "system",
                    content:
                        "You are an agricultural research assistant. " +
                        "Provide clear, practical and farmer-friendly agricultural information. " +
                        "Do not invent specific pesticide recommendations. " +
                        "For crop protection products, advise users to follow locally approved guidance and product labels.",
                },
                {
                    role: "user",
                    content: question.trim(),
                },
            ],
        });

        res.json({
            success: true,
            question,
            answer: response.output_text,
        });
    } catch (error) {
        console.error("AI research assistant error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get AI response",
            error: error.message,
        });
    }
});

module.exports = router;
