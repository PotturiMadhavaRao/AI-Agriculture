const mongoose = require("mongoose");
require("dotenv").config();

const Crop = require("./models/Crop");
const Disease = require("./models/Disease");
const Treatment = require("./models/Treatment");

async function seedLateBlight() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");

        // Find Tomato crop
        const tomato = await Crop.findOne({ name: "Tomato" });

        if (!tomato) {
            console.log("Tomato crop not found");
            return;
        }

        // Check if Late Blight already exists
        let disease = await Disease.findOne({
            name: "Late Blight",
            crop: tomato._id,
        });

        // Create Late Blight disease
        if (!disease) {
            disease = await Disease.create({
                crop: tomato._id,
                name: "Late Blight",
                cause:
                    "Late Blight is caused by the plant pathogen Phytophthora infestans.",

                symptoms: [
                    "Dark brown or black irregular spots on leaves",
                    "White fungal-like growth may appear under leaves during humid conditions",
                    "Leaves may turn brown and die rapidly",
                    "Dark lesions may appear on stems",
                    "Fruit may develop large brown or dark lesions",
                ],

                favorableConditions: [
                    "High humidity",
                    "Cool to moderate temperatures",
                    "Frequent rainfall",
                    "Long periods of leaf wetness",
                    "Poor air circulation",
                ],

                prevention: [
                    "Use healthy and disease-free planting material",
                    "Maintain adequate spacing between plants",
                    "Avoid prolonged leaf wetness",
                    "Improve air circulation around plants",
                    "Remove severely infected plant material",
                    "Avoid unnecessary overhead irrigation",
                ],

                description:
                    "Late Blight is a serious tomato disease that can spread rapidly under cool, humid and wet conditions.",
            });

            console.log("Late Blight disease created");
        } else {
            console.log("Late Blight already exists");
        }

        // Remove existing treatments for this disease
        await Treatment.deleteMany({
            disease: disease._id,
        });

        // Add treatments
        await Treatment.insertMany([
            {
                disease: disease._id,
                treatmentType: "Cultural",
                recommendation:
                    "Remove and properly dispose of severely infected leaves and plant material. Improve spacing and air circulation and avoid prolonged leaf wetness.",
                activeIngredient: "",
                safetyPrecautions: [
                    "Do not spread infected plant material to healthy areas",
                    "Clean tools after working with infected plants",
                ],
            },

            {
                disease: disease._id,
                treatmentType: "Organic",
                recommendation:
                    "Use locally approved biological or organic disease-management products according to their label and agricultural guidance.",
                activeIngredient: "",
                safetyPrecautions: [
                    "Use only products approved for the crop",
                    "Follow the product label carefully",
                    "Wear appropriate protective equipment",
                ],
            },

            {
                disease: disease._id,
                treatmentType: "Chemical",
                recommendation:
                    "Use an approved fungicide for tomato late blight according to local agricultural recommendations and the product label.",
                activeIngredient:
                    "Use only an active ingredient approved for your region and crop.",
                safetyPrecautions: [
                    "Follow the product label",
                    "Wear recommended protective equipment",
                    "Observe the specified waiting period before harvest",
                    "Do not exceed the recommended application rate",
                ],
            },
        ]);

        console.log("Late Blight treatments added successfully");

    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        await mongoose.disconnect();
        console.log("MongoDB disconnected");
    }
}

seedLateBlight();