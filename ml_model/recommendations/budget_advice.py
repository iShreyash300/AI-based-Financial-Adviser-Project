# -------------------------
# === Budget Advice ===
# -------------------------

def generate(financial_metrics):

    recommendations = []

    try:
        current_expenses = financial_metrics["current_expenses"]
        total_budget = financial_metrics["total_budget"]
        budget_utilization = financial_metrics["budget_utilization"]
        budget_variance = financial_metrics["budget_variance"]

        current_month = financial_metrics.get(
            "current_month",
            "this month"
        )

    except KeyError as e:
        print(f"[ERROR] Missing key: {e}")
        raise
    except Exception as e:
        print(f"[ERROR] Failed to read financial metrics: {e}")
        raise

    # -- severely over budget

    if budget_utilization > 120:

        recommendations.append({
            "recommendation_type": "budget_advice",
            "message": (
                f"Expenses (₹{current_expenses:,.0f}) have exceeded the budget (₹{total_budget:,.0f}) "
                f"by ₹{budget_variance:,.0f} ({budget_utilization:.1f}% utilisation). "
                f"Immediate budget review and spending freeze is advised."
            ),
            "priority": "high"
        })

    # -- moderately over budget

    elif budget_utilization > 100:

        recommendations.append({
            "recommendation_type": "budget_advice",
            "message": (
                f"Expenses (₹{current_expenses:,.0f}) have crossed the planned budget (₹{total_budget:,.0f}) "
                f"by ₹{budget_variance:,.0f}. Review discretionary spending to bring costs back in line."
            ),
            "priority": "medium"
        })

    # -- approaching budget limit

    elif budget_utilization > 90:

        recommendations.append({
            "recommendation_type": "budget_advice",
            "message": (
                f"Budget utilisation is at {budget_utilization:.1f}% (₹{current_expenses:,.0f} of ₹{total_budget:,.0f}). "
                f"Only ₹{abs(budget_variance):,.0f} remains. Exercise caution with further spending."
            ),
            "priority": "medium"
        })

    # -- heavily underutilised budget

    if budget_utilization > 0 and budget_utilization < 50:

        recommendations.append({
            "recommendation_type": "budget_advice",
            "message": (
                f"Only {budget_utilization:.1f}% of the budget (₹{current_expenses:,.0f} of ₹{total_budget:,.0f}) "
                f"has been utilised. Consider reallocating ₹{abs(budget_variance):,.0f} toward growth or savings."
            ),
            "priority": "low"
        })

    # -- no budget set

    if total_budget == 0:

        recommendations.append({
            "recommendation_type": "budget_advice",
            "message": (
                f"No budget has been set for this month. "
                f"With ₹{current_expenses:,.0f} already spent, setting a budget will help control future costs."
            ),
            "priority": "medium"
        })

    return recommendations