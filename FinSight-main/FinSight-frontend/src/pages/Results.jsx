import { useNavigate } from "react-router-dom";
import TrendChart from "../components/TrendChart.jsx";

/* ── helpers ──────────────────────────────────────────────────────────────── */
function riskColor(level) {
  if (!level) return "#94a3b8";
  const l = level.toLowerCase();
  if (l === "low")    return "#10b981";
  if (l === "medium") return "#f59e0b";
  return "#ef4444";
}
function fmtInr(v) {
  if (v == null) return "—";
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000)   return `₹${(v / 1000).toFixed(0)}K`;
  return `₹${v}`;
}

/* ── sub-components ──────────────────────────────────────────────────────── */
function StatCard({ label, value, sub, color }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "16px",
      padding: "20px",
    }}>
      <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "6px", fontWeight: 500 }}>{label}</p>
      <p style={{ fontSize: "22px", fontWeight: 800, color: color || "#f1f5f9" }}>{value}</p>
      {sub && <p style={{ fontSize: "12px", color: "#475569", marginTop: "4px" }}>{sub}</p>}
    </div>
  );
}

function DriverCard({ driver, index }) {
  const sevColor = driver.severity === "high" ? "#ef4444" : driver.severity === "medium" ? "#f59e0b" : "#10b981";
  const icons = ["🔴", "🟠", "🟡"];
  return (
    <div style={{
      display: "flex",
      gap: "14px",
      alignItems: "flex-start",
      padding: "16px 18px",
      background: "rgba(255,255,255,0.03)",
      borderRadius: "14px",
      border: `1px solid ${sevColor}22`,
    }}>
      <span style={{ fontSize: "20px", marginTop: "1px", flexShrink: 0 }}>{icons[index] || "⚪"}</span>
      <div>
        <p style={{ fontWeight: 700, fontSize: "15px", marginBottom: "4px", color: "#f1f5f9" }}>
          {driver.driver}
        </p>
        <p style={{ fontSize: "13px", color: "#94a3b8", lineHeight: 1.5 }}>{driver.description}</p>
        <div style={{
          display: "inline-flex",
          marginTop: "8px",
          padding: "2px 10px",
          borderRadius: "999px",
          background: `${sevColor}18`,
          border: `1px solid ${sevColor}33`,
          fontSize: "11px",
          color: sevColor,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}>
          {driver.contribution_pct}% contribution · {driver.severity} risk
        </div>
      </div>
    </div>
  );
}

function AnomalyRow({ anomaly }) {
  const typeIcon = {
    expense_spike: "⚡",
    cash_drop:     "📉",
    income_drop:   "💸",
  };
  const sevColor = anomaly.severity === "high" ? "#ef4444" : "#f59e0b";
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "14px",
      padding: "12px 14px",
      borderRadius: "10px",
      background: "rgba(255,255,255,0.025)",
      borderLeft: `3px solid ${sevColor}`,
    }}>
      <span style={{ fontSize: "18px" }}>{typeIcon[anomaly.type] || "⚠️"}</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: "13px", color: "#cbd5e1", fontWeight: 500 }}>{anomaly.description}</p>
        <p style={{ fontSize: "12px", color: "#475569", marginTop: "2px" }}>{anomaly.month}</p>
      </div>
      {anomaly.z_score && (
        <span style={{
          fontSize: "12px", fontWeight: 700,
          color: sevColor,
          background: `${sevColor}18`,
          padding: "2px 8px",
          borderRadius: "6px",
        }}>
          z={anomaly.z_score}σ
        </span>
      )}
    </div>
  );
}

function ForecastBadge({ direction }) {
  const map = {
    Increasing: { icon: "↑", color: "#ef4444", label: "Rising Risk",    bg: "rgba(239,68,68,0.1)" },
    Decreasing: { icon: "↓", color: "#10b981", label: "Declining Risk", bg: "rgba(16,185,129,0.1)" },
    Stable:     { icon: "→", color: "#f59e0b", label: "Stable Risk",    bg: "rgba(245,158,11,0.1)" },
  };
  const { icon, color, label, bg } = map[direction] || map.Stable;
  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "8px 18px",
      borderRadius: "999px",
      background: bg,
      border: `1px solid ${color}44`,
    }}>
      <span style={{ fontSize: "20px", color, fontWeight: 900 }}>{icon}</span>
      <div>
        <p style={{ fontSize: "13px", fontWeight: 700, color }}>{label}</p>
        <p style={{ fontSize: "11px", color: "#64748b" }}>{direction} Trend</p>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */
export default function Results({ result }) {
  const navigate = useNavigate();

  if (!result) {
    return (
      <div className="page-wrapper" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          textAlign: "center",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "20px",
          padding: "48px 40px",
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
          <h2 style={{ marginBottom: "12px" }}>No results yet</h2>
          <p style={{ color: "#64748b", marginBottom: "24px" }}>
            Upload a CSV or try a demo to see risk analysis.
          </p>
          <button className="btn-primary" onClick={() => navigate("/")}>Get Started</button>
        </div>
      </div>
    );
  }

  const rc           = riskColor(result.risk_level);
  const score        = Math.min(Math.max(result.risk_score, 0), 100);
  const topDrivers   = result.top_drivers || [];
  const anomalies    = result.anomalies   || [];
  const forecast     = result.forecast    || {};
  const explanation  = result.explanation || {};
  const monthlySeries= result.monthly_series || [];

  return (
    <div className="page-wrapper">
      <div className="container" style={{ padding: "48px 24px 72px" }}>

        {/* ── Page header ─────────────────────────────────────────────── */}
        <div style={{ marginBottom: "40px" }}>
          <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "6px" }}>
            Financial Risk Assessment
          </p>
          <h1 style={{ fontSize: "32px", fontWeight: 900 }}>Risk Intelligence Report</h1>
        </div>

        {/* ── Row 1: Score + Forecast + Stats ────────────────────────── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: "24px",
          marginBottom: "28px",
          alignItems: "start",
        }}>
          {/* Score card */}
          <div style={{
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${rc}33`,
            borderRadius: "22px",
            padding: "32px 36px",
            textAlign: "center",
            minWidth: "220px",
            boxShadow: `0 0 60px ${rc}18`,
          }}>
            <p style={{ color: "#64748b", fontSize: "12px", fontWeight: 600, marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Risk Score
            </p>
            <div style={{
              fontSize: "80px",
              fontWeight: 900,
              lineHeight: 1,
              color: rc,
              marginBottom: "8px",
              textShadow: `0 0 40px ${rc}55`,
            }}>
              {score}
            </div>
            <div style={{
              display: "inline-block",
              padding: "4px 14px",
              borderRadius: "999px",
              background: `${rc}18`,
              border: `1px solid ${rc}44`,
              color: rc,
              fontSize: "13px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "18px",
            }}>
              {result.risk_level} Risk
            </div>

            {/* Score bar */}
            <div style={{
              height: "8px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.07)",
              overflow: "hidden",
              marginBottom: "4px",
            }}>
              <div style={{
                width: `${score}%`,
                height: "100%",
                background: `linear-gradient(90deg, ${rc}99, ${rc})`,
                boxShadow: `0 0 12px ${rc}66`,
                transition: "width 1s ease",
              }} />
            </div>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "10px",
              color: "#334155",
            }}>
              <span>Low</span><span>Medium</span><span>High</span>
            </div>
          </div>

          {/* Right side: forecast + stat grid */}
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {/* Forecast indicator */}
            <div style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "16px",
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "16px",
            }}>
              <div>
                <p style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, marginBottom: "6px" }}>
                  FORECAST DIRECTION
                </p>
                <p style={{ fontSize: "13px", color: "#94a3b8" }}>
                  {forecast.forecast_risk_direction || "—"}
                </p>
              </div>
              <ForecastBadge direction={forecast.trend_direction || "Stable"} />
            </div>

            {/* Stats */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "14px",
            }}>
              <StatCard
                label="Time to Stress"
                value={result.time_to_stress_months ? `${result.time_to_stress_months}mo` : "Stable"}
                sub={result.time_to_stress_months ? "Months of runway" : "No immediate stress"}
                color={result.time_to_stress_months < 6 ? "#ef4444" : "#10b981"}
              />
              <StatCard label="Avg Income"  value={fmtInr(result.signals?.avg_income)}  />
              <StatCard label="Avg Expense" value={fmtInr(result.signals?.avg_expense)} />
              <StatCard label="Obligation"
                value={`${Math.round((result.signals?.obligation_ratio || 0) * 100)}%`}
                sub="of income as debt"
                color={(result.signals?.obligation_ratio || 0) > 0.4 ? "#ef4444" : "#10b981"}
              />
            </div>
          </div>
        </div>

        {/* ── Row 2: Risk Drivers ─────────────────────────────────────── */}
        {topDrivers.length > 0 && (
          <section style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "20px",
            padding: "28px",
            marginBottom: "24px",
          }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "18px", color: "#f1f5f9" }}>
              🎯 Top Risk Drivers
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {topDrivers.map((d, i) => (
                <DriverCard key={i} driver={d} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* ── Row 3: Trend Chart ──────────────────────────────────────── */}
        {monthlySeries.length > 0 && (
          <section style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "20px",
            padding: "28px",
            marginBottom: "24px",
          }}>
            <div style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: "24px",
              flexWrap: "wrap",
              gap: "12px",
            }}>
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#f1f5f9" }}>
                  📈 Financial Trend & Forecast
                </h2>
                <p style={{ color: "#64748b", fontSize: "13px", marginTop: "4px" }}>
                  Historical data + 3-month projection (dashed region)
                </p>
              </div>
              <ForecastBadge direction={forecast.trend_direction || "Stable"} />
            </div>
            <TrendChart data={monthlySeries} />
          </section>
        )}

        {/* ── Row 4: Anomaly Events ───────────────────────────────────── */}
        {anomalies.length > 0 && (
          <section style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "20px",
            padding: "28px",
            marginBottom: "24px",
          }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px", color: "#f1f5f9" }}>
              ⚡ Detected Anomalies
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {anomalies.map((a, i) => <AnomalyRow key={i} anomaly={a} />)}
            </div>
          </section>
        )}

        {/* ── Row 5: AI Explanation ──────────────────────────────────── */}
        <section style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(59,130,246,0.2)",
          borderRadius: "20px",
          padding: "28px",
          marginBottom: "24px",
        }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "6px", color: "#f1f5f9" }}>
            💡 AI Explanation
          </h2>
          <p style={{ fontSize: "12px", color: "#475569", marginBottom: "16px" }}>
            {result.ai_explanation?.startsWith("⚡ Demo Mode") ? "Rule-based fallback active" : "Powered by Ollama LLM"}
          </p>
          <pre style={{
            whiteSpace: "pre-wrap",
            fontFamily: "'Inter', sans-serif",
            fontSize: "14px",
            color: "#cbd5e1",
            lineHeight: 1.75,
          }}>
            {result.ai_explanation || explanation.full_text || "No explanation available."}
          </pre>
        </section>

        {/* ── Recommendations ────────────────────────────────────────── */}
        {result.recommendations?.length > 0 && (
          <section style={{
            background: "rgba(16,185,129,0.06)",
            border: "1px solid rgba(16,185,129,0.2)",
            borderRadius: "16px",
            padding: "20px 24px",
            marginBottom: "28px",
          }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "12px", color: "#34d399" }}>
              ✅ Recommendations
            </h3>
            {result.recommendations.map((r, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "12px",
                fontSize: "14px", color: "#a7f3d0", marginBottom: "8px",
              }}>
                <span style={{ color: "#10b981", fontWeight: 700 }}>→</span>
                {r.action}
                {r.impact_months && (
                  <span style={{ color: "#059669", fontSize: "12px" }}>
                    (+{r.impact_months} months runway)
                  </span>
                )}
              </div>
            ))}
          </section>
        )}

        {/* ── CTA ────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <button
            onClick={() => navigate("/explain")}
            className="btn-primary"
            style={{ flex: "1 1 200px" }}
          >
            View Detailed Breakdown →
          </button>
          <button
            onClick={() => navigate("/")}
            className="btn-ghost"
            style={{ flex: "1 1 160px" }}
          >
            New Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
