const mongoose = require("mongoose");

const lifeCycleStageSchema = new mongoose.Schema(
    {
        stage: {
            type: String,
            required: true,
        },

        duration: {
            type: String,
            required: true,
        },

        description: {
            type: String,
            required: true,
        },

        farmerActions: {
            type: [String],
            default: [],
        },

        monitoring: {
            type: [String],
            default: [],
        },
    },
    { _id: false }
);

const cropSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },

    scientificName: {
      type: String,
    },

    season: {
      type: String,
    },

    soilTypes: {
      type: [String],
    },

    waterRequirement: {
      type: String,
    },

    growthDuration: {
      type: String,
    },

    description: {
      type: String,
    },

    // 🌱 Crop Life Cycle
    lifeCycle: {
      type: [lifeCycleStageSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Crop", cropSchema);