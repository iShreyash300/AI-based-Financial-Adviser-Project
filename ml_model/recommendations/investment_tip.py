# -------------------------
# === Investment Tip ===
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
        current_profit = financial_metrics["current_profit"]

        predicted_profit = financial_metrics["predicted_profit"]
        predicted_profit_change = financial_metrics["predicted_profit_change"]

    except KeyError as e:
        print(f"[ERROR] Missing key: {e}")
        raise
    except Exception as e:
        print(f"[ERROR] Failed to read financial metrics: {e}")
        raise

    # -- healthy profit margin

    if profit_margin >= 20:

        recommendations.append({
            "recommendation_type": "investment_tip",
            "message": (
                f"Profit margin is strong at {profit_margin:.1f}% (₹{current_profit:,.0f} on ₹{current_revenue:,.0f} revenue). "
                f"Consider reinvesting surplus into growth initiatives or assets."
            ),
            "priority": "high"
        })

    # -- efficient scaling

    if revenue_growth > expense_growth and revenue_growth > 10:

        recommendations.append({
            "recommendation_type": "investment_tip",
            "message": (
                f"Revenue is growing at {revenue_growth:.1f}% while expenses grew by only {expense_growth:.1f}%. "
                f"This is an optimal window to invest in scaling operations."
            ),
            "priority": "high"
        })

    # -- low expense burn rate

    if expense_ratio < 65:

        recommendations.append({
            "recommendation_type": "investment_tip",
            "message": (
                f"Only {expense_ratio:.1f}% of revenue (₹{current_expenses:,.0f} of ₹{current_revenue:,.0f}) "
                f"is spent on expenses. Surplus funds could be directed toward strategic investments."
            ),
            "priority": "medium"
        })

    # -- strong profit growth forecast

    if predicted_profit_change >= 20:

        recommendations.append({
            "recommendation_type": "investment_tip",
            "message": (
                f"Profit is forecasted to grow by {predicted_profit_change:.1f}%, reaching ₹{predicted_profit:,.0f}. "
                f"Now is a good time to plan long-term investments."
            ),
            "priority": "high"
        })

    elif predicted_profit_change >= 10:

        recommendations.append({
            "recommendation_type": "investment_tip",
            "message": (
                f"Moderate profit growth of {predicted_profit_change:.1f}% is expected, "
                f"with forecasted profit at ₹{predicted_profit:,.0f}. "
                f"Consider smaller, targeted investment opportunities."
            ),
            "priority": "medium"
        })

    # -- falling costs with healthy margin

    if expense_growth < 0 and profit_margin > 10:

        recommendations.append({
            "recommendation_type": "investment_tip",
            "message": (
                f"Expenses declined by {abs(expense_growth):.1f}% while profit margin holds at {profit_margin:.1f}%. "
                f"Freed-up capital of approximately ₹{current_profit:,.0f} is available for investment."
            ),
            "priority": "medium"
        })

    # -- positive predicted profit safety gate

    if predicted_profit < 0:
        return []

    return recommendations