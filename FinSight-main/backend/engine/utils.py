import numpy as np
from sklearn.linear_model import LinearRegression

def linear_trend(series):
    if len(series) < 2:
        return series.iloc[-1]

    X = np.arange(len(series)).reshape(-1, 1)
    y = series.values
    model = LinearRegression().fit(X, y)
    return model.predict([[len(series)]])[0]

def risk_level(score):
    if score < 30:
        return "Low"
    elif score < 65:
        return "Medium"
    return "High"
