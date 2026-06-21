const API_BASE = "http://127.0.0.1:5000";

export async function analyzeCompliance({ file, text }) {
  const formData = new FormData();
  if (file) formData.append("file", file);
  if (text?.trim()) formData.append("text", text.trim());

  const response = await fetch(`${API_BASE}/smart-compliance/process`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function downloadComplianceReport(result) {
  const response = await fetch(`${API_BASE}/smart-compliance/download-report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(result),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Download failed" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.blob();
}

