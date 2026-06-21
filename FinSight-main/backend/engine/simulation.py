"""
Simulation Module — FinSight Engine
Simulates the impact of reducing discretionary spending on financial runway.
Uses real monthly surplus/deficit arithmetic rather than the trend coefficient.
"""

import math


def simulate_discretionary_cut(signals, cut):
    """
    Estimate additional runway (months) gained by cutting discretionary spend.

    Uses the actual monthly net cash position:
        monthly_net = avg_income - avg_expense - avg_debt

    If the net is already positive (no deficit), there is nothing to simulate.
    If cutting spend by `cut` turns the deficit positive, return None
    (effectively stable — no finite runway improvement needed).

    Returns float (months improvement) or None.
    """
    avg_income  = signals.get("avg_income",  0)
    avg_expense = signals.get("avg_expense", 0)
    avg_debt    = signals.get("avg_debt",    0)

    monthly_net = avg_income - avg_expense - avg_debt   # positive = surplus

    if monthly_net >= 0:
        return None   # Already surplus — no stress runway to improve

    monthly_deficit = -monthly_net   # positive number e.g. 5000

    new_deficit = monthly_deficit - cut
    if new_deficit <= 0:
        # Cutting eliminates the deficit entirely → effectively stable
        return None

    # Conservative 2-month income buffer as proxy for liquid reserves
    buffer = avg_income * 2

    old_runway = _safe_div(buffer, monthly_deficit)
    new_runway = _safe_div(buffer, new_deficit)

    improvement = round(new_runway - old_runway, 1)
    return improvement if improvement > 0 else None


def _safe_div(numerator, denominator):
    """Division that never returns Infinity or NaN."""
    if denominator <= 0:
        return 0.0
    result = numerator / denominator
    if math.isinf(result) or math.isnan(result):
        return 0.0
    return result
