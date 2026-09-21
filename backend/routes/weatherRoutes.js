const express = require("express");
const { getWeather, geocodeLocation } = require("../controllers/weatherController");

const router = express.Router();

router.get("/", getWeather);
router.get("/geocode", geocodeLocation);

module.exports = router;
