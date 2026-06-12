from ml_model.database.db_connection import (
    fetch_data,
    execute_query
)


# -------------------------
# === Generate Profit Prediction ===
# -------------------------
# -- fetch revenue prediction

def generate_profit_prediction(
    user_id,
    prediction_month,
    prediction_year
):

    revenue_query = """
    SELECT predicted_value, confidence_score
    FROM predictions
    WHERE user_id = %s
    AND prediction_type = 'revenue'
    AND prediction_month = %s
    AND prediction_year = %s;
    """

    try:
        revenue_df = fetch_data(
            revenue_query,
            (
                user_id,
                prediction_month,
                prediction_year
            )
        )
    except Exception as e:
        print(f"[ERROR] Failed to fetch revenue prediction: {e}")
        raise

    if revenue_df is None or revenue_df.empty:
        raise ValueError(
            "Revenue prediction not found."
        )

    # -- fetch expense prediction

    expense_query = """
    SELECT predicted_value, confidence_score
    FROM predictions
    WHERE user_id = %s
    AND prediction_type = 'expense'
    AND prediction_month = %s
    AND prediction_year = %s;
    """

    try:
        expense_df = fetch_data(
            expense_query,
            (
                user_id,
                prediction_month,
                prediction_year
            )
        )
    except Exception as e:
        print(f"[ERROR] Failed to fetch expense prediction: {e}")
        raise

    if expense_df is None or expense_df.empty:
        raise ValueError(
            "Expense prediction not found."
        )

    # -- calculate profit

    try:
        predicted_revenue = float(
            revenue_df["predicted_value"].iloc[0]
        )

        predicted_expense = float(
            expense_df["predicted_value"].iloc[0]
        )

        revenue_confidence = float(
            revenue_df["confidence_score"].iloc[0]
        )

        expense_confidence = float(
            expense_df["confidence_score"].iloc[0]
        )

        predicted_profit = round(
            predicted_revenue - predicted_expense,
            2
        )

        confidence_score = min(
            revenue_confidence,
            expense_confidence
        )
    except KeyError as e:
        print(f"[ERROR] Missing column: {e}")
        raise
    except ValueError as e:
        print(f"[ERROR] Invalid prediction value: {e}")
        raise
    except Exception as e:
        print(f"[ERROR] Profit calculation failed: {e}")
        raise

    # -- check existing profit

    check_query = """
    SELECT id
    FROM predictions
    WHERE user_id = %s
    AND prediction_type = 'profit'
    AND prediction_month = %s
    AND prediction_year = %s;
    """

    try:
        existing_profit = fetch_data(
            check_query,
            (
                user_id,
                prediction_month,
                prediction_year
            )
        )
    except Exception as e:
        print(f"[ERROR] Failed to check existing profit prediction: {e}")
        raise

    # -- update profit

    if (
        existing_profit is not None
        and not existing_profit.empty
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
                    predicted_profit,
                    confidence_score,
                    int(existing_profit["id"].iloc[0])
                )
            )
        except KeyError as e:
            print(f"[ERROR] Missing column: {e}")
            raise
        except Exception as e:
            print(f"[ERROR] Failed to update profit prediction: {e}")
            raise

        print(
            f"Profit prediction updated "
            f"for User {user_id}"
        )

    # -- insert profit

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
                    "profit",
                    predicted_profit,
                    confidence_score,
                    prediction_month,
                    prediction_year
                )
            )
        except Exception as e:
            print(f"[ERROR] Failed to insert profit prediction: {e}")
            raise

        print(
            f"Profit prediction created "
            f"for User {user_id}"
        )

    return {
        "user_id": user_id,
        "prediction_type": "profit",
        "predicted_value": predicted_profit,
        "confidence_score": confidence_score,
        "prediction_month": prediction_month,
        "prediction_year": prediction_year
    }