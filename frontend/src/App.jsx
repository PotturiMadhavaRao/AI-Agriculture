import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Dashboard from "./pages/Dashboard";
import DiseaseDetection from "./pages/DiseaseDetection";
import CropRecommendation from "./pages/CropRecommendation";
import YieldPrediction from "./pages/YieldPrediction";
import DiseaseRisk from "./pages/DiseaseRisk";
import CropLifeCycle from "./pages/CropLifeCycle";
import ResearchAssistant from "./pages/ResearchAssistant";

function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        <Route
          path="/"
          element={<Dashboard />}
        />

        <Route
          path="/disease-detection"
          element={<DiseaseDetection />}
        />

        <Route
          path="/crop-recommendation"
          element={<CropRecommendation />}
        />

        <Route
          path="/yield-prediction"
          element={<YieldPrediction />}
        />

        <Route
          path="/disease-risk"
          element={<DiseaseRisk />}
        />

        <Route
          path="/crop-life-cycle"
          element={<CropLifeCycle />}
        />

        <Route
          path="/research"
          element={<ResearchAssistant />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;

