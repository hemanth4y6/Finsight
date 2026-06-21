"""
Explainability Layer — FinSight Engine
Rule-based (no LLM required). Generates structured, human-readable risk
explanations from signals, weighted scores, anomalies, and forecast.

Used as:
  1. Primary structured output (always returned in `explanation` field)
  2. Fallback text when Ollama LLM is unavailable
"""

# ─── Label Maps ────────────────────────────────────────────────────────────────

DRIVER_LABELS = {
    "income_volatility":      "Income Volatility",
    "expense_volatility":     "Expense Volatility",
    "obligation_ratio":       "High Obligation Ratio",
    "cash_reserve_weakness":  "Weak Cash Reserves",
    "spending_anomaly_score": "Spending Anomaly Detected",
    # legacy / SME signals
    "discretionary_ratio":    "High Discretionary Spending",
    "fixed_cost_ratio":       "High Fixed Cost Ratio",
    "debt_pressure":          "Debt Pressure",
    "burn_rate":              "Cash Burn Rate",
    "operating_leverage":     "High Operating Leverage",
    "growth_ratio":           "Growth Expenditure Ratio",
}

DRIVER_DESCRIPTIONS = {
    "income_volatility":      "Income is highly irregular, making financial planning unreliable",
    "expense_volatility":     "Expenses fluctuate sharply month-to-month, indicating instability",
    "obligation_ratio":       "Debt/EMI payments consume a large share of monthly income",
    "cash_reserve_weakness":  "Net savings are insufficient relative to income — limited buffer",
    "spending_anomaly_score": "Unusual spending spikes detected, significantly above the norm",
    "discretionary_ratio":    "Discretionary spending is a disproportionate share of expenses",
    "fixed_cost_ratio":       "Fixed costs are high relative to income",
    "debt_pressure":          "Debt repayments are straining monthly cash flow",
    "burn_rate":              "Expenses are growing faster than income",
    "operating_leverage":     "High fixed operational costs amplify downside risk",
    "growth_ratio":           "Growth spending exceeds sustainable income ratios",
}


# ─── Public API ────────────────────────────────────────────────────────────────

def generate_explanation(risk_score, risk_level, signals, weighted_scores, anomalies, forecast):
    """
    Generate a structured rule-based explanation.

    Args:
        risk_score      : float   0-100
        risk_level      : str     "Low" | "Medium" | "High"
        signals         : dict    raw signal values
        weighted_scores : dict    {signal_key: contribution_weight}
        anomalies       : dict    from detect_anomalies()
        forecast        : dict    from forecast_financials()

    Returns:
        dict:
            summary          : "Risk Score: 68 (High Risk)"
            top_drivers      : list of driver dicts
            trend_text       : str
            forecast_text    : str
            full_text        : formatted plain-text for fallback
    """
    # Sort drivers by weighted contribution (descending)
    sorted_drivers = sorted(weighted_scores.items(), key=lambda x: x[1], reverse=True)

    top_drivers = []
    for key, contribution in sorted_drivers[:3]:
        sig_val = signals.get(key, contribution)
        severity = (
            "high"   if sig_val > 0.6 else
            "medium" if sig_val > 0.3 else
            "low"
        )
        top_drivers.append({
            "driver":           DRIVER_LABELS.get(key, key.replace("_", " ").title()),
            "description":      _contextual_description(key, signals),
            "severity":         severity,
            "contribution_pct": round(contribution * 100),
        })

    # Append anomaly driver if significant and we have room
    if anomalies.get("count", 0) > 0 and len(top_drivers) < 3:
        first_event = anomalies["events"][0] if anomalies["events"] else {}
        top_drivers.append({
            "driver":           "Spending Anomaly Detected",
            "description":      first_event.get("description", "Unusual spending pattern detected"),
            "severity":         first_event.get("severity", "medium"),
            "contribution_pct": 15,
        })

    # Summary
    summary = f"Risk Score: {risk_score} ({risk_level} Risk)"

    # Trend narrative
    trend_dir    = forecast.get("trend_direction", "Stable")
    trend_lookup = {
        "Increasing": "Risk has been increasing over the recent period",
        "Decreasing": "Risk trend is improving — financial health is stabilizing",
        "Stable":     "Risk remains relatively stable with no strong trend",
    }
    trend_text = trend_lookup.get(trend_dir, trend_lookup["Stable"])

    # Forecast narrative
    forecast_text = forecast.get(
        "forecast_risk_direction", "Risk expected to remain stable"
    )

    # Full plain-text (used as LLM fallback)
    drivers_block = "\n".join(
        f"  • {d['driver']}: {d['description']}" for d in top_drivers
    )
    full_text = (
        f"{summary}\n\n"
        f"Top Risk Drivers:\n{drivers_block}\n\n"
        f"Trend: {trend_text}\n\n"
        f"Forecast: {forecast_text}"
    )

    return {
        "summary":      summary,
        "top_drivers":  top_drivers,
        "trend_text":   trend_text,
        "forecast_text": forecast_text,
        "full_text":    full_text,
    }


# ─── Helpers ───────────────────────────────────────────────────────────────────

def _contextual_description(key, signals):
    """Enrich the driver description with actual signal values where possible."""
    if key == "obligation_ratio":
        pct = round(signals.get("obligation_ratio", 0) * 100)
        return f"Debt/EMI payments consume {pct}% of monthly income"

    if key == "income_volatility":
        cv = round(signals.get("income_volatility", 0) * 100)
        return f"Income varies by up to {cv}% month-to-month — unreliable cash flow"

    if key == "expense_volatility":
        cv = round(signals.get("expense_volatility", 0) * 100)
        return f"Monthly expenses vary by {cv}% — spending pattern is inconsistent"

    if key == "cash_reserve_weakness":
        burn = signals.get("burn_rate", 0)
        if burn > 0:
            months = round(1 / burn, 1)
            return f"Current savings buffer is approximately {months} months of expenses"
        return "Savings are accumulating — reserve strength is adequate"

    if key == "burn_rate":
        burn = signals.get("burn_rate", 0)
        if burn > 0:
            return f"Monthly cash deficit of ₹{burn:,.0f} — expenses exceed income"
        return "Income exceeds expenses — positive cash flow"

    return DRIVER_DESCRIPTIONS.get(key, f"{key.replace('_', ' ').title()} is elevated")
