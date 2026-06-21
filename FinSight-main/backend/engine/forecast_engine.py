"""
Forecast Engine — FinSight Engine
Linear-regression + moving-average forecasting for:
  - Income trend
  - Expense trend
  - Net balance trajectory

Returns trend_direction, forecast_risk_direction, predicted_months, monthly_series.
"""

import numpy as np
from sklearn.linear_model import LinearRegression


def forecast_financials(df, months_ahead=3):
    """
    Forecast income, expense, and balance for the next `months_ahead` months.

    Returns dict:
        trend_direction        : "Increasing" | "Stable" | "Decreasing"
        forecast_risk_direction: human-readable string
        predicted_months       : list of {month, income, expenses, balance}
        monthly_series         : historical + forecast combined (forecast=True flag)
        income_ma              : 3-month moving-average income
        expense_ma             : 3-month moving-average expense
    """
    monthly_income  = df[df.flow_type == "income"].groupby("month")["amount"].sum()
    monthly_expense = df[df.flow_type == "expense"].groupby("month")["amount"].sum()

    all_months = sorted(set(monthly_income.index) | set(monthly_expense.index))

    if len(all_months) < 2:
        return _default_forecast()

    inc_values = [float(monthly_income.get(m, 0)) for m in all_months]
    exp_values = [float(monthly_expense.get(m, 0)) for m in all_months]
    bal_values = [i - e for i, e in zip(inc_values, exp_values)]

    X = np.arange(len(all_months)).reshape(-1, 1)

    inc_pred = _lr_predict(X, inc_values, months_ahead)
    exp_pred = _lr_predict(X, exp_values, months_ahead)
    bal_pred = [i - e for i, e in zip(inc_pred, exp_pred)]

    # 3-month moving-average
    window    = min(3, len(all_months))
    income_ma = float(np.mean(inc_values[-window:]))
    expense_ma = float(np.mean(exp_values[-window:]))

    # Trend direction: compare first vs last expense relative to income
    if len(exp_values) >= 2:
        expense_growth = (exp_values[-1] - exp_values[0]) / (inc_values[0] + 1)
        income_growth  = (inc_values[-1] - inc_values[0]) / (inc_values[0] + 1)
        net_trend = expense_growth - income_growth
    else:
        net_trend = 0

    if net_trend > 0.08:
        trend_direction = "Increasing"
        forecast_risk   = "Risk expected to increase if trend continues"
    elif net_trend < -0.05:
        trend_direction = "Decreasing"
        forecast_risk   = "Risk expected to decrease — positive trajectory"
    else:
        trend_direction = "Stable"
        forecast_risk   = "Risk expected to remain stable in near term"

    # Future month period labels
    last_month     = all_months[-1]
    future_months  = [str(last_month + i) for i in range(1, months_ahead + 1)]

    predicted_months = [
        {
            "month":    m,
            "income":   round(max(inc_pred[i], 0)),
            "expenses": round(max(exp_pred[i], 0)),
            "balance":  round(bal_pred[i]),
        }
        for i, m in enumerate(future_months)
    ]

    # Build unified monthly_series (historical + forecast)
    monthly_series = [
        {
            "month":    str(m),
            "income":   round(inc_values[i]),
            "expenses": round(exp_values[i]),
            "balance":  round(bal_values[i]),
            "forecast": False,
        }
        for i, m in enumerate(all_months)
    ] + [
        {**p, "forecast": True}
        for p in predicted_months
    ]

    return {
        "trend_direction":         trend_direction,
        "forecast_risk_direction": forecast_risk,
        "predicted_months":        predicted_months,
        "monthly_series":          monthly_series,
        "income_ma":               round(income_ma),
        "expense_ma":              round(expense_ma),
    }


def _lr_predict(X, y_values, months_ahead):
    y     = np.array(y_values)
    model = LinearRegression().fit(X, y)
    future_X = np.arange(len(y_values), len(y_values) + months_ahead).reshape(-1, 1)
    return list(model.predict(future_X))


def _default_forecast():
    return {
        "trend_direction":         "Stable",
        "forecast_risk_direction": "Insufficient data for forecast",
        "predicted_months":        [],
        "monthly_series":          [],
        "income_ma":               0,
        "expense_ma":              0,
    }
