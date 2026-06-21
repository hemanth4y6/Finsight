import pandas as pd

REQUIRED_COLUMNS = {
    "date", "amount", "flow_type", "category", "sub_category"
}

def parse_csv(file):
    df = pd.read_csv(file)
    if not REQUIRED_COLUMNS.issubset(df.columns):
        missing = REQUIRED_COLUMNS - set(df.columns)
        raise ValueError(f"Missing columns: {missing}")

    df["date"] = pd.to_datetime(df["date"])
    df["month"] = df["date"].dt.to_period("M")
    return df
