import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";

const PALETTE = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6"];

function riskColor(score) {
  if (score >= 65) return "#ef4444";
  if (score >= 30) return "#f59e0b";
  return "#10b981";
}

const DarkTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div style={{
      background: "#0f172a",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: "10px",
      padding: "10px 14px",
      fontSize: "13px",
    }}>
      <p style={{ color: "#94a3b8", marginBottom: "4px" }}>{name}</p>
      <p style={{ color: "#f1f5f9", fontWeight: 700 }}>
        {(value * 100).toFixed(1)}%
      </p>
    </div>
  );
};

export default function Explain({ result }) {
  const navigate = useNavigate();

  if (!result || !result.signal_contributions) {
    return (
      <div className="page-wrapper" style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: "calc(100vh - 60px)",
      }}>
        <div style={{
          textAlign: "center",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "20px",
          padding: "48px 40px",
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
          <h2 style={{ marginBottom: "12px" }}>No Explainability Data</h2>
          <p style={{ color: "#64748b", marginBottom: "24px" }}>
            Run an analysis first to see the detailed breakdown.
          </p>
          <button className="btn-primary" onClick={() => navigate("/")}>Get Started</button>
        </div>
      </div>
    );
  }

  const explanation = result.explanation || {};
  const topDrivers  = result.top_drivers || [];
  const score       = result.risk_score;
  const rc          = riskColor(score);

  const chartData = Object.entries(result.signal_contributions)
    .map(([key, val]) => ({
      name:       key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      value:      parseFloat(val),
      percentage: Math.round(parseFloat(val) * 100),
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="page-wrapper">
      <div className="container" style={{ padding: "48px 24px 72px" }}>

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div style={{ marginBottom: "40px" }}>
          <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "6px" }}>
            Explainability
          </p>
          <h1 style={{ fontSize: "32px", fontWeight: 900, marginBottom: "10px" }}>
            Risk Analysis Breakdown
          </h1>
          <p style={{ color: "#64748b", fontSize: "15px" }}>
            Understanding the financial signals that drove this risk score.
          </p>
        </div>

        {/* ── Summary card ────────────────────────────────────────────── */}
        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: `1px solid ${rc}33`,
          borderRadius: "20px",
          padding: "24px 28px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "20px",
          boxShadow: `0 0 50px ${rc}12`,
        }}>
          <div>
            <p style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, marginBottom: "6px", textTransform: "uppercase" }}>
              Assessment Summary
            </p>
            <p style={{ fontSize: "22px", fontWeight: 800, color: "#f1f5f9" }}>
              {explanation.summary || `Risk Score: ${score}`}
            </p>
          </div>
          <div style={{
            textAlign: "center",
            minWidth: "100px",
          }}>
            <div style={{ fontSize: "56px", fontWeight: 900, color: rc, lineHeight: 1 }}>{score}</div>
            <div style={{
              marginTop: "4px",
              fontSize: "11px",
              fontWeight: 700,
              color: rc,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}>
              {result.risk_level} Risk
            </div>
          </div>
        </div>

        {/* ── Trend + Forecast narrative ──────────────────────────────── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginBottom: "28px",
        }}>
          <div style={{
            background: "rgba(59,130,246,0.06)",
            border: "1px solid rgba(59,130,246,0.2)",
            borderRadius: "14px",
            padding: "18px 20px",
          }}>
            <p style={{ fontSize: "11px", color: "#3b82f6", fontWeight: 700, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              📊 Current Trend
            </p>
            <p style={{ fontSize: "14px", color: "#cbd5e1", lineHeight: 1.6 }}>
              {explanation.trend_text || "Trend data unavailable"}
            </p>
          </div>
          <div style={{
            background: "rgba(139,92,246,0.06)",
            border: "1px solid rgba(139,92,246,0.2)",
            borderRadius: "14px",
            padding: "18px 20px",
          }}>
            <p style={{ fontSize: "11px", color: "#8b5cf6", fontWeight: 700, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              🔮 Forecast
            </p>
            <p style={{ fontSize: "14px", color: "#cbd5e1", lineHeight: 1.6 }}>
              {explanation.forecast_text || "Forecast data unavailable"}
            </p>
          </div>
        </div>

        {/* ── Top Drivers list ────────────────────────────────────────── */}
        {topDrivers.length > 0 && (
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "18px",
            padding: "24px",
            marginBottom: "28px",
          }}>
            <h2 style={{ fontSize: "17px", fontWeight: 700, marginBottom: "16px", color: "#f1f5f9" }}>
              🎯 Top Risk Drivers
            </h2>
            {topDrivers.map((d, i) => {
              const sevColor = d.severity === "high" ? "#ef4444" : d.severity === "medium" ? "#f59e0b" : "#10b981";
              return (
                <div key={i} style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.025)",
                  marginBottom: "8px",
                  borderLeft: `3px solid ${sevColor}`,
                }}>
                  <div style={{
                    width: 28, height: 28,
                    borderRadius: "8px",
                    background: `${sevColor}22`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "13px", fontWeight: 900,
                    color: sevColor, flexShrink: 0,
                  }}>
                    {i + 1}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: "14px", color: "#f1f5f9", marginBottom: "3px" }}>
                      {d.driver}
                    </p>
                    <p style={{ fontSize: "13px", color: "#94a3b8" }}>{d.description}</p>
                  </div>
                  <div style={{
                    marginLeft: "auto",
                    flexShrink: 0,
                    fontSize: "13px",
                    fontWeight: 700,
                    color: sevColor,
                  }}>
                    {d.contribution_pct}%
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Charts ──────────────────────────────────────────────────── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
          marginBottom: "28px",
        }}>
          {/* Pie */}
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "18px",
            padding: "24px",
          }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "20px", color: "#f1f5f9" }}>
              Risk Distribution
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%" cy="50%"
                  outerRadius={95}
                  innerRadius={42}
                  dataKey="value"
                  labelLine={false}
                  label={({ name, percent }) =>
                    percent > 0.08 ? `${(percent * 100).toFixed(0)}%` : ""
                  }
                >
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip content={<DarkTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar */}
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "18px",
            padding: "24px",
          }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "20px", color: "#f1f5f9" }}>
              Signal Contributions
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 24 }}>
                <XAxis
                  type="number"
                  tickFormatter={(v) => `${Math.round(v * 100)}%`}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  type="category" dataKey="name" width={140}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip content={<DarkTooltip />} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Signal details table ─────────────────────────────────────── */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "18px",
          padding: "24px",
          marginBottom: "32px",
        }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "20px", color: "#f1f5f9" }}>
            Signal Details
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {chartData.map((item, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
              }}>
                <span style={{
                  width: "10px", height: "10px",
                  borderRadius: "999px",
                  background: PALETTE[i % PALETTE.length],
                  flexShrink: 0,
                }} />
                <span style={{ flex: 1, fontSize: "13px", color: "#cbd5e1" }}>{item.name}</span>
                <div style={{
                  width: "140px",
                  height: "6px",
                  borderRadius: "999px",
                  background: "rgba(255,255,255,0.08)",
                  overflow: "hidden",
                }}>
                  <div style={{
                    width: `${item.percentage}%`,
                    height: "100%",
                    background: PALETTE[i % PALETTE.length],
                    borderRadius: "999px",
                  }} />
                </div>
                <span style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: PALETTE[i % PALETTE.length],
                  width: "38px",
                  textAlign: "right",
                }}>
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTAs ─────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
          <button
            onClick={() => navigate("/results")}
            className="btn-primary"
          >
            ← Back to Dashboard
          </button>
          <button
            onClick={() => navigate("/")}
            className="btn-ghost"
          >
            New Analysis
          </button>
        </div>
      </div>
    </div>
  );
}