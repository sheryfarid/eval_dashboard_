import { useState, useEffect, useRef } from "react";

// ════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ════════════════════════════════════════════════════════════════════════
const C = {
  navy: "#0A1628", navyMid: "#122040", slate: "#1E3050", steel: "#2A4570",
  accent: "#0F7AFF", accentL: "#3D9BFF", teal: "#0DBFB0", amber: "#F5A623",
  red: "#E53E3E", green: "#22C55E", text: "#E8EEF8", textDim: "#7A95BE",
  border: "#1E3050", card: "#0F1E35",
};

const PILL = {
  PROTECT: { bg: "#1A1040", border: "#7C3AED", text: "#A78BFA" },
  IMPROVE: { bg: "#0A2030", border: "#0284C7", text: "#38BDF8" },
  EMPOWER: { bg: "#0A2820", border: "#059669", text: "#34D399" },
  INNOVATE:{ bg: "#2A1800", border: "#D97706", text: "#FCD34D" },
};

const STORAGE_KEY = "aisda-app-state-v1";

// ════════════════════════════════════════════════════════════════════════
// PRIMITIVES
// ════════════════════════════════════════════════════════════════════════
function PrinciplePill({ name, size = "sm" }) {
  const s = PILL[name] || PILL.PROTECT;
  return (
    <span style={{
      background: s.bg, border: `1px solid ${s.border}`, color: s.text,
      borderRadius: 4, padding: size === "sm" ? "2px 7px" : "4px 12px",
      fontSize: size === "sm" ? 10 : 12, fontWeight: 600, letterSpacing: "0.04em",
      whiteSpace: "nowrap",
    }}>{name}</span>
  );
}

function StatusBadge({ status }) {
  const map = {
    "Not Started": { bg: "#1A2438", color: C.textDim },
    "In Progress": { bg: "#0A2A50", color: C.accentL },
    "Evidence Required": { bg: "#2A1800", color: "#FCD34D" },
    "Review Required": { bg: "#1A1A00", color: "#FACC15" },
    "Approved": { bg: "#0A2A18", color: C.green },
    "Blocked": { bg: "#2A0A0A", color: C.red },
    "Complete": { bg: "#0A2A18", color: C.green },
  };
  const s = map[status] || map["Not Started"];
  return <span style={{ background: s.bg, color: s.color, borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>{status}</span>;
}

function Tag({ label, color }) {
  return (
    <span style={{
      border: `1px solid ${color}`, color, borderRadius: 4, padding: "2px 8px",
      fontSize: 10, fontWeight: 700, whiteSpace: "nowrap", background: color + "18",
    }}>{label}</span>
  );
}

function SectionTitle({ children, sub, right }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text, letterSpacing: "-0.01em" }}>{children}</h2>
        {sub && <p style={{ margin: "4px 0 0", fontSize: 13, color: C.textDim }}>{sub}</p>}
      </div>
      {right}
    </div>
  );
}

function Card({ children, style = {}, highlight }) {
  return <div style={{ background: C.card, border: `1px solid ${highlight || C.border}`, borderRadius: 8, padding: 20, ...style }}>{children}</div>;
}

function Btn({ children, onClick, active, variant = "default", small, style = {} }) {
  const variants = {
    default: { bg: active ? C.accent : C.navyMid, border: active ? C.accent : C.border, color: C.text },
    ghost: { bg: "transparent", border: C.border, color: C.textDim },
    danger: { bg: active ? C.red : "transparent", border: C.red, color: active ? C.text : C.red },
    success: { bg: active ? C.green : "transparent", border: C.green, color: active ? C.navy : C.green },
    amber: { bg: active ? C.amber : "transparent", border: C.amber, color: active ? C.navy : C.amber },
  };
  const v = variants[variant];
  return (
    <button onClick={onClick} style={{
      background: v.bg, border: `1px solid ${v.border}`, color: v.color,
      borderRadius: 6, padding: small ? "4px 10px" : "7px 16px",
      fontSize: small ? 11 : 12, fontWeight: 600, cursor: "pointer",
      transition: "all 0.12s", ...style,
    }}>{children}</button>
  );
}

function Input({ value, onChange, placeholder, style = {}, as = "input", rows }) {
  const props = {
    value, onChange: e => onChange(e.target.value), placeholder,
    style: {
      width: "100%", background: C.navyMid, border: `1px solid ${C.border}`,
      borderRadius: 6, padding: "8px 12px", color: C.text, fontSize: 13,
      fontFamily: "inherit", boxSizing: "border-box", ...style,
    },
  };
  return as === "textarea" ? <textarea rows={rows || 3} {...props} /> : <input {...props} />;
}

function Select({ value, onChange, options, style = {} }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{
      width: "100%", background: C.navyMid, border: `1px solid ${C.border}`,
      borderRadius: 6, padding: "8px 12px", color: C.text, fontSize: 13, ...style,
    }}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function TriToggle({ value, onChange, options = ["Yes", "No", "TBD"] }) {
  const colorMap = { Yes: C.green, No: C.red, TBD: C.amber, Pass: C.green, Fail: C.red };
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {options.map(opt => (
        <button key={opt} onClick={() => onChange(opt)} style={{
          background: value === opt ? (colorMap[opt] || C.accent) + "22" : "transparent",
          border: `1px solid ${value === opt ? (colorMap[opt] || C.accent) : C.border}`,
          color: value === opt ? (colorMap[opt] || C.accent) : C.textDim,
          borderRadius: 4, padding: "3px 10px", fontSize: 11, cursor: "pointer", fontWeight: 600,
        }}>{opt}</button>
      ))}
    </div>
  );
}

function Ring({ pct, size = 70, stroke = 7, color = C.accent, label }) {
  const r = (size - stroke) / 2, circ = 2 * Math.PI * r;
  return (
    <div style={{ textAlign: "center" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct/100)} strokeLinecap="round" />
        <text x={size/2} y={size/2+1} fill={C.text} fontSize={size*0.2} textAnchor="middle"
          dominantBaseline="middle" transform={`rotate(90 ${size/2} ${size/2})`} fontWeight="800">{pct}%</text>
      </svg>
      {label && <div style={{ fontSize: 10, color: C.textDim, marginTop: 3 }}>{label}</div>}
    </div>
  );
}

function Bar({ pct, color, height = 6 }) {
  return <div style={{ height, background: C.border, borderRadius: height }}>
    <div style={{ width: `${Math.min(Math.max(pct,0),100)}%`, height: "100%", background: color, borderRadius: height, transition: "width 0.4s" }} />
  </div>;
}

// ════════════════════════════════════════════════════════════════════════
// NAV / PHASE CONSTANTS
// ════════════════════════════════════════════════════════════════════════
const NAV = [
  { id: "home",         label: "Home",             icon: "⬡" },
  { id: "discover",     label: "Discover",         icon: "◎" },
  { id: "ai-fit",       label: "AI Fit",           icon: "◈" },
  { id: "requirements", label: "Requirements",     icon: "≡" },
  { id: "data",         label: "Data Readiness",   icon: "⬢" },
  { id: "design",       label: "System Design",    icon: "⬣" },
  { id: "evaluation",   label: "Evaluation Lab",   icon: "◉" },
  { id: "buildbuy",     label: "Build vs Buy",     icon: "⊞" },
  { id: "governance",   label: "Governance",       icon: "◈" },
  { id: "mlops",        label: "MLOps",            icon: "⟳" },
  { id: "deploy",       label: "Deployment",       icon: "↑" },
  { id: "monitor",      label: "Monitoring",       icon: "⬡" },
  { id: "reports",      label: "Reports",          icon: "⊟" },
];

const PHASE_LIST = ["discover","define","ai-fit","design","select","evaluate","govern","build","validate","deploy","operate","improve"];
const PHASE_NAMES = { discover:"Discover", define:"Define", "ai-fit":"Assess AI Fit", design:"Design", select:"Select Tech",
  evaluate:"Evaluate", govern:"Govern", build:"Build", validate:"Validate", deploy:"Deploy", operate:"Operate", improve:"Improve" };

// ════════════════════════════════════════════════════════════════════════
// DEFAULT STATE
// ════════════════════════════════════════════════════════════════════════
const DEFAULT_STATE = {
  discover: {
    problem: "Manual processing of incoming supplier invoices and customer onboarding documents consumes significant staff time, causes payment delays, and introduces data-entry errors that increase downstream risk.",
    who: "Accounts Payable team (12 FTE), Customer Onboarding team (8 FTE), and customers awaiting account activation.",
    process: "Documents received by email or post → manually reviewed → data keyed into ERP → exceptions routed to team leads → customer notified.",
    causes: "High document volume (avg 3,200/month), inconsistent formats across 400+ suppliers, manual keying errors, no prioritisation logic.",
    frequency: "Daily, peak at month-end. Average 160 documents per working day.",
    volume: "3,200 invoices/month · 800 onboarding packs/month",
    baseline: "Avg processing time: 4.2 days/invoice. Error rate: 6.8%. Cost per invoice: £18.40.",
    doNothing: "£2.1M annual cost continues to grow 12% YoY. SLA breach risk increases.",
    outcome: "Reduce average processing time to <4 hours. Error rate below 1%. Cost per document below £4.",
    primaryObj: "Cost reduction", primaryPrinciple: "IMPROVE", secondary: ["PROTECT","EMPOWER"],
  },
  aiFit: {
    deterministic: "No", rules: "No", prediction: "Yes", unstructured: "Yes", generation: "Yes",
    semantic: "Yes", classification: "Yes", reasoning: "Yes", autonomous: "No", vision: "Yes",
    human: "Yes", workflow: "No",
  },
  requirements: {
    functional: [
      { id: "FR-001", desc: "Extract structured data fields from invoice PDFs and images", priority: "Must", owner: "James Patel", status: "Approved" },
      { id: "FR-002", desc: "Classify incoming documents by type (invoice, PO, onboarding pack)", priority: "Must", owner: "James Patel", status: "Approved" },
      { id: "FR-003", desc: "Route low-confidence extractions to human review queue", priority: "Must", owner: "Sarah Chen", status: "In Progress" },
      { id: "FR-004", desc: "Provide audit trail of every extraction decision", priority: "Must", owner: "Mark Hobbs", status: "In Progress" },
    ],
    nonFunctional: {
      expectedUsers: "20", concurrentUsers: "8", requestsPerSecond: "5", transactionsPerDay: "4,000",
      responseTarget: "≤5s per document", availabilityTarget: "99.5%", rto: "4 hours", rpo: "1 hour",
      dataResidency: "United Kingdom only", securityClassification: "Confidential",
      tokenBudget: "£5,000/month", maxLatency: "8s", maxFailureRate: "2%",
    },
  },
  dataReadiness: {
    structured: "Partially", personalData: "Yes", specialCategory: "No", confidential: "Yes",
    labelled: "Partially", enoughData: "Yes", copyright: "No", customerDataOk: "Yes",
    dataLeaveOrg: "No", dataLeaveRegion: "No", trainingProhibited: "Yes",
  },
  design: {
    pattern: "RAG",
    adrs: [
      { id: "ADR-001", title: "Managed LLM service vs self-hosted model", decision: "Managed service (Claude API)", status: "Approved" },
      { id: "ADR-002", title: "Vector database selection", decision: "TBD — evaluating 2 vendors", status: "In Progress" },
    ],
  },
  mlops: {
    stages: {
      Source: "Done", Data: "Done", Validate: "Done", "Train/Configure": "In Progress",
      Evaluate: "Not Started", Register: "Not Started", Approve: "Not Started",
      Deploy: "Not Started", Monitor: "Not Started", "Re-evaluate": "Not Started",
    },
    versions: {
      "System prompt": "v1.4", "Model": "claude-3-5-sonnet", "Embedding model": "TBD",
      "Knowledge base": "v0.9 (draft)", "Evaluation dataset": "v1.3", "Guardrails": "v1.0",
    },
  },
  deployment: {
    checklist: {
      "Functional tests passed": "No", "Evaluation thresholds passed": "No", "Security testing passed": "No",
      "Data protection review passed": "TBD", "Human oversight tested": "No", "Rollback tested": "No",
      "Provider failure tested": "No", "Monitoring configured": "TBD", "Logs retained": "Yes",
      "Model versions recorded": "Yes", "Kill switch available": "No", "Support teams ready": "TBD",
      "Incident process documented": "TBD", "Business owner accepted residual risk": "No",
    },
  },
  gates: {
    G0: "Approved", G1: "Approved", G2: "In Progress", G3: "Evidence Required",
    G4: "Not Started", G5: "Not Started", G6: "Not Started", G7: "Not Started",
  },
};

// ════════════════════════════════════════════════════════════════════════
// STORAGE HOOK
// ════════════════════════════════════════════════════════════════════════
export function useAppState() {
  const [state, setState] = useState(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage?.get(STORAGE_KEY, false);
        if (res && res.value) {
          const parsed = JSON.parse(res.value);
          setState(prev => ({ ...prev, ...parsed }));
        }
      } catch (e) {
        // no saved state yet — use defaults
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await window.storage?.set(STORAGE_KEY, JSON.stringify(state), false);
      } catch (e) { /* ignore */ }
    }, 500);
    return () => clearTimeout(saveTimer.current);
  }, [state, loaded]);

  const update = (section, patch) => {
    setState(prev => ({ ...prev, [section]: typeof patch === "function" ? patch(prev[section]) : { ...prev[section], ...patch } }));
  };

  const reset = async () => {
    try { await window.storage?.delete(STORAGE_KEY, false); } catch (e) {}
    setState(DEFAULT_STATE);
  };

  return { state, setState, update, reset, loaded };
}

// ════════════════════════════════════════════════════════════════════════
// COMPUTED SCORES
// ════════════════════════════════════════════════════════════════════════
function computeAIFitScore(a) {
  const yesGood = ["prediction","unstructured","generation","semantic","classification","reasoning","vision","human"];
  const noGood = ["deterministic","rules","autonomous","workflow"];
  let hit = 0, total = yesGood.length + noGood.length;
  yesGood.forEach(k => { if (a[k] === "Yes") hit++; });
  noGood.forEach(k => { if (a[k] === "No") hit++; });
  return Math.round(hit / total * 100);
}

function computeDataReadiness(d) {
  const vals = Object.values(d);
  const good = vals.filter(v => v === "Yes" || v === "No" || v === "Partially").length;
  const tbd = vals.filter(v => v === "TBD").length;
  return Math.max(0, Math.round(((vals.length - tbd) / vals.length) * 100));
}

function computeReadiness(state) {
  const gateWeights = { G0: 100, G1: 100, G2: 60, G3: 20, G4: 0, G5: 0, G6: 0, G7: 0 };
  const statusPct = { Approved: 100, "In Progress": 55, "Evidence Required": 30, "Not Started": 0, Blocked: 10 };
  const vals = Object.values(state.gates).map(g => statusPct[g] ?? 0);
  return Math.round(vals.reduce((a,b) => a+b, 0) / vals.length);
}

function computeDeploymentReadiness(checklist) {
  const vals = Object.values(checklist);
  const yes = vals.filter(v => v === "Yes").length;
  return Math.round(yes / vals.length * 100);
}

// ════════════════════════════════════════════════════════════════════════
// HOME SCREEN
// ════════════════════════════════════════════════════════════════════════
function HomeScreen({ state, setActive, setPhase }) {
  const overallReadiness = computeReadiness(state);
  const aiFitScore = computeAIFitScore(state.aiFit);
  const dataScore = computeDataReadiness(state.dataReadiness);
  const deployScore = computeDeploymentReadiness(state.deployment.checklist);

  const meta = [
    ["Use Case", "Intelligent Document Processing"],
    ["Business Owner", "Sarah Chen – Head of Operations"],
    ["Technical Owner", "James Patel – AI Engineering Lead"],
    ["Risk Owner", "Mark Hobbs – Chief Risk Officer"],
    ["Department", "Operations & Customer Services"],
    ["Current Stage", "Design / Technology Selection"],
    ["Overall Readiness", `${overallReadiness}%`],
    ["AI Risk Level", "Moderate"],
  ];

  const gateEntries = Object.entries(state.gates);
  const gateNames = { G0: "Problem & AI Suitability", G1: "Data Readiness", G2: "Architecture", G3: "Model Evaluation",
    G4: "Responsible AI", G5: "Production Readiness", G6: "Production Release", G7: "Post-Deployment Review" };
  const gateOwners = { G0: "Business Owner", G1: "Data Owner · Privacy", G2: "EA · AI Arch · Sec Arch", G3: "AI Eng · Business",
    G4: "AI WG · DPO · Legal", G5: "Eng · Ops · Security", G6: "Named Approver", G7: "Business · Risk · Ops" };

  const pillars = [
    { name: "PROTECT", desc: "Risk, security, privacy, compliance, resilience", active: true },
    { name: "IMPROVE", desc: "Efficiency, accuracy, reduced operational friction", active: true },
    { name: "EMPOWER", desc: "Human augmentation, access to information", active: true },
    { name: "INNOVATE", desc: "New capabilities and controlled experimentation", active: false },
  ];

  return (
    <div>
      <SectionTitle
        children="AI System Design & Adoption"
        sub="Module within the Citation AI Strategy Platform · Intelligent Document Processing"
        right={<div style={{ display: "flex", gap: 8 }}>{["PROTECT","IMPROVE","EMPOWER"].map(p => <PrinciplePill key={p} name={p} />)}</div>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
        {pillars.map(p => (
          <Card key={p.name} highlight={p.active ? PILL[p.name].border : C.border} style={{ opacity: p.active ? 1 : 0.5 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: PILL[p.name].text, marginBottom: 4 }}>{p.name}</div>
            <div style={{ fontSize: 12, color: C.textDim }}>{p.desc}</div>
            {p.active && <div style={{ marginTop: 8, fontSize: 10, color: PILL[p.name].text }}>● Active for this use case</div>}
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 14 }}>Use Case Overview</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
              {meta.map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: 10, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.06em" }}>{k}</div>
                  <div style={{ fontSize: 13, color: k === "Overall Readiness" ? C.accent : k === "AI Risk Level" ? C.amber : C.text, marginTop: 2, fontWeight: k.includes("Readiness") ? 700 : 400 }}>{v}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 14 }}>Governance Gates</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {gateEntries.map(([id, status]) => (
                <button key={id} onClick={() => setActive("governance")} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", borderRadius: 6,
                  background: status === "In Progress" ? "#0A2040" : "transparent",
                  border: `1px solid ${status === "Approved" ? C.border : status === "In Progress" ? C.accent + "60" : C.border}`,
                  cursor: "pointer", textAlign: "left", width: "100%",
                }}>
                  <span style={{ fontSize: 11, color: C.textDim, width: 20, flexShrink: 0 }}>{id}</span>
                  <span style={{ flex: 1, fontSize: 13, color: C.text }}>{gateNames[id]}</span>
                  <span style={{ fontSize: 11, color: C.textDim }}>{gateOwners[id]}</span>
                  <StatusBadge status={status} />
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card style={{ textAlign: "center" }}>
            <div style={{ fontSize: 12, color: C.textDim, marginBottom: 12 }}>Overall Readiness</div>
            <div style={{ display: "flex", justifyContent: "center" }}><Ring pct={overallReadiness} size={90} stroke={8} color={C.accent} /></div>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                ["AI Fit Score", aiFitScore, C.teal, "ai-fit"],
                ["Data Readiness", dataScore, C.accentL, "data"],
                ["Deployment Readiness", deployScore, C.amber, "deploy"],
              ].map(([label, pct, color, screen]) => (
                <button key={label} onClick={() => setActive(screen)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, width: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.textDim, marginBottom: 2 }}>
                    <span>{label}</span><span style={{ color }}>{pct}%</span>
                  </div>
                  <Bar pct={pct} color={color} />
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <div style={{ fontSize: 12, color: C.textDim, marginBottom: 10 }}>Requirements Summary</div>
            {[
              ["Functional requirements", state.requirements.functional.length],
              ["Approved", state.requirements.functional.filter(r => r.status === "Approved").length],
              ["ADRs recorded", state.design.adrs.length],
              ["MLOps stages complete", Object.values(state.mlops.stages).filter(s => s === "Done").length + " / " + Object.keys(state.mlops.stages).length],
            ].map(([label, val]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>
                <span style={{ color: C.textDim }}>{label}</span>
                <span style={{ color: C.text, fontWeight: 600 }}>{val}</span>
              </div>
            ))}
          </Card>

          <Card>
            <div style={{ fontSize: 12, color: C.textDim, marginBottom: 10 }}>Quick Actions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <Btn onClick={() => setActive("requirements")} style={{ width: "100%" }}>Add a requirement</Btn>
              <Btn onClick={() => setActive("evaluation")} style={{ width: "100%" }}>Review evaluation results</Btn>
              <Btn onClick={() => setActive("deploy")} style={{ width: "100%" }}>Check production readiness</Btn>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// DISCOVER SCREEN
// ════════════════════════════════════════════════════════════════════════
function DiscoverScreen({ state, update }) {
  const d = state.discover;
  const set = (k, v) => update("discover", { [k]: v });
  const objectives = ["Revenue growth","Cost reduction","Productivity","Automation","Customer experience","Risk reduction","Quality","Compliance","Faster decisions","Innovation","New products","New markets"];

  const toggleSecondary = (p) => {
    const cur = d.secondary || [];
    update("discover", { secondary: cur.includes(p) ? cur.filter(x => x !== p) : [...cur, p] });
  };

  return (
    <div>
      <SectionTitle children="Discover the Business Problem" sub="Understand what problem needs solving before considering AI solutions. All fields save automatically." />
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {[
          ["What business problem are you solving?", "problem", 3],
          ["Who experiences the problem?", "who", 2],
          ["What is the current process?", "process", 3],
          ["What causes delay, cost, error or risk?", "causes", 2],
          ["How frequently does the problem occur?", "frequency", 1],
          ["Users, transactions or cases involved?", "volume", 1],
          ["Current baseline (cost, time, error rate)?", "baseline", 1],
          ["What happens if nothing changes?", "doNothing", 2],
          ["What measurable outcome is required?", "outcome", 2],
        ].map(([label, key, rows]) => (
          <Card key={key}>
            <label style={{ display: "block", fontSize: 12, color: C.textDim, marginBottom: 6 }}>{label}</label>
            <Input as="textarea" rows={rows} value={d[key]} onChange={v => set(key, v)} />
          </Card>
        ))}

        <Card>
          <div style={{ fontSize: 12, color: C.textDim, marginBottom: 10 }}>Primary Objective</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {objectives.map(o => <Btn key={o} active={d.primaryObj === o} onClick={() => set("primaryObj", o)}>{o}</Btn>)}
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: 12, color: C.textDim, marginBottom: 10 }}>Strategic Principles</div>
          <div style={{ fontSize: 11, color: C.textDim, marginBottom: 8 }}>Primary driver</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            {["PROTECT","IMPROVE","EMPOWER","INNOVATE"].map(p => (
              <button key={p} onClick={() => set("primaryPrinciple", p)} style={{
                background: d.primaryPrinciple === p ? PILL[p].bg : "transparent",
                border: `2px solid ${d.primaryPrinciple === p ? PILL[p].border : C.border}`,
                color: d.primaryPrinciple === p ? PILL[p].text : C.textDim,
                borderRadius: 6, padding: "8px 18px", fontSize: 12, fontWeight: 700, cursor: "pointer",
              }}>{p}</button>
            ))}
          </div>
          <div style={{ fontSize: 11, color: C.textDim, marginBottom: 8 }}>Secondary principles</div>
          <div style={{ display: "flex", gap: 8 }}>
            {["PROTECT","IMPROVE","EMPOWER","INNOVATE"].filter(p => p !== d.primaryPrinciple).map(p => (
              <button key={p} onClick={() => toggleSecondary(p)} style={{
                background: (d.secondary||[]).includes(p) ? PILL[p].bg : "transparent",
                border: `1px solid ${(d.secondary||[]).includes(p) ? PILL[p].border : C.border}`,
                color: (d.secondary||[]).includes(p) ? PILL[p].text : C.textDim,
                borderRadius: 6, padding: "6px 16px", fontSize: 12, cursor: "pointer",
              }}>{p}</button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// AI FIT SCREEN
// ════════════════════════════════════════════════════════════════════════
const AI_FIT_QUESTIONS = [
  { key: "deterministic", q: "Is the task deterministic (same input → same output always)?" },
  { key: "rules", q: "Would rule-based software solve the problem entirely?" },
  { key: "prediction", q: "Does it require prediction from historical data?" },
  { key: "unstructured", q: "Does it involve understanding unstructured information?" },
  { key: "generation", q: "Does it require generating new content?" },
  { key: "semantic", q: "Does it require semantic search?" },
  { key: "classification", q: "Does it require classification?" },
  { key: "reasoning", q: "Does it require reasoning across multiple systems?" },
  { key: "autonomous", q: "Does it require autonomous actions without human approval?" },
  { key: "vision", q: "Does it require computer vision?" },
  { key: "human", q: "Does it require meaningful human oversight?" },
  { key: "workflow", q: "Could workflow automation alone solve this without AI?" },
];

function AIFitScreen({ state, update }) {
  const a = state.aiFit;
  const score = computeAIFitScore(a);

  const patterns = score >= 70
    ? { rec: "RAG + Document Intelligence", desc: "Retrieval-augmented generation with multimodal document ingestion, structured extraction, and human-in-the-loop validation.", alts: [["LLM API Integration","High"],["Traditional ML (extraction)","Medium"],["Rules + Workflow","Low"],["Agentic AI","Not Justified"]] }
    : score >= 40
    ? { rec: "Traditional ML / Hybrid", desc: "A narrower ML or hybrid rules+ML approach may be sufficient given the current answers.", alts: [["Rules + Workflow","Medium"],["Traditional ML","High"],["RAG","Medium"],["Agentic AI","Not Justified"]] }
    : { rec: "No AI Required", desc: "Based on current answers, deterministic rules or workflow automation may solve this without AI.", alts: [["Rules + Workflow","High"],["Traditional ML","Low"],["RAG","Not Justified"],["Agentic AI","Not Justified"]] };

  return (
    <div>
      <SectionTitle children="AI Suitability Assessment" sub="Determine whether AI is the right solution before selecting a model." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 14 }}>Suitability Questions</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {AI_FIT_QUESTIONS.map(({ key, q }) => (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", borderRadius: 6, background: C.navyMid }}>
                <span style={{ flex: 1, fontSize: 13, color: C.text }}>{q}</span>
                <TriToggle value={a[key]} onChange={v => update("aiFit", { [key]: v })} />
              </div>
            ))}
          </div>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card style={{ textAlign: "center" }}>
            <div style={{ fontSize: 12, color: C.textDim, marginBottom: 12 }}>AI Fit Score</div>
            <Ring pct={score} size={90} stroke={8} color={C.teal} />
            <div style={{ marginTop: 12, fontSize: 12, color: C.teal, fontWeight: 700 }}>
              {score >= 70 ? "Strong AI Fit" : score >= 40 ? "Moderate AI Fit" : "Weak AI Fit"}
            </div>
          </Card>

          <Card highlight={C.teal + "80"}>
            <div style={{ fontSize: 11, color: C.teal, fontWeight: 700, marginBottom: 8 }}>RECOMMENDED PATTERN</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 8 }}>{patterns.rec}</div>
            <div style={{ fontSize: 12, color: C.textDim }}>{patterns.desc}</div>
          </Card>

          <Card>
            <div style={{ fontSize: 12, color: C.textDim, marginBottom: 10 }}>Alternative Patterns</div>
            {patterns.alts.map(([name, fit]) => (
              <div key={name} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 12, borderBottom: `1px solid ${C.border}` }}>
                <span style={{ color: C.text }}>{name}</span>
                <span style={{ color: fit === "High" ? C.teal : fit === "Medium" ? C.amber : fit === "Low" ? C.textDim : C.red, fontSize: 11 }}>{fit}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// REQUIREMENTS SCREEN
// ════════════════════════════════════════════════════════════════════════
function RequirementsScreen({ state, update }) {
  const [tab, setTab] = useState("functional");
  const r = state.requirements;
  const [newReq, setNewReq] = useState({ desc: "", priority: "Must", owner: "" });

  const addReq = () => {
    if (!newReq.desc.trim()) return;
    const nextId = `FR-${String(r.functional.length + 1).padStart(3, "0")}`;
    update("requirements", {
      functional: [...r.functional, { id: nextId, desc: newReq.desc, priority: newReq.priority, owner: newReq.owner || "Unassigned", status: "Not Started" }],
    });
    setNewReq({ desc: "", priority: "Must", owner: "" });
  };

  const removeReq = (id) => update("requirements", { functional: r.functional.filter(x => x.id !== id) });
  const cycleStatus = (id) => {
    const order = ["Not Started","In Progress","Review Required","Approved"];
    update("requirements", { functional: r.functional.map(x => x.id === id ? { ...x, status: order[(order.indexOf(x.status)+1) % order.length] } : x) });
  };

  const nfr = r.nonFunctional;
  const setNfr = (k, v) => update("requirements", { nonFunctional: { ...nfr, [k]: v } });

  const nfrFields = [
    ["expectedUsers","Expected users"], ["concurrentUsers","Concurrent users"], ["requestsPerSecond","Requests / second"],
    ["transactionsPerDay","Transactions / day"], ["responseTarget","Response-time target"], ["availabilityTarget","Availability target"],
    ["rto","Recovery Time Objective"], ["rpo","Recovery Point Objective"], ["dataResidency","Data residency"],
    ["securityClassification","Security classification"], ["tokenBudget","Token budget"], ["maxLatency","Max model latency"],
    ["maxFailureRate","Max acceptable failure rate"],
  ];

  const completion = Math.round(r.functional.filter(x => x.status === "Approved").length / Math.max(r.functional.length,1) * 100);

  return (
    <div>
      <SectionTitle children="Requirements Collection" sub="Functional and non-functional requirements. Architecture cannot be generated without these being identified." />

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <Btn active={tab === "functional"} onClick={() => setTab("functional")}>Functional Requirements</Btn>
        <Btn active={tab === "nonfunctional"} onClick={() => setTab("nonfunctional")}>Non-Functional Requirements</Btn>
      </div>

      {tab === "functional" && (
        <div>
          <Card style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: C.textDim }}>Approval Progress</div>
              <div style={{ fontSize: 12, color: C.teal, fontWeight: 700 }}>{completion}%</div>
            </div>
            <Bar pct={completion} color={C.teal} />
          </Card>

          <Card style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 10 }}>Add Requirement</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 160px auto", gap: 8 }}>
              <Input value={newReq.desc} onChange={v => setNewReq({ ...newReq, desc: v })} placeholder="Requirement description" />
              <Select value={newReq.priority} onChange={v => setNewReq({ ...newReq, priority: v })} options={["Must","Should","Could","Won't"]} />
              <Input value={newReq.owner} onChange={v => setNewReq({ ...newReq, owner: v })} placeholder="Owner" />
              <Btn onClick={addReq} variant="success" active>Add</Btn>
            </div>
          </Card>

          <Card>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr>{["ID","Description","Priority","Owner","Status",""].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 10px", color: C.textDim, borderBottom: `1px solid ${C.border}`, fontWeight: 600 }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {r.functional.map((req, i) => (
                  <tr key={req.id} style={{ background: i % 2 === 0 ? C.card : C.navyMid }}>
                    <td style={{ padding: "7px 10px", color: C.textDim, fontWeight: 600 }}>{req.id}</td>
                    <td style={{ padding: "7px 10px", color: C.text }}>{req.desc}</td>
                    <td style={{ padding: "7px 10px" }}><Tag label={req.priority} color={req.priority === "Must" ? C.red : req.priority === "Should" ? C.amber : C.textDim} /></td>
                    <td style={{ padding: "7px 10px", color: C.textDim }}>{req.owner}</td>
                    <td style={{ padding: "7px 10px" }}>
                      <button onClick={() => cycleStatus(req.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                        <StatusBadge status={req.status} />
                      </button>
                    </td>
                    <td style={{ padding: "7px 10px" }}>
                      <button onClick={() => removeReq(req.id)} style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 14 }}>✕</button>
                    </td>
                  </tr>
                ))}
                {r.functional.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: 20, textAlign: "center", color: C.textDim }}>No requirements yet — add one above.</td></tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {tab === "nonfunctional" && (
        <Card>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 20px" }}>
            {nfrFields.map(([key, label]) => (
              <div key={key}>
                <label style={{ display: "block", fontSize: 11, color: C.textDim, marginBottom: 4 }}>{label}</label>
                <Input value={nfr[key] || ""} onChange={v => setNfr(key, v)} />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// DATA READINESS SCREEN
// ════════════════════════════════════════════════════════════════════════
const DATA_QUESTIONS = [
  { key: "structured", q: "Is the data structured or unstructured?", opts: ["Structured","Unstructured","Partially"] },
  { key: "personalData", q: "Does personal data exist in this dataset?", opts: ["Yes","No","TBD"] },
  { key: "specialCategory", q: "Does special-category data exist?", opts: ["Yes","No","TBD"] },
  { key: "confidential", q: "Does confidential business information exist?", opts: ["Yes","No","TBD"] },
  { key: "labelled", q: "Does labelled data exist for evaluation?", opts: ["Yes","No","Partially"] },
  { key: "enoughData", q: "Is there enough data for model evaluation?", opts: ["Yes","No","TBD"] },
  { key: "copyright", q: "Are copyright or licensing restrictions present?", opts: ["Yes","No","TBD"] },
  { key: "customerDataOk", q: "Is customer information permitted for this use?", opts: ["Yes","No","TBD"] },
  { key: "dataLeaveOrg", q: "Is data allowed to leave the organisation?", opts: ["Yes","No","TBD"] },
  { key: "dataLeaveRegion", q: "Is data permitted to leave the geographic region?", opts: ["Yes","No","TBD"] },
  { key: "trainingProhibited", q: "Is provider training on organisational data prohibited?", opts: ["Yes","No","TBD"] },
];

function DataReadinessScreen({ state, update }) {
  const d = state.dataReadiness;
  const score = computeDataReadiness(d);

  const risks = [];
  if (d.personalData === "Yes") risks.push("Personal data present — DPIA required before Gate 1 approval.");
  if (d.specialCategory === "Yes") risks.push("Special-category data present — enhanced controls and legal basis required.");
  if (d.dataLeaveOrg === "Yes") risks.push("Data leaving the organisation increases third-party risk exposure.");
  if (d.copyright === "Yes") risks.push("Copyright/licensing restrictions may limit use of source material.");
  if (d.enoughData === "No") risks.push("Insufficient data volume for robust model evaluation.");
  if (risks.length === 0) risks.push("No material data risks identified from current answers.");

  return (
    <div>
      <SectionTitle children="Data Readiness Assessment" sub="Understand what data exists and what constraints apply before architecture is finalised." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 14 }}>Data Questions</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {DATA_QUESTIONS.map(({ key, q, opts }) => (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", borderRadius: 6, background: C.navyMid }}>
                <span style={{ flex: 1, fontSize: 13, color: C.text }}>{q}</span>
                <TriToggle value={d[key]} onChange={v => update("dataReadiness", { [key]: v })} options={opts} />
              </div>
            ))}
          </div>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card style={{ textAlign: "center" }}>
            <div style={{ fontSize: 12, color: C.textDim, marginBottom: 12 }}>Data Readiness Score</div>
            <Ring pct={score} size={90} stroke={8} color={C.accentL} />
            <div style={{ marginTop: 8, fontSize: 11, color: C.textDim }}>Higher score = fewer open TBD items</div>
          </Card>

          <Card highlight={C.amber + "60"}>
            <div style={{ fontSize: 11, color: C.amber, fontWeight: 700, marginBottom: 8 }}>DATA PROTECTION RISKS</div>
            {risks.map((r, i) => <div key={i} style={{ fontSize: 12, color: C.textDim, padding: "4px 0", borderBottom: i < risks.length - 1 ? `1px solid ${C.border}` : "none" }}>⚠ {r}</div>)}
          </Card>

          <Card>
            <div style={{ fontSize: 12, color: C.textDim, marginBottom: 10 }}>Recommended Data Architecture</div>
            <div style={{ fontSize: 13, color: C.text }}>
              {d.dataLeaveOrg === "No" && d.dataLeaveRegion === "No"
                ? "UK-hosted private tenancy with no cross-border data transfer. Vector store and document storage co-located with LLM inference endpoint."
                : "Cross-border transfer requires a data processing agreement and transfer impact assessment before proceeding."}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// SYSTEM DESIGN SCREEN
// ════════════════════════════════════════════════════════════════════════
const PATTERNS = ["RAG","LLM API Integration","Private Hosted Foundation Model","Multi-Agent Architecture","Traditional Predictive ML","Copilot","Document Intelligence"];

function ArchitectureDiagram({ pattern }) {
  // simplified illustrative SVG per pattern
  const shapes = {
    "RAG": (
      <>
        <rect x="20" y="30" width="90" height="40" rx="4" fill="none" stroke={C.accentL} strokeWidth="1.5" />
        <text x="65" y="54" fill={C.text} fontSize="10" textAnchor="middle">User Query</text>
        <line x1="110" y1="50" x2="170" y2="50" stroke={C.textDim} strokeWidth="1" markerEnd="url(#arrow)" />
        <rect x="170" y="30" width="100" height="40" rx="4" fill="none" stroke={C.teal} strokeWidth="1.5" />
        <text x="220" y="47" fill={C.text} fontSize="9" textAnchor="middle">Retrieval</text>
        <text x="220" y="59" fill={C.textDim} fontSize="8" textAnchor="middle">Service</text>
        <line x1="220" y1="70" x2="220" y2="105" stroke={C.textDim} strokeWidth="1" markerEnd="url(#arrow)" />
        <ellipse cx="220" cy="125" rx="45" ry="18" fill="none" stroke={C.amber} strokeWidth="1.5" />
        <text x="220" y="129" fill={C.text} fontSize="9" textAnchor="middle">Vector DB</text>
        <line x1="270" y1="50" x2="330" y2="50" stroke={C.textDim} strokeWidth="1" markerEnd="url(#arrow)" />
        <rect x="330" y="20" width="110" height="60" rx="4" fill="none" stroke={C.accent} strokeWidth="1.5" />
        <text x="385" y="45" fill={C.text} fontSize="9" textAnchor="middle">LLM</text>
        <text x="385" y="58" fill={C.textDim} fontSize="8" textAnchor="middle">Claude 3.5 Sonnet</text>
        <line x1="330" y1="140" x2="270" y2="110" stroke={C.border} strokeWidth="1" strokeDasharray="3,3" />
        <rect x="180" y="140" width="150" height="35" rx="16" fill="none" stroke={C.steel} strokeWidth="1.5" />
        <text x="255" y="162" fill={C.textDim} fontSize="8" textAnchor="middle">H — Human Review Gate</text>
      </>
    ),
    "LLM API Integration": (
      <>
        <rect x="20" y="60" width="100" height="40" rx="4" fill="none" stroke={C.accentL} strokeWidth="1.5" />
        <text x="70" y="84" fill={C.text} fontSize="9" textAnchor="middle">Application</text>
        <line x1="120" y1="80" x2="200" y2="80" stroke={C.textDim} strokeWidth="1" markerEnd="url(#arrow)" />
        <path d="M 300 60 a 40 20 0 1 0 0.01 0 z" fill="none" stroke={C.textDim} strokeWidth="1.5" />
        <text x="300" y="84" fill={C.textDim} fontSize="8" textAnchor="middle">Public API</text>
        <rect x="200" y="60" width="90" height="40" rx="4" fill="none" stroke={C.accent} strokeWidth="1.5" />
        <text x="245" y="84" fill={C.text} fontSize="9" textAnchor="middle">LLM API</text>
      </>
    ),
    "Private Hosted Foundation Model": (
      <>
        <rect x="20" y="60" width="100" height="40" rx="4" fill="none" stroke={C.accentL} strokeWidth="1.5" />
        <text x="70" y="84" fill={C.text} fontSize="9" textAnchor="middle">Application</text>
        <line x1="120" y1="80" x2="200" y2="80" stroke={C.textDim} strokeWidth="1" markerEnd="url(#arrow)" />
        <rect x="200" y="50" width="120" height="60" rx="4" fill="none" stroke={C.amber} strokeWidth="1.5" />
        <text x="260" y="78" fill={C.text} fontSize="9" textAnchor="middle">Private VPC</text>
        <text x="260" y="92" fill={C.textDim} fontSize="8" textAnchor="middle">Hosted Model</text>
      </>
    ),
    "Multi-Agent Architecture": (
      <>
        <rect x="20" y="70" width="80" height="30" rx="4" fill="none" stroke={C.accentL} strokeWidth="1.5" />
        <text x="60" y="89" fill={C.text} fontSize="8" textAnchor="middle">Orchestrator</text>
        <rect x="150" y="20" width="70" height="30" rx="4" fill="none" stroke={C.teal} strokeWidth="1.5" />
        <text x="185" y="39" fill={C.text} fontSize="8" textAnchor="middle">Agent A</text>
        <rect x="150" y="70" width="70" height="30" rx="4" fill="none" stroke={C.teal} strokeWidth="1.5" />
        <text x="185" y="89" fill={C.text} fontSize="8" textAnchor="middle">Agent B</text>
        <rect x="150" y="120" width="70" height="30" rx="4" fill="none" stroke={C.teal} strokeWidth="1.5" />
        <text x="185" y="139" fill={C.text} fontSize="8" textAnchor="middle">Agent C</text>
        <line x1="100" y1="85" x2="150" y2="35" stroke={C.textDim} strokeWidth="1" markerEnd="url(#arrow)" />
        <line x1="100" y1="85" x2="150" y2="85" stroke={C.textDim} strokeWidth="1" markerEnd="url(#arrow)" />
        <line x1="100" y1="85" x2="150" y2="135" stroke={C.textDim} strokeWidth="1" markerEnd="url(#arrow)" />
        <rect x="260" y="70" width="90" height="30" rx="16" fill="none" stroke={C.steel} strokeWidth="1.5" />
        <text x="305" y="89" fill={C.textDim} fontSize="8" textAnchor="middle">H — Approval</text>
      </>
    ),
  };
  const fallback = shapes["LLM API Integration"];
  return (
    <svg viewBox="0 0 460 190" style={{ width: "100%", height: 200 }}>
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill={C.textDim} /></marker>
      </defs>
      {shapes[pattern] || fallback}
    </svg>
  );
}

function SystemDesignScreen({ state, update }) {
  const d = state.design;
  const [newAdr, setNewAdr] = useState({ title: "", decision: "" });

  const addAdr = () => {
    if (!newAdr.title.trim()) return;
    const id = `ADR-${String(d.adrs.length + 1).padStart(3, "0")}`;
    update("design", { adrs: [...d.adrs, { id, title: newAdr.title, decision: newAdr.decision || "TBD", status: "In Progress" }] });
    setNewAdr({ title: "", decision: "" });
  };

  const cycleAdrStatus = (id) => {
    const order = ["In Progress","Review Required","Approved"];
    update("design", { adrs: d.adrs.map(a => a.id === id ? { ...a, status: order[(order.indexOf(a.status)+1) % order.length] } : a) });
  };

  const bottlenecks = [
    { name: "LLM API throughput", prob: "Medium", impact: "High", mitigation: "Rate limit queueing + retry with backoff" },
    { name: "Vector search latency", prob: "Low", impact: "Medium", mitigation: "Approximate nearest-neighbour index tuning" },
    { name: "Context-window growth", prob: "Medium", impact: "Medium", mitigation: "Chunking strategy + summarisation of long documents" },
    { name: "Human approval queue depth", prob: "High", impact: "Medium", mitigation: "Confidence-based routing to reduce review volume" },
  ];

  return (
    <div>
      <SectionTitle children="System Design Workspace" sub="Select an architecture pattern, record decisions, and track known bottlenecks." />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Card>
          <div style={{ fontSize: 12, color: C.textDim, marginBottom: 10 }}>AI Solution Pattern</div>
          <Select value={d.pattern} onChange={v => update("design", { pattern: v })} options={PATTERNS} />
          <div style={{ marginTop: 14 }}>
            <ArchitectureDiagram pattern={d.pattern} />
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: 12, color: C.textDim, marginBottom: 10 }}>Bottleneck Analysis</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead><tr>{["Bottleneck","Prob.","Impact","Mitigation"].map(h => <th key={h} style={{ textAlign: "left", padding: "5px 8px", color: C.textDim, borderBottom: `1px solid ${C.border}` }}>{h}</th>)}</tr></thead>
            <tbody>
              {bottlenecks.map(b => (
                <tr key={b.name}>
                  <td style={{ padding: "6px 8px", color: C.text, borderBottom: `1px solid ${C.border}` }}>{b.name}</td>
                  <td style={{ padding: "6px 8px", color: b.prob === "High" ? C.red : b.prob === "Medium" ? C.amber : C.textDim, borderBottom: `1px solid ${C.border}` }}>{b.prob}</td>
                  <td style={{ padding: "6px 8px", color: b.impact === "High" ? C.red : C.amber, borderBottom: `1px solid ${C.border}` }}>{b.impact}</td>
                  <td style={{ padding: "6px 8px", color: C.textDim, borderBottom: `1px solid ${C.border}`, fontSize: 10 }}>{b.mitigation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <Card>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>Architecture Decision Records</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8, marginBottom: 14 }}>
          <Input value={newAdr.title} onChange={v => setNewAdr({ ...newAdr, title: v })} placeholder="Decision title" />
          <Input value={newAdr.decision} onChange={v => setNewAdr({ ...newAdr, decision: v })} placeholder="Recommendation / decision" />
          <Btn onClick={addAdr} variant="success" active>Add ADR</Btn>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {d.adrs.map(a => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: C.navyMid, borderRadius: 6 }}>
              <span style={{ fontSize: 11, color: C.accentL, fontWeight: 700, width: 60 }}>{a.id}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: C.text }}>{a.title}</div>
                <div style={{ fontSize: 11, color: C.textDim }}>{a.decision}</div>
              </div>
              <button onClick={() => cycleAdrStatus(a.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                <StatusBadge status={a.status} />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// EVALUATION LAB (as before, static evidence-based data)
// ════════════════════════════════════════════════════════════════════════
const LLM_METRICS = [
  { cat: "Quality", items: [
    { name: "Task completion", result: "91%", threshold: "≥88%", status: "pass" },
    { name: "Answer relevance", result: "88%", threshold: "≥85%", status: "pass" },
    { name: "Correctness", result: "86%", threshold: "≥85%", status: "pass" },
    { name: "Groundedness", result: "89%", threshold: "≥90%", status: "watch" },
    { name: "Hallucination rate", result: "4.2%", threshold: "≤3%", status: "fail" },
  ]},
  { cat: "Safety", items: [
    { name: "Safety violations", result: "0", threshold: "0", status: "pass" },
    { name: "Bias score", result: "Low", threshold: "Low", status: "pass" },
    { name: "Privacy leakage", result: "None", threshold: "None", status: "pass" },
  ]},
  { cat: "Security", items: [
    { name: "Prompt injection resist.", result: "Pass", threshold: "Pass", status: "pass" },
    { name: "Jailbreak resistance", result: "Pass", threshold: "Pass", status: "pass" },
  ]},
  { cat: "Performance", items: [
    { name: "P95 latency", result: "3.8s", threshold: "≤5s", status: "pass" },
    { name: "Cost / request", result: "£0.004", threshold: "≤£0.01", status: "pass" },
  ]},
];

const RAG_METRICS = [
  { name: "Recall @ 5", layer: "Retrieval", result: "82%", threshold: "≥85%", status: "fail" },
  { name: "Precision @ 5", layer: "Retrieval", result: "76%", threshold: "≥80%", status: "fail" },
  { name: "Relevant doc retrieval", layer: "Retrieval", result: "88%", threshold: "≥85%", status: "pass" },
  { name: "Permissions enforcement", layer: "Retrieval", result: "Pass", threshold: "Pass", status: "pass" },
  { name: "Groundedness", layer: "Generation", result: "89%", threshold: "≥90%", status: "watch" },
  { name: "Faithfulness", layer: "Generation", result: "87%", threshold: "≥90%", status: "fail" },
  { name: "Citation correctness", layer: "Generation", result: "83%", threshold: "≥90%", status: "fail" },
  { name: "E2E task completion", layer: "End-to-End", result: "79%", threshold: "≥85%", status: "fail" },
  { name: "Business accuracy", layer: "End-to-End", result: "TBD", threshold: "≥90%", status: "tbd" },
];

const statusColor = { pass: C.green, fail: C.red, watch: C.amber, tbd: C.textDim };
const statusLabel = { pass: "PASS", fail: "FAIL", watch: "WATCH", tbd: "TBD" };

function EvaluationScreen() {
  const [tab, setTab] = useState("llm");
  const models = [
    { name: "GPT-4o", provider: "OpenAI", scores: { quality: 88, safety: 90, security: 78, latency: 72, cost: 60, dataRes: 65, overall: 79 } },
    { name: "Claude 3.5 S", provider: "Anthropic", scores: { quality: 91, safety: 95, security: 85, latency: 78, cost: 70, dataRes: 80, overall: 85 } },
    { name: "Gemini 1.5 P", provider: "Google", scores: { quality: 85, safety: 87, security: 76, latency: 80, cost: 75, dataRes: 60, overall: 78 } },
  ];

  return (
    <div>
      <SectionTitle children="Model Evaluation Lab" sub="Evidence-based model assessment against your use case — not reputation." />
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[["llm","LLM Evaluation"],["rag","RAG Evaluation"],["leaderboard","Model Leaderboard"]].map(([id, label]) => (
          <Btn key={id} active={tab === id} onClick={() => setTab(id)}>{label}</Btn>
        ))}
      </div>

      {tab === "llm" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {LLM_METRICS.map(cat => (
            <Card key={cat.cat}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.textDim, marginBottom: 10, textTransform: "uppercase" }}>{cat.cat}</div>
              {cat.items.map(m => (
                <div key={m.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
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
        </div>
      )}

      {tab === "rag" && (
        <Card>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead><tr>{["Metric","Layer","Result","Threshold","Status"].map(h => <th key={h} style={{ textAlign: "left", padding: "8px 10px", color: C.textDim, borderBottom: `1px solid ${C.border}` }}>{h}</th>)}</tr></thead>
            <tbody>
              {RAG_METRICS.map((m, i) => (
                <tr key={m.name} style={{ background: i % 2 === 0 ? C.card : C.navyMid }}>
                  <td style={{ padding: "7px 10px", color: C.text }}>{m.name}</td>
                  <td style={{ padding: "7px 10px" }}><span style={{ fontSize: 10, color: C.textDim, background: C.slate, borderRadius: 3, padding: "1px 6px" }}>{m.layer}</span></td>
                  <td style={{ padding: "7px 10px", color: statusColor[m.status], fontWeight: 600 }}>{m.result}</td>
                  <td style={{ padding: "7px 10px", color: C.textDim }}>{m.threshold}</td>
                  <td style={{ padding: "7px 10px" }}><Tag label={statusLabel[m.status]} color={statusColor[m.status]} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === "leaderboard" && (
        <Card>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "8px 12px", color: C.textDim, borderBottom: `1px solid ${C.border}` }}>Metric</th>
                {models.map(m => <th key={m.name} style={{ textAlign: "center", padding: "8px 12px", color: C.text, borderBottom: `1px solid ${C.border}` }}>{m.name}<br/><span style={{ fontSize: 10, color: C.textDim }}>{m.provider}</span></th>)}
              </tr>
            </thead>
            <tbody>
              {[["Business task quality","quality"],["Safety","safety"],["Security","security"],["Latency","latency"],["Cost","cost"],["Data residency","dataRes"]].map(([label, key]) => {
                const best = Math.max(...models.map(m => m.scores[key]));
                return (
                  <tr key={key}>
                    <td style={{ padding: "8px 12px", color: C.textDim, borderBottom: `1px solid ${C.border}` }}>{label}</td>
                    {models.map(m => (
                      <td key={m.name} style={{ textAlign: "center", padding: "8px 12px", borderBottom: `1px solid ${C.border}`, color: m.scores[key] === best ? C.green : C.text, fontWeight: m.scores[key] === best ? 700 : 400 }}>
                        {m.scores[key]}{m.scores[key] === best && <span style={{ fontSize: 10 }}> ★</span>}
                      </td>
                    ))}
                  </tr>
                );
              })}
              <tr>
                <td style={{ padding: "8px 12px", color: C.text, fontWeight: 700 }}>Overall Score</td>
                {models.map(m => (
                  <td key={m.name} style={{ textAlign: "center", padding: "8px 12px", color: m.scores.overall === Math.max(...models.map(x => x.scores.overall)) ? C.teal : C.text, fontWeight: 700, fontSize: 16 }}>
                    {m.scores.overall}
                    {m.scores.overall === Math.max(...models.map(x => x.scores.overall)) && <div style={{ fontSize: 9, color: C.teal }}>RECOMMENDED</div>}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// BUILD VS BUY
// ════════════════════════════════════════════════════════════════════════
function BuildBuyScreen() {
  const [factors, setFactors] = useState([
    { label: "Strategic differentiation", build: 4, buy: 2, hybrid: 3 },
    { label: "Time to value", build: 2, buy: 5, hybrid: 4 },
    { label: "Data sensitivity", build: 5, buy: 2, hybrid: 3 },
    { label: "Customisation", build: 5, buy: 2, hybrid: 4 },
    { label: "Internal skills", build: 3, buy: 5, hybrid: 4 },
    { label: "Total cost of ownership", build: 3, buy: 3, hybrid: 4 },
    { label: "Vendor dependency", build: 5, buy: 1, hybrid: 3 },
    { label: "Data residency", build: 5, buy: 2, hybrid: 4 },
    { label: "IP ownership", build: 5, buy: 1, hybrid: 3 },
  ]);

  const setScore = (i, key, val) => setFactors(prev => prev.map((f, idx) => idx === i ? { ...f, [key]: val } : f));

  const tot = (key) => factors.reduce((s, f) => s + f[key], 0);
  const max = factors.length * 5;
  const scores = { build: Math.round(tot("build")/max*100), buy: Math.round(tot("buy")/max*100), hybrid: Math.round(tot("hybrid")/max*100) };
  const winner = Object.entries(scores).sort((a,b) => b[1]-a[1])[0][0];
  const winnerLabel = { build: "BUILD", buy: "BUY", hybrid: "HYBRID" }[winner];

  return (
    <div>
      <SectionTitle children="Build vs Buy vs Hybrid" sub="Adjust scores (1–5) per factor. Weighted scoring with mandatory risk gates — score alone does not decide the outcome." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>
        <Card>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead><tr><th style={{ textAlign: "left", padding: "8px 12px", color: C.textDim, borderBottom: `1px solid ${C.border}` }}>Factor</th>{["Build","Buy","Hybrid"].map(h => <th key={h} style={{ textAlign: "center", padding: "8px 12px", color: C.text, borderBottom: `1px solid ${C.border}` }}>{h}</th>)}</tr></thead>
            <tbody>
              {factors.map((f, i) => (
                <tr key={f.label}>
                  <td style={{ padding: "6px 12px", color: C.textDim, borderBottom: `1px solid ${C.border}` }}>{f.label}</td>
                  {["build","buy","hybrid"].map(k => (
                    <td key={k} style={{ textAlign: "center", padding: "4px 8px", borderBottom: `1px solid ${C.border}` }}>
                      <input type="range" min="1" max="5" value={f[k]} onChange={e => setScore(i, k, Number(e.target.value))} style={{ width: 60 }} />
                      <div style={{ fontSize: 11, color: C.text }}>{f[k]}</div>
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td style={{ padding: "8px 12px", fontWeight: 700, color: C.text }}>Weighted Score</td>
                {["build","buy","hybrid"].map(k => <td key={k} style={{ textAlign: "center", padding: "8px 12px", fontWeight: 700, fontSize: 16, color: k === winner ? C.teal : C.text }}>{scores[k]}%</td>)}
              </tr>
            </tbody>
          </table>
        </Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card highlight={C.teal + "60"}>
            <div style={{ fontSize: 11, color: C.teal, fontWeight: 700, marginBottom: 8 }}>RECOMMENDATION</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{winnerLabel}</div>
            <div style={{ fontSize: 12, color: C.textDim, marginTop: 8 }}>Based on your current weighting of the factors above.</div>
          </Card>
          <Card>
            <div style={{ fontSize: 12, color: C.textDim, marginBottom: 10 }}>Score Summary</div>
            {Object.entries(scores).map(([k, s]) => (
              <div key={k} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                  <span style={{ color: k === winner ? C.teal : C.textDim, fontWeight: k === winner ? 700 : 400, textTransform: "capitalize" }}>{k}</span>
                  <span style={{ color: k === winner ? C.teal : C.textDim }}>{s}%</span>
                </div>
                <Bar pct={s} color={k === winner ? C.teal : C.steel} />
              </div>
            ))}
          </Card>
          <Card highlight={C.amber + "60"}>
            <div style={{ fontSize: 11, color: C.amber, fontWeight: 700, marginBottom: 8 }}>MANDATORY RISK GATES</div>
            <div style={{ fontSize: 12, color: C.textDim }}>Data residency requirements override scoring. Any vendor must confirm UK data processing. Training opt-out is mandatory.</div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// GOVERNANCE
// ════════════════════════════════════════════════════════════════════════
function GovernanceScreen({ state, update }) {
  const gates = state.gates;
  const gateNames = { G0: "Problem & AI Suitability", G1: "Data Readiness", G2: "Architecture", G3: "Model Evaluation",
    G4: "Responsible AI", G5: "Production Readiness", G6: "Production Release", G7: "Post-Deployment Review" };
  const order = ["Not Started","In Progress","Evidence Required","Review Required","Approved","Blocked"];
  const cycle = (id) => update("gates", { [id]: order[(order.indexOf(gates[id])+1) % order.length] });

  const frameworks = [
    { name: "NIST AI RMF 1.0", status: "In Progress", owner: "AI Eng" },
    { name: "NIST AI 600-1 (GenAI)", status: "Not Started", owner: "AI Eng" },
    { name: "ISO/IEC 42001:2023", status: "Not Started", owner: "CISO" },
    { name: "OWASP LLM Top 10", status: "In Progress", owner: "Security" },
    { name: "UK GDPR / ICO AI Toolkit", status: "In Progress", owner: "DPO" },
    { name: "EU AI Act (Aug 2026)", status: "Not Started", owner: "Legal" },
  ];

  const risks = [
    { id: "R-001", title: "Hallucination in document extraction", level: "High", control: "Human review gate on low-confidence outputs" },
    { id: "R-002", title: "Data residency breach", level: "High", control: "Vendor contractual commitment + DPA" },
    { id: "R-003", title: "Prompt injection via document content", level: "High", control: "Input sanitisation + output validation" },
    { id: "R-004", title: "Model output bias", level: "Moderate", control: "Fairness evaluation dataset + periodic audit" },
  ];
  const levelCol = { High: C.red, Moderate: C.amber, Low: C.textDim };

  return (
    <div>
      <SectionTitle children="Responsible AI & Governance" sub="Click any gate or framework status to update it." />
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 14 }}>Governance Gates</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Object.entries(gates).map(([id, status]) => (
              <div key={id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", borderRadius: 6, background: C.navyMid }}>
                <span style={{ fontSize: 11, color: C.textDim, width: 24 }}>{id}</span>
                <span style={{ flex: 1, fontSize: 13, color: C.text }}>{gateNames[id]}</span>
                <button onClick={() => cycle(id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  <StatusBadge status={status} />
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 14 }}>Framework Mapping</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead><tr>{["Framework","Status","Owner"].map(h => <th key={h} style={{ textAlign: "left", padding: "6px 12px", color: C.textDim, borderBottom: `1px solid ${C.border}` }}>{h}</th>)}</tr></thead>
            <tbody>
              {frameworks.map(f => (
                <tr key={f.name}>
                  <td style={{ padding: "7px 12px", color: C.text, borderBottom: `1px solid ${C.border}` }}>{f.name}</td>
                  <td style={{ padding: "7px 12px", borderBottom: `1px solid ${C.border}` }}><StatusBadge status={f.status} /></td>
                  <td style={{ padding: "7px 12px", color: C.textDim, borderBottom: `1px solid ${C.border}` }}>{f.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 14 }}>Risk Register</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead><tr>{["ID","Risk","Level","Control"].map(h => <th key={h} style={{ textAlign: "left", padding: "6px 12px", color: C.textDim, borderBottom: `1px solid ${C.border}` }}>{h}</th>)}</tr></thead>
            <tbody>
              {risks.map(r => (
                <tr key={r.id}>
                  <td style={{ padding: "7px 12px", color: C.textDim, borderBottom: `1px solid ${C.border}` }}>{r.id}</td>
                  <td style={{ padding: "7px 12px", color: C.text, borderBottom: `1px solid ${C.border}` }}>{r.title}</td>
                  <td style={{ padding: "7px 12px", borderBottom: `1px solid ${C.border}` }}><span style={{ color: levelCol[r.level], fontWeight: 700 }}>{r.level}</span></td>
                  <td style={{ padding: "7px 12px", color: C.textDim, borderBottom: `1px solid ${C.border}` }}>{r.control}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// MLOPS
// ════════════════════════════════════════════════════════════════════════
const MLOPS_STAGE_ORDER = ["Source","Data","Validate","Train/Configure","Evaluate","Register","Approve","Deploy","Monitor","Re-evaluate"];

function MLOpsScreen({ state, update }) {
  const m = state.mlops;
  const cycle = (stage) => {
    const order = ["Not Started","In Progress","Done"];
    update("mlops", { stages: { ...m.stages, [stage]: order[(order.indexOf(m.stages[stage])+1) % order.length] } });
  };
  const setVersion = (key, val) => update("mlops", { versions: { ...m.versions, [key]: val } });

  const stageColor = { "Not Started": C.textDim, "In Progress": C.accent, "Done": C.green };
  const doneCount = Object.values(m.stages).filter(s => s === "Done").length;

  return (
    <div>
      <SectionTitle children="MLOps / LLMOps / AgentOps" sub="Operational lifecycle. Click a stage to advance its status." />
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ fontSize: 12, color: C.textDim }}>Pipeline Progress</div>
          <div style={{ fontSize: 12, color: C.teal, fontWeight: 700 }}>{doneCount} / {MLOPS_STAGE_ORDER.length} stages complete</div>
        </div>
        <Bar pct={doneCount / MLOPS_STAGE_ORDER.length * 100} color={C.teal} />
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 4 }}>
          {MLOPS_STAGE_ORDER.map((stage, i) => (
            <div key={stage} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              <button onClick={() => cycle(stage)} style={{
                background: stageColor[m.stages[stage]] + "18", border: `1.5px solid ${stageColor[m.stages[stage]]}`,
                borderRadius: 8, padding: "10px 12px", textAlign: "center", cursor: "pointer", minWidth: 90,
              }}>
                <div style={{ fontSize: 11, color: C.text, fontWeight: 600 }}>{stage}</div>
                <div style={{ fontSize: 9, color: stageColor[m.stages[stage]], marginTop: 4, fontWeight: 700 }}>{m.stages[stage]}</div>
              </button>
              {i < MLOPS_STAGE_ORDER.length - 1 && <span style={{ color: C.border, margin: "0 4px" }}>→</span>}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 14 }}>Versioned Artifacts</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 20px" }}>
          {Object.entries(m.versions).map(([key, val]) => (
            <div key={key}>
              <label style={{ display: "block", fontSize: 11, color: C.textDim, marginBottom: 4 }}>{key}</label>
              <Input value={val} onChange={v => setVersion(key, v)} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// DEPLOYMENT
// ════════════════════════════════════════════════════════════════════════
function DeploymentScreen({ state, update }) {
  const dep = state.deployment;
  const readiness = computeDeploymentReadiness(dep.checklist);
  const blockers = Object.entries(dep.checklist).filter(([, v]) => v === "No");
  const setItem = (key, val) => update("deployment", { checklist: { ...dep.checklist, [key]: val } });

  return (
    <div>
      <SectionTitle children="Production Readiness Review" sub="All mandatory evidence must be present before production release." />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 14 }}>Readiness Checklist</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {Object.entries(dep.checklist).map(([key, val]) => (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", borderRadius: 6, background: C.navyMid }}>
                <span style={{ flex: 1, fontSize: 13, color: C.text }}>{key}</span>
                <TriToggle value={val} onChange={v => setItem(key, v)} />
              </div>
            ))}
          </div>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card style={{ textAlign: "center" }}>
            <div style={{ fontSize: 12, color: C.textDim, marginBottom: 12 }}>Production Readiness</div>
            <Ring pct={readiness} size={90} stroke={8} color={readiness === 100 ? C.green : C.amber} />
          </Card>

          {blockers.length > 0 ? (
            <Card highlight={C.red + "80"}>
              <div style={{ fontSize: 12, color: C.red, fontWeight: 800, marginBottom: 8 }}>⛔ BLOCK PRODUCTION RELEASE</div>
              <div style={{ fontSize: 12, color: C.textDim, marginBottom: 8 }}>{blockers.length} mandatory item{blockers.length !== 1 ? "s" : ""} not satisfied:</div>
              {blockers.map(([k]) => <div key={k} style={{ fontSize: 11, color: C.text, padding: "3px 0" }}>✗ {k}</div>)}
            </Card>
          ) : (
            <Card highlight={C.green + "80"}>
              <div style={{ fontSize: 12, color: C.green, fontWeight: 800 }}>✓ Ready for Gate 6 submission</div>
            </Card>
          )}

          <Card>
            <div style={{ fontSize: 12, color: C.textDim, marginBottom: 10 }}>Environments</div>
            {["Development","Test","Evaluation","Pre-production","Production"].map((env, i) => (
              <div key={env} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 12, borderBottom: `1px solid ${C.border}` }}>
                <span style={{ color: C.textDim }}>{env}</span>
                <span style={{ color: i < 3 ? C.green : C.textDim, fontSize: 11 }}>{i < 3 ? "Deployed" : "Pending"}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// MONITORING
// ════════════════════════════════════════════════════════════════════════
function MonitoringScreen() {
  const metrics = [
    { label: "Requests / day", val: "3,241", trend: "+2.4%", good: true },
    { label: "Task success rate", val: "91.2%", trend: "-0.3%", good: false },
    { label: "P95 Latency", val: "3.8s", trend: "+0.2s", good: false },
    { label: "Hallucination flags", val: "4.2%", trend: "-0.8%", good: true },
    { label: "Safety violations", val: "0", trend: "0", good: true },
    { label: "Cost / request", val: "£0.004", trend: "+£0.001", good: false },
    { label: "Human escalations", val: "284", trend: "+12", good: false },
    { label: "Provider uptime", val: "99.94%", trend: "—", good: true },
  ];

  return (
    <div>
      <SectionTitle children="Production Monitoring" sub="Technical metrics connected to business outcomes." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
        {metrics.map(m => (
          <Card key={m.label}>
            <div style={{ fontSize: 11, color: C.textDim, marginBottom: 6 }}>{m.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>{m.val}</div>
            <div style={{ fontSize: 11, color: m.good ? C.green : C.amber, marginTop: 4 }}>{m.trend}</div>
          </Card>
        ))}
      </div>
      <Card>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 14 }}>Business KPI Alignment</div>
        {[
          { kpi: "Processing time", baseline: "4.2 days", current: "6.2 hrs", target: "<4 hrs" },
          { kpi: "Error rate", baseline: "6.8%", current: "1.4%", target: "<1%" },
          { kpi: "Cost / doc", baseline: "£18.40", current: "£6.20", target: "<£4" },
        ].map(k => (
          <div key={k.kpi} style={{ padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 13, color: C.text, marginBottom: 4 }}>{k.kpi}</div>
            <div style={{ display: "flex", gap: 16, fontSize: 11 }}>
              <span style={{ color: C.textDim }}>Was: {k.baseline}</span>
              <span style={{ color: C.accentL }}>Now: {k.current}</span>
              <span style={{ color: C.green }}>Target: {k.target}</span>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// REPORTS
// ════════════════════════════════════════════════════════════════════════
function ReportsScreen({ state }) {
  const readiness = computeReadiness(state);
  const aiFitScore = computeAIFitScore(state.aiFit);
  const recommendation = readiness >= 80 ? "GO" : readiness >= 50 ? "GO WITH CONDITIONS" : "REWORK";
  const recColor = recommendation === "GO" ? C.green : recommendation === "GO WITH CONDITIONS" ? C.amber : C.red;

  return (
    <div>
      <SectionTitle children="Executive Decision" sub="Generated live from current assessment state." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>{["PROTECT","IMPROVE","EMPOWER"].map(p => <PrinciplePill key={p} name={p} size="md" />)}</div>
            {[
              ["Business Problem", state.discover.problem],
              ["Proposed Solution", `${state.design.pattern} architecture with human-in-the-loop validation.`],
              ["Why AI", `AI Fit Score: ${aiFitScore}%. Task involves unstructured document understanding beyond rule-based capability.`],
              ["Expected Business Outcome", state.discover.outcome],
            ].map(([k, v]) => (
              <div key={k} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: C.textDim, fontWeight: 700, marginBottom: 4, textTransform: "uppercase" }}>{k}</div>
                <div style={{ fontSize: 13, color: C.text }}>{v}</div>
              </div>
            ))}
          </Card>

          <Card>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 14 }}>Requirements &amp; Design Snapshot</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: C.textDim, marginBottom: 8 }}>REQUIREMENTS</div>
                {state.requirements.functional.map(r => <div key={r.id} style={{ fontSize: 12, color: C.textDim, padding: "4px 0", borderBottom: `1px solid ${C.border}` }}>{r.id}: {r.desc} <StatusBadge status={r.status} /></div>)}
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.textDim, marginBottom: 8 }}>ARCHITECTURE DECISIONS</div>
                {state.design.adrs.map(a => <div key={a.id} style={{ fontSize: 12, color: C.textDim, padding: "4px 0", borderBottom: `1px solid ${C.border}` }}>{a.id}: {a.title}</div>)}
              </div>
            </div>
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card style={{ textAlign: "center" }} highlight={recColor + "80"}>
            <div style={{ fontSize: 11, color: C.textDim, marginBottom: 8 }}>RECOMMENDATION</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: recColor }}>{recommendation}</div>
            <div style={{ fontSize: 11, color: C.textDim, marginTop: 10 }}>Based on {readiness}% overall gate readiness.</div>
          </Card>

          <Card>
            <div style={{ fontSize: 12, color: C.textDim, marginBottom: 10 }}>Gate Status</div>
            {Object.entries(state.gates).map(([id, status]) => (
              <div key={id} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 12, borderBottom: `1px solid ${C.border}` }}>
                <span style={{ color: C.textDim }}>{id}</span>
                <StatusBadge status={status} />
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// ROOT APP
// ════════════════════════════════════════════════════════════════════════
export default function App({ external } = {}) {
  const [active, setActive] = useState("home");
  const [phase, setPhase] = useState("design");
  const internal = useAppState();
  const { state, update, reset, loaded } = external || internal;
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const overallReadiness = computeReadiness(state);

  const screens = {
    home: <HomeScreen state={state} setActive={setActive} setPhase={setPhase} />,
    discover: <DiscoverScreen state={state} update={update} />,
    "ai-fit": <AIFitScreen state={state} update={update} />,
    requirements: <RequirementsScreen state={state} update={update} />,
    data: <DataReadinessScreen state={state} update={update} />,
    design: <SystemDesignScreen state={state} update={update} />,
    evaluation: <EvaluationScreen />,
    buildbuy: <BuildBuyScreen />,
    governance: <GovernanceScreen state={state} update={update} />,
    mlops: <MLOpsScreen state={state} update={update} />,
    deploy: <DeploymentScreen state={state} update={update} />,
    monitor: <MonitoringScreen />,
    reports: <ReportsScreen state={state} />,
  };

  if (!loaded) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: C.navy, color: C.textDim, fontFamily: "system-ui" }}>
        Loading workspace…
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.navy, color: C.text, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ width: 200, background: C.navyMid, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "20px 16px 16px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 10, color: C.textDim, letterSpacing: "0.12em", marginBottom: 2 }}>CITATION</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text, lineHeight: 1.2 }}>AI System<br/>Design &amp; Adoption</div>
        </div>
        <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setActive(n.id)} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 10px",
              borderRadius: 6, border: "none", background: active === n.id ? C.slate : "transparent",
              color: active === n.id ? C.text : C.textDim, fontSize: 13, cursor: "pointer", textAlign: "left",
              fontWeight: active === n.id ? 600 : 400,
            }}>
              <span style={{ fontSize: 14, opacity: 0.7 }}>{n.icon}</span>{n.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}` }}>
          {!showResetConfirm ? (
            <button onClick={() => setShowResetConfirm(true)} style={{ background: "none", border: "none", color: C.textDim, fontSize: 10, cursor: "pointer", padding: 0 }}>
              Reset demo data
            </button>
          ) : (
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => { reset(); setShowResetConfirm(false); }} style={{ background: "none", border: "none", color: C.red, fontSize: 10, cursor: "pointer", padding: 0, fontWeight: 700 }}>Confirm reset</button>
              <button onClick={() => setShowResetConfirm(false)} style={{ background: "none", border: "none", color: C.textDim, fontSize: 10, cursor: "pointer", padding: 0 }}>Cancel</button>
            </div>
          )}
          <div style={{ fontSize: 9, color: C.border, marginTop: 6 }}>v1.4 · Sep 2026 · Auto-saved</div>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ padding: "12px 24px", background: C.navyMid, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ flex: 1, display: "flex", gap: 0, overflowX: "auto", background: C.navy, borderRadius: 8, border: `1px solid ${C.border}`, padding: "6px 8px" }}>
            {PHASE_LIST.map((p, i) => (
              <button key={p} onClick={() => setPhase(p)} style={{
                display: "flex", alignItems: "center", gap: 6, background: phase === p ? C.slate : "transparent",
                border: "none", borderRadius: 6, padding: "6px 10px", cursor: "pointer",
                color: phase === p ? C.text : C.textDim, fontSize: 12, fontWeight: phase === p ? 700 : 400, whiteSpace: "nowrap",
              }}>
                <span style={{ fontSize: 10, opacity: 0.6 }}>{String(i+1).padStart(2,"0")}</span>{PHASE_NAMES[p]}
                {i < PHASE_LIST.length - 1 && <span style={{ color: C.border, marginLeft: 4 }}>›</span>}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: 12, flexShrink: 0 }}>
            <div><div style={{ fontSize: 10, color: C.textDim }}>Risk</div><div style={{ color: C.amber, fontWeight: 600 }}>Moderate</div></div>
            <div><div style={{ fontSize: 10, color: C.textDim }}>Readiness</div><div style={{ color: C.accent, fontWeight: 600 }}>{overallReadiness}%</div></div>
          </div>
        </div>
        <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>
          {screens[active]}
        </div>
      </div>
    </div>
  );
}
