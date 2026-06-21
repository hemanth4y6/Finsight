"""
Signals Module — FinSight Engine
Computes financial signals from transaction data.

Core signals (shared by individual + SME):
  income_volatility      CoV of monthly income
  expense_volatility     CoV of monthly expenses
  burn_rate              projected monthly deficit (expense_trend - income_trend)
  avg_income             mean monthly income
  avg_expense            mean monthly expenses
  avg_debt               mean monthly debt payments
  obligation_ratio       avg_debt / avg_income
  cash_reserve_strength  monthly net / avg_income  ∈ [-∞, 1]
"""

import numpy as np
from .utils import linear_trend


def compute_core_signals(df):
    income  = df[df.flow_type == "income"].groupby("month")["amount"].sum()
    expense = df[df.flow_type == "expense"].groupby("month")["amount"].sum()
    debt    = df[df.flow_type == "debt_payment"].groupby("month")["amount"].sum()

    income_trend  = linear_trend(income)
    expense_trend = linear_trend(expense)
    burn_rate     = expense_trend - income_trend

    avg_income  = float(income.mean())  if not income.empty  else income_trend
    avg_expense = float(expense.mean()) if not expense.empty else expense_trend
    avg_debt    = float(debt.mean())    if not debt.empty    else 0.0

    # Coefficient of Variation (volatility)
    iv = income.std()  / income.mean()  if len(income)  > 1 and income.mean()  > 0 else 0.0
    ev = expense.std() / expense.mean() if len(expense) > 1 and expense.mean() > 0 else 0.0

    # Obligation ratio
    obligation_ratio = avg_debt / avg_income if avg_income > 0 else 0.0

    # Cash reserve strength: monthly net relative to income
    avg_net = avg_income - avg_expense - avg_debt
    cash_reserve_strength = avg_net / avg_income if avg_income > 0 else 0.0

    return {
        "income_volatility":      round(iv, 4),
        "expense_volatility":     round(ev, 4),
        "burn_rate":              round(burn_rate, 2),
        "avg_income":             round(avg_income, 2),
        "avg_expense":            round(avg_expense, 2),
        "avg_debt":               round(avg_debt, 2),
        "obligation_ratio":       round(obligation_ratio, 4),
        "cash_reserve_strength":  round(cash_reserve_strength, 4),
    }


def individual_signals(df, core):
    """Add individual-specific signals on top of core."""
    discretionary = df[df.category == "discretionary"]["amount"].sum()
    fixed         = df[df.category == "fixed"]["amount"].sum()
    total_expense = df[df.flow_type == "expense"]["amount"].sum()

    return {
        **core,
        "discretionary_ratio": round(discretionary / total_expense, 4) if total_expense else 0,
        "fixed_cost_ratio":    round(fixed / core["avg_income"], 4)    if core["avg_income"] else 0,
        # alias for backward compatibility
        "debt_pressure":       core["obligation_ratio"],
    }


def sme_signals(df, core):
    """Add SME-specific signals on top of core."""
    fixed  = df[df.category == "fixed"]["amount"].sum()
    growth = df[df.category == "growth"]["amount"].sum()

    return {
        **core,
        "operating_leverage": round(fixed  / core["avg_income"], 4) if core["avg_income"] else 0,
        "growth_ratio":       round(growth / core["avg_income"], 4) if core["avg_income"] else 0,
        "debt_coverage": round(
            (core["avg_income"] - core["avg_expense"]) / core["avg_debt"], 4
        ) if core["avg_debt"] else 1.0,
    }
