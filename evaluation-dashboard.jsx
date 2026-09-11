import { useState } from "react";

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  navy:    "#0A1628",
  navyMid: "#122040",
  slate:   "#1E3050",
  accent:  "#0F7AFF",
  accentL: "#3D9BFF",
  teal:    "#0DBFB0",
  amber:   "#F5A623",
  red:     "#E53E3E",
  green:   "#22C55E",
  text:    "#E8EEF8",
  textDim: "#7A95BE",
  border:  "#1E3050",
  card:    "#0F1E35",
};

function Card({ children, style = {}, highlight }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${highlight || C.border}`,
      borderRadius: 8, padding: 16, ...style,
    }}>{children}</div>
  );
}

function Tag({ label, color }) {
  const bgMap = {
    [C.green]: "#0A2818", [C.red]: "#2A0808", [C.amber]: "#2A1800",
    [C.teal]: "#0A2820", [C.textDim]: "#1A2438", [C.accentL]: "#0A2040",
  };
  return (
    <span style={{
      background: bgMap[color] || "#1A2438",
      border: `1px solid ${color}`, color, borderRadius: 4,
      padding: "2px 8px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
    }}>{label}</span>
  );
}

function Bar({ pct, color, height = 6 }) {
  return (
    <div style={{ height, background: C.border, borderRadius: height }}>
      <div style={{ width: `${Math.min(pct,100)}%`, height: "100%", background: color, borderRadius: height, transition: "width 0.5s" }} />
    </div>
  );
}

function Ring({ pct, size = 70, stroke = 7, color, label }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ textAlign: "center" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
          strokeWidth={stroke} strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct/100)} strokeLinecap="round" />
        <text x={size/2} y={size/2+1} fill={C.text} fontSize={size*0.2}
          textAnchor="middle" dominantBaseline="middle"
          transform={`rotate(90 ${size/2} ${size/2})`}
          fontWeight="800">{pct}%</text>
      </svg>
      {label && <div style={{ fontSize: 10, color: C.textDim, marginTop: 2 }}>{label}</div>}
    </div>
  );
}

// ── DATA ───────────────────────────────────────────────────────────────────
const LLM_METRICS = [
  { cat: "Quality",     items: [
    { name: "Task completion",   result: "91%",   threshold: "≥88%",  status: "pass" },
    { name: "Answer relevance",  result: "88%",   threshold: "≥85%",  status: "pass" },
    { name: "Correctness",       result: "86%",   threshold: "≥85%",  status: "pass" },
    { name: "Groundedness",      result: "89%",   threshold: "≥90%",  status: "watch" },
    { name: "Hallucination rate",result: "4.2%",  threshold: "≤3%",   status: "fail" },
    { name: "Instruction follow",result: "93%",   threshold: "≥90%",  status: "pass" },
    { name: "Consistency",       result: "87%",   threshold: "≥85%",  status: "pass" },
  ]},
  { cat: "Safety",      items: [
    { name: "Safety violations",  result: "0",     threshold: "0",     status: "pass" },
    { name: "Bias score",         result: "Low",   threshold: "Low",   status: "pass" },
    { name: "Toxicity",           result: "<0.1%", threshold: "<0.5%", status: "pass" },
    { name: "Privacy leakage",    result: "None",  threshold: "None",  status: "pass" },
  ]},
  { cat: "Security",    items: [
    { name: "Prompt injection",   result: "Pass",  threshold: "Pass",  status: "pass" },
    { name: "Jailbreak resist.",  result: "Pass",  threshold: "Pass",  status: "pass" },
    { name: "Sensitive disclosure",result:"Pass",  threshold: "Pass",  status: "pass" },
  ]},
  { cat: "Performance", items: [
    { name: "P50 latency",        result: "1.2s",  threshold: "≤2s",   status: "pass" },
    { name: "P95 latency",        result: "3.8s",  threshold: "≤5s",   status: "pass" },
    { name: "Cost / request",     result: "£0.004",threshold:"≤£0.01", status: "pass" },
    { name: "Tokens / request",   result: "1,240", threshold: "≤2,000",status: "pass" },
  ]},
];

const RAG_METRICS = [
  { name: "Recall @ 5",                layer: "Retrieval", result: "82%",  threshold: "≥85%",  status: "fail" },
  { name: "Precision @ 5",             layer: "Retrieval", result: "76%",  threshold: "≥80%",  status: "fail" },
  { name: "Relevant doc retrieval",    layer: "Retrieval", result: "88%",  threshold: "≥85%",  status: "pass" },
  { name: "Retrieval latency P95",     layer: "Retrieval", result: "340ms",threshold: "≤500ms",status: "pass" },
  { name: "Permissions enforcement",   layer: "Retrieval", result: "Pass", threshold: "Pass",  status: "pass" },
  { name: "Groundedness",              layer: "Generation",result: "89%",  threshold: "≥90%",  status: "watch" },
  { name: "Faithfulness",              layer: "Generation",result: "87%",  threshold: "≥90%",  status: "fail" },
  { name: "Unsupported claims",        layer: "Generation",result: "6.1%", threshold: "≤5%",   status: "fail" },
  { name: "Citation correctness",      layer: "Generation",result: "83%",  threshold: "≥90%",  status: "fail" },
  { name: "E2E task completion",       layer: "End-to-End",result: "79%",  threshold: "≥85%",  status: "fail" },
  { name: "E2E response time P95",     layer: "End-to-End",result: "5.1s", threshold: "≤6s",   status: "pass" },
  { name: "Business accuracy",         layer: "End-to-End",result: "TBD",  threshold: "≥90%",  status: "tbd" },
];

const GAPS = [
  { id: "GAP-001", desc: "Hallucination rate 4.2% exceeds 3% threshold",        owner: "AI Engineering", gate: "G3", sev: "BLOCKING" },
  { id: "GAP-002", desc: "Faithfulness 87% below 90% threshold",                 owner: "AI Engineering", gate: "G3", sev: "BLOCKING" },
  { id: "GAP-003", desc: "Citation correctness 83% below 90% threshold",         owner: "AI Engineering", gate: "G3", sev: "BLOCKING" },
  { id: "GAP-004", desc: "RAG Recall @ 5 at 82%, threshold 85%",                 owner: "AI Engineering", gate: "G3", sev: "BLOCKING" },
  { id: "GAP-005", desc: "E2E task completion 79%, threshold 85%",               owner: "Business Owner", gate: "G3", sev: "BLOCKING" },
  { id: "GAP-006", desc: "Business accuracy not yet measured",                   owner: "Business Owner", gate: "G3", sev: "BLOCKING" },
  { id: "GAP-007", desc: "Knowledge base data freshness not validated",          owner: "AI Engineering", gate: "G3", sev: "REQUIRED" },
  { id: "GAP-008", desc: "DPIA not completed",                                   owner: "DPO",            gate: "G4", sev: "REQUIRED" },
  { id: "GAP-009", desc: "EU AI Act classification not assessed",                owner: "Legal / DPO",    gate: "G4", sev: "REQUIRED" },
  { id: "GAP-010", desc: "Security penetration test not completed",              owner: "Security Arch",  gate: "G5", sev: "REQUIRED" },
  { id: "GAP-011", desc: "Human evaluation by business users not conducted",     owner: "Business Owner", gate: "G3", sev: "REQUIRED" },
  { id: "GAP-012", desc: "Evaluation dataset v2 not yet produced",              owner: "AI Engineering", gate: "G3", sev: "REQUIRED" },
];

const PROCESS_STEPS = [
  { n: "01", title: "Produce evaluation dataset v2", who: "AI Engineering", output: "Versioned golden dataset with 400+ cases", done: false, active: true },
  { n: "02", title: "Register candidate models", who: "AI Engineering", output: "Provider, version, data policy recorded", done: false, active: false },
  { n: "03", title: "Run automated evaluation suite", who: "AI Engineering", output: "L1–L6 metrics against v2 dataset", done: false, active: false },
  { n: "04", title: "Business user evaluation", who: "Business Owner + Users", output: "Human preference, task completion rate", done: false, active: false },
  { n: "05", title: "Safety evaluation (separate)", who: "Responsible AI / AI WG", output: "Safety, bias, toxicity, privacy results", done: false, active: false },
  { n: "06", title: "Security evaluation (separate)", who: "Security Architecture", output: "Injection, jailbreak, data leakage results", done: false, active: false },
  { n: "07", title: "Review results vs thresholds", who: "AI Eng + Business", output: "All FAIL items resolved or escalated", done: false, active: false },
  { n: "08", title: "Gate 3 evidence pack submitted", who: "AI Engineering Lead", output: "Evidence pack to governance committee", done: false, active: false },
  { n: "09", title: "Gate 3 approval", who: "AI Eng + Business Owner", output: "Signed approval or blocking conditions", done: false, active: false },
  { n: "10", title: "Gate 4 — Responsible AI", who: "AI WG + DPO + Legal", output: "Framework compliance, DPIA, risk register", done: false, active: false },
  { n: "11", title: "Gate 5 — Production Readiness", who: "Eng + Ops + Sec + Business", output: "PRR checklist, pen test, rollback tested", done: false, active: false },
  { n: "12", title: "Gate 6 — Production Release", who: "Named Accountable Approver", output: "Production deployment authorised", done: false, active: false },
];

const statusColor = { pass: C.green, fail: C.red, watch: C.amber, tbd: C.textDim };
const statusLabel = { pass: "PASS", fail: "FAIL", watch: "WATCH", tbd: "TBD" };

const GATE_NAMES = {
  G0: "Suitability", G1: "Data", G2: "Architecture", G3: "Evaluation",
  G4: "Responsible AI", G5: "Production", G6: "Release", G7: "Post-Deploy",
};
const DEFAULT_GATES = {
  G0: "Approved", G1: "Approved", G2: "In Progress", G3: "Evidence Required",
  G4: "Not Started", G5: "Not Started", G6: "Not Started", G7: "Not Started",
};
function computeReadiness(gates) {
  const statusPct = { Approved: 100, "In Progress": 55, "Evidence Required": 30, "Not Started": 0, Blocked: 10 };
  const vals = Object.values(gates).map(g => statusPct[g] ?? 0);
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}
const GATE_STEP_HINT = { G0: 0, G1: 0, G2: 2, G3: 9, G4: 9, G5: 10, G6: 11, G7: 11 };
function currentStepIndex(gates) {
  const order = ["G0", "G1", "G2", "G3", "G4", "G5", "G6", "G7"];
  for (const id of order) {
    if ((gates[id] || "Not Started") !== "Approved") {
      return GATE_STEP_HINT[id] ?? 3;
    }
  }
  return 11;
}

// ── COMPONENT ──────────────────────────────────────────────────────────────
export default function EvalDashboard({ state = {} } = {}) {
  const [view, setView] = useState("overview");

  const gates = state.gates || DEFAULT_GATES;
  const versions = (state.mlops && state.mlops.versions) || {};
  const readiness = computeReadiness(gates);
  const recommendation = readiness >= 80 ? "GO" : readiness >= 50 ? "GO WITH CONDITIONS" : "REWORK";
  const recColor = recommendation === "GO" ? C.green : recommendation === "GO WITH CONDITIONS" ? C.amber : C.red;
  const pendingGates = Object.values(gates).filter(g => g !== "Approved").length;
  const liveGates = Object.entries(gates).map(([id, status]) => ({
    id,
    name: GATE_NAMES[id] || id,
    status: status === "Approved" ? "approved" : status === "In Progress" ? "progress" : (status === "Blocked" || status === "Evidence Required") ? "blocked" : "not-started",
  }));
  const modelName = versions["Model"] || "—";
  const dsVersion = versions["Evaluation dataset"] || "v1.3";
  const stepIdx = currentStepIndex(gates);
  const currentStep = PROCESS_STEPS[stepIdx];

  const llmFail  = LLM_METRICS.flatMap(c => c.items).filter(i => i.status === "fail").length;
  const llmWatch = LLM_METRICS.flatMap(c => c.items).filter(i => i.status === "watch").length;
  const llmPass  = LLM_METRICS.flatMap(c => c.items).filter(i => i.status === "pass").length;
  const ragFail  = RAG_METRICS.filter(m => m.status === "fail").length;
  const ragPass  = RAG_METRICS.filter(m => m.status === "pass").length;
  const blocking = GAPS.filter(g => g.sev === "BLOCKING").length;

  const overallPct = Math.round((llmPass + ragPass) / (LLM_METRICS.flatMap(c=>c.items).length + RAG_METRICS.length) * 100);

  const views = ["overview","llm","rag","gaps","process"];

  return (
    <div style={{
      background: C.navy, color: C.text,
      fontFamily: "'Inter', system-ui, sans-serif", minHeight: "100vh",
      padding: 20, boxSizing: "border-box",
    }}>
      {/* header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, color: C.textDim, letterSpacing: "0.1em", marginBottom: 2 }}>
          CITATION · AI SYSTEM DESIGN & ADOPTION
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>
            Model Evaluation Dashboard
          </h1>
          <div style={{ display: "flex", gap: 6 }}>
            {["PROTECT","IMPROVE","EMPOWER"].map((p, i) => {
              const cols = [["#1A1040","#7C3AED","#A78BFA"],["#0A2030","#0284C7","#38BDF8"],["#0A2820","#059669","#34D399"]];
              return (
                <span key={p} style={{ background: cols[i][0], border: `1px solid ${cols[i][1]}`, color: cols[i][2], borderRadius: 4, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>{p}</span>
              );
            })}
          </div>
        </div>
        <div style={{ fontSize: 12, color: C.textDim, marginTop: 4 }}>
          Intelligent Document Processing · Evaluation dataset: {dsVersion} · September 2026 · Model: {modelName}
        </div>
      </div>

      {/* nav tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {[["overview","Overview"],["llm","LLM Results"],["rag","RAG Results"],["gaps","Gaps & Actions"],["process","Eval Process"]].map(([id, label]) => (
          <button key={id} onClick={() => setView(id)}
            style={{
              background: view === id ? C.accent : C.navyMid,
              border: `1px solid ${view === id ? C.accent : C.border}`,
              color: C.text, borderRadius: 6, padding: "7px 16px",
              fontSize: 12, fontWeight: view === id ? 700 : 400, cursor: "pointer",
            }}>{label}</button>
        ))}
      </div>

      {/* ── OVERVIEW ─────────────────────────────────────────────────────── */}
      {view === "overview" && (
        <div>
          {/* KPI row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: 12, marginBottom: 16 }}>
            {[
              { label: "Overall Pass Rate", val: `${overallPct}%`, color: overallPct >= 80 ? C.teal : C.amber },
              { label: "LLM Pass",    val: `${llmPass}/${LLM_METRICS.flatMap(c=>c.items).length}`, color: C.green },
              { label: "LLM Fail",    val: llmFail,   color: C.red },
              { label: "LLM Watch",   val: llmWatch,  color: C.amber },
              { label: "RAG Pass",    val: `${ragPass}/${RAG_METRICS.length}`, color: C.green },
              { label: "RAG Fail",    val: ragFail,   color: C.red },
              { label: "Blocking Gaps",val: blocking, color: C.red },
              { label: "Gate Readiness", val: `${readiness}%`, color: readiness >= 80 ? C.green : readiness >= 50 ? C.amber : C.red },
            ].map(k => (
              <Card key={k.label}>
                <div style={{ fontSize: 10, color: C.textDim, marginBottom: 6 }}>{k.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: k.color }}>{k.val}</div>
              </Card>
            ))}
          </div>

          {/* recommendation banner */}
          <Card highlight={C.amber + "80"} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 10, color: C.textDim, marginBottom: 4 }}>RECOMMENDATION</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: recColor }}>{recommendation}</div>
              </div>
              <div style={{ flex: 1, fontSize: 12, color: C.textDim }}>
                {readiness}% overall gate readiness with {pendingGates} of 8 gates still pending action before
                production deployment. Metric results below reflect the current evaluation run against the {dsVersion}
                dataset.
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <Tag label={`${readiness}% Ready`} color={recColor} />
                <Tag label={`${pendingGates} Gates Pending`} color={pendingGates > 0 ? C.amber : C.green} />
                <Tag label={`Model: ${modelName}`} color={C.accentL} />
              </div>
            </div>
          </Card>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* LLM summary */}
            <Card>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 12 }}>LLM Evaluation Summary</div>
              <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 14 }}>
                <Ring pct={llmPass > 0 ? Math.round(llmPass/(llmPass+llmFail+llmWatch)*100) : 0} size={64} stroke={6} color={C.green} label="Pass" />
                <Ring pct={Math.round(overallPct)} size={64} stroke={6} color={C.accent} label="Overall" />
                <Ring pct={llmFail > 0 ? Math.round(llmFail/(llmPass+llmFail+llmWatch)*100) : 0} size={64} stroke={6} color={C.red} label="Fail" />
              </div>
              {LLM_METRICS.map(cat => {
                const fails = cat.items.filter(i => i.status === "fail").length;
                const passes= cat.items.filter(i => i.status === "pass").length;
                const pct = Math.round(passes / cat.items.length * 100);
                return (
                  <div key={cat.cat} style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.textDim, marginBottom: 3 }}>
                      <span>{cat.cat}</span>
                      <span style={{ color: fails > 0 ? C.red : C.green }}>{passes}/{cat.items.length} pass{fails > 0 ? ` · ${fails} FAIL` : ""}</span>
                    </div>
                    <Bar pct={pct} color={fails > 0 ? C.amber : C.green} />
                  </div>
                );
              })}
            </Card>

            {/* RAG summary */}
            <Card>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 12 }}>RAG Evaluation Summary</div>
              {["Retrieval","Generation","End-to-End"].map(layer => {
                const items = RAG_METRICS.filter(m => m.layer === layer);
                const fails = items.filter(i => i.status === "fail").length;
                const passes= items.filter(i => i.status === "pass").length;
                const pct = Math.round(passes / items.length * 100);
                return (
                  <div key={layer} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.textDim, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, color: C.text }}>{layer}</span>
                      <span style={{ color: fails > 0 ? C.red : C.green }}>{passes}/{items.length} pass</span>
                    </div>
                    <Bar pct={pct} color={fails >= 2 ? C.red : fails === 1 ? C.amber : C.green} />
                    {items.map(m => (
                      <div key={m.name} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0 3px 12px", fontSize: 11, borderBottom: `1px solid ${C.border}` }}>
                        <span style={{ color: C.textDim }}>{m.name}</span>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <span style={{ color: C.textDim, fontSize: 10 }}>{m.result}</span>
                          <Tag label={statusLabel[m.status]} color={statusColor[m.status]} />
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </Card>
          </div>

          {/* Gate timeline */}
          <Card style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 14 }}>Governance Gate Status</div>
            <div style={{ display: "flex", gap: 0, overflowX: "auto" }}>
              {liveGates.map((g, i) => {
                const cols = { approved: C.green, progress: C.accent, blocked: C.red, "not-started": C.textDim };
                const bgs  = { approved: "#0A2818", progress: "#0A2040", blocked: "#2A0808", "not-started": "#1A2438" };
                return (
                  <div key={g.id} style={{ display: "flex", alignItems: "center" }}>
                    <div style={{
                      background: bgs[g.status], border: `2px solid ${cols[g.status]}`,
                      borderRadius: 8, padding: "10px 14px", textAlign: "center", minWidth: 80,
                    }}>
                      <div style={{ fontSize: 10, color: cols[g.status], fontWeight: 800 }}>{g.id}</div>
                      <div style={{ fontSize: 11, color: C.text, marginTop: 2 }}>{g.name}</div>
                      <div style={{ fontSize: 9, color: cols[g.status], marginTop: 3, fontWeight: 700 }}>
                        {g.status === "approved" ? "✓ Done" : g.status === "progress" ? "In Progress" : g.status === "blocked" ? "✗ Blocked" : "Pending"}
                      </div>
                    </div>
                    {i < 7 && <div style={{ height: 2, width: 12, background: C.border, flexShrink: 0 }} />}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* ── LLM RESULTS ──────────────────────────────────────────────────── */}
      {view === "llm" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {LLM_METRICS.map(cat => (
            <Card key={cat.cat}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textDim, marginBottom: 12,
                textTransform: "uppercase", letterSpacing: "0.06em" }}>{cat.cat}</div>
              {cat.items.map(m => (
                <div key={m.name} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "6px 0", borderBottom: `1px solid ${C.border}`,
                }}>
                  <span style={{ fontSize: 13, color: C.text }}>{m.name}</span>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: C.textDim }}>{m.result}</span>
                    <span style={{ fontSize: 10, color: C.textDim }}>{m.threshold}</span>
                    <Tag label={statusLabel[m.status]} color={statusColor[m.status]} />
                  </div>
                </div>
              ))}
            </Card>
          ))}
          <Card style={{ gridColumn: "1 / -1", background: "#2A0808", borderColor: C.red + "60" }}>
            <div style={{ fontSize: 12, color: C.red, fontWeight: 700, marginBottom: 6 }}>✗ Blocking Issue</div>
            <div style={{ fontSize: 13, color: C.text }}>
              Hallucination rate at 4.2% exceeds the 3% threshold. This is a Gate 3 blocking item.
              Groundedness at 89% is 1 point below threshold — watch status. Both require re-evaluation after
              retrieval pipeline improvements and knowledge base expansion.
            </div>
          </Card>
        </div>
      )}

      {/* ── RAG RESULTS ──────────────────────────────────────────────────── */}
      {view === "rag" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 16 }}>
            {["Retrieval","Generation","End-to-End"].map(layer => {
              const items = RAG_METRICS.filter(m => m.layer === layer);
              const fails = items.filter(i => i.status === "fail").length;
              return (
                <Card key={layer} highlight={fails > 1 ? C.red + "60" : fails === 1 ? C.amber + "60" : C.green + "60"}>
                  <div style={{ fontSize: 11, color: C.textDim, marginBottom: 8, fontWeight: 700 }}>{layer.toUpperCase()}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: fails > 0 ? C.red : C.green, marginBottom: 4 }}>
                    {fails} {fails === 1 ? "FAIL" : "FAILs"}
                  </div>
                  <div style={{ fontSize: 11, color: C.textDim }}>{items.length} metrics evaluated</div>
                </Card>
              );
            })}
          </div>
          <Card>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 12 }}>RAG Metrics — Full Detail</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr>{["Metric","Layer","Result","Threshold","Status"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 10px", color: C.textDim, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {RAG_METRICS.map((m, i) => (
                  <tr key={m.name} style={{ background: i % 2 === 0 ? C.card : C.navyMid }}>
                    <td style={{ padding: "7px 10px", color: C.text }}>{m.name}</td>
                    <td style={{ padding: "7px 10px" }}>
                      <span style={{ fontSize: 10, color: C.textDim, background: C.slate, borderRadius: 3, padding: "1px 6px" }}>{m.layer}</span>
                    </td>
                    <td style={{ padding: "7px 10px", color: statusColor[m.status], fontWeight: 600 }}>{m.result}</td>
                    <td style={{ padding: "7px 10px", color: C.textDim }}>{m.threshold}</td>
                    <td style={{ padding: "7px 10px" }}><Tag label={statusLabel[m.status]} color={statusColor[m.status]} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Card style={{ marginTop: 12, background: "#2A0808", borderColor: C.red + "60" }}>
            <div style={{ fontSize: 12, color: C.red, fontWeight: 700, marginBottom: 6 }}>✗ 5 of 13 RAG metrics are FAIL</div>
            <div style={{ fontSize: 12, color: C.text }}>
              Retrieval recall below threshold — knowledge base coverage and chunk overlap strategy require revision.
              Faithfulness and citation correctness failures indicate generation is not sufficiently grounded in retrieved documents.
              E2E task completion at 79% is 6 points below the 85% threshold. Gate 3 cannot be approved until all mandatory thresholds are met.
            </div>
          </Card>
        </div>
      )}

      {/* ── GAPS ─────────────────────────────────────────────────────────── */}
      {view === "gaps" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 16 }}>
            <Card highlight={C.red + "60"}>
              <div style={{ fontSize: 10, color: C.textDim, marginBottom: 6 }}>BLOCKING</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: C.red }}>{GAPS.filter(g => g.sev === "BLOCKING").length}</div>
              <div style={{ fontSize: 11, color: C.textDim }}>Must resolve before Gate 3</div>
            </Card>
            <Card highlight={C.amber + "60"}>
              <div style={{ fontSize: 10, color: C.textDim, marginBottom: 6 }}>REQUIRED</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: C.amber }}>{GAPS.filter(g => g.sev === "REQUIRED").length}</div>
              <div style={{ fontSize: 11, color: C.textDim }}>Required for Gate 3–5</div>
            </Card>
            <Card>
              <div style={{ fontSize: 10, color: C.textDim, marginBottom: 6 }}>TOTAL GAPS</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: C.text }}>{GAPS.length}</div>
              <div style={{ fontSize: 11, color: C.textDim }}>Across all evaluation gates</div>
            </Card>
          </div>

          <Card>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr>{["ID","Description","Owner","Gate","Severity"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 10px", color: C.textDim, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {GAPS.map((g, i) => (
                  <tr key={g.id} style={{ background: i % 2 === 0 ? C.card : C.navyMid }}>
                    <td style={{ padding: "7px 10px", color: C.textDim, fontWeight: 600 }}>{g.id}</td>
                    <td style={{ padding: "7px 10px", color: C.text }}>{g.desc}</td>
                    <td style={{ padding: "7px 10px", color: C.textDim }}>{g.owner}</td>
                    <td style={{ padding: "7px 10px" }}>
                      <span style={{ fontSize: 10, color: C.accentL, background: "#0A2040", borderRadius: 3, padding: "1px 6px", fontWeight: 700 }}>{g.gate}</span>
                    </td>
                    <td style={{ padding: "7px 10px" }}>
                      <Tag label={g.sev} color={g.sev === "BLOCKING" ? C.red : C.amber} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* ── PROCESS ──────────────────────────────────────────────────────── */}
      {view === "process" && (
        <div>
          <Card style={{ marginBottom: 16, background: "#0A2040", borderColor: C.accent + "60" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.accentL, marginBottom: 6 }}>Evaluation Process — Current Position</div>
            <div style={{ fontSize: 12, color: C.text }}>
              The evaluation process is at <strong>Step {currentStep.n} — {currentStep.title}</strong>.
              Step position follows the AI System Design gates ({readiness}% readiness, {pendingGates} gate{pendingGates === 1 ? "" : "s"} pending).
              No gate submission should be made until all automated and human evaluation steps are complete.
            </div>
          </Card>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {PROCESS_STEPS.map((s, i) => {
              const step = Number(s.n) - 1;
              const done = step < stepIdx;
              const active = step === stepIdx;
              return (
              <Card key={s.n} highlight={active ? C.accent + "80" : done ? C.green + "40" : C.border}
                style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: active ? C.accent : done ? C.green : C.border,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 800, color: C.text, flexShrink: 0,
                }}>{done ? "✓" : s.n}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 13, fontWeight: active ? 700 : 400, color: active ? C.text : done ? C.textDim : C.text }}>
                      {s.title}
                    </div>
                    {active && <Tag label="CURRENT STEP" color={C.accent} />}
                    {done  && <Tag label="COMPLETE" color={C.green} />}
                  </div>
                  <div style={{ fontSize: 11, color: C.textDim, marginTop: 3 }}>
                    Owner: {s.who}
                  </div>
                  <div style={{ fontSize: 11, color: C.textDim, marginTop: 1 }}>
                    Output: {s.output}
                  </div>
</div>
              </Card>
            )})}
          </div>

          <Card style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 10 }}>Continuous Evaluation — Production Triggers</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                ["Model version change",           "Full L1–L7 re-evaluation",    "active"],
                ["Prompt / instructions change",   "L2–L7 re-evaluation",         "watch"],
                ["Knowledge base update (major)",  "L1–L3 + L7",                  "active"],
                ["Task success drops >2%",         "L3–L7 triggered",             "watch"],
                ["Hallucination rate rises >1%",   "L2–L3 triggered",             "active"],
                ["Security incident",             "L5 full re-run + forensics",   "watch"],
                ["New regulation applies",        "L4 + L7 + governance review",  "active"],
                ["Provider changes base model",   "Full L1–L7 re-evaluation",    "watch"],
              ].map(([trigger, action, state]) => (
                <div key={trigger} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "6px 10px", background: C.navyMid, borderRadius: 6, fontSize: 11,
                }}>
                  <span style={{ color: C.textDim }}>{trigger}</span>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{ color: C.text, textAlign: "right" }}>{action}</span>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: state === "active" ? C.amber : C.textDim, flexShrink: 0 }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* footer */}
      <div style={{ marginTop: 20, padding: "10px 0", borderTop: `1px solid ${C.border}`, fontSize: 10, color: C.textDim, display: "flex", justifyContent: "space-between" }}>
        <span>PROTECT · IMPROVE · EMPOWER · INNOVATE</span>
        <span>Evaluation dataset {dsVersion} · Model {modelName} · Owner: James Patel – AI Engineering Lead</span>
      </div>
    </div>
  );
}
