import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { analyzeCompliance, downloadComplianceReport } from "./api.js";

const riskAccent = {
  High: "#ef4444",
  Medium: "#f59e0b",
  Low: "#10b981",
};

export default function SmartCompliancePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!file && !text.trim()) {
      setError("Upload a file or paste document text to analyze.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await analyzeCompliance({ file, text });
      setResult(data);
    } catch (err) {
      setError(err.message || "Could not analyze the document.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!result) return;

    setDownloadLoading(true);
    setError("");

    try {
      const blob = await downloadComplianceReport(result);
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "compliance_report.pdf";
      anchor.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "Could not generate the report.");
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <section
        style={{
          padding: "56px 24px 72px",
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(16,185,129,0.18) 0%, transparent 70%)",
        }}
      >
        <div className="container" style={{ maxWidth: "1100px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "24px",
              flexWrap: "wrap",
              alignItems: "center",
              marginBottom: "28px",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 14px",
                  borderRadius: "9999px",
                  background: "rgba(16,185,129,0.12)",
                  border: "1px solid rgba(16,185,129,0.24)",
                  color: "#6ee7b7",
                  fontSize: "13px",
                  fontWeight: 600,
                  marginBottom: "18px",
                }}
              >
                Compliance Intelligence
              </div>
              <h1 style={{ fontSize: "clamp(34px, 5vw, 56px)", marginBottom: "12px" }}>
                Smart Compliance Copilot
              </h1>
              <p style={{ maxWidth: "720px", color: "#94a3b8", fontSize: "17px", lineHeight: 1.7 }}>
                Analyze policy, contract, or legal text for high-risk clauses using the existing
                FinSight backend. Upload a document or paste text, then generate a compliance
                report in one flow.
              </p>
            </div>

            <button className="btn-ghost" onClick={() => navigate("/")}>
              Back to Home
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.1fr) minmax(320px, 0.9fr)",
              gap: "24px",
              alignItems: "start",
            }}
          >
            <div
              className="glass"
              style={{
                padding: "28px",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              <h2 style={{ fontSize: "24px", marginBottom: "8px" }}>Analyze a document</h2>
              <p style={{ color: "#94a3b8", marginBottom: "24px" }}>
                Supports PDF and text-based files, or direct pasted text.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                hidden
                onChange={(event) => setFile(event.target.files?.[0] || null)}
              />

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginBottom: "18px",
                }}
              >
                <button className="btn-primary" onClick={() => fileInputRef.current?.click()}>
                  {file ? "Change File" : "Choose File"}
                </button>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "0 14px",
                    borderRadius: "14px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: file ? "#e2e8f0" : "#64748b",
                    minHeight: "48px",
                    background: "rgba(15,23,42,0.7)",
                    flex: "1 1 220px",
                  }}
                >
                  {file ? file.name : "No file selected"}
                </div>
              </div>

              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Paste legal, policy, or compliance text here..."
                style={{
                  width: "100%",
                  minHeight: "220px",
                  resize: "vertical",
                  background: "rgba(15,23,42,0.8)",
                  color: "#f8fafc",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "16px",
                  padding: "16px",
                  fontSize: "14px",
                  lineHeight: 1.7,
                  marginBottom: "16px",
                }}
              />

              {error ? (
                <div
                  style={{
                    marginBottom: "16px",
                    padding: "12px 14px",
                    borderRadius: "12px",
                    color: "#fecaca",
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.25)",
                  }}
                >
                  {error}
                </div>
              ) : null}

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button className="btn-primary" onClick={handleAnalyze} disabled={loading}>
                  {loading ? "Analyzing..." : "Analyze Document"}
                </button>
                <button
                  className="btn-ghost"
                  onClick={() => {
                    setFile(null);
                    setText("");
                    setResult(null);
                    setError("");
                  }}
                  disabled={loading || downloadLoading}
                >
                  Reset
                </button>
              </div>
            </div>

            <div
              className="glass"
              style={{
                padding: "28px",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              <h2 style={{ fontSize: "24px", marginBottom: "16px" }}>What this module does</h2>
              <div style={{ display: "grid", gap: "14px" }}>
                {[
                  "Flags obligation-heavy and enforcement-heavy clauses.",
                  "Summarizes clause-level risk into a quick compliance overview.",
                  "Renders a risk distribution chart for faster review.",
                  "Exports the analysis as a PDF report.",
                ].map((item) => (
                  <div
                    key={item}
                    style={{
                      padding: "14px 16px",
                      borderRadius: "14px",
                      background: "rgba(15,23,42,0.72)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      color: "#cbd5e1",
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {result ? (
            <div style={{ marginTop: "28px", display: "grid", gap: "24px" }}>
              <div
                className="glass"
                style={{
                  padding: "28px",
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) auto",
                  gap: "24px",
                  alignItems: "center",
                }}
              >
                <div>
                  <h2 style={{ fontSize: "24px", marginBottom: "10px" }}>Analysis Summary</h2>
                  <p style={{ color: "#cbd5e1", lineHeight: 1.8 }}>{result.summary}</p>
                </div>
                <button className="btn-primary" onClick={handleDownload} disabled={downloadLoading}>
                  {downloadLoading ? "Preparing PDF..." : "Download Compliance Report"}
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 340px)",
                  gap: "24px",
                  alignItems: "start",
                }}
              >
                <div className="glass" style={{ padding: "28px" }}>
                  <h2 style={{ fontSize: "24px", marginBottom: "18px" }}>Clause Review</h2>
                  <div style={{ display: "grid", gap: "16px" }}>
                    {result.risk_analysis?.map((item) => (
                      <article
                        key={`${item.clause_number}-${item.clause}`}
                        style={{
                          padding: "18px",
                          borderRadius: "16px",
                          border: `1px solid ${riskAccent[item.risk_level]}33`,
                          background: `${riskAccent[item.risk_level]}12`,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "12px",
                            alignItems: "center",
                            marginBottom: "10px",
                            flexWrap: "wrap",
                          }}
                        >
                          <strong style={{ fontSize: "15px" }}>Clause {item.clause_number}</strong>
                          <span
                            className={`risk-badge ${item.risk_level.toLowerCase()}`}
                            style={{ textTransform: "none" }}
                          >
                            {item.risk_level} Risk
                          </span>
                        </div>

                        <p style={{ color: "#e2e8f0", lineHeight: 1.8, marginBottom: "10px" }}>
                          {item.clause}
                        </p>
                        <p style={{ color: "#94a3b8", fontSize: "14px" }}>{item.reason}</p>
                      </article>
                    ))}
                  </div>
                </div>

                <div className="glass" style={{ padding: "28px" }}>
                  <h2 style={{ fontSize: "24px", marginBottom: "18px" }}>Risk Distribution</h2>

                  <div style={{ display: "grid", gap: "12px", marginBottom: "18px" }}>
                    {Object.entries(result.risk_counts || {}).map(([label, count]) => (
                      <div
                        key={label}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "12px 14px",
                          borderRadius: "12px",
                          background: "rgba(15,23,42,0.75)",
                          border: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        <span style={{ color: "#cbd5e1" }}>{label}</span>
                        <strong style={{ color: riskAccent[label] }}>{count}</strong>
                      </div>
                    ))}
                  </div>

                  {result.risk_chart_base64 ? (
                    <img
                      src={`data:image/png;base64,${result.risk_chart_base64}`}
                      alt="Compliance risk distribution"
                      style={{
                        width: "100%",
                        borderRadius: "18px",
                        background: "#fff",
                        padding: "8px",
                      }}
                    />
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

