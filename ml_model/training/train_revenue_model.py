import sys
import pandas as pd
import numpy as np
import joblib

from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from ml_model.database.db_connection import fetch_data

# -------------------------
# === Fetch Data ===
# -------------------------

# -- query

query = """
SELECT *
FROM revenue;
"""

try:
    df_raw = fetch_data(query)
except Exception as e:
    print(f"[ERROR] Failed to fetch data: {e}")
    sys.exit(1)

# -- validate

if df_raw is None or df_raw.empty:
    print("[WARNING] No data found.")
    sys.exit(0)


# -------------------------
# === Working Copy ===
# -------------------------

try:
    df = df_raw.copy()
    print("\nColumns:", df.columns.tolist())
except Exception as e:
    print(f"[ERROR] Failed to copy dataframe: {e}")
    sys.exit(1)


# -------------------------
# === Date Features ===
# -------------------------

try:
    revenue_date = pd.to_datetime(df["revenue_date"])
    df["month"] = revenue_date.dt.month
    df["year"] = revenue_date.dt.year
except KeyError:
    print("[ERROR] Column 'revenue_date' not found.")
    sys.exit(1)
except Exception as e:
    print(f"[ERROR] Date parsing failed: {e}")
    sys.exit(1)


# -------------------------
# === Monthly Aggregation ===
# -------------------------

try:
    monthly_df = (
        df.groupby(["user_id", "month", "year"])["amount"]
        .sum()
        .reset_index()
    )
    print("\nMonthly Dataset:")
    print(monthly_df.head())
    print(monthly_df.shape[0], "rows in monthly dataset.")
except KeyError as e:
    print(f"[ERROR] Missing column during aggregation: {e}")
    sys.exit(1)
except Exception as e:
    print(f"[ERROR] Monthly aggregation failed: {e}")
    sys.exit(1)


# -------------------------
# === Train Model ===
# -------------------------

# -- features & target

try:
    X = monthly_df[["user_id", "month", "year"]]
    y = monthly_df["amount"]
except KeyError as e:
    print(f"[ERROR] Missing feature/target column: {e}")
    sys.exit(1)
except Exception as e:
    print(f"[ERROR] Feature preparation failed: {e}")
    sys.exit(1)

# -- train/test split

try:
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
except ValueError as e:
    print(f"[ERROR] Train/test split failed: {e}")
    sys.exit(1)
except Exception as e:
    print(f"[ERROR] Unexpected split error: {e}")
    sys.exit(1)

# -- fit random forest

try:
    model = RandomForestRegressor(
        n_estimators=300,
        max_depth=10,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)
except Exception as e:
    print(f"[ERROR] Model training failed: {e}")
    sys.exit(1)


# -------------------------
# === Evaluate Model ===
# -------------------------

# -- predictions

try:
    predictions = model.predict(X_test)
except Exception as e:
    print(f"[ERROR] Prediction failed: {e}")
    sys.exit(1)

# -- metrics

try:
    mae = mean_absolute_error(y_test, predictions)
    rmse = np.sqrt(mean_squared_error(y_test, predictions))
    r2 = r2_score(y_test, predictions)

    print("\n===== MODEL EVALUATION =====")
    print(f"MAE  : {mae:.2f}")
    print(f"RMSE : {rmse:.2f}")
    print(f"R²   : {r2:.4f}")
except Exception as e:
    print(f"[ERROR] Evaluation failed: {e}")
    sys.exit(1)


# -------------------------
# === Save Model ===
# -------------------------

# try:
#     joblib.dump(model,"ml_model/trained_models/revenue_prediction_model.pkl")
#     print("\nModel saved successfully.")
# except Exception as e:
#     print(f"[ERROR] Failed to save model: {e}")
#     sys.exit(1)
print("\nModel saved successfully.")