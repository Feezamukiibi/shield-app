import { useState, useEffect, useRef } from "react";

// ─── Palette & Design Tokens ───────────────────────────────────────────────
const C = {
  pru: "#ED1B2E",     // Prudential red
  pruDark: "#A8121F",
  pruLight: "#FDECEA",
  gold: "#C8952A",
  goldLight: "#FBF3E0",
  navy: "#0A1628",
  navyMid: "#1A2E4A",
  teal: "#1D9E75",
  tealLight: "#E1F5EE",
  amber: "#BA7517",
  amberLight: "#FAEEDA",
  sky: "#378ADD",
  skyLight: "#E6F1FB",
  slate: "#5F5E5A",
  muted: "#888780",
  border: "rgba(0,0,0,0.10)",
  bg: "#F7F6F2",
  white: "#FFFFFF",
};

// ─── Mock Data ─────────────────────────────────────────────────────────────
const KIVULU_DATA = {
  name: "Makerere Kivulu CBHI",
  location: "Kampala, Uganda",
  lc1: "Kivulu LC1",
  parish: "Kagugube",
  totalHouseholds: 58,
  targetHouseholds: 60,
  registered: 47,
  premiumPerHH: 650000,
  annualPool: 36000000,
  premiumsPaid: 28,
  claimsSettled: 12,
  claimsPending: 3,
  claimsTotal: 15,
  healthcareFacilities: ["Seventh-Day Adventist Health Facility", "Kagugube HC III"],
  riskDistribution: { high: 57, moderate: 2, low: 0 },
  vulnerabilityDistribution: { high: 4, medium: 41, low: 14 },
  illnessDistribution: { frequent: 48, occasional: 5, rare: 6 },
  accessDistribution: { good: 20, moderate: 19, poor: 20 },
  incomeSource: { business: 59, casual: 20, salaried: 7, boda: 7, unemployed: 5, other: 2 },
  paymentMethod: { oop: 77, borrow: 14, savings: 9 },
  packages: {
    outpatient: { overall: 500000, dental: 150000, optical: 150000 },
    inpatient: { preExisting: 3000000, maternity: 700000, illnessRelated: 5000000 },
  },
};

const MEMBERS = [
  { id: 1, name: "Nalweyiso Fatuma", nin: "CF123456", hh: "Ka001", paid: true, joined: "Mar 2026", claims: 1 },
  { id: 2, name: "Ssentongo Peter", nin: "CM234567", hh: "Ka002", paid: true, joined: "Mar 2026", claims: 0 },
  { id: 3, name: "Nakato Aisha", nin: "CF345678", hh: "Ka003", paid: false, joined: "Apr 2026", claims: 2 },
  { id: 4, name: "Mugisha Robert", nin: "CM456789", hh: "KA004", paid: true, joined: "Feb 2026", claims: 1 },
  { id: 5, name: "Nambatya Joyce", nin: "CF567890", hh: "KA005", paid: true, joined: "Feb 2026", claims: 0 },
  { id: 6, name: "Ssemwogerere Dan", nin: "CM678901", hh: "KA006", paid: false, joined: "Apr 2026", claims: 3 },
  { id: 7, name: "Namukwaya Grace", nin: "CF789012", hh: "Ka007", paid: true, joined: "Mar 2026", claims: 0 },
  { id: 8, name: "Kyeyune Ivan", nin: "CM890123", hh: "Ka010", paid: true, joined: "Mar 2026", claims: 1 },
];

const APPLICANTS = [
  { id: 1, name: "Nakabuye Sandra", nin: "CF111222", contact: "0701234567", lc1: "Kivulu LC1", status: "pending", applied: "May 10, 2026" },
  { id: 2, name: "Wasswa Emmanuel", nin: "CM222333", contact: "0772345678", lc1: "Kivulu LC1", status: "interview_scheduled", applied: "May 8, 2026", interviewDate: "May 18, 2026" },
  { id: 3, name: "Nalubega Harriet", nin: "CF333444", contact: "0753456789", lc1: "Kivulu LC1", status: "approved", applied: "Apr 28, 2026" },
];

const CBHIS = [
  { id: "kivulu", name: "Makerere Kivulu CBHI", location: "Kampala", members: 47, active: true },
  { id: "namuwongo", name: "Namuwongo CBHI", location: "Kampala", members: 0, active: false, stage: "survey_pending" },
  { id: "bwaise", name: "Bwaise CBHI", location: "Kampala", members: 0, active: false, stage: "premium_design" },
];

// ─── Utility Components ────────────────────────────────────────────────────
const Badge = ({ children, color = "default" }) => {
  const map = {
    default: { bg: "#F1EFE8", text: "#5F5E5A" },
    success: { bg: "#E1F5EE", text: "#0F6E56" },
    warning: { bg: "#FAEEDA", text: "#854F0B" },
    danger: { bg: "#FCEBEB", text: "#A32D2D" },
    info: { bg: "#E6F1FB", text: "#185FA5" },
    pru: { bg: "#FDECEA", text: "#A8121F" },
  };
  const s = map[color] || map.default;
  return (
    <span style={{ background: s.bg, color: s.text, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap", letterSpacing: 0.3 }}>
      {children}
    </span>
  );
};

const MetricCard = ({ label, value, sub, accent = C.pru, icon }) => (
  <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px", position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: accent, borderRadius: "14px 0 0 14px" }} />
    <div style={{ paddingLeft: 8 }}>
      <div style={{ fontSize: 12, color: C.muted, fontWeight: 500, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: C.navy, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: C.slate, marginTop: 4 }}>{sub}</div>}
    </div>
  </div>
);

const Btn = ({ children, onClick, variant = "primary", small, full, disabled }) => {
  const styles = {
    primary: { background: C.pru, color: C.white, border: "none" },
    secondary: { background: "transparent", color: C.navy, border: `1.5px solid ${C.border}` },
    ghost: { background: "transparent", color: C.pru, border: `1.5px solid ${C.pru}` },
    success: { background: C.teal, color: C.white, border: "none" },
    gold: { background: C.gold, color: C.white, border: "none" },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles[variant],
        padding: small ? "6px 14px" : "10px 22px",
        borderRadius: 8,
        fontSize: small ? 13 : 14,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        width: full ? "100%" : undefined,
        transition: "opacity 0.15s",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
};

// ─── Mini Bar Chart ────────────────────────────────────────────────────────
const MiniBar = ({ data, colors, label }) => {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div>
      {label && <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>{label}</div>}
      {data.map((d, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <div style={{ width: 90, fontSize: 12, color: C.slate, textAlign: "right", flexShrink: 0 }}>{d.label}</div>
          <div style={{ flex: 1, background: "#F1EFE8", borderRadius: 4, overflow: "hidden", height: 18 }}>
            <div style={{ width: `${(d.value / max) * 100}%`, background: colors[i % colors.length], height: "100%", borderRadius: 4, transition: "width 0.4s ease", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 4 }}>
              {d.value > 3 && <span style={{ fontSize: 10, color: C.white, fontWeight: 700 }}>{d.value}</span>}
            </div>
          </div>
          <div style={{ width: 24, fontSize: 12, color: C.slate, fontWeight: 600 }}>{d.value <= 3 ? d.value : ""}</div>
        </div>
      ))}
    </div>
  );
};

// ─── Pie Chart SVG ─────────────────────────────────────────────────────────
const PieChart = ({ data, colors, size = 110 }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  let angle = -90;
  const slices = data.map((d, i) => {
    const pct = d.value / total;
    const start = angle;
    angle += pct * 360;
    const startRad = (start * Math.PI) / 180;
    const endRad = (angle * Math.PI) / 180;
    const r = size / 2 - 4;
    const cx = size / 2, cy = size / 2;
    const x1 = cx + r * Math.cos(startRad), y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad), y2 = cy + r * Math.sin(endRad);
    const large = pct > 0.5 ? 1 : 0;
    return { d: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`, color: colors[i], label: d.label, pct: Math.round(pct * 100) };
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s, i) => <path key={i} d={s.d} fill={s.color} stroke={C.white} strokeWidth={1.5} />)}
      <circle cx={size / 2} cy={size / 2} r={size / 4.5} fill={C.white} />
    </svg>
  );
};

// ─── Map placeholder (Leaflet-style SVG mock with household dots) ──────────
const KivuluMap = () => {
  const households = [
    { x: 220, y: 110, risk: "high" }, { x: 195, y: 135, risk: "high" }, { x: 255, y: 125, risk: "moderate" },
    { x: 235, y: 150, risk: "high" }, { x: 215, y: 160, risk: "high" }, { x: 270, y: 145, risk: "high" },
    { x: 290, y: 160, risk: "high" }, { x: 260, y: 175, risk: "moderate" }, { x: 230, y: 185, risk: "high" },
    { x: 205, y: 190, risk: "high" }, { x: 280, y: 185, risk: "high" }, { x: 310, y: 175, risk: "high" },
    { x: 295, y: 200, risk: "high" }, { x: 265, y: 205, risk: "high" }, { x: 240, y: 215, risk: "high" },
    { x: 220, y: 225, risk: "high" }, { x: 305, y: 220, risk: "high" }, { x: 280, y: 230, risk: "high" },
    { x: 255, y: 245, risk: "high" }, { x: 235, y: 255, risk: "high" },
  ];
  const riskColor = { high: C.pru, moderate: C.amber, low: C.teal };
  return (
    <div style={{ background: "#EAE6DA", borderRadius: 12, overflow: "hidden", position: "relative" }}>
      <svg viewBox="0 0 480 320" style={{ width: "100%", display: "block" }}>
        {/* Boundary polygon */}
        <polygon points="170,90 210,75 260,80 310,95 340,120 350,165 335,215 300,260 255,275 210,268 175,245 155,200 150,155 160,115" fill="#DDD8C8" stroke="#8B8570" strokeWidth={2} />
        {/* Roads */}
        <line x1="250" y1="75" x2="250" y2="280" stroke="#C8C4B8" strokeWidth={3.5} />
        <line x1="150" y1="180" x2="350" y2="180" stroke="#C8C4B8" strokeWidth={3.5} />
        <line x1="180" y1="110" x2="340" y2="240" stroke="#C8C4B8" strokeWidth={2.5} />
        {/* Buildings */}
        {[[185,145,22,16],[230,140,18,14],[195,175,20,15],[270,155,24,18],[285,195,20,16],[245,215,18,14],[220,230,22,16],[295,170,16,12]].map((b, i) => (
          <rect key={i} x={b[0]} y={b[1]} width={b[2]} height={b[3]} fill="#D4D0C2" stroke="#B8B4A8" strokeWidth={0.8} rx={1} />
        ))}
        {/* Health facility */}
        <rect x={175} y={92} width={26} height={20} fill="#BDDFF4" stroke="#378ADD" strokeWidth={1.5} rx={2} />
        <text x={188} y={106} textAnchor="middle" fontSize={9} fill="#185FA5" fontWeight={700}>H</text>
        {/* Household dots */}
        {households.map((h, i) => (
          <circle key={i} cx={h.x} cy={h.y} r={5} fill={riskColor[h.risk]} stroke={C.white} strokeWidth={1.2} opacity={0.9} />
        ))}
        {/* Hotspot glow */}
        <circle cx={255} cy={185} r={55} fill={C.pru} opacity={0.08} />
        <circle cx={255} cy={185} r={38} fill={C.pru} opacity={0.10} />
        <circle cx={255} cy={185} r={20} fill={C.pru} opacity={0.14} />
      </svg>
      <div style={{ position: "absolute", bottom: 10, right: 10, background: "rgba(255,255,255,0.92)", borderRadius: 8, padding: "8px 12px", fontSize: 11 }}>
        <div style={{ fontWeight: 700, marginBottom: 4, color: C.navy }}>Legend</div>
        {[{ c: C.pru, l: "High Risk" }, { c: C.amber, l: "Moderate" }, { c: C.teal, l: "Low Risk" }, { c: "#378ADD", l: "Health Facility" }].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: item.c }} />
            <span style={{ color: C.slate }}>{item.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── PAGE: Landing ─────────────────────────────────────────────────────────
const LandingPage = ({ setPage }) => {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handler = () => setScrollY(window.scrollY || 0);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: C.navy, fontFamily: "'Georgia', serif" }}>
      {/* Header */}
      <header style={{ background: C.navyMid, borderBottom: `1px solid rgba(255,255,255,0.08)`, padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, background: C.pru, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div>
            <div style={{ color: C.white, fontWeight: 700, fontSize: 16, letterSpacing: 1, fontFamily: "sans-serif" }}>SHIELD</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, letterSpacing: 1.5, fontFamily: "sans-serif", textTransform: "uppercase" }}>by Prudential Uganda</div>
          </div>
        </div>
        <nav style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setPage("story")} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", fontSize: 13, padding: "6px 14px", fontFamily: "sans-serif" }}>Our Story</button>
          <button onClick={() => setPage("customer")} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.25)", color: C.white, cursor: "pointer", fontSize: 13, padding: "6px 14px", borderRadius: 6, fontFamily: "sans-serif" }}>Join a CBHI</button>
          <button onClick={() => setPage("admin_login")} style={{ background: C.pru, border: "none", color: C.white, cursor: "pointer", fontSize: 13, padding: "6px 16px", borderRadius: 6, fontWeight: 600, fontFamily: "sans-serif" }}>Admin Login</button>
        </nav>
      </header>

      {/* Hero */}
      <section style={{ padding: "100px 40px 80px", textAlign: "center", maxWidth: 840, margin: "0 auto" }}>
        <div style={{ display: "inline-block", background: "rgba(237,27,46,0.15)", border: "1px solid rgba(237,27,46,0.3)", borderRadius: 20, padding: "5px 16px", fontSize: 12, color: "#F5A0A8", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 24, fontFamily: "sans-serif" }}>
          Community Health Insurance — Uganda
        </div>
        <h1 style={{ fontSize: 54, fontWeight: 700, color: C.white, lineHeight: 1.15, marginBottom: 24, letterSpacing: -0.5 }}>
          Healthcare shouldn't be a<br />
          <span style={{ color: C.pru }}>financial emergency.</span>
        </h1>
        <p style={{ fontSize: 18, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: 40, fontFamily: "sans-serif" }}>
          SHIELD pools community resources to give low-income households in urban Uganda access to affordable, structured health insurance — backed by geospatial analysis and actuarial expertise.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => setPage("customer")} style={{ background: C.pru, color: C.white, border: "none", padding: "14px 32px", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif" }}>
            Get Coverage →
          </button>
          <button onClick={() => setPage("story")} style={{ background: "transparent", color: "rgba(255,255,255,0.8)", border: "1.5px solid rgba(255,255,255,0.25)", padding: "14px 32px", borderRadius: 10, fontSize: 15, cursor: "pointer", fontFamily: "sans-serif" }}>
            Read Our Story
          </button>
        </div>
      </section>

      {/* Stats strip */}
      <section style={{ background: C.pru, padding: "28px 40px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32, textAlign: "center" }}>
          {[
            { n: "60", l: "Target Households" }, { n: "UGX 650K", l: "Annual Premium" }, { n: "58", l: "Households Surveyed" }, { n: "5", l: "Insurance Benefits" }
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: 28, fontWeight: 800, color: C.white, fontFamily: "sans-serif" }}>{s.n}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: 1, fontFamily: "sans-serif" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* What you can do */}
      <section style={{ padding: "80px 40px", maxWidth: 1000, margin: "0 auto" }}>
        <h2 style={{ fontSize: 32, color: C.white, textAlign: "center", marginBottom: 12 }}>How SHIELD works</h2>
        <p style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", marginBottom: 48, fontFamily: "sans-serif" }}>Two paths. One goal — affordable community health coverage.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {[
            { icon: "👥", title: "Join an existing CBHI", desc: "Browse listed Community Based Health Insurance groups in your area. Apply, schedule an interview, and get covered.", btn: "Browse CBHIs", color: C.sky, page: "customer" },
            { icon: "🏘️", title: "Start a new CBHI", desc: "Organize your community, gather members, submit a recommendation letter from your LC1 and begin the journey to insure your community.", btn: "Register a CBHI", color: C.teal, page: "register_cbhi" },
            { icon: "🔑", title: "CBHI Administrator", desc: "Manage your registered CBHI — view members, approve applicants, track premiums and claims from your private dashboard.", btn: "Admin Login", color: C.gold, page: "cbhi_admin_login" },
            { icon: "📊", title: "Prudential Dashboard", desc: "Full operational view for Prudential staff — community analytics, GIS maps, risk data, and cross-CBHI management.", btn: "Staff Login", color: C.pru, page: "admin_login" },
          ].map((card, i) => (
            <div key={i} onClick={() => setPage(card.page)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 16, padding: 28, cursor: "pointer", transition: "background 0.2s", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: card.color }} />
              <div style={{ fontSize: 32, marginBottom: 12 }}>{card.icon}</div>
              <h3 style={{ color: C.white, fontSize: 18, marginBottom: 10, fontFamily: "sans-serif", fontWeight: 700 }}>{card.title}</h3>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.6, marginBottom: 20, fontFamily: "sans-serif" }}>{card.desc}</p>
              <span style={{ fontSize: 13, color: card.color, fontWeight: 700, fontFamily: "sans-serif" }}>{card.btn} →</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "24px 40px", textAlign: "center" }}>
        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, fontFamily: "sans-serif" }}>
          © 2026 Prudential Uganda · SHIELD CBHI Platform · Built by PM Group One, Makerere University
        </div>
      </footer>
    </div>
  );
};

// ─── PAGE: Story (Makerere Kivulu Pilot) ───────────────────────────────────
const StoryPage = ({ setPage }) => (
  <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "sans-serif" }}>
    <div style={{ background: C.navyMid, padding: "16px 40px", display: "flex", alignItems: "center", gap: 16 }}>
      <button onClick={() => setPage("landing")} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", fontSize: 13 }}>← Back</button>
      <span style={{ color: "rgba(255,255,255,0.4)" }}>|</span>
      <span style={{ color: C.white, fontWeight: 600 }}>The Makerere Kivulu Pilot Study</span>
    </div>
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "48px 24px" }}>
      {/* Hero image placeholder */}
      <div style={{ background: "linear-gradient(135deg, #1A2E4A 0%, #0A1628 100%)", borderRadius: 16, padding: "48px 40px", marginBottom: 40, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🌍</div>
        <h1 style={{ color: C.white, fontSize: 32, marginBottom: 12, lineHeight: 1.3 }}>A Geospatial Health Insurance Intelligence Platform for Climate-Vulnerable Urban Uganda</h1>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14 }}>Makerere Kivulu, Kampala · February – May 2026 · PM Group One</p>
      </div>
      {[
        { tag: "The Challenge", color: C.pru, text: "In Makerere Kivulu — a densely settled urban community near Makerere University in Kampala — households face repeated health shocks with almost no financial protection. 77% pay for healthcare entirely out-of-pocket. 14% borrow money to meet medical costs. Only a fraction have any formal insurance. This is the story of how our team set out to change that." },
        { tag: "Our Approach", color: C.sky, text: "We collected household-level data from 78 households using structured questionnaires, retaining 58 valid records after cleaning and GPS validation. We built a Social Vulnerability Index (SVI) and a composite Health Risk Index modelled on the CMS-HCC risk adjustment framework — scoring each household on income stability, tenure, household size, medical burden, illness frequency, healthcare access, and malaria prevalence (PFPR)." },
        { tag: "What We Found", color: C.teal, text: "57 of 58 households were classified as high health risk. 41 households fall into medium vulnerability; 14 are low vulnerability, and 4 are high. 48 households experience frequent illness (more than 2 episodes per quarter, or a chronic condition). Healthcare access is split nearly evenly — 20 households have good access, 19 moderate, and 20 poor access to the nearest facility." },
        { tag: "The Solution", color: C.gold, text: "Working with Prudential Uganda's actuarial team, we designed a Community-Based Health Insurance package for 60 households — each contributing UGX 650,000 annually, creating a UGX 36,000,000 premium pool. The package covers outpatient services (UGX 500K), dental and optical (UGX 150K each), inpatient pre-existing and chronic conditions (UGX 3M), maternity (UGX 700K), and general illness (UGX 5M)." },
        { tag: "The CBO 'Engabo'", color: C.navyMid, text: "To help households save toward the annual premium, the community established a CBO called Engabo, supported by letters from the LC1 and LC3. Each of the 60 members contributes progressively across the year until the group premium is reached. After the first year, continued savings cover renewal. This model turns individual vulnerability into collective resilience." },
        { tag: "Technology", color: C.pruDark, text: "Our technical stack included QGIS, ArcMap, KoBoToolbox for field collection, and a Django web application. The SHIELD platform — which you are using now — is the digital evolution of that prototype: designed to scale this approach to communities across Uganda." },
      ].map((s, i) => (
        <div key={i} style={{ marginBottom: 32 }}>
          <div style={{ display: "inline-block", background: s.color, color: C.white, fontSize: 11, fontWeight: 700, padding: "3px 12px", borderRadius: 20, marginBottom: 10, letterSpacing: 0.5, textTransform: "uppercase" }}>{s.tag}</div>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: C.navy, margin: 0 }}>{s.text}</p>
        </div>
      ))}

      {/* Stats callout */}
      <div style={{ background: C.navyMid, borderRadius: 16, padding: "28px 32px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 40, textAlign: "center" }}>
        {[["58", "Valid Households"], ["UGX 36M", "Annual Premium Pool"], ["5", "Coverage Benefits"]].map(([n, l], i) => (
          <div key={i}>
            <div style={{ fontSize: 30, fontWeight: 800, color: C.pru }}>{n}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: 0.8, marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center" }}>
        <button onClick={() => setPage("customer")} style={{ background: C.pru, color: C.white, border: "none", padding: "14px 32px", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
          Join the Movement →
        </button>
      </div>
    </div>
  </div>
);

// ─── PAGE: Admin Login ─────────────────────────────────────────────────────
const AdminLogin = ({ setPage, setRole }) => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const submit = () => {
    if (email === "admin@prudential.ug" && pass === "shield2026") { setRole("admin"); setPage("admin_dashboard"); }
    else setErr("Invalid credentials. Try admin@prudential.ug / shield2026");
  };
  return (
    <div style={{ minHeight: "100vh", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.white, borderRadius: 20, padding: "44px 40px", width: 400, boxShadow: "0 24px 80px rgba(0,0,0,0.4)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, background: C.pru, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <h2 style={{ color: C.navy, fontSize: 22, margin: 0 }}>Prudential Staff Login</h2>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 6 }}>SHIELD Administration Portal</p>
        </div>
        {err && <div style={{ background: "#FCEBEB", color: "#A32D2D", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{err}</div>}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.slate, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@prudential.ug" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, boxSizing: "border-box" }} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.slate, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Password</label>
          <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && submit()} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, boxSizing: "border-box" }} />
        </div>
        <button onClick={submit} style={{ width: "100%", background: C.pru, color: C.white, border: "none", padding: "12px", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Sign In</button>
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button onClick={() => setPage("cbhi_admin_login")} style={{ background: "transparent", border: "none", color: C.sky, fontSize: 13, cursor: "pointer" }}>CBHI Administrator? Login here</button>
        </div>
        <div style={{ textAlign: "center", marginTop: 8 }}>
          <button onClick={() => setPage("landing")} style={{ background: "transparent", border: "none", color: C.muted, fontSize: 12, cursor: "pointer" }}>← Back to SHIELD</button>
        </div>
      </div>
    </div>
  );
};

// ─── PAGE: CBHI Admin Login ────────────────────────────────────────────────
const CbhiAdminLogin = ({ setPage }) => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const submit = () => {
    if (email === "kivulu@cbhi.ug" && pass === "engabo2026") { setPage("cbhi_admin"); }
    else setErr("Invalid credentials. Try kivulu@cbhi.ug / engabo2026");
  };
  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.white, borderRadius: 20, padding: "44px 40px", width: 400, border: `1px solid ${C.border}` }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, background: C.teal, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <span style={{ fontSize: 24 }}>🏘️</span>
          </div>
          <h2 style={{ color: C.navy, fontSize: 22, margin: 0 }}>CBHI Administrator</h2>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 6 }}>Makerere Kivulu CBHI · Engabo CBO</p>
        </div>
        {err && <div style={{ background: "#FCEBEB", color: "#A32D2D", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{err}</div>}
        {[{ l: "Email", v: email, s: setEmail, p: "kivulu@cbhi.ug", t: "text" }, { l: "Password", v: pass, s: setPass, p: "••••••••", t: "password" }].map((f, i) => (
          <div key={i} style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.slate, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>{f.l}</label>
            <input type={f.t} value={f.v} onChange={e => f.s(e.target.value)} placeholder={f.p} onKeyDown={e => e.key === "Enter" && submit()} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, boxSizing: "border-box" }} />
          </div>
        ))}
        <button onClick={submit} style={{ width: "100%", background: C.teal, color: C.white, border: "none", padding: "12px", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 8 }}>Sign In</button>
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button onClick={() => setPage("landing")} style={{ background: "transparent", border: "none", color: C.muted, fontSize: 12, cursor: "pointer" }}>← Back to SHIELD</button>
        </div>
      </div>
    </div>
  );
};

// ─── PAGE: Admin Dashboard (Prudential) ────────────────────────────────────
const AdminDashboard = ({ setPage }) => {
  const [activeCbhi, setActiveCbhi] = useState("kivulu");
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedChart, setExpandedChart] = useState(null);

  const cbhi = KIVULU_DATA;
  const tabs = ["overview", "maps & analytics", "members", "claims", "cbhi management"];

  const chartInfo = {
    risk: { title: "Health Risk Distribution", detail: "57 of 58 surveyed households in Makerere Kivulu were classified as High Risk, with only 2 falling into Moderate Risk. This was driven by the combined weight of high illness frequency, financial vulnerability, poor healthcare access in parts of the community, and medical financial burden. This distribution was central to justifying the need for community-based risk pooling through CBHI." },
    vulnerability: { title: "Socioeconomic Vulnerability", detail: "The majority of Kivulu households (41 of 58) fall into Medium Vulnerability — financially fragile but not destitute. 4 households are highly vulnerable. Only 14 show low vulnerability. This middle band is the primary target for CBHI, as these households can potentially contribute to savings schemes but cannot sustain individual insurance premiums of UGX 1M+." },
    illness: { title: "Illness Frequency Distribution", detail: "48 households experienced frequent illness — defined as more than 2 episodes in the past 3 months or the presence of a chronic condition. Only 6 had rare illness events. This high burden of frequent illness creates recurring, unpredictable healthcare expenditure that out-of-pocket payment cannot sustainably absorb." },
    access: { title: "Healthcare Access Distribution", detail: "Healthcare access across Kivulu is nearly evenly split: 20 households have good access (within 0.76–1.72 km of a facility), 19 have moderate access (1.72–2.07 km), and 20 have relatively poor access (beyond 2.07 km). The main facility serving the community is the Seventh-Day Adventist Health Facility at the northern edge of the study area." },
    income: { title: "Sources of Household Income", detail: "59% of Kivulu households depend on business income (trade, petty commerce), while 20% rely on casual and daily wage labor. Only 7% are formally salaried. This income structure means most households face significant income irregularity — making lump-sum insurance payments difficult and reinforcing the need for a structured savings model like Engabo." },
    payment: { title: "Healthcare Financing Methods", detail: "77% of households pay for healthcare out of pocket with no savings buffer. 14% borrow money when illness strikes. Only 9% draw on savings. This pattern reveals extreme financial exposure — a single serious illness can trigger debt spirals. It provides the clearest possible justification for introducing a pooled health financing mechanism." },
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "sans-serif" }}>
      {/* Sidebar */}
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <aside style={{ width: 220, background: C.navyMid, flexShrink: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ width: 28, height: 28, background: C.pru, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <span style={{ color: C.white, fontWeight: 700, fontSize: 14 }}>SHIELD</span>
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1 }}>Prudential Portal</div>
          </div>
          <div style={{ padding: "12px 8px" }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 1, padding: "4px 8px", marginBottom: 4 }}>Active CBHI</div>
            {CBHIS.map(c => (
              <button key={c.id} onClick={() => setActiveCbhi(c.id)} style={{ width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: 8, background: activeCbhi === c.id ? "rgba(237,27,46,0.15)" : "transparent", border: activeCbhi === c.id ? `1px solid rgba(237,27,46,0.3)` : "1px solid transparent", color: activeCbhi === c.id ? C.white : "rgba(255,255,255,0.55)", cursor: "pointer", marginBottom: 2, fontSize: 13 }}>
                <div style={{ fontWeight: activeCbhi === c.id ? 600 : 400 }}>{c.name.replace(" CBHI", "")}</div>
                <div style={{ fontSize: 10, marginTop: 2 }}>{c.active ? `${c.members} members` : "Stage: " + (c.stage === "survey_pending" ? "Survey Pending" : "Premium Design")}</div>
              </button>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ padding: "12px 8px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <button onClick={() => setPage("landing")} style={{ width: "100%", textAlign: "left", padding: "8px 10px", background: "transparent", border: "none", color: "rgba(255,255,255,0.45)", cursor: "pointer", fontSize: 12 }}>← Sign Out</button>
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, overflow: "auto" }}>
          {/* Top bar */}
          <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "0 32px", display: "flex", alignItems: "center", gap: 0, height: 52 }}>
            {tabs.map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{ background: "transparent", border: "none", borderBottom: activeTab === t ? `2.5px solid ${C.pru}` : "2.5px solid transparent", color: activeTab === t ? C.navy : C.muted, cursor: "pointer", padding: "0 16px", height: 52, fontSize: 13, fontWeight: activeTab === t ? 700 : 400, textTransform: "capitalize", fontFamily: "sans-serif" }}>
                {t}
              </button>
            ))}
          </div>

          <div style={{ padding: "28px 32px" }}>
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div>
                <div style={{ marginBottom: 24 }}>
                  <h2 style={{ color: C.navy, margin: 0, fontSize: 22 }}>Makerere Kivulu CBHI</h2>
                  <p style={{ color: C.muted, margin: "4px 0 0", fontSize: 13 }}>Kagugube Parish · Kampala · Active since March 2026</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
                  <MetricCard label="Registered Members" value={cbhi.registered} sub="Target: 60" accent={C.teal} />
                  <MetricCard label="Premiums Paid" value={cbhi.premiumsPaid} sub={`UGX ${(cbhi.premiumsPaid * cbhi.premiumPerHH / 1e6).toFixed(1)}M collected`} accent={C.gold} />
                  <MetricCard label="Claims Settled" value={`${cbhi.claimsSettled}/${cbhi.claimsTotal}`} sub={`${cbhi.claimsPending} pending`} accent={C.sky} />
                  <MetricCard label="Annual Pool" value="UGX 36M" sub="650K × 60 households" accent={C.pru} />
                </div>

                {/* Progress bar */}
                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 24px", marginBottom: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, color: C.navy }}>Enrollment Progress</span>
                    <span style={{ color: C.pru, fontWeight: 700 }}>{cbhi.registered}/60 households</span>
                  </div>
                  <div style={{ background: "#F1EFE8", borderRadius: 6, height: 10, overflow: "hidden" }}>
                    <div style={{ width: `${(cbhi.registered / 60) * 100}%`, height: "100%", background: C.pru, borderRadius: 6 }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12, color: C.muted }}>
                    <span>78.3% complete</span>
                    <span>13 households remaining</span>
                  </div>
                </div>

                {/* Package summary */}
                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 24px" }}>
                  <h3 style={{ color: C.navy, margin: "0 0 16px", fontSize: 15 }}>PruMed CBHI Package — Benefit Summary</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {[
                      { l: "Outpatient Cover", v: "UGX 500,000", tag: "OPD" },
                      { l: "Dental", v: "UGX 150,000", tag: "Dental" },
                      { l: "Optical", v: "UGX 150,000", tag: "Optical" },
                      { l: "Pre-existing & Chronic", v: "UGX 3,000,000", tag: "Inpatient" },
                      { l: "Maternity", v: "UGX 700,000", tag: "Inpatient" },
                      { l: "General Illness", v: "UGX 5,000,000", tag: "Inpatient" },
                    ].map((p, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: C.bg, borderRadius: 8 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{p.l}</div>
                          <div style={{ fontSize: 11, color: C.muted }}>{p.tag}</div>
                        </div>
                        <div style={{ fontWeight: 700, color: C.teal, fontSize: 13 }}>{p.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Maps & Analytics Tab */}
            {activeTab === "maps & analytics" && (
              <div>
                <div style={{ marginBottom: 20 }}>
                  <h2 style={{ color: C.navy, margin: "0 0 4px", fontSize: 22 }}>Community Analytics</h2>
                  <p style={{ color: C.muted, margin: 0, fontSize: 13 }}>Click any chart to read the full interpretation</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                  {/* Map */}
                  <div style={{ gridColumn: "1 / -1" }}>
                    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 24px" }}>
                      <h3 style={{ color: C.navy, margin: "0 0 14px", fontSize: 15 }}>Household Health Risk Map — Makerere Kivulu</h3>
                      <KivuluMap />
                    </div>
                  </div>

                  {/* Charts */}
                  {[
                    { key: "risk", title: "Health Risk Levels", data: [{ label: "High Risk", value: 57 }, { label: "Moderate", value: 2 }], colors: [C.pru, C.amber] },
                    { key: "vulnerability", title: "Vulnerability Classes", data: [{ label: "Low", value: 14 }, { label: "Medium", value: 41 }, { label: "High", value: 4 }], colors: [C.teal, C.amber, C.pru] },
                    { key: "illness", title: "Illness Frequency", data: [{ label: "Frequent", value: 48 }, { label: "Occasional", value: 5 }, { label: "Rare", value: 6 }], colors: [C.pru, C.amber, C.teal] },
                    { key: "access", title: "Healthcare Access", data: [{ label: "Good", value: 20 }, { label: "Moderate", value: 19 }, { label: "Poor", value: 20 }], colors: [C.teal, C.amber, C.pru] },
                    { key: "income", title: "Income Sources", data: [{ label: "Business", value: 59 }, { label: "Casual", value: 20 }, { label: "Salaried", value: 7 }, { label: "Boda", value: 7 }, { label: "Unemployed", value: 5 }, { label: "Other", value: 2 }], colors: [C.sky, C.teal, C.gold, C.amber, C.pru, C.slate] },
                    { key: "payment", title: "Healthcare Financing", data: [{ label: "Out-of-pocket", value: 77 }, { label: "Borrow", value: 14 }, { label: "Savings", value: 9 }], colors: [C.pru, C.amber, C.teal] },
                  ].map(chart => (
                    <div key={chart.key} onClick={() => setExpandedChart(chart.key === expandedChart ? null : chart.key)} style={{ background: C.white, border: `1px solid ${chart.key === expandedChart ? C.pru : C.border}`, borderRadius: 14, padding: "20px 24px", cursor: "pointer", transition: "border-color 0.2s" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                        <h3 style={{ color: C.navy, margin: 0, fontSize: 14 }}>{chart.title}</h3>
                        <span style={{ fontSize: 11, color: C.pru }}>Click to read ↗</span>
                      </div>
                      <MiniBar data={chart.data} colors={chart.colors} />
                      {expandedChart === chart.key && (
                        <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: C.pru, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Interpretation</div>
                          <p style={{ fontSize: 13, color: C.navy, lineHeight: 1.7, margin: 0 }}>{chartInfo[chart.key].detail}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Members Tab */}
            {activeTab === "members" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h2 style={{ color: C.navy, margin: 0, fontSize: 22 }}>Member Registry</h2>
                  <Badge color="success">{cbhi.registered} Members</Badge>
                </div>
                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: C.bg }}>
                        {["Name", "NIN", "Household", "Joined", "Premium", "Claims"].map(h => (
                          <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {MEMBERS.map((m, i) => (
                        <tr key={m.id} style={{ borderTop: `1px solid ${C.border}`, background: i % 2 === 0 ? C.white : "#FAFAF8" }}>
                          <td style={{ padding: "12px 16px", fontWeight: 600, color: C.navy }}>{m.name}</td>
                          <td style={{ padding: "12px 16px", fontSize: 12, color: C.slate }}>{m.nin}</td>
                          <td style={{ padding: "12px 16px", fontSize: 12, color: C.slate }}>{m.hh}</td>
                          <td style={{ padding: "12px 16px", fontSize: 12, color: C.slate }}>{m.joined}</td>
                          <td style={{ padding: "12px 16px" }}><Badge color={m.paid ? "success" : "danger"}>{m.paid ? "Paid" : "Pending"}</Badge></td>
                          <td style={{ padding: "12px 16px", fontSize: 13, color: C.navy, fontWeight: 600 }}>{m.claims}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Claims Tab */}
            {activeTab === "claims" && (
              <div>
                <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
                  <MetricCard label="Total Claims" value={cbhi.claimsTotal} accent={C.sky} />
                  <MetricCard label="Settled" value={cbhi.claimsSettled} accent={C.teal} />
                  <MetricCard label="Pending Review" value={cbhi.claimsPending} accent={C.amber} />
                </div>
                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
                  <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, fontWeight: 700, color: C.navy }}>Claims Log</div>
                  {[
                    { member: "Nalweyiso Fatuma", type: "Outpatient", amount: "UGX 85,000", date: "May 2", status: "settled" },
                    { member: "Mugisha Robert", type: "Inpatient – Malaria", amount: "UGX 1,200,000", date: "Apr 28", status: "settled" },
                    { member: "Ssemwogerere Dan", type: "Dental", amount: "UGX 120,000", date: "May 10", status: "pending" },
                    { member: "Nakato Aisha", type: "Outpatient", amount: "UGX 65,000", date: "May 5", status: "settled" },
                    { member: "Kyeyune Ivan", type: "Optical", amount: "UGX 100,000", date: "Apr 15", status: "settled" },
                    { member: "Ssemwogerere Dan", type: "Inpatient – Chronic", amount: "UGX 2,800,000", date: "May 12", status: "pending" },
                  ].map((c, i) => (
                    <div key={i} style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontWeight: 600, color: C.navy, fontSize: 14 }}>{c.member}</div>
                        <div style={{ fontSize: 12, color: C.muted }}>{c.type} · {c.date}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontWeight: 700, color: C.navy, fontSize: 13 }}>{c.amount}</span>
                        <Badge color={c.status === "settled" ? "success" : "warning"}>{c.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CBHI Management Tab */}
            {activeTab === "cbhi management" && (
              <div>
                <h2 style={{ color: C.navy, margin: "0 0 20px", fontSize: 22 }}>All CBHIs</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
                  {CBHIS.map(c => (
                    <div key={c.id} style={{ background: C.white, border: `2px solid ${c.active ? C.teal : C.border}`, borderRadius: 14, padding: "22px 20px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                        <div>
                          <div style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>{c.name}</div>
                          <div style={{ fontSize: 12, color: C.muted }}>{c.location}</div>
                        </div>
                        <Badge color={c.active ? "success" : "warning"}>{c.active ? "Active" : "Setup"}</Badge>
                      </div>
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Members</div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: c.active ? C.teal : C.muted }}>{c.members}</div>
                      </div>
                      {!c.active && (
                        <div style={{ fontSize: 12, color: C.amber, background: C.amberLight, padding: "6px 10px", borderRadius: 6 }}>
                          Stage: {c.stage === "survey_pending" ? "Awaiting Community Survey" : "Premium Package Design"}
                        </div>
                      )}
                    </div>
                  ))}
                  <div style={{ background: C.bg, border: `2px dashed ${C.border}`, borderRadius: 14, padding: "22px 20px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <div style={{ textAlign: "center", color: C.muted }}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>+</div>
                      <div style={{ fontSize: 13 }}>New CBHI Application</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

// ─── PAGE: CBHI Admin (Community Liaison) ─────────────────────────────────
const CbhiAdmin = ({ setPage }) => {
  const [activeTab, setActiveTab] = useState("members");
  const [applicants, setApplicants] = useState(APPLICANTS);
  const tabs = ["members", "applicants", "payments", "claims"];
  const approve = (id) => {
    setApplicants(prev => prev.map(a => a.id === id ? { ...a, status: "approved" } : a));
  };
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "sans-serif" }}>
      <header style={{ background: C.teal, padding: "0 32px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ color: C.white, fontWeight: 700, fontSize: 16 }}>Makerere Kivulu CBHI</div>
          <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 12 }}>Administrator Dashboard · Engabo CBO</div>
        </div>
        <button onClick={() => setPage("landing")} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: C.white, cursor: "pointer", padding: "6px 14px", borderRadius: 6, fontSize: 13 }}>Sign Out</button>
      </header>
      <div style={{ padding: "24px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          <MetricCard label="Members" value={47} sub="3 pending approval" accent={C.teal} />
          <MetricCard label="Premiums Paid" value={28} sub={`UGX ${(28 * 650000 / 1e6).toFixed(2)}M`} accent={C.gold} />
          <MetricCard label="Active Claims" value={3} sub="12 settled this year" accent={C.sky} />
          <MetricCard label="Annual Pool" value="UGX 36M" sub="78% enrolled" accent={C.pru} />
        </div>
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ display: "flex", borderBottom: `1px solid ${C.border}` }}>
            {tabs.map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{ padding: "12px 22px", background: "transparent", border: "none", borderBottom: activeTab === t ? `2.5px solid ${C.teal}` : "2.5px solid transparent", color: activeTab === t ? C.navy : C.muted, cursor: "pointer", fontSize: 13, fontWeight: activeTab === t ? 700 : 400, textTransform: "capitalize", fontFamily: "sans-serif" }}>
                {t}
              </button>
            ))}
          </div>
          <div style={{ padding: "20px 24px" }}>
            {activeTab === "members" && (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>{["Member", "Household", "Joined", "Premium Status", "Claims"].map(h => <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, color: C.muted, fontWeight: 700, textTransform: "uppercase" }}>{h}</th>)}</tr></thead>
                <tbody>{MEMBERS.map(m => <tr key={m.id} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: "11px 12px", fontWeight: 600, color: C.navy }}>{m.name}</td>
                  <td style={{ padding: "11px 12px", fontSize: 12, color: C.slate }}>{m.hh}</td>
                  <td style={{ padding: "11px 12px", fontSize: 12, color: C.slate }}>{m.joined}</td>
                  <td style={{ padding: "11px 12px" }}><Badge color={m.paid ? "success" : "danger"}>{m.paid ? "Paid" : "Pending"}</Badge></td>
                  <td style={{ padding: "11px 12px", fontSize: 13, fontWeight: 600, color: C.navy }}>{m.claims}</td>
                </tr>)}</tbody>
              </table>
            )}
            {activeTab === "applicants" && (
              <div>
                <p style={{ color: C.muted, fontSize: 13, marginTop: 0 }}>Review and approve people applying to join your CBHI. Verify they are known community members before approval.</p>
                {applicants.map(a => (
                  <div key={a.id} style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 18px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 700, color: C.navy }}>{a.name}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>{a.nin} · {a.contact} · {a.lc1}</div>
                      <div style={{ fontSize: 12, color: C.slate, marginTop: 4 }}>Applied: {a.applied} {a.interviewDate && `· Interview: ${a.interviewDate}`}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Badge color={a.status === "pending" ? "warning" : a.status === "interview_scheduled" ? "info" : "success"}>
                        {a.status === "pending" ? "Pending Review" : a.status === "interview_scheduled" ? "Interview Set" : "Approved"}
                      </Badge>
                      {a.status === "pending" && <button onClick={() => approve(a.id)} style={{ background: C.teal, color: C.white, border: "none", padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Approve</button>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {activeTab === "payments" && (
              <div>
                <p style={{ color: C.muted, fontSize: 13, marginTop: 0 }}>Track savings contributions toward the annual premium. Each member contributes UGX 650,000 per year via Engabo CBO savings.</p>
                {MEMBERS.map((m, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ fontWeight: 600, color: C.navy }}>{m.name}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ width: 120, background: "#F1EFE8", borderRadius: 4, height: 6 }}>
                        <div style={{ width: m.paid ? "100%" : `${Math.round(Math.random() * 60 + 20)}%`, height: "100%", background: m.paid ? C.teal : C.amber, borderRadius: 4 }} />
                      </div>
                      <Badge color={m.paid ? "success" : "warning"}>{m.paid ? "UGX 650,000 ✓" : "Saving..."}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {activeTab === "claims" && (
              <div>
                <p style={{ color: C.muted, fontSize: 13, marginTop: 0 }}>Claims submitted by your CBHI members.</p>
                {[
                  { member: "Nakato Aisha", type: "Outpatient", amount: "65,000", status: "settled", date: "May 5" },
                  { member: "Ssemwogerere Dan", type: "Dental", amount: "120,000", status: "pending", date: "May 10" },
                  { member: "Ssemwogerere Dan", type: "Inpatient – Chronic", amount: "2,800,000", status: "pending", date: "May 12" },
                ].map((c, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
                    <div>
                      <div style={{ fontWeight: 600, color: C.navy }}>{c.member}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>{c.type} · {c.date}</div>
                    </div>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <span style={{ fontWeight: 700, color: C.navy }}>UGX {c.amount}</span>
                      <Badge color={c.status === "settled" ? "success" : "warning"}>{c.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── PAGE: Customer Portal ─────────────────────────────────────────────────
const CustomerPortal = ({ setPage }) => {
  const [choice, setChoice] = useState(null);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", nin: "", contact: "", lc1: "", parish: "", subcounty: "", county: "", district: "", dependents: "", interviewDate: "" });
  const [selectedCbhi, setSelectedCbhi] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const activeCbhis = CBHIS.filter(c => c.active);

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const handleSubmit = () => setSubmitted(true);

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: C.white, borderRadius: 20, padding: "48px 40px", maxWidth: 480, textAlign: "center", border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
          <h2 style={{ color: C.navy, marginBottom: 12 }}>Application Submitted!</h2>
          <p style={{ color: C.slate, fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
            {choice === "join" ? `Your application to join ${activeCbhis.find(c => c.id === selectedCbhi)?.name || "the CBHI"} has been submitted. The CBHI administrator will review your request and confirm your interview date.` : "Your CBHI registration request has been received. The Prudential marketing team will contact you to schedule a community survey. We will analyse your community's risk profile and design an appropriate insurance package."}
          </p>
          <div style={{ background: C.bg, borderRadius: 10, padding: "16px 20px", marginBottom: 24, textAlign: "left" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.pru, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Next Steps</div>
            {choice === "join" ? [
              "CBHI admin reviews your application",
              "You'll be notified of your interview date",
              "Marketing team visits your household",
              "Risk assessment completed",
              "You're added to the CBHI!"
            ] : [
              "Prudential confirms receipt",
              "Community survey date agreed",
              "GIS & risk analysis completed",
              "Insurance package designed",
              "Premium communicated to your CBO"
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 6, fontSize: 13, color: C.navy }}>
                <span style={{ color: C.teal, fontWeight: 700 }}>→</span> {s}
              </div>
            ))}
          </div>
          <button onClick={() => setPage("landing")} style={{ background: C.pru, color: C.white, border: "none", padding: "12px 28px", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Return to SHIELD</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "sans-serif" }}>
      <header style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "0 40px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, background: C.pru, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <span style={{ fontWeight: 700, color: C.navy }}>SHIELD</span>
          <span style={{ color: C.muted, fontSize: 13 }}>/ Community Portal</span>
        </div>
        <button onClick={() => setPage("landing")} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 13 }}>← Back</button>
      </header>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px" }}>
        {!choice ? (
          <div>
            <h2 style={{ color: C.navy, fontSize: 26, marginBottom: 8 }}>Get Health Coverage</h2>
            <p style={{ color: C.muted, fontSize: 14, marginBottom: 32 }}>Choose how you'd like to get started with SHIELD community health insurance.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { key: "join", icon: "🤝", title: "Join a CBHI", sub: "Apply to an existing community group in your area", color: C.sky },
                { key: "register", icon: "🏗️", title: "Register a CBHI", sub: "Organize your community and start a new group", color: C.teal },
              ].map(o => (
                <div key={o.key} onClick={() => { setChoice(o.key); setStep(1); }} style={{ background: C.white, border: `2px solid ${C.border}`, borderRadius: 14, padding: "28px 22px", cursor: "pointer", textAlign: "center", transition: "border-color 0.2s" }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>{o.icon}</div>
                  <div style={{ fontWeight: 700, color: C.navy, fontSize: 16, marginBottom: 6 }}>{o.title}</div>
                  <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{o.sub}</div>
                  <div style={{ marginTop: 16, color: o.color, fontWeight: 700, fontSize: 13 }}>Get Started →</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, textAlign: "center" }}>
              <button onClick={() => setPage("cbhi_admin_login")} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.slate, cursor: "pointer", padding: "10px 20px", borderRadius: 8, fontSize: 13 }}>
                🔑 CBHI Administrator Login
              </button>
            </div>
          </div>
        ) : (
          <div>
            <button onClick={() => { setChoice(null); setStep(1); }} style={{ background: "transparent", border: "none", color: C.pru, cursor: "pointer", fontSize: 13, marginBottom: 20 }}>← Choose different option</button>
            
            {/* Step indicators */}
            <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
              {(choice === "join" ? ["Your Details", "Choose CBHI", "Interview Date"] : ["Your Details", "Community Info", "Upload Letter"]).map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: step > i ? C.teal : step === i + 1 ? C.pru : "#D3D1C7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: C.white, flexShrink: 0 }}>
                    {step > i ? "✓" : i + 1}
                  </div>
                  <span style={{ fontSize: 12, color: step === i + 1 ? C.navy : C.muted, fontWeight: step === i + 1 ? 700 : 400 }}>{s}</span>
                  {i < 2 && <div style={{ width: 24, height: 1, background: C.border }} />}
                </div>
              ))}
            </div>

            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: "28px 28px" }}>
              {step === 1 && (
                <div>
                  <h3 style={{ color: C.navy, margin: "0 0 20px" }}>Your Personal Details</h3>
                  {[["Full Name", "name", "text", "e.g. Nakato Sarah"], ["NIN Number", "nin", "text", "e.g. CF123456"], ["Phone Number", "contact", "tel", "e.g. 0701234567"], ["Number of Dependents", "dependents", "number", "e.g. 3"]].map(([l, k, t, p]) => (
                    <div key={k} style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: C.slate, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>{l}</label>
                      <input type={t} value={form[k]} onChange={e => upd(k, e.target.value)} placeholder={p} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, boxSizing: "border-box" }} />
                    </div>
                  ))}
                  <button onClick={() => setStep(2)} disabled={!form.name || !form.nin || !form.contact} style={{ background: C.pru, color: C.white, border: "none", padding: "12px 28px", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer", marginTop: 8, opacity: (!form.name || !form.nin || !form.contact) ? 0.5 : 1 }}>
                    Continue →
                  </button>
                </div>
              )}
              {step === 2 && choice === "join" && (
                <div>
                  <h3 style={{ color: C.navy, margin: "0 0 8px" }}>Select a CBHI</h3>
                  <p style={{ color: C.muted, fontSize: 13, marginBottom: 20 }}>Choose the community health insurance group in your area.</p>
                  {activeCbhis.map(c => (
                    <div key={c.id} onClick={() => setSelectedCbhi(c.id)} style={{ border: `2px solid ${selectedCbhi === c.id ? C.teal : C.border}`, borderRadius: 12, padding: "16px 18px", marginBottom: 12, cursor: "pointer", background: selectedCbhi === c.id ? C.tealLight : C.white }}>
                      <div style={{ fontWeight: 700, color: C.navy }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>{c.location} · {c.members} members</div>
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                    <button onClick={() => setStep(1)} style={{ background: C.bg, color: C.navy, border: `1px solid ${C.border}`, padding: "10px 20px", borderRadius: 8, fontSize: 14, cursor: "pointer" }}>← Back</button>
                    <button onClick={() => setStep(3)} disabled={!selectedCbhi} style={{ background: C.pru, color: C.white, border: "none", padding: "12px 28px", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: !selectedCbhi ? 0.5 : 1 }}>Continue →</button>
                  </div>
                </div>
              )}
              {step === 2 && choice === "register" && (
                <div>
                  <h3 style={{ color: C.navy, margin: "0 0 20px" }}>Community Information</h3>
                  {[["LC1", "lc1", "Your LC1 name"], ["Parish", "parish", "Parish name"], ["Sub-county", "subcounty", "Sub-county"], ["County", "county", "County"], ["District", "district", "District"], ["Estimated members", "dependents", "Min. 30 households"]].map(([l, k, p]) => (
                    <div key={k} style={{ marginBottom: 14 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: C.slate, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>{l}</label>
                      <input value={form[k]} onChange={e => upd(k, e.target.value)} placeholder={p} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, boxSizing: "border-box" }} />
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 12 }}>
                    <button onClick={() => setStep(1)} style={{ background: C.bg, color: C.navy, border: `1px solid ${C.border}`, padding: "10px 20px", borderRadius: 8, fontSize: 14, cursor: "pointer" }}>← Back</button>
                    <button onClick={() => setStep(3)} style={{ background: C.pru, color: C.white, border: "none", padding: "12px 28px", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Continue →</button>
                  </div>
                </div>
              )}
              {step === 3 && (
                <div>
                  <h3 style={{ color: C.navy, margin: "0 0 8px" }}>{choice === "join" ? "Preferred Interview Date" : "LC1 Recommendation Letter"}</h3>
                  <p style={{ color: C.muted, fontSize: 13, marginBottom: 20 }}>
                    {choice === "join" ? "Select a date when the Prudential marketing team can visit your household to capture your full household data." : "Attach your LC1 recommendation letter and select a preferred date for the community survey."}
                  </p>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: C.slate, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Preferred Date</label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                      {["May 19, 2026", "May 22, 2026", "May 26, 2026", "Jun 2, 2026", "Jun 5, 2026", "Jun 9, 2026"].map(d => (
                        <div key={d} onClick={() => upd("interviewDate", d)} style={{ border: `2px solid ${form.interviewDate === d ? C.pru : C.border}`, borderRadius: 8, padding: "10px 8px", textAlign: "center", cursor: "pointer", background: form.interviewDate === d ? C.pruLight : C.white, fontSize: 12, color: form.interviewDate === d ? C.pru : C.navy, fontWeight: form.interviewDate === d ? 700 : 400 }}>{d}</div>
                      ))}
                    </div>
                  </div>
                  {choice === "register" && (
                    <div style={{ marginBottom: 20 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: C.slate, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>LC1 Letter (PDF)</label>
                      <div style={{ border: `2px dashed ${C.border}`, borderRadius: 10, padding: "24px", textAlign: "center", color: C.muted, fontSize: 13 }}>
                        📎 Click to upload recommendation letter
                      </div>
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 12 }}>
                    <button onClick={() => setStep(2)} style={{ background: C.bg, color: C.navy, border: `1px solid ${C.border}`, padding: "10px 20px", borderRadius: 8, fontSize: 14, cursor: "pointer" }}>← Back</button>
                    <button onClick={handleSubmit} disabled={!form.interviewDate} style={{ background: C.teal, color: C.white, border: "none", padding: "12px 28px", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: !form.interviewDate ? 0.5 : 1 }}>
                      Submit Application ✓
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Root App ──────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("landing");
  const [role, setRole] = useState(null);

  const pages = {
    landing: <LandingPage setPage={setPage} />,
    story: <StoryPage setPage={setPage} />,
    admin_login: <AdminLogin setPage={setPage} setRole={setRole} />,
    cbhi_admin_login: <CbhiAdminLogin setPage={setPage} />,
    admin_dashboard: <AdminDashboard setPage={setPage} />,
    cbhi_admin: <CbhiAdmin setPage={setPage} />,
    customer: <CustomerPortal setPage={setPage} />,
    register_cbhi: <CustomerPortal setPage={setPage} />,
  };

  return (
    <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      {pages[page] || pages.landing}
    </div>
  );
}
