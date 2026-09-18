const express = require("express");

const {
    predictYield,
} = require("../controllers/yieldPredictionController");

const router = express.Router();

router.post(
    "/predict",
    predictYield
);

module.exports = router;