const mongoose = require("mongoose");

const treatmentSchema = new mongoose.Schema(
  {
    disease: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Disease",
      required: true,
    },

    treatmentType: {
      type: String,
      enum: ["Organic", "Chemical", "Cultural"],
    },

    recommendation: {
      type: String,
      required: true,
    },

    activeIngredient: {
      type: String,
    },

    safetyPrecautions: {
      type: [String],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Treatment", treatmentSchema);
