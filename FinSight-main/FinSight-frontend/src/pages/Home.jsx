import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { getDemo } from "../api/client.js";

const features = [
  {
    icon: "📊",
    title: "Weighted Risk Scoring",
    desc: "5-factor model: income volatility, expense volatility, obligation ratio, cash reserves, and anomaly signals.",
    color: "#3b82f6",
  },
  {
    icon: "🔍",
    title: "Anomaly Detection",
    desc: "Z-score based detection of expense spikes, cash drop events, and income disruptions.",
    color: "#06b6d4",
  },
  {
    icon: "📈",
    title: "3-Month Forecasting",
    desc: "Linear regression + moving average projections for income, expense, and net balance trends.",
    color: "#8b5cf6",
  },
  {
    icon: "💡",
    title: "Explainability Engine",
    desc: "Rule-based + LLM-powered explanations — top drivers, trend narratives, and actionable recommendations.",
    color: "#10b981",
  },
];

const stats = [
  { value: "5-Factor", label: "Risk Model" },
  { value: "3-Month",  label: "Forecast Horizon" },
  { value: "Real-time", label: "Analysis" },
];

export default function Home({ updateResult }) {
  const navigate  = useNavigate();
  const [loading, setLoading] = useState(null); // "individual" | "sme" | null

  const handleDemo = async (type) => {
    setLoading(type);
    try {
      const data = await getDemo(type);
      updateResult(data, type);
      navigate("/results");
    } catch {
      alert("Could not reach backend. Is it running on port 5000?");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="page-wrapper">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section style={{
        padding: "80px 24px 60px",
        textAlign: "center",
        background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(59,130,246,0.18) 0%, transparent 70%)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div className="container">
          {/* Eyebrow */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 16px",
            borderRadius: "9999px",
            background: "rgba(59,130,246,0.12)",
            border: "1px solid rgba(59,130,246,0.25)",
            fontSize: "13px",
            color: "#93c5fd",
            marginBottom: "28px",
            fontWeight: 500,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6", animation: "pulse-ring 2s infinite" }} />
            AI-powered Financial Intelligence
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: "clamp(40px, 6vw, 72px)",
            fontWeight: 900,
            lineHeight: 1.08,
            marginBottom: "20px",
            letterSpacing: "-0.04em",
          }}>
            <span className="gradient-text">FinSight</span>
            <span style={{ display: "block", color: "#f1f5f9", fontSize: "0.72em", fontWeight: 700, marginTop: "4px" }}>
              Explainable Risk Intelligence
            </span>
          </h1>

          <p style={{
            maxWidth: "620px",
            margin: "0 auto 40px",
            color: "#94a3b8",
            fontSize: "18px",
            lineHeight: 1.7,
          }}>
            Detect hidden financial stress before it becomes a crisis.
            Built for individuals and SMEs — powered by AI, backed by data.
          </p>

          <div style={{ marginBottom: "44px" }}>
            <button
              onClick={() => navigate("/smart-compliance")}
              style={{
                background: "linear-gradient(135deg, #10b981, #14b8a6)",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                padding: "14px 24px",
                fontSize: "15px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 8px 28px rgba(16,185,129,0.28)",
              }}
            >
              Smart Compliance Copilot
            </button>
          </div>

          {/* Stat pills */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "24px",
            flexWrap: "wrap",
            marginBottom: "56px",
          }}>
            {stats.map(({ value, label }) => (
              <div key={label} style={{
                padding: "10px 24px",
                borderRadius: "9999px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)",
                textAlign: "center",
              }}>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#3b82f6" }}>{value}</div>
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>{label}</div>
              </div>
            ))}
          </div>

          {/* CTA Cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
            maxWidth: "720px",
            margin: "0 auto",
          }}>
            {[
              {
                type: "individual",
                icon: "👤",
                title: "Individual",
                desc: "Personal financial risk assessment — understand your EMI exposure, savings runway, and spending anomalies.",
                accent: "#3b82f6",
              },
              {
                type: "sme",
                icon: "🏢",
                title: "SME / Business",
                desc: "Business risk analysis — track revenue volatility, operating leverage, and debt coverage ratios.",
                accent: "#06b6d4",
              },
            ].map(({ type, icon, title, desc, accent }) => (
              <div key={type} style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: "20px",
                padding: "28px",
                textAlign: "left",
                transition: "all 0.2s ease",
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.border = `1px solid ${accent}55`;
                  e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                  e.currentTarget.style.transform = "translateY(-3px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(255,255,255,0.09)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{
                  width: 52, height: 52,
                  borderRadius: "14px",
                  background: `${accent}22`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "26px",
                  marginBottom: "16px",
                }}>
                  {icon}
                </div>

                <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "10px" }}>{title}</h3>
                <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: 1.6, marginBottom: "24px" }}>{desc}</p>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => navigate(`/upload/${type}`)}
                    style={{
                      flex: 1,
                      background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                      color: "#fff",
                      border: "none",
                      borderRadius: "10px",
                      padding: "11px 0",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                      boxShadow: `0 4px 18px ${accent}44`,
                      transition: "all 0.2s ease",
                    }}
                  >
                    Upload CSV
                  </button>

                  <button
                    onClick={() => handleDemo(type)}
                    disabled={loading === type}
                    style={{
                      flex: 1,
                      background: "rgba(255,255,255,0.07)",
                      color: "#cbd5e1",
                      border: "1px solid rgba(255,255,255,0.13)",
                      borderRadius: "10px",
                      padding: "11px 0",
                      fontSize: "14px",
                      fontWeight: 500,
                      cursor: loading === type ? "not-allowed" : "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {loading === type ? "Loading…" : "⚡ Try Demo"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────── */}
      <section style={{ padding: "72px 24px" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "52px" }}>
            <h2 style={{ fontSize: "32px", color: "#f1f5f9", marginBottom: "12px" }}>
              Production-grade intelligence engine
            </h2>
            <p style={{ color: "#64748b", fontSize: "16px" }}>
              Every module is interpretable, auditable, and demo-ready
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "20px",
          }}>
            {features.map(({ icon, title, desc, color }) => (
              <div key={title} style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "18px",
                padding: "28px",
                transition: "all 0.2s ease",
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = `0 12px 40px ${color}22`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{
                  width: 48, height: 48,
                  borderRadius: "12px",
                  background: `${color}1a`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "24px",
                  marginBottom: "16px",
                }}>
                  {icon}
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>{title}</h3>
                <p style={{ color: "#64748b", fontSize: "14px", lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "24px",
        textAlign: "center",
        color: "#334155",
        fontSize: "13px",
      }}>
        FinSight v2.0 — Explainable Financial Risk Intelligence Engine
      </footer>
    </div>
  );
}
