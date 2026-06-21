"""
LLM Explainability — FinSight Engine
Calls a local Ollama server for a rich narrative explanation.
Returns None gracefully when Ollama is unavailable (caller falls back to rule-based).
"""

import requests
import json

OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL      = "deepseek-r1:7b"


def explain_risk_llm(entity_type, risk_score, risk_level, signals,
                     weighted_scores, top_drivers, runway):
    """
    Call Ollama LLM for a rich narrative financial risk explanation.

    Args:
        entity_type    : "Individual" | "SME"
        risk_score     : float  0-100
        risk_level     : str    "Low" | "Medium" | "High"
        signals        : dict   raw signal values
        weighted_scores: dict   {key: weighted_contribution}
        top_drivers    : list   [{"driver": str, "description": str, ...}]
        runway         : float | None  months to financial stress

    Returns:
        str   — LLM narrative text, or None if Ollama is unavailable
    """

    driver_text = "\n".join(
        f"  - {d['driver']}: {d['description']}"
        for d in (top_drivers or [])
    )

    runway_str = f"{runway} months" if runway else "stable (expenses ≤ income)"

    prompt = f"""You are a senior financial risk analyst presenting findings to a client.

Client Type   : {entity_type}
Risk Score    : {risk_score}/100
Risk Level    : {risk_level}
Financial Runway: {runway_str}

Top Risk Drivers Identified:
{driver_text}

Raw Signal Data (for reference):
{json.dumps(signals, indent=2)}

Please provide a concise, professional risk report covering:
1. A 2-sentence summary of the overall financial health
2. The 2 most critical risk factors and why they are dangerous
3. Two specific, actionable recommendations (use ₹ for any amounts)

Constraints: < 160 words, professional tone, avoid bullet overload.
"""

    payload = {
        "model":    MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "stream":   False,
    }

    try:
        resp = requests.post(OLLAMA_URL, json=payload, timeout=30)
        resp.raise_for_status()
        return resp.json()["message"]["content"]
    except Exception:
        # Return None → caller uses rule-based fallback text
        return None