/**
 * ocrService.js
 * 
 * Simulated OCR abstraction service for extracting Soil Health Card data.
 * In a real production environment, this would call AWS Textract, Google Cloud Vision,
 * or a local Tesseract instance to parse the uploaded document image.
 */

const extractSoilData = async (imageBuffer) => {
    console.log("Mocking OCR extraction for uploaded Soil Health Card...");
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Return a plausible simulated response. 
    // In reality, this would be parsed from the OCR text.
    return {
        success: true,
        data: {
            N: 85,
            P: 45,
            K: 40,
            ph: 6.8,
            organicCarbon: 0.5, // Extras that might be returned
            ec: 0.25
        },
        confidence: 0.89, // Overall OCR confidence
        message: "Soil data extracted successfully from document."
    };
};

module.exports = {
    extractSoilData
};
