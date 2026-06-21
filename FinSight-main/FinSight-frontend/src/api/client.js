const API_BASE = "http://127.0.0.1:5000";

/**
 * Analyse an individual's financial data from a CSV file.
 * @param {File} file
 * @returns {Promise<Object>} Analysis result
 */
export async function analyzeIndividual(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/analyze/individual`, { method: "POST", body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

/**
 * Analyse an SME's financial data from a CSV file.
 * @param {File} file
 * @returns {Promise<Object>} Analysis result
 */
export async function analyzeSME(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/analyze/sme`, { method: "POST", body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

/**
 * Load pre-computed demo data (no file needed).
 * @param {"individual"|"sme"} type
 * @returns {Promise<Object>} Demo result
 */
export async function getDemo(type = "individual") {
  const res = await fetch(`${API_BASE}/analyze/demo?type=${type}`);
  if (!res.ok) throw new Error(`Demo fetch failed: HTTP ${res.status}`);
  return res.json();
}
