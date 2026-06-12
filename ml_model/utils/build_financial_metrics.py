from datetime import datetime

from ml_model.database.db_connection import fetch_data


# -------------------------
# === Financial Metrics ===
# -------------------------

def get_financial_metrics(user_id):

    current_month = datetime.now().month
    current_year = datetime.now().year

    if current_month == 1:
        previous_month = 12
        previous_year = current_year - 1
    else:
        previous_month = current_month - 1
        previous_year = current_year

    # -- current revenue

    revenue_query = f"""
    SELECT COALESCE(SUM(amount), 0) AS revenue
    FROM revenue
    WHERE user_id = {user_id}
    AND EXTRACT(MONTH FROM revenue_date) = {current_month}
    AND EXTRACT(YEAR FROM revenue_date) = {current_year};
    """

    try:
        current_revenue = float(
            fetch_data(revenue_query)
            .iloc[0]["revenue"]
        )
    except KeyError as e:
        print(f"[ERROR] Missing column: {e}")
        raise
    except ValueError as e:
        print(f"[ERROR] Invalid revenue value: {e}")
        raise
    except Exception as e:
        print(f"[ERROR] Failed to fetch current revenue: {e}")
        raise

    # -- current expenses

    expense_query = f"""
    SELECT COALESCE(SUM(amount), 0) AS expenses
    FROM expenses
    WHERE user_id = {user_id}
    AND EXTRACT(MONTH FROM expense_date) = {current_month}
    AND EXTRACT(YEAR FROM expense_date) = {current_year};
    """

    try:
        current_expenses = float(
            fetch_data(expense_query)
            .iloc[0]["expenses"]
        )
    except KeyError as e:
        print(f"[ERROR] Missing column: {e}")
        raise
    except ValueError as e:
        print(f"[ERROR] Invalid expense value: {e}")
        raise
    except Exception as e:
        print(f"[ERROR] Failed to fetch current expenses: {e}")
        raise

    # -- previous revenue

    previous_revenue_query = f"""
    SELECT COALESCE(SUM(amount), 0) AS revenue
    FROM revenue
    WHERE user_id = {user_id}
    AND EXTRACT(MONTH FROM revenue_date) = {previous_month}
    AND EXTRACT(YEAR FROM revenue_date) = {previous_year};
    """

    try:
        previous_revenue = float(
            fetch_data(previous_revenue_query)
            .iloc[0]["revenue"]
        )
    except KeyError as e:
        print(f"[ERROR] Missing column: {e}")
        raise
    except ValueError as e:
        print(f"[ERROR] Invalid revenue value: {e}")
        raise
    except Exception as e:
        print(f"[ERROR] Failed to fetch previous revenue: {e}")
        raise

    # -- previous expenses

    previous_expense_query = f"""
    SELECT COALESCE(SUM(amount), 0) AS expenses
    FROM expenses
    WHERE user_id = {user_id}
    AND EXTRACT(MONTH FROM expense_date) = {previous_month}
    AND EXTRACT(YEAR FROM expense_date) = {previous_year};
    """

    try:
        previous_expenses = float(
            fetch_data(previous_expense_query)
            .iloc[0]["expenses"]
        )
    except KeyError as e:
        print(f"[ERROR] Missing column: {e}")
        raise
    except ValueError as e:
        print(f"[ERROR] Invalid expense value: {e}")
        raise
    except Exception as e:
        print(f"[ERROR] Failed to fetch previous expenses: {e}")
        raise

    # -- predictions

    def get_prediction(prediction_type):

        query = f"""
        SELECT predicted_value
        FROM predictions
        WHERE user_id = {user_id}
        AND prediction_type = '{prediction_type}'
        ORDER BY created_at DESC
        LIMIT 1;
        """

        try:
            df = fetch_data(query)

            if df.empty:
                return 0

            return float(
                df.iloc[0]["predicted_value"]
            )

        except KeyError as e:
            print(f"[ERROR] Missing column: {e}")
            raise
        except ValueError as e:
            print(f"[ERROR] Invalid prediction value: {e}")
            raise
        except Exception as e:
            print(f"[ERROR] Failed to fetch {prediction_type} prediction: {e}")
            raise

    predicted_revenue = get_prediction("revenue")
    predicted_expenses = get_prediction("expense")
    predicted_profit = get_prediction("profit")

    # -- total budget

    budget_query = f"""
    SELECT COALESCE(SUM(amount), 0) AS total_budget
    FROM budgets
    WHERE user_id = {user_id}
    AND budget_month = {current_month}
    AND budget_year = {current_year};
    """

    try:
        total_budget = float(
            fetch_data(budget_query)
            .iloc[0]["total_budget"]
        )
    except KeyError as e:
        print(f"[ERROR] Missing column: {e}")
        raise
    except ValueError as e:
        print(f"[ERROR] Invalid budget value: {e}")
        raise
    except Exception as e:
        print(f"[ERROR] Failed to fetch total budget: {e}")
        raise

    # -- calculated metrics

    try:
        current_profit = (
            current_revenue
            - current_expenses
        )

        revenue_growth = (
            (
                current_revenue
                - previous_revenue
            )
            / previous_revenue
            * 100
        ) if previous_revenue > 0 else 0

        expense_growth = (
            (
                current_expenses
                - previous_expenses
            )
            / previous_expenses
            * 100
        ) if previous_expenses > 0 else 0

        expense_ratio = (
            current_expenses
            / current_revenue
            * 100
        ) if current_revenue > 0 else 0

        predicted_profit_change = (
            (
                predicted_profit
                - current_profit
            )
            / abs(current_profit)
            * 100
        ) if current_profit != 0 else 0

        profit_margin = (
            (
                current_profit
                / current_revenue
            )
            * 100
        ) if current_revenue > 0 else 0

        budget_utilization = (
            current_expenses
            / total_budget
            * 100
        ) if total_budget > 0 else 0

        budget_variance = round(
            current_expenses - total_budget,
            2
        )
    except Exception as e:
        print(f"[ERROR] Failed to calculate metrics: {e}")
        raise

    # -- final metrics

    return {
        "user_id": user_id,

        "current_revenue": round(current_revenue, 2),
        "current_expenses": round(current_expenses, 2),
        "current_profit": round(current_profit, 2),

        "previous_revenue": round(previous_revenue, 2),
        "previous_expenses": round(previous_expenses, 2),

        "predicted_revenue": round(predicted_revenue, 2),
        "predicted_expenses": round(predicted_expenses, 2),
        "predicted_profit": round(predicted_profit, 2),

        "revenue_growth": round(revenue_growth, 2),
        "expense_growth": round(expense_growth, 2),

        "expense_ratio": round(expense_ratio, 2),

        "total_budget": round(total_budget, 2),
        "budget_utilization": round(budget_utilization, 2),
        "budget_variance": round(budget_variance, 2),

        "predicted_profit_change": round(predicted_profit_change, 2),
        "profit_margin": round(profit_margin, 2)
    }