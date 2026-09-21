const express = require("express");
const multer = require("multer");

const {
    recommendCrop,
    handleOcrUpload,
    findLabs
} = require("../controllers/cropRecommendationController");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/recommend", recommendCrop);
router.post("/ocr", upload.single("image"), handleOcrUpload);
router.get("/labs", findLabs);

module.exports = router;