import { useParams, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { analyzeIndividual, analyzeSME } from "../api/client.js";

const API_BASE = "http://127.0.0.1:5000";

const SAMPLE_FILES = {
  individual: "/sample_individual.csv",
  sme:        "/sample_sme.csv",
};

export default function Upload({ setResult }) {
  const { type }   = useParams();
  const navigate   = useNavigate();
  const inputRef   = useRef();

  const [file,    setFile]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [drag,    setDrag]    = useState(false);
  const [error,   setError]   = useState("");

  const isIndividual = type === "individual";
  const accentColor  = isIndividual ? "#3b82f6" : "#06b6d4";

  // ── Submit real file ──────────────────────────────────────────────────────
  const submit = async () => {
    if (!file) { setError("Please upload a CSV file first."); return; }
    setLoading(true);
    setError("");
    try {
      const data = isIndividual
        ? await analyzeIndividual(file)
        : await analyzeSME(file);
      setResult(data, type);
      navigate("/results");
    } catch (err) {
      setError(err.message || "Server error — is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  // ── Load sample dataset (backend file path) ──────────────────────────────
  const loadSample = async () => {
    setLoading(true);
    setError("");
    try {
      const filename = isIndividual ? "sample_individual.csv" : "sample_sme.csv";
      const res  = await fetch(`${API_BASE}/sample/${filename}`);
      if (!res.ok) throw new Error("Sample file not found on server");
      const blob = await res.blob();
      const f    = new File([blob], filename, { type: "text/csv" });
      setFile(f);
    } catch {
      // If backend sample endpoint not available, show message
      setError("Sample file unavailable on server. Please upload the CSV from backend/data/ folder.");
    } finally {
      setLoading(false);
    }
  };

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const onDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f?.name.endsWith(".csv")) { setFile(f); setError(""); }
    else setError("Only .csv files are accepted.");
  };

  return (
    <div className="page-wrapper" style={{ minHeight: "calc(100vh - 60px)" }}>
      <div className="container" style={{ padding: "60px 24px", maxWidth: "760px" }}>

        {/* Header */}
        <div style={{ marginBottom: "36px" }}>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "none", border: "none",
              color: "#64748b",
              fontSize: "14px",
              cursor: "pointer",
              marginBottom: "20px",
              display: "flex", alignItems: "center", gap: "6px",
            }}
          >
            ← Back
          </button>

          <div style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            background: `${accentColor}18`,
            border: `1px solid ${accentColor}33`,
            borderRadius: "999px",
            padding: "6px 16px",
            marginBottom: "16px",
          }}>
            <span style={{ fontSize: "16px" }}>{isIndividual ? "👤" : "🏢"}</span>
            <span style={{ fontSize: "13px", color: accentColor, fontWeight: 600 }}>
              {isIndividual ? "Individual Analysis" : "SME Analysis"}
            </span>
          </div>

          <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "10px" }}>
            Upload Financial Data
          </h1>
          <p style={{ color: "#64748b", fontSize: "16px" }}>
            {isIndividual
              ? "Upload a 6-month transaction CSV to assess personal financial risk."
              : "Upload a 6-month business transaction CSV for SME risk analysis."}
          </p>
        </div>

        {/* Drop zone */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          style={{
            border: `2px dashed ${drag ? accentColor : file ? "#10b981" : "rgba(255,255,255,0.15)"}`,
            borderRadius: "18px",
            padding: "52px 24px",
            textAlign: "center",
            cursor: "pointer",
            background: drag
              ? `${accentColor}0a`
              : file
              ? "rgba(16,185,129,0.06)"
              : "rgba(255,255,255,0.03)",
            transition: "all 0.2s ease",
            marginBottom: "16px",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>
            {file ? "✅" : drag ? "📂" : "⬆️"}
          </div>
          <p style={{
            fontSize: "16px", fontWeight: 600,
            color: file ? "#10b981" : "#f1f5f9",
            marginBottom: "6px",
          }}>
            {file ? file.name : "Drop your CSV file here"}
          </p>
          <p style={{ color: "#64748b", fontSize: "14px" }}>
            {file ? `${(file.size / 1024).toFixed(1)} KB · Ready to analyse` : "or click to browse — .csv files only"}
          </p>

          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files[0];
              if (f) { setFile(f); setError(""); }
            }}
          />
        </div>

        {/* Sample dataset hint */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "12px",
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "28px",
          flexWrap: "wrap",
          gap: "10px",
        }}>
          <div>
            <p style={{ fontSize: "13px", color: "#cbd5e1", fontWeight: 500 }}>
              📁 Need a sample file?
            </p>
            <p style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
              Use <code style={{ color: "#3b82f6" }}>
                backend/data/{isIndividual ? "sample_individual.csv" : "sample_sme.csv"}
              </code>
            </p>
          </div>
          <button
            onClick={loadSample}
            disabled={loading}
            style={{
              background: `${accentColor}18`,
              border: `1px solid ${accentColor}44`,
              color: accentColor,
              borderRadius: "8px",
              padding: "8px 16px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Load Sample
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "10px",
            padding: "12px 16px",
            color: "#fca5a5",
            fontSize: "14px",
            marginBottom: "20px",
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={submit}
          disabled={!file || loading}
          style={{
            width: "100%",
            background: !file
              ? "rgba(255,255,255,0.05)"
              : `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
            color: !file ? "#334155" : "#fff",
            border: "none",
            borderRadius: "14px",
            padding: "16px",
            fontSize: "16px",
            fontWeight: 700,
            cursor: !file ? "not-allowed" : loading ? "wait" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            boxShadow: file ? `0 8px 28px ${accentColor}44` : "none",
            transition: "all 0.2s ease",
          }}
        >
          {loading
            ? (<><span className="spinner" /><span>Analysing…</span></>)
            : (<>🔍 Analyse Financial Data</>)
          }
        </button>

        {/* CSV format guide */}
        <div style={{
          marginTop: "32px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "12px",
          padding: "20px",
        }}>
          <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "10px", fontWeight: 600 }}>
            Required CSV columns:
          </p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {["date", "amount", "flow_type", "category", "sub_category"].map((col) => (
              <code key={col} style={{
                background: "rgba(59,130,246,0.12)",
                color: "#93c5fd",
                padding: "3px 10px",
                borderRadius: "6px",
                fontSize: "12px",
              }}>
                {col}
              </code>
            ))}
          </div>
          <p style={{ fontSize: "12px", color: "#475569", marginTop: "10px" }}>
            flow_type values: <code style={{ color: "#94a3b8" }}>income</code>,{" "}
            <code style={{ color: "#94a3b8" }}>expense</code>,{" "}
            <code style={{ color: "#94a3b8" }}>debt_payment</code>
          </p>
        </div>
      </div>
    </div>
  );
}
