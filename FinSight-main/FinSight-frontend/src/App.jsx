import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

import Navbar   from "./components/Navbar.jsx";
import Home     from "./pages/Home.jsx";
import Upload   from "./pages/Upload.jsx";
import Results  from "./pages/Results.jsx";
import Explain  from "./pages/Explain.jsx";
import SmartCompliancePage from "./modules/smartCompliance/SmartCompliancePage.jsx";

function App() {
  const [result, setResult] = useState(() => {
    try {
      const saved = localStorage.getItem("finsight_result");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [analysisType, setAnalysisType] = useState(
    () => localStorage.getItem("finsight_type") || "individual"
  );

  const updateResult = (data, type) => {
    setResult(data);
    setAnalysisType(type || "individual");
    localStorage.setItem("finsight_result", JSON.stringify(data));
    localStorage.setItem("finsight_type",   type || "individual");
  };

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"             element={<Home updateResult={updateResult} />} />
        <Route path="/upload/:type" element={<Upload setResult={updateResult} />} />
        <Route path="/results"      element={<Results result={result} analysisType={analysisType} />} />
        <Route path="/explain"      element={<Explain result={result} />} />
        <Route path="/smart-compliance" element={<SmartCompliancePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
