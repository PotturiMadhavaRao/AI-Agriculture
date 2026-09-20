const express = require("express");
const Disease = require("../models/Disease");
const Crop = require("../models/Crop");
const Treatment = require("../models/Treatment");

const router = express.Router();


// POST /api/research/ask
router.post("/ask", async (req, res) => {
    try {
        const { question } = req.body;

        if (!question || question.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Please enter a question",
            });
        }

        const query = question.toLowerCase();

        const normalizedQuery = query
            .replace(/[?.,!]/g, " ")
            .replace(/\s+/g, " ")
            .trim();

        const agriculturalAliases = {
            tomato: [
                "tomato",
                "tomatoes",
                "tamatar",
            ],

            rice: [
                "rice",
                "paddy",
                "paddy crop",
            ],

            maize: [
                "maize",
                "corn",
            ],

            potato: [
                "potato",
                "potatoes",
            ],

            chilli: [
                "chilli",
                "chili",
                "chilli pepper",
                "green chilli",
            ],

            wheat: [
                "wheat",
            ],

            lateBlight: [
                "late blight",
                "late-blight",
                "lateblight",
            ],

            earlyBlight: [
                "early blight",
                "early-blight",
                "earlyblight",
            ],
        };

        function containsAlias(text, aliases) {
            return aliases.some((alias) =>
                text.includes(alias)
            );
        }

        // -----------------------------------------
        // Detect what the farmer is asking about
        // -----------------------------------------

        let intents = [];

        if (
            query.includes("symptom") ||
            query.includes("sign") ||
            query.includes("identify")
        ) {
            intents.push("symptoms");
        }

        if (
            query.includes("prevent") ||
            query.includes("prevention") ||
            query.includes("avoid")
        ) {
            intents.push("prevention");
        }

        if (
            query.includes("treatment") ||
            query.includes("treat") ||
            query.includes("manage") ||
            query.includes("control") ||
            query.includes("cure")
        ) {
            intents.push("treatment");
        }

        if (
            query.includes("condition") ||
            query.includes("weather") ||
            query.includes("humidity") ||
            query.includes("rainfall")
        ) {
            intents.push("conditions");
        }

        if (
            query.includes("soil") ||
            query.includes("land")
        ) {
            intents.push("soil");
        }

        if (
            query.includes("water") ||
            query.includes("irrigation")
        ) {
            intents.push("water");
        }

        if (
            query.includes("season") ||
            query.includes("when to plant") ||
            query.includes("planting time")
        ) {
            intents.push("season");
        }

        if (
            query.includes("how long") ||
            query.includes("duration") ||
            query.includes("days") ||
            query.includes("growing period") ||
            query.includes("growth period")
        ) {
            intents.push("duration");
        }

        if (
            query.includes("life cycle") ||
            query.includes("lifecycle") ||
            query.includes("growth stages") ||
            query.includes("stages")
        ) {
            intents.push("lifecycle");
        }

        // Find diseases
        const diseases = await Disease.find()
            .populate("crop", "name scientificName");

        // -----------------------------------------
        // Find matching disease
        // Priority:
        // 1. Exact disease name
        // 2. Disease keywords
        // 3. Crop name
        // -----------------------------------------

        let matchedDisease = null;

        // STEP 1: First search for the disease name
        for (const disease of diseases) {
            const diseaseName = disease.name.toLowerCase();

            if (normalizedQuery.includes(diseaseName)) {
                matchedDisease = disease;
                break;
            }

            if (
                diseaseName === "late blight" &&
                containsAlias(
                    normalizedQuery,
                    agriculturalAliases.lateBlight
                )
            ) {
                matchedDisease = disease;
                break;
            }

            if (
                diseaseName === "early blight" &&
                containsAlias(
                    normalizedQuery,
                    agriculturalAliases.earlyBlight
                )
            ) {
                matchedDisease = disease;
                break;
            }
        }

        // STEP 2: If no disease name is found,
        // search for common disease keywords
        if (!matchedDisease) {

            const diseaseKeywords = [
                {
                    keywords: ["late blight", "late-blight"],
                    diseaseName: "Late Blight",
                },
                {
                    keywords: ["early blight", "early-blight"],
                    diseaseName: "Early Blight",
                },
            ];

            for (const item of diseaseKeywords) {

                const keywordFound = item.keywords.some(
                    (keyword) => query.includes(keyword)
                );

                if (keywordFound) {

                    matchedDisease = diseases.find(
                        (disease) =>
                            disease.name.toLowerCase() ===
                            item.diseaseName.toLowerCase()
                    );

                    if (matchedDisease) {
                        break;
                    }
                }
            }
        }

        // If disease found
        if (matchedDisease) {

            const treatments = await Treatment.find({
                disease: matchedDisease._id,
            });

            if (intents.length > 1) {
                return res.json({
                    success: true,
                    type: "combined_answer",
                    question,
                    answer: {
                        title: matchedDisease.name,
                        crop: matchedDisease.crop?.name,

                        symptoms: intents.includes("symptoms")
                            ? matchedDisease.symptoms || []
                            : [],

                        prevention: intents.includes("prevention")
                            ? matchedDisease.prevention || []
                            : [],

                        conditions: intents.includes("conditions")
                            ? matchedDisease.favorableConditions || []
                            : [],

                        treatments: intents.includes("treatment")
                            ? treatments.map((treatment) => ({
                                  type: treatment.treatmentType,
                                  recommendation: treatment.recommendation,
                                  activeIngredient:
                                      treatment.activeIngredient,
                                  safetyPrecautions:
                                      treatment.safetyPrecautions,
                              }))
                            : [],
                    },
                });
            }

            if (intents.length === 1 && intents[0] === "treatment") {
                return res.json({
                    success: true,
                    type: "focused_answer",
                    intent: "treatment",
                    question,
                    answer: {
                        title: matchedDisease.name,
                        crop: matchedDisease.crop?.name,
                        heading: "Treatment & Management",
                        treatments: treatments.map((treatment) => ({
                            type: treatment.treatmentType,
                            recommendation: treatment.recommendation,
                            activeIngredient: treatment.activeIngredient,
                            safetyPrecautions: treatment.safetyPrecautions,
                        })),
                    },
                });
            }

            // -----------------------------------------
            // Disease-specific focused answers
            // -----------------------------------------

            if (intents.length === 1 && intents[0] === "symptoms") {
                return res.json({
                    success: true,
                    type: "focused_answer",
                    intent: "symptoms",
                    question,

                    answer: {
                        title: matchedDisease.name,
                        crop: matchedDisease.crop?.name,

                        heading: "Disease Symptoms",

                        items: matchedDisease.symptoms || [],
                    },
                });
            }


            if (intents.length === 1 && intents[0] === "prevention") {
                return res.json({
                    success: true,
                    type: "focused_answer",
                    intent: "prevention",
                    question,

                    answer: {
                        title: matchedDisease.name,
                        crop: matchedDisease.crop?.name,

                        heading: "Prevention",

                        items: matchedDisease.prevention || [],
                    },
                });
            }


            if (intents.length === 1 && intents[0] === "conditions") {
                return res.json({
                    success: true,
                    type: "focused_answer",
                    intent: "conditions",
                    question,

                    answer: {
                        title: matchedDisease.name,
                        crop: matchedDisease.crop?.name,

                        heading: "Favorable Conditions",

                        items:
                            matchedDisease.favorableConditions || [],
                    },
                });
            }

            return res.json({
                success: true,
                type: "disease_information",

                question,

                answer: {
                    title: matchedDisease.name,

                    crop: matchedDisease.crop?.name,

                    description: matchedDisease.description,

                    cause: matchedDisease.cause,

                    symptoms: matchedDisease.symptoms,

                    favorableConditions:
                        matchedDisease.favorableConditions,

                    prevention:
                        matchedDisease.prevention,

                    treatments: treatments.map((treatment) => ({
                        type: treatment.treatmentType,
                        recommendation:
                            treatment.recommendation,
                        activeIngredient:
                            treatment.activeIngredient,
                        safetyPrecautions:
                            treatment.safetyPrecautions,
                    })),
                },
            });
        }

        // -----------------------------------------
        // STEP 3: Search for crop information
        // -----------------------------------------

        const crops = await Crop.find().sort({ name: 1 });

        let matchedCrop = null;

        for (const crop of crops) {
            const cropName = crop.name.toLowerCase();

            if (normalizedQuery.includes(cropName)) {
                matchedCrop = crop;
                break;
            }

            if (
                cropName === "rice" &&
                containsAlias(normalizedQuery, agriculturalAliases.rice)
            ) {
                matchedCrop = crop;
                break;
            }

            if (
                cropName === "maize" &&
                containsAlias(normalizedQuery, agriculturalAliases.maize)
            ) {
                matchedCrop = crop;
                break;
            }

            if (
                cropName === "tomato" &&
                containsAlias(normalizedQuery, agriculturalAliases.tomato)
            ) {
                matchedCrop = crop;
                break;
            }

            if (
                cropName === "potato" &&
                containsAlias(normalizedQuery, agriculturalAliases.potato)
            ) {
                matchedCrop = crop;
                break;
            }

            if (
                cropName === "chilli" &&
                containsAlias(normalizedQuery, agriculturalAliases.chilli)
            ) {
                matchedCrop = crop;
                break;
            }

            if (
                cropName === "wheat" &&
                containsAlias(normalizedQuery, agriculturalAliases.wheat)
            ) {
                matchedCrop = crop;
                break;
            }
        }


        // -----------------------------------------
        // STEP 4: Return crop information
        // -----------------------------------------

        if (matchedCrop) {

            // -----------------------------------------
            // Crop-specific focused answers
            // -----------------------------------------

            if (intents.length === 1 && intents[0] === "soil") {
                return res.json({
                    success: true,
                    type: "focused_answer",
                    intent: "soil",
                    question,

                    answer: {
                        title: matchedCrop.name,

                        heading: "Suitable Soil",

                        items: matchedCrop.soilTypes || [],
                    },
                });
            }


            if (intents.length === 1 && intents[0] === "water") {
                return res.json({
                    success: true,
                    type: "focused_answer",
                    intent: "water",
                    question,

                    answer: {
                        title: matchedCrop.name,

                        heading: "Water Requirement",

                        value:
                            matchedCrop.waterRequirement ||
                            "Information not available",
                    },
                });
            }


            if (intents.length === 1 && intents[0] === "season") {
                return res.json({
                    success: true,
                    type: "focused_answer",
                    intent: "season",
                    question,

                    answer: {
                        title: matchedCrop.name,

                        heading: "Growing Season",

                        value:
                            matchedCrop.season ||
                            "Information not available",
                    },
                });
            }


            if (intents.length === 1 && intents[0] === "duration") {
                return res.json({
                    success: true,
                    type: "focused_answer",
                    intent: "duration",
                    question,

                    answer: {
                        title: matchedCrop.name,

                        heading: "Growth Duration",

                        value:
                            matchedCrop.growthDuration ||
                            "Information not available",
                    },
                });
            }


            if (intents.length === 1 && intents[0] === "lifecycle") {
                return res.json({
                    success: true,
                    type: "focused_answer",
                    intent: "lifecycle",
                    question,

                    answer: {
                        title: matchedCrop.name,

                        heading: "Crop Life Cycle",

                        lifeCycle:
                            matchedCrop.lifeCycle || [],
                    },
                });
            }

            return res.json({
                success: true,
                type: "crop_information",

                question,

                answer: {
                    title: matchedCrop.name,

                    scientificName:
                        matchedCrop.scientificName,

                    description:
                        matchedCrop.description,

                    season:
                        matchedCrop.season,

                    soilTypes:
                        matchedCrop.soilTypes,

                    waterRequirement:
                        matchedCrop.waterRequirement,

                    growthDuration:
                        matchedCrop.growthDuration,

                    lifeCycle:
                        matchedCrop.lifeCycle,
                },
            });
        }


        // -----------------------------------------
        // STEP 5: No matching information
        // -----------------------------------------

        return res.json({
            success: true,
            type: "general",

            question,

            answer: {
                title: "Agricultural Research Assistant",

                message:
                    "I could not find specific information for your question in the current agricultural knowledge database.",

                suggestion:
                    "Try asking about a crop or disease available in the system, such as Tomato, Rice, Maize, Potato, Chilli, Late Blight, or Early Blight.",
            },
        });

    } catch (error) {

        console.error(
            "Research assistant error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to process research question",
            error: error.message,
        });
    }
});


module.exports = router;