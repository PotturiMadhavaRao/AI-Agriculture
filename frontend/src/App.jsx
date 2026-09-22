import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import Dashboard from "./pages/Dashboard";
import DiseaseDetection from "./pages/DiseaseDetection";
import CropRecommendation from "./pages/CropRecommendation";
import YieldPrediction from "./pages/YieldPrediction";
import DiseaseRisk from "./pages/DiseaseRisk";
import CropLifeCycle from "./pages/CropLifeCycle";
import WeatherAdvisory from "./pages/WeatherAdvisory";
import HelpSupport from "./pages/HelpSupport";

import { AgriAIProvider } from './context/AgriAIContext';
import AgricultureAIChat from './components/AgriAIChat/AgricultureAIChat';

import "./App.css"; // Ensure App layout CSS is loaded

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <AgriAIProvider>
      <BrowserRouter>
        <div className="app-container">
          
          {/* Mobile Sidebar Overlay */}
        <div 
          className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} 
          onClick={toggleSidebar}
        ></div>

        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div className="main-content">
          <Header toggleSidebar={toggleSidebar} />
          
          <main className="page-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/disease-detection" element={<DiseaseDetection />} />
              <Route path="/crop-recommendation" element={<CropRecommendation />} />
              <Route path="/yield-prediction" element={<YieldPrediction />} />
              <Route path="/disease-risk" element={<DiseaseRisk />} />
              <Route path="/crop-life-cycle" element={<CropLifeCycle />} />
              <Route path="/weather" element={<WeatherAdvisory />} />
              <Route path="/help" element={<HelpSupport />} />
            </Routes>
          </main>
        </div>

        <AgricultureAIChat />

      </div>
    </BrowserRouter>
    </AgriAIProvider>
  );
}

export default App;

