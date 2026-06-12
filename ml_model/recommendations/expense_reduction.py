# -------------------------
# === Expense Reduction ===
# -------------------------

def generate(financial_metrics):

    recommendations = []

    try:
        profit_margin = financial_metrics["profit_margin"]
        revenue_growth = financial_metrics["revenue_growth"]
        expense_growth = financial_metrics["expense_growth"]
        expense_ratio = financial_metrics["expense_ratio"]

        current_revenue = financial_metrics["current_revenue"]
        current_expenses = financial_metrics["current_expenses"]
        predicted_profit = financial_metrics["predicted_profit"]

    except KeyError as e:
        print(f"[ERROR] Missing key: {e}")
        raise
    except Exception as e:
        print(f"[ERROR] Failed to read financial metrics: {e}")
        raise

    # -- dangerously high burn rate

    if expense_ratio > 80:

        recommendations.append({
            "recommendation_type": "expense_reduction",
            "message": (
                f"Expenses (₹{current_expenses:,.0f}) are consuming {expense_ratio:.1f}% "
                f"of revenue (₹{current_revenue:,.0f}). Immediate cost review is recommended."
            ),
            "priority": "high"
        })

    # -- expenses scaling faster than revenue

    if expense_growth > revenue_growth and expense_growth > 20:

        recommendations.append({
            "recommendation_type": "expense_reduction",
            "message": (
                f"Expenses grew by {expense_growth:.1f}% while revenue grew by only {revenue_growth:.1f}%. "
                f"Review variable and operational costs before the gap widens further."
            ),
            "priority": "high"
        })

    # -- thin profit margins

    if profit_margin < 10 and current_expenses > 0:

        recommendations.append({
            "recommendation_type": "expense_reduction",
            "message": (
                f"Profit margin is at {profit_margin:.1f}%. "
                f"Reducing non-essential expenses from the current ₹{current_expenses:,.0f} "
                f"could meaningfully improve profitability."
            ),
            "priority": "medium"
        })

    # -- cost rise without revenue justification

    if expense_growth > 15 and revenue_growth < 5:

        recommendations.append({
            "recommendation_type": "expense_reduction",
            "message": (
                f"Costs rose by {expense_growth:.1f}% but revenue grew by only {revenue_growth:.1f}%. "
                f"Audit recent expense increases to identify and eliminate inefficiencies."
            ),
            "priority": "medium"
        })

    # -- predicted loss next month

    if predicted_profit < 0:

        recommendations.append({
            "recommendation_type": "expense_reduction",
            "message": (
                f"A loss of ₹{abs(predicted_profit):,.0f} is forecasted next month. "
                f"Cutting costs now could prevent or reduce the deficit."
            ),
            "priority": "high"
        })

    return recommendations