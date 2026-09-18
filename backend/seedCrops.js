const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Crop = require("./models/Crop");

dotenv.config();

const crops = [
    {
        name: "Rice",
        scientificName: "Oryza sativa",
        season: "Kharif",
        soilTypes: ["Clay", "Loamy"],
        waterRequirement: "High",
        growthDuration: "120-150 days",
        description: "Rice is a major cereal crop that requires warm temperatures and adequate water.",

        lifeCycle: [
            {
                stage: "Seed",
                duration: "0-5 days",
                description: "Healthy rice seeds are selected and sown."
            },
            {
                stage: "Germination",
                duration: "5-10 days",
                description: "Seeds absorb water and begin developing roots and shoots."
            },
            {
                stage: "Vegetative Growth",
                duration: "10-45 days",
                description: "Rice plants develop leaves, stems and roots."
            },
            {
                stage: "Tillering",
                duration: "45-70 days",
                description: "The plant produces additional shoots called tillers."
            },
            {
                stage: "Flowering and Grain Formation",
                duration: "70-110 days",
                description: "The rice plant flowers and grains begin to develop."
            },
            {
                stage: "Harvest",
                duration: "110-140 days",
                description: "Mature rice grains are harvested."
            }
        ]
    },
    {
        name: "Maize",
        scientificName: "Zea mays",
        season: "Kharif and Rabi",
        soilTypes: ["Loamy", "Sandy Loam"],
        waterRequirement: "Moderate",
        growthDuration: "90-120 days",
        description: "Maize is an important cereal crop used for food, animal feed and industrial products.",

        lifeCycle: [
            {
                stage: "Seed",
                duration: "0-3 days",
                description: "Healthy maize seeds are selected and planted."
            },
            {
                stage: "Germination",
                duration: "3-10 days",
                description: "Seeds absorb water and produce roots and shoots."
            },
            {
                stage: "Vegetative Growth",
                duration: "10-45 days",
                description: "The maize plant develops leaves, stem and roots."
            },
            {
                stage: "Tasseling and Flowering",
                duration: "45-65 days",
                description: "The plant produces tassels and develops reproductive structures."
            },
            {
                stage: "Grain Development",
                duration: "65-90 days",
                description: "Maize kernels develop and gradually mature."
            },
            {
                stage: "Harvest",
                duration: "90-120 days",
                description: "Mature maize cobs are harvested."
            }
        ]
    },
    {
        name: "Tomato",
        scientificName: "Solanum lycopersicum",
        season: "Kharif and Rabi",
        soilTypes: ["Loamy", "Sandy Loam"],
        waterRequirement: "Moderate",
        growthDuration: "90-120 days",
        description: "Tomato is an important vegetable crop grown in many regions.",

        lifeCycle: [
            {
                stage: "Seed",
                duration: "0-5 days",
                description: "Healthy tomato seeds are selected and planted in suitable soil.",
                farmerActions: [
                    "Select healthy seeds",
                    "Prepare well-drained soil",
                    "Maintain suitable soil moisture"
                ],
                monitoring: [
                    "Soil moisture",
                    "Seed condition",
                    "Planting depth"
                ]
            },
            {
                stage: "Germination",
                duration: "5-10 days",
                description: "The seed absorbs water and develops roots and a young shoot.",
                farmerActions: [
                    "Maintain adequate soil moisture",
                    "Avoid excessive watering",
                    "Protect young seedlings from pests"
                ],
                monitoring: [
                    "Seedling emergence",
                    "Soil moisture",
                    "Early pest symptoms"
                ]
            },
            {
                stage: "Vegetative Growth",
                duration: "10-40 days",
                description: "The plant develops leaves, stems and a strong root system.",
                farmerActions: [
                    "Provide appropriate irrigation",
                    "Maintain soil nutrients",
                    "Remove weeds around plants"
                ],
                monitoring: [
                    "Leaf health",
                    "Plant growth",
                    "Pest and disease symptoms"
                ]
            },
            {
                stage: "Flowering",
                duration: "40-60 days",
                description: "The plant produces flowers that can develop into fruits.",
                farmerActions: [
                    "Maintain adequate water",
                    "Support healthy plant growth",
                    "Monitor for flowering-stage pests"
                ],
                monitoring: [
                    "Flower development",
                    "Pest activity",
                    "Leaf and stem health"
                ]
            },
            {
                stage: "Fruit Development",
                duration: "60-90 days",
                description: "Tomato fruits grow and gradually mature.",
                farmerActions: [
                    "Maintain consistent irrigation",
                    "Provide appropriate nutrition",
                    "Remove severely diseased plant parts"
                ],
                monitoring: [
                    "Fruit development",
                    "Fruit damage",
                    "Disease symptoms"
                ]
            },
            {
                stage: "Harvest",
                duration: "90-120 days",
                description: "Mature tomatoes are harvested.",
                farmerActions: [
                    "Harvest fruits at the appropriate maturity stage",
                    "Handle fruits carefully",
                    "Remove damaged fruits"
                ],
                monitoring: [
                    "Fruit maturity",
                    "Fruit quality",
                    "Post-harvest damage"
                ]
            }
        ]
    },
    {
        name: "Potato",
        scientificName: "Solanum tuberosum",
        season: "Rabi",
        soilTypes: ["Loamy", "Sandy Loam"],
        waterRequirement: "Moderate",
        growthDuration: "90-120 days",
        description: "Potato is an important tuber crop grown for food and processing.",
        lifeCycle: [
            {
                stage: "Seed Tuber Selection",
                duration: "0-10 days",
                description: "Healthy and disease-free seed tubers are selected for planting.",
                farmerActions: [
                    "Select healthy seed tubers",
                    "Avoid damaged or diseased tubers",
                    "Prepare well-drained soil"
                ],
                monitoring: [
                    "Seed tuber condition",
                    "Soil moisture",
                    "Soil preparation"
                ]
            },
            {
                stage: "Sprouting",
                duration: "10-20 days",
                description: "Seed tubers develop sprouts that emerge from the soil.",
                farmerActions: [
                    "Maintain suitable soil moisture",
                    "Protect young sprouts from pests",
                    "Avoid excessive irrigation"
                ],
                monitoring: [
                    "Sprout emergence",
                    "Soil moisture",
                    "Early pest symptoms"
                ]
            },
            {
                stage: "Vegetative Growth",
                duration: "20-50 days",
                description: "Potato plants develop leaves, stems and roots.",
                farmerActions: [
                    "Provide appropriate irrigation",
                    "Control weeds",
                    "Maintain soil nutrients",
                    "Earth up soil around plants"
                ],
                monitoring: [
                    "Leaf health",
                    "Plant growth",
                    "Pest activity",
                    "Disease symptoms"
                ]
            },
            {
                stage: "Tuber Formation",
                duration: "50-80 days",
                description: "Underground potato tubers begin to form and increase in size.",
                farmerActions: [
                    "Maintain consistent soil moisture",
                    "Provide appropriate nutrition",
                    "Protect plants from diseases"
                ],
                monitoring: [
                    "Tuber development",
                    "Leaf health",
                    "Disease symptoms"
                ]
            },
            {
                stage: "Maturity",
                duration: "80-100 days",
                description: "Tubers reach their mature size and the plant begins to senesce.",
                farmerActions: [
                    "Reduce irrigation near maturity",
                    "Monitor plant maturity",
                    "Prepare for harvesting"
                ],
                monitoring: [
                    "Plant maturity",
                    "Tuber size",
                    "Disease symptoms"
                ]
            },
            {
                stage: "Harvest",
                duration: "90-120 days",
                description: "Mature potato tubers are harvested from the soil.",
                farmerActions: [
                    "Harvest at appropriate maturity",
                    "Avoid damaging tubers",
                    "Store harvested potatoes properly"
                ],
                monitoring: [
                    "Tuber quality",
                    "Physical damage",
                    "Storage condition"
                ]
            }
        ]
    },
    {
        name: "Chilli",
        scientificName: "Capsicum annuum",
        season: "Kharif and Rabi",
        soilTypes: ["Loamy", "Sandy Loam"],
        waterRequirement: "Moderate",
        growthDuration: "120-180 days",
        description: "Chilli is an important spice and vegetable crop cultivated for its fruits.",
        lifeCycle: [
            {
                stage: "Seed",
                duration: "0-7 days",
                description: "Healthy chilli seeds are selected and planted in suitable soil or nursery beds.",
                farmerActions: [
                    "Select healthy seeds",
                    "Prepare suitable nursery soil",
                    "Maintain adequate moisture"
                ],
                monitoring: [
                    "Seed condition",
                    "Soil moisture",
                    "Planting depth"
                ]
            },
            {
                stage: "Germination",
                duration: "7-15 days",
                description: "Seeds germinate and young chilli seedlings emerge.",
                farmerActions: [
                    "Maintain soil moisture",
                    "Protect seedlings from pests",
                    "Avoid excessive watering"
                ],
                monitoring: [
                    "Seedling emergence",
                    "Soil moisture",
                    "Early pest symptoms"
                ]
            },
            {
                stage: "Vegetative Growth",
                duration: "15-50 days",
                description: "Chilli plants develop leaves, branches and a strong root system.",
                farmerActions: [
                    "Provide appropriate irrigation",
                    "Control weeds",
                    "Maintain soil nutrition"
                ],
                monitoring: [
                    "Leaf health",
                    "Plant growth",
                    "Pest and disease symptoms"
                ]
            },
            {
                stage: "Flowering",
                duration: "50-80 days",
                description: "Plants produce flowers that develop into chilli fruits.",
                farmerActions: [
                    "Maintain adequate irrigation",
                    "Monitor flowering plants",
                    "Protect plants from pests"
                ],
                monitoring: [
                    "Flower development",
                    "Pest activity",
                    "Leaf health"
                ]
            },
            {
                stage: "Fruit Development",
                duration: "80-130 days",
                description: "Chilli fruits develop and gradually mature.",
                farmerActions: [
                    "Maintain consistent irrigation",
                    "Provide appropriate nutrition",
                    "Monitor fruit damage"
                ],
                monitoring: [
                    "Fruit development",
                    "Fruit quality",
                    "Disease symptoms"
                ]
            },
            {
                stage: "Harvest",
                duration: "120-180 days",
                description: "Mature chilli fruits are harvested according to the intended use.",
                farmerActions: [
                    "Harvest fruits at suitable maturity",
                    "Handle fruits carefully",
                    "Remove damaged fruits"
                ],
                monitoring: [
                    "Fruit maturity",
                    "Fruit quality",
                    "Post-harvest damage"
                ]
            }
        ]
    },
    {
        name: "Wheat",
        scientificName: "Triticum aestivum",
        season: "Rabi",
        soilTypes: ["Loamy", "Clay Loam"],
        waterRequirement: "Moderate",
        growthDuration: "120-150 days",
        description: "Wheat is an important cereal crop widely cultivated for grain production.",
        lifeCycle: [
            {
                stage: "Seed",
                duration: "0-7 days",
                description: "Healthy wheat seeds are selected and planted in prepared soil.",
                farmerActions: [
                    "Select quality seeds",
                    "Prepare the seedbed",
                    "Maintain suitable soil moisture"
                ],
                monitoring: [
                    "Seed quality",
                    "Soil moisture",
                    "Planting depth"
                ]
            },
            {
                stage: "Germination",
                duration: "7-15 days",
                description: "Seeds absorb water and young wheat seedlings emerge.",
                farmerActions: [
                    "Maintain adequate moisture",
                    "Avoid waterlogging",
                    "Monitor early pest activity"
                ],
                monitoring: [
                    "Seedling emergence",
                    "Soil moisture",
                    "Pest symptoms"
                ]
            },
            {
                stage: "Tillering",
                duration: "15-45 days",
                description: "Wheat plants produce additional shoots called tillers.",
                farmerActions: [
                    "Provide appropriate irrigation",
                    "Control weeds",
                    "Maintain soil nutrients"
                ],
                monitoring: [
                    "Tillering",
                    "Leaf health",
                    "Weed growth"
                ]
            },
            {
                stage: "Stem Elongation",
                duration: "45-75 days",
                description: "The main stem grows and the plant develops toward reproductive growth.",
                farmerActions: [
                    "Maintain appropriate irrigation",
                    "Monitor nutrient requirements",
                    "Check for disease symptoms"
                ],
                monitoring: [
                    "Plant height",
                    "Leaf health",
                    "Disease symptoms"
                ]
            },
            {
                stage: "Flowering",
                duration: "75-100 days",
                description: "Wheat plants flower and grain formation begins.",
                farmerActions: [
                    "Maintain suitable moisture",
                    "Monitor disease development",
                    "Protect the crop from pests"
                ],
                monitoring: [
                    "Flowering",
                    "Disease symptoms",
                    "Pest activity"
                ]
            },
            {
                stage: "Grain Filling",
                duration: "100-130 days",
                description: "Developing wheat grains increase in size and accumulate nutrients.",
                farmerActions: [
                    "Maintain appropriate irrigation",
                    "Monitor grain development",
                    "Protect plants from pests and diseases"
                ],
                monitoring: [
                    "Grain development",
                    "Plant health",
                    "Disease symptoms"
                ]
            },
            {
                stage: "Harvest",
                duration: "120-150 days",
                description: "Mature wheat grains are harvested when the crop reaches suitable maturity.",
                farmerActions: [
                    "Harvest at appropriate maturity",
                    "Dry grain properly",
                    "Store grain in a suitable condition"
                ],
                monitoring: [
                    "Grain maturity",
                    "Grain moisture",
                    "Storage quality"
                ]
            }
        ]
    },
    {
        name: "Chickpea",
        scientificName: "Cicer arietinum",
        season: "Rabi",
        soilTypes: ["Loamy", "Sandy Loam"],
        waterRequirement: "Low to Moderate",
        growthDuration: "100-120 days",
        description: "Chickpea is a pulse crop commonly grown during the Rabi season."
    },
    {
        name: "Kidney Beans",
        scientificName: "Phaseolus vulgaris",
        season: "Kharif",
        soilTypes: ["Loamy", "Sandy Loam"],
        waterRequirement: "Moderate",
        growthDuration: "90-120 days",
        description: "Kidney beans are an important pulse crop requiring well-drained soil."
    },
    {
        name: "Pigeon Peas",
        scientificName: "Cajanus cajan",
        season: "Kharif",
        soilTypes: ["Loamy", "Sandy Loam"],
        waterRequirement: "Moderate",
        growthDuration: "150-180 days",
        description: "Pigeon pea is a drought-tolerant pulse crop widely cultivated in tropical regions."
    },
    {
        name: "Moth Beans",
        scientificName: "Vigna aconitifolia",
        season: "Kharif",
        soilTypes: ["Sandy", "Sandy Loam"],
        waterRequirement: "Low",
        growthDuration: "75-90 days",
        description: "Moth bean is a drought-resistant pulse crop suitable for dry regions."
    },
    {
        name: "Mung Bean",
        scientificName: "Vigna radiata",
        season: "Kharif and Rabi",
        soilTypes: ["Loamy", "Sandy Loam"],
        waterRequirement: "Low to Moderate",
        growthDuration: "60-90 days",
        description: "Mung bean is a short-duration pulse crop requiring well-drained soil."
    },
    {
        name: "Blackgram",
        scientificName: "Vigna mungo",
        season: "Kharif and Rabi",
        soilTypes: ["Loamy", "Clay Loam"],
        waterRequirement: "Moderate",
        growthDuration: "70-100 days",
        description: "Blackgram is an important pulse crop grown in many parts of India."
    },
    {
        name: "Lentil",
        scientificName: "Lens culinaris",
        season: "Rabi",
        soilTypes: ["Loamy", "Clay Loam"],
        waterRequirement: "Low to Moderate",
        growthDuration: "100-120 days",
        description: "Lentil is a cool-season pulse crop commonly cultivated during Rabi."
    },
    {
        name: "Pomegranate",
        scientificName: "Punica granatum",
        season: "Year-round",
        soilTypes: ["Loamy", "Sandy Loam"],
        waterRequirement: "Moderate",
        growthDuration: "150-180 days",
        description: "Pomegranate is a fruit crop that performs well in warm and relatively dry climates."
    },
    {
        name: "Banana",
        scientificName: "Musa spp.",
        season: "Year-round",
        soilTypes: ["Loamy", "Alluvial"],
        waterRequirement: "High",
        growthDuration: "9-12 months",
        description: "Banana is a tropical fruit crop requiring warm temperatures and regular irrigation."
    },
    {
        name: "Mango",
        scientificName: "Mangifera indica",
        season: "Year-round",
        soilTypes: ["Loamy", "Alluvial"],
        waterRequirement: "Moderate",
        growthDuration: "3-5 years for fruiting",
        description: "Mango is an important tropical fruit crop grown in warm climates."
    },
    {
        name: "Grapes",
        scientificName: "Vitis vinifera",
        season: "Year-round",
        soilTypes: ["Sandy Loam", "Loamy"],
        waterRequirement: "Moderate",
        growthDuration: "150-180 days",
        description: "Grapes are fruit crops requiring good sunlight, drainage and suitable temperature."
    },
    {
        name: "Watermelon",
        scientificName: "Citrullus lanatus",
        season: "Summer",
        soilTypes: ["Sandy Loam", "Loamy"],
        waterRequirement: "Moderate",
        growthDuration: "80-100 days",
        description: "Watermelon is a warm-season fruit crop requiring sunlight and well-drained soil."
    },
    {
        name: "Muskmelon",
        scientificName: "Cucumis melo",
        season: "Summer",
        soilTypes: ["Sandy Loam", "Loamy"],
        waterRequirement: "Moderate",
        growthDuration: "80-100 days",
        description: "Muskmelon is a warm-season crop requiring good sunlight and drainage."
    },
    {
        name: "Apple",
        scientificName: "Malus domestica",
        season: "Year-round",
        soilTypes: ["Loamy", "Well-drained"],
        waterRequirement: "Moderate",
        growthDuration: "150-180 days",
        description: "Apple is a temperate fruit crop that requires suitable cool climatic conditions."
    },
    {
        name: "Orange",
        scientificName: "Citrus sinensis",
        season: "Year-round",
        soilTypes: ["Loamy", "Sandy Loam"],
        waterRequirement: "Moderate",
        growthDuration: "180-240 days",
        description: "Orange is a citrus fruit crop requiring warm conditions and well-drained soil."
    },
    {
        name: "Papaya",
        scientificName: "Carica papaya",
        season: "Year-round",
        soilTypes: ["Loamy", "Sandy Loam"],
        waterRequirement: "Moderate",
        growthDuration: "9-12 months",
        description: "Papaya is a tropical fruit crop that grows well in warm climates."
    },
    {
        name: "Coconut",
        scientificName: "Cocos nucifera",
        season: "Year-round",
        soilTypes: ["Sandy", "Loamy"],
        waterRequirement: "High",
        growthDuration: "5-7 years for fruiting",
        description: "Coconut is a tropical plantation crop requiring warm temperatures and adequate moisture."
    },
    {
        name: "Cotton",
        scientificName: "Gossypium spp.",
        season: "Kharif",
        soilTypes: ["Black Soil", "Loamy"],
        waterRequirement: "Moderate",
        growthDuration: "150-180 days",
        description: "Cotton is an important fiber crop requiring warm temperatures and suitable soil."
    },
    {
        name: "Jute",
        scientificName: "Corchorus spp.",
        season: "Kharif",
        soilTypes: ["Alluvial", "Loamy"],
        waterRequirement: "High",
        growthDuration: "120-150 days",
        description: "Jute is an important natural fiber crop requiring warm and humid conditions."
    },
    {
        name: "Coffee",
        scientificName: "Coffea spp.",
        season: "Year-round",
        soilTypes: ["Loamy", "Well-drained"],
        waterRequirement: "Moderate to High",
        growthDuration: "2-4 years for first production",
        description: "Coffee is a plantation crop requiring suitable temperature, rainfall and well-drained soil."
    }
];

const seedCrops = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");

        for (const crop of crops) {
            await Crop.updateOne(
                { name: crop.name },
                { $set: crop },
                { upsert: true }
            );
        }

        console.log("Crop data inserted successfully");
        console.log(`Total crops processed: ${crops.length}`);

        await mongoose.disconnect();

        console.log("MongoDB disconnected");
    } catch (error) {
        console.error("Seed error:", error.message);
        process.exit(1);
    }
};

seedCrops();