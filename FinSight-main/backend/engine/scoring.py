"""
Risk Scoring Engine — FinSight
5-factor weighted scoring system. All sub-scores normalized to [0, 1].
Final score ∈ [0, 100].

Factors:
  income_volatility      — income irregularity (CoV)
  expense_volatility     — expense irregularity (CoV)
  obligation_ratio       — debt/EMI as share of income
  cash_reserve_weakness  — inverted cash reserve strength
  spending_anomaly_score — anomaly detector output
"""

# ─── Weight Profiles ───────────────────────────────────────────────────────────

INDIVIDUAL_WEIGHTS = {
    "income_volatility":      0.25,
    "expense_volatility":     0.20,
    "obligation_ratio":       0.25,
    "cash_reserve_weakness":  0.15,
    "spending_anomaly_score": 0.15,
}

SME_WEIGHTS = {
    "income_volatility":      0.20,
    "expense_volatility":     0.20,
    "obligation_ratio":       0.25,
    "cash_reserve_weakness":  0.20,
    "spending_anomaly_score": 0.15,
}


# ─── Normalisation Bounds ─────────────────────────────────────────────────────
# (low, high) — values below low → 0, above high → 1

BOUNDS = {
    "income_volatility":     (0.0, 0.50),   # CoV: 0 = stable, 0.5+ = volatile
    "expense_volatility":    (0.0, 0.50),
    "obligation_ratio":      (0.0, 0.80),   # 80 %+ of income → full stress
    "cash_reserve_weakness": (0.0, 1.00),   # already [0,1], pass through
    "spending_anomaly_score":(0.0, 1.00),
}


# ─── Public API ────────────────────────────────────────────────────────────────

def score_individual(signals, anomaly_score=0.0):
    """Returns (score: float 0-100, weighted_scores: dict)."""
    sub = _sub_scores(signals, anomaly_score)
    return _apply_weights(sub, INDIVIDUAL_WEIGHTS)


def score_sme(signals, anomaly_score=0.0):
    """Returns (score: float 0-100, weighted_scores: dict)."""
    sub = _sub_scores(signals, anomaly_score)
    return _apply_weights(sub, SME_WEIGHTS)


# ─── Helpers ───────────────────────────────────────────────────────────────────

def _normalize(val, low, high):
    """Clip value to [low, high] then scale to [0, 1]."""
    span = high - low + 1e-9
    return float(max(0.0, min(1.0, (val - low) / span)))


def _sub_scores(signals, anomaly_score):
    """Convert raw signals → normalised sub-scores in [0, 1]."""
    crs = signals.get("cash_reserve_strength", 0.0)
    # Invert: strong reserve → low risk weakness
    cash_weakness = _normalize(1.0 - min(max(crs, 0.0), 1.0), *BOUNDS["cash_reserve_weakness"])

    return {
        "income_volatility":      _normalize(signals.get("income_volatility",  0), *BOUNDS["income_volatility"]),
        "expense_volatility":     _normalize(signals.get("expense_volatility", 0), *BOUNDS["expense_volatility"]),
        "obligation_ratio":       _normalize(signals.get("obligation_ratio",   0), *BOUNDS["obligation_ratio"]),
        "cash_reserve_weakness":  cash_weakness,
        "spending_anomaly_score": float(min(max(anomaly_score, 0.0), 1.0)),
    }


def _apply_weights(sub_scores, weights):
    weighted = {k: sub_scores[k] * w for k, w in weights.items()}
    total    = sum(weighted.values())
    return round(total * 100, 1), weighted
