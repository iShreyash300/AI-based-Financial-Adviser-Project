# -------------------------
# === Saving Suggestion ===
# -------------------------

def generate(financial_metrics):

    recommendations = []

    try:
        current_profit = financial_metrics["current_profit"]
        current_revenue = financial_metrics["current_revenue"]
        
        profit_margin = financial_metrics["profit_margin"]
        expense_growth = financial_metrics["expense_growth"]
        revenue_growth = financial_metrics["revenue_growth"]
        
        budget_utilization = financial_metrics["budget_utilization"]
        total_budget = financial_metrics["total_budget"]
        budget_variance = financial_metrics["budget_variance"]

    except KeyError as e:
        print(f"[ERROR] Missing key: {e}")
        raise
    except Exception as e:
        print(f"[ERROR] Failed to read financial metrics: {e}")
        raise

    # -- profit exists but margin is thin

    if current_profit > 0 and profit_margin < 15:

        recommendations.append({
            "recommendation_type": "saving_suggestion",
            "message": (
                f"You are generating a profit of ₹{current_profit:,.0f} "
                f"but margin is thin at {profit_margin:.1f}%. "
                f"Start setting aside even a small fixed amount each month to build a financial buffer."
            ),
            "priority": "medium"
        })

    # -- decent margin encourage formal saving

    elif profit_margin >= 15 and profit_margin < 30:

        suggested_saving = round(current_profit * 0.20, 0)

        recommendations.append({
            "recommendation_type": "saving_suggestion",
            "message": (
                f"Profit margin is at {profit_margin:.1f}% (₹{current_profit:,.0f}). "
                f"Consider saving at least 20% of monthly profit — "
                f"approximately ₹{suggested_saving:,.0f} — as a financial reserve."
            ),
            "priority": "medium"
        })

    # -- strong margin allocate savings formally

    elif profit_margin >= 30:

        suggested_saving = round(current_profit * 0.30, 0)

        recommendations.append({
            "recommendation_type": "saving_suggestion",
            "message": (
                f"Profit margin is strong at {profit_margin:.1f}% (₹{current_profit:,.0f}). "
                f"Allocate at least 30% of profit — ₹{suggested_saving:,.0f} — "
                f"into a dedicated savings or emergency fund."
            ),
            "priority": "high"
        })

    # -- silent expense creep

    if expense_growth > 10 and revenue_growth < expense_growth:

        recommendations.append({
            "recommendation_type": "saving_suggestion",
            "message": (
                f"Expenses grew by {expense_growth:.1f}% while revenue grew by only {revenue_growth:.1f}%. "
                f"This silent creep will erode savings over time. "
                f"Review and cap non-essential spending before it compounds."
            ),
            "priority": "medium"
        })

    # -- underutilised budget redirect to savings

    if (
        budget_utilization > 0
        and budget_utilization < 50
        and current_profit > 0
    ):

        unspent = abs(budget_variance)

        recommendations.append({
            "recommendation_type": "saving_suggestion",
            "message": (
                f"Only {budget_utilization:.1f}% of the budget has been utilised. "
                f"The unspent ₹{unspent:,.0f} could be redirected into savings "
                f"rather than carried forward as discretionary spend."
            ),
            "priority": "low"
        })

    return recommendations