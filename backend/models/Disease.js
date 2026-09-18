const mongoose = require("mongoose");

const diseaseSchema = new mongoose.Schema(
  {
    crop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Crop",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    cause: {
      type: String,
    },

    symptoms: {
      type: [String],
    },

    favorableConditions: {
      type: [String],
    },

    prevention: {
      type: [String],
    },

    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Disease", diseaseSchema);
