from ml_model.database.db_connection import (
    fetch_data,
    execute_query
)


# -------------------------
# === Generate Profit Prediction ===
# -------------------------

def generate_profit_prediction(
    user_id,
    prediction_month,
    prediction_year
):
    print(
        f"\nGenerating profit prediction for "
        f"user_id: {user_id} for "
        f"{prediction_month}/{prediction_year}...\n"
    )

    # -------------------------
    # === Fetch Revenue Prediction ===
    # -------------------------

    revenue_query = """
        SELECT predicted_value, confidence_score
        FROM predictions
        WHERE user_id = :user_id
        AND prediction_type = :prediction_type
        AND prediction_month = :prediction_month
        AND prediction_year = :prediction_year;
    """

    try:
        revenue_df = fetch_data(
            revenue_query,
            {
                "user_id": user_id,
                "prediction_type": "revenue",
                "prediction_month": prediction_month,
                "prediction_year": prediction_year
            }
        )

    except Exception as e:
        print(
            f"[ERROR] Failed to fetch "
            f"revenue prediction: {e}"
        )
        raise

    if revenue_df is None or revenue_df.empty:
        raise ValueError(
            "Revenue prediction not found."
        )


    # -------------------------
    # === Fetch Expense Prediction ===
    # -------------------------

    expense_query = """
        SELECT predicted_value, confidence_score
        FROM predictions
        WHERE user_id = :user_id
        AND prediction_type = :prediction_type
        AND prediction_month = :prediction_month
        AND prediction_year = :prediction_year;
    """

    try:
        expense_df = fetch_data(
            expense_query,
            {
                "user_id": user_id,
                "prediction_type": "expense",
                "prediction_month": prediction_month,
                "prediction_year": prediction_year
            }
        )

    except Exception as e:
        print(
            f"[ERROR] Failed to fetch "
            f"expense prediction: {e}"
        )
        raise

    if expense_df is None or expense_df.empty:
        raise ValueError(
            "Expense prediction not found."
        )


    # -------------------------
    # === Calculate Profit ===
    # -------------------------

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

        confidence_score = float(
            min(
                revenue_confidence,
                expense_confidence
            )
        )

    except KeyError as e:
        print(f"[ERROR] Missing column: {e}")
        raise

    except ValueError as e:
        print(f"[ERROR] Invalid prediction value: {e}")
        raise

    except Exception as e:
        print(
            f"[ERROR] Profit calculation failed: {e}"
        )
        raise

    print(f"Predicted Profit: ₹{predicted_profit:.2f}")


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
        existing_profit = fetch_data(
            check_query,
            {
                "user_id": user_id,
                "prediction_type": "profit",
                "prediction_month": prediction_month,
                "prediction_year": prediction_year
            }
        )

    except Exception as e:
        print(
            f"[ERROR] Failed to check existing "
            f"profit prediction: {e}"
        )
        raise


    # -------------------------
    # === Update Existing Prediction ===
    # -------------------------

    if (
        existing_profit is not None
        and not existing_profit.empty
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
                    "predicted_value": predicted_profit,
                    "confidence_score": confidence_score,
                    "prediction_id": int(
                        existing_profit["id"].iloc[0]
                    )
                }
            )

        except KeyError as e:
            print(f"[ERROR] Missing column: {e}")
            raise

        except Exception as e:
            print(
                f"[ERROR] Failed to update "
                f"profit prediction: {e}"
            )
            raise

        print(
            f"Profit prediction updated "
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
                    "prediction_type": "profit",
                    "predicted_value": predicted_profit,
                    "confidence_score": confidence_score,
                    "prediction_month": prediction_month,
                    "prediction_year": prediction_year
                }
            )

        except Exception as e:
            print(
                f"[ERROR] Failed to insert "
                f"profit prediction: {e}"
            )
            raise

        print(
            f"Profit prediction created "
            f"for User {user_id}"
        )


    # -------------------------
    # === Return Prediction ===
    # -------------------------

    return {
        "user_id": user_id,
        "prediction_type": "profit",
        "predicted_value": predicted_profit,
        "confidence_score": confidence_score,
        "prediction_month": prediction_month,
        "prediction_year": prediction_year
    }
    
# generate_profit_prediction(1, 1, 2025)  # Example call for testing