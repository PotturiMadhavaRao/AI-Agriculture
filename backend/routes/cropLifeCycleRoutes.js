const express = require("express");
const Crop = require("../models/Crop");

const router = express.Router();

// GET all crops that have life cycle data
router.get("/", async (req, res) => {
    try {
        const crops = await Crop.find(
            { lifeCycle: { $exists: true, $ne: [] } },
            {
                name: 1,
                scientificName: 1,
                growthDuration: 1
            }
        ).sort({ name: 1 });

        res.json({
            success: true,
            count: crops.length,
            crops
        });

    } catch (error) {
        console.error("Fetch crops error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// GET crop life cycle
router.get("/:cropName", async (req, res) => {
    try {
        const cropName = req.params.cropName;

        const crop = await Crop.findOne({
            name: { $regex: new RegExp(`^${cropName}$`, "i") }
        });

        if (!crop) {
            return res.status(404).json({
                success: false,
                message: "Crop not found"
            });
        }

        res.json({
            success: true,
            crop: {
                name: crop.name,
                scientificName: crop.scientificName,
                growthDuration: crop.growthDuration,
                lifeCycle: crop.lifeCycle
            }
        });

    } catch (error) {
        console.error("Life cycle error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

module.exports = router;