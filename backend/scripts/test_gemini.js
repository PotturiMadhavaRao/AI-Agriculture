const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const geminiService = require('../services/geminiService');

async function test() {
    try {
        console.log("Testing getChatResponse...");
        const response = await geminiService.getChatResponse("What is a good crop to grow in summer?", [], {});
        console.log("Success:", response);
    } catch (e) {
        console.error("Caught error:", e);
    }
}

test();
