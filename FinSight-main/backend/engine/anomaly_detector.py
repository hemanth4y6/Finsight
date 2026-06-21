"""
Anomaly Detector — FinSight Engine
Detects financial anomalies using statistical methods:
- Expense spike detection (Z-score > 2.0)
- Cash drop events (MoM net savings drop > 30%)
- Income drop detection (MoM > 20% decline)
"""

import numpy as np


def detect_anomalies(df, core_signals):
    """
    Detect financial anomalies from the transaction dataframe.

    Returns:
        dict with keys:
            events      : list of anomaly dicts
            anomaly_score: float [0, 1]
            count       : int
    """
    anomalies = []

    monthly_expense = df[df.flow_type == "expense"].groupby("month")["amount"].sum()
    monthly_income  = df[df.flow_type == "income"].groupby("month")["amount"].sum()

    # ── 1. Expense Spike (Z-score based) ───────────────────────────────────────
    if len(monthly_expense) >= 3:
        exp_mean = monthly_expense.mean()
        exp_std  = monthly_expense.std()
        if exp_std > 0:
            for month, amount in monthly_expense.items():
                z = (amount - exp_mean) / exp_std
                if z > 2.0:
                    anomalies.append({
                        "month":       str(month),
                        "type":        "expense_spike",
                        "description": (
                            f"Expense spike: ₹{amount:,.0f} vs avg ₹{exp_mean:,.0f}"
                            f" (z={z:.1f}σ)"
                        ),
                        "severity": "high" if z > 2.5 else "medium",
                        "z_score":  round(z, 2),
                    })

    # ── 2. Cash Drop (MoM net savings drop > 30%) ──────────────────────────────
    all_months = sorted(set(monthly_income.index) | set(monthly_expense.index))
    if len(all_months) >= 2:
        balance = {
            m: float(monthly_income.get(m, 0)) - float(monthly_expense.get(m, 0))
            for m in all_months
        }
        months_sorted = sorted(balance.keys())
        for i in range(1, len(months_sorted)):
            prev = balance[months_sorted[i - 1]]
            curr = balance[months_sorted[i]]
            if prev > 0 and curr < prev * 0.70:          # >30 % drop
                drop_pct = round((prev - curr) / prev * 100, 1)
                anomalies.append({
                    "month":       str(months_sorted[i]),
                    "type":        "cash_drop",
                    "description": f"Net savings dropped {drop_pct}% vs previous month",
                    "severity":    "high" if drop_pct > 50 else "medium",
                    "z_score":     None,
                })

    # ── 3. Income Drop (MoM > 20% decline) ────────────────────────────────────
    if len(monthly_income) >= 2:
        inc_list = [(m, float(monthly_income[m])) for m in sorted(monthly_income.index)]
        for i in range(1, len(inc_list)):
            prev_m, prev_v = inc_list[i - 1]
            curr_m, curr_v = inc_list[i]
            if prev_v > 0 and curr_v < prev_v * 0.80:    # >20 % drop
                drop_pct = round((prev_v - curr_v) / prev_v * 100, 1)
                anomalies.append({
                    "month": str(curr_m),
                    "type":  "income_drop",
                    "description": (
                        f"Income dropped {drop_pct}%: ₹{curr_v:,.0f}"
                        f" vs ₹{prev_v:,.0f} previous month"
                    ),
                    "severity": "high" if drop_pct > 30 else "medium",
                    "z_score":  None,
                })

    # ── Aggregate Score ────────────────────────────────────────────────────────
    severity_weights = {"high": 1.0, "medium": 0.5, "low": 0.25}
    raw = sum(severity_weights.get(a["severity"], 0.3) for a in anomalies)
    anomaly_score = round(min(raw / 3.0, 1.0), 4)   # cap at 1.0

    return {
        "events":        anomalies,
        "anomaly_score": anomaly_score,
        "count":         len(anomalies),
    }
