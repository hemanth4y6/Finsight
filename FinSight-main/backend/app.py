import math
from flask import Flask, request, jsonify
from flask_cors import CORS

from engine.parser              import parse_csv
from engine.signals             import compute_core_signals, individual_signals, sme_signals
from engine.scoring             import score_individual, score_sme
from engine.simulation          import simulate_discretionary_cut
from engine.utils               import risk_level
from engine.anomaly_detector    import detect_anomalies
from engine.forecast_engine     import forecast_financials
from engine.explainability_layer import generate_explanation
from engine.explain_llm         import explain_risk_llm
from modules.smart_compliance import smart_compliance_bp

app = Flask(__name__)
CORS(app)
app.register_blueprint(smart_compliance_bp, url_prefix="/smart-compliance")


# ─── JSON safety net ───────────────────────────────────────────────────────────

def sanitize_for_json(obj):
    """Recursively replace float Infinity / NaN with None so Flask
    never produces invalid JSON (e.g. 'Infinity' or 'NaN')."""
    if isinstance(obj, float):
        if math.isinf(obj) or math.isnan(obj):
            return None
        return obj
    if isinstance(obj, dict):
        return {k: sanitize_for_json(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [sanitize_for_json(v) for v in obj]
    return obj


# ─── Shared builder ────────────────────────────────────────────────────────────

def build_response(entity_type, df, score_fn, signal_fn):
    core    = compute_core_signals(df)
    signals = signal_fn(df, core)

    anomaly_result = detect_anomalies(df, core)

    score, weighted_scores = score_fn(signals, anomaly_result["anomaly_score"])
    level = risk_level(score)

    # Runway: months until reserves are exhausted given current monthly deficit.
    # Uses actual ₹ values instead of the dimensionless burn_rate coefficient.
    avg_income  = signals.get("avg_income",  0)
    avg_expense = signals.get("avg_expense", 0)
    avg_debt    = signals.get("avg_debt",    0)
    monthly_net = avg_income - avg_expense - avg_debt
    if monthly_net < 0:
        monthly_deficit = -monthly_net
        buffer  = avg_income * 2       # conservative 2-month income buffer
        _runway = buffer / monthly_deficit
        if math.isfinite(_runway):
            runway = float(min(round(_runway, 1), 36))  # cap at 36 months
        else:
            runway = None
    else:
        runway = None   # surplus — no immediate stress

    forecast    = forecast_financials(df)
    explanation = generate_explanation(
        score, level, signals, weighted_scores, anomaly_result, forecast
    )

    # LLM narrative (Ollama); falls back to rule-based full_text
    ai_text = explain_risk_llm(
        entity_type, score, level, signals,
        weighted_scores, explanation["top_drivers"], runway
    )
    if ai_text is None:
        ai_text = explanation["full_text"]

    # Recommendations (individual only)
    recommendations = []
    if entity_type == "Individual":
        impact = simulate_discretionary_cut(signals, 6000)
        if impact:
            recommendations.append({
                "action":        "Reduce discretionary spend by ₹6,000/month",
                "impact_months": impact,
            })

    return {
        "risk_score":            score,
        "risk_level":            level,
        "time_to_stress_months": runway,
        "signal_contributions":  weighted_scores,
        "signals":               signals,
        "top_drivers":           explanation["top_drivers"],
        "anomalies":             anomaly_result["events"],
        "forecast": {
            "trend_direction":         forecast["trend_direction"],
            "forecast_risk_direction": forecast["forecast_risk_direction"],
            "predicted_months":        forecast["predicted_months"],
        },
        "monthly_series": forecast["monthly_series"],
        "explanation": {
            "summary":          explanation["summary"],
            "top_drivers_text": [d["description"] for d in explanation["top_drivers"]],
            "trend_text":       explanation["trend_text"],
            "forecast_text":    explanation["forecast_text"],
        },
        "ai_explanation":  ai_text,
        "recommendations": recommendations,
    }


# ─── Routes ────────────────────────────────────────────────────────────────────

@app.route("/")
def health():
    return jsonify({"status": "FinSight backend running", "version": "2.0"})


@app.route("/analyze/individual", methods=["POST"])
def analyze_individual():
    try:
        df = parse_csv(request.files["file"])
        return jsonify(sanitize_for_json(build_response("Individual", df, score_individual, individual_signals)))
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/analyze/sme", methods=["POST"])
def analyze_sme():
    try:
        df = parse_csv(request.files["file"])
        return jsonify(sanitize_for_json(build_response("SME", df, score_sme, sme_signals)))
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/analyze/demo", methods=["GET"])
def demo_mode():
    """Pre-computed mock data — no file upload needed. Used by frontend demo mode."""
    demo_type = request.args.get("type", "individual")
    if demo_type == "sme":
        return jsonify(_sme_demo())
    return jsonify(_individual_demo())


# ─── Mock data ─────────────────────────────────────────────────────────────────

def _individual_demo():
    return {
        "risk_score":  68,
        "risk_level":  "High",
        "time_to_stress_months": 3.8,
        "signal_contributions": {
            "income_volatility":      0.118,
            "expense_volatility":     0.112,
            "obligation_ratio":       0.148,
            "cash_reserve_weakness":  0.102,
            "spending_anomaly_score": 0.120,
        },
        "signals": {
            "income_volatility":     0.472,
            "expense_volatility":    0.440,
            "obligation_ratio":      0.592,
            "cash_reserve_strength": 0.08,
            "avg_income":  82000,
            "avg_expense": 58000,
            "avg_debt":    15000,
            "burn_rate":   0.263,
        },
        "top_drivers": [
            {
                "driver":           "High Obligation Ratio",
                "description":      "Debt/EMI payments consume 59% of monthly income",
                "severity":         "high",
                "contribution_pct": 25,
            },
            {
                "driver":           "Spending Anomaly Detected",
                "description":      "Expense spike: ₹72,000 vs avg ₹58,000 (z=2.4σ) in Nov 2023",
                "severity":         "high",
                "contribution_pct": 20,
            },
            {
                "driver":           "Weak Cash Reserves",
                "description":      "Savings buffer is approximately 3.8 months of expenses",
                "severity":         "medium",
                "contribution_pct": 15,
            },
        ],
        "anomalies": [
            {
                "month":       "2023-11",
                "type":        "expense_spike",
                "description": "Expense spike: ₹72,000 vs avg ₹58,000 (z=2.4σ)",
                "severity":    "high",
                "z_score":     2.4,
            },
            {
                "month":       "2023-10",
                "type":        "cash_drop",
                "description": "Net savings dropped 42% vs previous month",
                "severity":    "medium",
                "z_score":     None,
            },
        ],
        "forecast": {
            "trend_direction":         "Increasing",
            "forecast_risk_direction": "Risk expected to increase if trend continues",
            "predicted_months": [
                {"month": "2024-01", "income": 81000, "expenses": 63000, "balance": 18000},
                {"month": "2024-02", "income": 80000, "expenses": 66000, "balance": 14000},
                {"month": "2024-03", "income": 79000, "expenses": 70000, "balance":  9000},
            ],
        },
        "monthly_series": [
            {"month": "2023-07", "income": 80000, "expenses": 44000, "balance": 36000, "forecast": False},
            {"month": "2023-08", "income": 85000, "expenses": 50000, "balance": 35000, "forecast": False},
            {"month": "2023-09", "income": 78000, "expenses": 54000, "balance": 24000, "forecast": False},
            {"month": "2023-10", "income": 84000, "expenses": 62000, "balance": 22000, "forecast": False},
            {"month": "2023-11", "income": 82000, "expenses": 72000, "balance": 10000, "forecast": False},
            {"month": "2023-12", "income": 80000, "expenses": 64000, "balance": 16000, "forecast": False},
            {"month": "2024-01", "income": 81000, "expenses": 63000, "balance": 18000, "forecast": True},
            {"month": "2024-02", "income": 80000, "expenses": 66000, "balance": 14000, "forecast": True},
            {"month": "2024-03", "income": 79000, "expenses": 70000, "balance":  9000, "forecast": True},
        ],
        "explanation": {
            "summary": "Risk Score: 68 (High Risk)",
            "top_drivers_text": [
                "Debt/EMI payments consume 59% of monthly income",
                "Expense spike detected in November: ₹72,000 vs avg ₹58,000",
                "Savings buffer is under 4 months — limited financial resilience",
            ],
            "trend_text":    "Risk has been increasing over the recent period",
            "forecast_text": "Risk expected to increase if trend continues",
        },
        "ai_explanation": (
            "⚡ Demo Mode (Ollama not active) — Rule-based Analysis:\n\n"
            "This individual is under significant financial pressure. EMI obligations consume "
            "nearly 60% of income, leaving minimal buffer for unexpected expenses. A major "
            "spending anomaly was detected in November (₹72,000 — 24% above average), which "
            "sharply reduced the monthly savings buffer.\n\n"
            "Recommendations:\n"
            "1. Reduce discretionary spend by at least ₹8,000/month to extend runway\n"
            "2. Review and consolidate high-interest EMI obligations immediately"
        ),
        "recommendations": [
            {"action": "Reduce discretionary spend by ₹6,000/month", "impact_months": 1.4}
        ],
    }


def _sme_demo():
    return {
        "risk_score":  54,
        "risk_level":  "Medium",
        "time_to_stress_months": 6.2,
        "signal_contributions": {
            "income_volatility":      0.080,
            "expense_volatility":     0.091,
            "obligation_ratio":       0.135,
            "cash_reserve_weakness":  0.130,
            "spending_anomaly_score": 0.104,
        },
        "signals": {
            "income_volatility":     0.320,
            "expense_volatility":    0.366,
            "obligation_ratio":      0.540,
            "cash_reserve_strength": 0.12,
            "avg_income":  520000,
            "avg_expense": 320000,
            "avg_debt":     60000,
            "burn_rate":   -0.161,
        },
        "top_drivers": [
            {
                "driver":           "High Obligation Ratio",
                "description":      "Debt/loan repayments consume 54% of monthly revenue",
                "severity":         "high",
                "contribution_pct": 25,
            },
            {
                "driver":           "Weak Cash Reserves",
                "description":      "Business cash buffer is approximately 6.2 months",
                "severity":         "medium",
                "contribution_pct": 20,
            },
            {
                "driver":           "Expense Volatility",
                "description":      "Monthly costs fluctuate 37% — operational instability",
                "severity":         "medium",
                "contribution_pct": 18,
            },
        ],
        "anomalies": [
            {
                "month":       "2023-09",
                "type":        "expense_spike",
                "description": "Operational costs spiked: ₹3,80,000 vs avg ₹3,20,000 (z=2.1σ)",
                "severity":    "medium",
                "z_score":     2.1,
            },
        ],
        "forecast": {
            "trend_direction":         "Stable",
            "forecast_risk_direction": "Risk expected to remain stable in near term",
            "predicted_months": [
                {"month": "2024-01", "income": 530000, "expenses": 325000, "balance": 205000},
                {"month": "2024-02", "income": 535000, "expenses": 330000, "balance": 205000},
                {"month": "2024-03", "income": 540000, "expenses": 335000, "balance": 205000},
            ],
        },
        "monthly_series": [
            {"month": "2023-07", "income": 480000, "expenses": 290000, "balance": 190000, "forecast": False},
            {"month": "2023-08", "income": 510000, "expenses": 310000, "balance": 200000, "forecast": False},
            {"month": "2023-09", "income": 490000, "expenses": 380000, "balance": 110000, "forecast": False},
            {"month": "2023-10", "income": 540000, "expenses": 330000, "balance": 210000, "forecast": False},
            {"month": "2023-11", "income": 520000, "expenses": 315000, "balance": 205000, "forecast": False},
            {"month": "2023-12", "income": 560000, "expenses": 340000, "balance": 220000, "forecast": False},
            {"month": "2024-01", "income": 530000, "expenses": 325000, "balance": 205000, "forecast": True},
            {"month": "2024-02", "income": 535000, "expenses": 330000, "balance": 205000, "forecast": True},
            {"month": "2024-03", "income": 540000, "expenses": 335000, "balance": 205000, "forecast": True},
        ],
        "explanation": {
            "summary": "Risk Score: 54 (Medium Risk)",
            "top_drivers_text": [
                "Debt/loan repayments consume 54% of monthly revenue",
                "Business cash buffer is limited — operational volatility risk",
                "One cost spike anomaly detected in September",
            ],
            "trend_text":    "Risk remains relatively stable with no strong trend",
            "forecast_text": "Risk expected to remain stable in near term",
        },
        "ai_explanation": (
            "⚡ Demo Mode (Ollama not active) — Rule-based Analysis:\n\n"
            "This SME shows moderate financial risk with relatively stable revenue growth. "
            "The primary concern is a high loan obligation-to-revenue ratio (54%), which "
            "limits financial flexibility. A cost spike in September temporarily stressed "
            "the balance sheet but the business recovered well.\n\n"
            "Recommendations:\n"
            "1. Maintain a minimum 3-month operating expense reserve at all times\n"
            "2. Explore refinancing options to reduce monthly debt obligations by 15-20%"
        ),
        "recommendations": [],
    }


if __name__ == "__main__":
    app.run(debug=True)
