const express = require("express");

const {
    recommendCrop,
} = require("../controllers/cropRecommendationController");

const router = express.Router();

router.post(
    "/recommend",
    recommendCrop
);

module.exports = router;