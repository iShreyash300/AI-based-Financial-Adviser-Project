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
    model = joblib.load(
        "ml_model/trained_models/expense_prediction_model.pkl"
    )

    expense_metrics = joblib.load(
        "ml_model/trained_models/expense_model_metrics.pkl"
    )

except FileNotFoundError as e:
    print(f"[ERROR] Model file not found: {e}")
    raise

except Exception as e:
    print(f"[ERROR] Failed to load expense model: {e}")
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
# === Predict Expense ===
# -------------------------

def generate_expense_prediction(
    user_id,
    prediction_month,
    prediction_year
):
    print(
        f"\nGenerating expense prediction for "
        f"user_id: {user_id} for "
        f"{prediction_month}/{prediction_year}...\n"
    )

    # -------------------------
    # === Generate Prediction ===
    # -------------------------

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

        predicted_expense = float(
            model.predict(
                prediction_data
            )[0]
        )

    except KeyError as e:
        print(f"[ERROR] Missing feature column: {e}")
        raise

    except ValueError as e:
        print(f"[ERROR] Invalid prediction input: {e}")
        raise

    except Exception as e:
        print(f"[ERROR] Expense prediction failed: {e}")
        raise

    print(f"Predicted Expense: ₹{predicted_expense:.2f}")


    # -------------------------
    # === Calculate Confidence ===
    # -------------------------

    try:
        if predicted_expense <= 0:
            confidence_score = 0
        else:
            confidence_score = float(
                round(
                    max(
                        0,
                        100 - (
                            expense_metrics["residual_std"]
                            / predicted_expense
                        ) * 100
                    ),
                    2
                )
            )

    except KeyError as e:
        print(f"[ERROR] Missing residual_std: {e}")
        raise

    except ValueError as e:
        print(f"[ERROR] Invalid confidence calculation: {e}")
        raise

    except Exception as e:
        print(f"[ERROR] Failed to calculate confidence score: {e}")
        raise


    # -------------------------
    # === Check Existing Prediction ===
    # -------------------------

    check_query = """
        SELECT id
        FROM predictions
        WHERE user_id = :user_id
        AND prediction_type = :prediction_type
        AND prediction_month = :prediction_month
        AND prediction_year = :prediction_year;
    """

    try:
        existing_expense = fetch_data(
            check_query,
            {
                "user_id": user_id,
                "prediction_type": "expense",
                "prediction_month": prediction_month,
                "prediction_year": prediction_year
            }
        )

    except Exception as e:
        print(
            f"[ERROR] Failed to check existing "
            f"expense prediction: {e}"
        )
        raise


    # -------------------------
    # === Update Existing Prediction ===
    # -------------------------

    if (
        existing_expense is not None
        and not existing_expense.empty
    ):

        update_query = """
            UPDATE predictions
            SET
                predicted_value = :predicted_value,
                confidence_score = :confidence_score,
                created_at = CURRENT_TIMESTAMP
            WHERE id = :prediction_id;
        """

        try:
            execute_query(
                update_query,
                {
                    "predicted_value": predicted_expense,
                    "confidence_score": confidence_score,
                    "prediction_id": int(
                        existing_expense["id"].iloc[0]
                    )
                }
            )

        except KeyError as e:
            print(f"[ERROR] Missing column: {e}")
            raise

        except Exception as e:
            print(
                f"[ERROR] Failed to update "
                f"expense prediction: {e}"
            )
            raise

        print(
            f"Expense prediction updated "
            f"for User {user_id}"
        )


    # -------------------------
    # === Insert New Prediction ===
    # -------------------------

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
            VALUES (
                :user_id,
                :prediction_type,
                :predicted_value,
                :confidence_score,
                :prediction_month,
                :prediction_year
            );
        """

        try:
            execute_query(
                insert_query,
                {
                    "user_id": user_id,
                    "prediction_type": "expense",
                    "predicted_value": predicted_expense,
                    "confidence_score": confidence_score,
                    "prediction_month": prediction_month,
                    "prediction_year": prediction_year
                }
            )

        except Exception as e:
            print(
                f"[ERROR] Failed to insert "
                f"expense prediction: {e}"
            )
            raise

        print(
            f"Expense prediction created "
            f"for User {user_id}"
        )


    # -------------------------
    # === Return Prediction ===
    # -------------------------

    return {
        "user_id": user_id,
        "prediction_type": "expense",
        "predicted_value": predicted_expense,
        "confidence_score": confidence_score,
        "prediction_month": prediction_month,
        "prediction_year": prediction_year
    }
