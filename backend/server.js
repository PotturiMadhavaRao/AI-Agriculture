require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const cropRoutes = require("./routes/cropRoutes");
const diseaseRoutes = require("./routes/diseaseRoutes");
const treatmentRoutes = require("./routes/treatmentRoutes");
const aiRoutes = require("./routes/aiRoutes");

const cropRecommendationRoutes = require("./routes/cropRecommendationRoutes");
const yieldPredictionRoutes = require("./routes/yieldPredictionRoutes");
const diseaseRiskRoutes = require("./routes/diseaseRiskRoutes");
const cropLifeCycleRoutes = require('./routes/cropLifeCycleRoutes');
const researchRoutes = require('./routes/researchRoutes');
const translateRoutes = require('./routes/translateRoutes');
const aiResearchRoutes = require("./routes/aiResearchRoutes");

const app = express();


// Middleware
app.use(cors());
app.use(express.json());


// MongoDB
connectDB();


// API Routes
app.use("/api/crops", cropRoutes);
app.use("/api/diseases", diseaseRoutes);
app.use("/api/treatments", treatmentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/crop-recommendation", cropRecommendationRoutes);
app.use("/api/yield-prediction", yieldPredictionRoutes);
app.use("/api/disease-risk", diseaseRiskRoutes);
app.use('/api/crop-life-cycle', cropLifeCycleRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/translate', translateRoutes);
app.use("/api/ai-research", aiResearchRoutes);


// Home route
app.get("/", (req, res) => {
  res.json({
    message: "AI Agriculture Backend is running",
  });
});


// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});