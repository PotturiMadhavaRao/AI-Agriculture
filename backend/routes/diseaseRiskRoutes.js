const express = require("express");

const {
    predictDiseaseRisk,
} = require("../controllers/diseaseRiskController");

const router = express.Router();

router.post(
    "/predict",
    predictDiseaseRisk
);

module.exports = router;