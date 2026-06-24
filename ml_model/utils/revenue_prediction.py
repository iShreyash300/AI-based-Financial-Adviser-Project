import joblib
import pandas as pd

from datetime import datetime

from ml_model.database.db_connection import (
    fetch_data,
    execute_query
)

# -------------------------
# === Load Model ===
# -------------------------

try:

    model = joblib.load("ml_model/trained_models/revenue_prediction_model.pkl")
    revenue_metrics = joblib.load("ml_model/trained_models/revenue_model_metrics.pkl")

except FileNotFoundError as e:
    print(f"[ERROR] Model file not found: {e}")
    raise

except Exception as e:
    print(f"[ERROR] Failed to load revenue model: {e}")
    raise
# -------------------------
# === Get Next Prediction Month ===
# -------------------------

try:

    current_month = datetime.now().month
    current_year = datetime.now().year

    prediction_month = current_month + 1
    prediction_year = current_year

    if prediction_month > 12:
        prediction_month = 1
        prediction_year += 1

except Exception as e:
    print(f"[ERROR] Failed to determine prediction period: {e}")
    raise

# -------------------------
# === Predict Revenue ===
# -------------------------

def generate_revenue_prediction(user_id, prediction_month, prediction_year):
# -- predict revenue

    try:

        prediction_data = pd.DataFrame(
            [[
                user_id,
                prediction_month,
                prediction_year
           ]],
        columns=[
            "user_id",
            "month",
            "year"
            ]
        )

        predicted_revenue = model.predict(
            prediction_data
        )[0]

    except KeyError as e:
        print(f"[ERROR] Missing feature column: {e}")
        raise

    except ValueError as e:
        print(f"[ERROR] Invalid prediction input: {e}")
        raise

    except Exception as e:
        print(f"[ERROR] Revenue prediction failed: {e}")
        raise
    print(f"Predicted Revenue: ₹{predicted_revenue:.2f}")
    
    # -- calculate confidence

    try:
        
        if predicted_revenue <= 0:
            confidence_score = 0

        else:

            confidence_score = round(max(0, 100 - (revenue_metrics["residual_std"] / predicted_revenue) * 100), 2)

    except KeyError as e:
        print(f"[ERROR] Missing residual_std: {e}")
        raise

    except ValueError as e:
        print(f"[ERROR] Invalid confidence calculation: {e}")
        raise

    except Exception as e:
        print(f"[ERROR] Failed to calculate confidence score: {e}")
        raise
    
    # -- check existing prediction
    
    check_query = """
    SELECT id
    FROM predictions
    WHERE user_id = %s
    AND prediction_type = 'revenue'
    AND prediction_month = %s
    AND prediction_year = %s;
    """
    try:
        existing_revenue = fetch_data(
            check_query,
            (user_id, prediction_month, prediction_year)
        )
    except Exception as e:
        print(f"[ERROR] Failed to check existing prediction: {e}")
        raise  
    
    # -- check existing revenue

    check_query = """
    SELECT id
    FROM predictions
    WHERE user_id = %s
    AND prediction_type = 'revenue'
    AND prediction_month = %s
    AND prediction_year = %s;
    """

    try:
        existing_revenue = fetch_data(
            check_query,
            (
                user_id,
                prediction_month,
                prediction_year
            )
        )
    except Exception as e:
        print(f"[ERROR] Failed to check existing revenue prediction: {e}")
        raise

    # -- update revenue

    if (
        existing_revenue is not None
        and not existing_revenue.empty
    ):

        update_query = """
        UPDATE predictions
        SET
            predicted_value = %s,
            confidence_score = %s,
            created_at = CURRENT_TIMESTAMP
        WHERE id = %s;
        """

        try:
            execute_query(
                update_query,
                (
                    predicted_revenue,
                    confidence_score,
                    int(existing_revenue["id"].iloc[0])
                )
            )
        except KeyError as e:
            print(f"[ERROR] Missing column: {e}")
            raise
        except Exception as e:
            print(f"[ERROR] Failed to update revenue prediction: {e}")
            raise

        print(
            f"Revenue prediction updated "
            f"for User {user_id}"
        )

    # -- insert revenue

    else:

        insert_query = """
        INSERT INTO predictions (
            user_id,
            prediction_type,
            predicted_value,
            confidence_score,
            prediction_month,
            prediction_year
        )
        VALUES (%s, %s, %s, %s, %s, %s);
        """

        try:
            execute_query(
                insert_query,
                (
                    user_id,
                    "revenue",
                    predicted_revenue,
                    confidence_score,
                    prediction_month,
                    prediction_year
                )
            )
        except Exception as e:
            print(f"[ERROR] Failed to insert revenue prediction: {e}")
            raise

        print(
            f"Revenue prediction created "
            f"for User {user_id}"
        )

    return {
        "user_id": user_id,
        "prediction_type": "revenue",
        "predicted_value": predicted_revenue,
        "confidence_score": confidence_score,
        "prediction_month": prediction_month,
        "prediction_year": prediction_year
    }