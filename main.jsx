import { useState } from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App, { useAppState } from "./ai-system-design-full.jsx";
import EvalDashboard from "./evaluation-dashboard.jsx";

function Root() {
  const [tab, setTab] = useState("design");
  const external = useAppState();

  return (
    <div>
      <div className="app-tabs">
        <button className={tab === "design" ? "active" : ""} onClick={() => setTab("design")}>
          AI System Design
        </button>
        <button className={tab === "dashboard" ? "active" : ""} onClick={() => setTab("dashboard")}>
          Evaluation Dashboard
        </button>
      </div>
      <div className="panel">
        {tab === "design" && <App external={external} />}
        {tab === "dashboard" && <EvalDashboard state={external.state} />}
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
  </StrictMode>
);