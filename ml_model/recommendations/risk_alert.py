# -------------------------
# === Risk Alert ===
# -------------------------

def generate(financial_metrics):

    recommendations = []

    try:
        current_revenue = financial_metrics["current_revenue"]
        current_expenses = financial_metrics["current_expenses"]

        predicted_profit = financial_metrics["predicted_profit"]
        predicted_profit_change = financial_metrics["predicted_profit_change"]

        revenue_growth = financial_metrics["revenue_growth"]
        expense_growth = financial_metrics["expense_growth"]
        expense_ratio = financial_metrics["expense_ratio"]

    except KeyError as e:
        print(f"[ERROR] Missing key: {e}")
        raise
    except Exception as e:
        print(f"[ERROR] Failed to read financial metrics: {e}")
        raise

    # -- expenses exceed revenue

    if current_expenses > current_revenue:

        recommendations.append({
            "recommendation_type": "risk_alert",
            "message": (
                f"Expenses (₹{current_expenses:,.0f}) are exceeding revenue (₹{current_revenue:,.0f}). "
                f"Immediate cost control is required."
            ),
            "priority": "high"
        })

    # -- negative profit forecast

    if predicted_profit < 0:

        recommendations.append({
            "recommendation_type": "risk_alert",
            "message": (
                f"A financial loss of ₹{abs(predicted_profit):,.0f} is predicted for next month. "
                f"Proactive measures are strongly advised."
            ),
            "priority": "high"
        })

    # -- profit drop

    if predicted_profit_change <= -50:

        recommendations.append({
            "recommendation_type": "risk_alert",
            "message": (
                f"A severe profit decline of {abs(predicted_profit_change):.1f}% is expected next month, "
                f"dropping to ₹{predicted_profit:,.0f}. Urgent intervention is recommended."
            ),
            "priority": "high"
        })

    elif predicted_profit_change <= -25:

        recommendations.append({
            "recommendation_type": "risk_alert",
            "message": (
                f"A moderate profit decline of {abs(predicted_profit_change):.1f}% is expected next month, "
                f"with forecasted profit at ₹{predicted_profit:,.0f}. Review cost and revenue strategies."
            ),
            "priority": "medium"
        })

    # -- expense growth

    if expense_growth > 30:

        recommendations.append({
            "recommendation_type": "risk_alert",
            "message": (
                f"Expenses have grown rapidly by {expense_growth:.1f}%, "
                f"reaching ₹{current_expenses:,.0f} this month. Investigate the root cause immediately."
            ),
            "priority": "medium"
        })

    # -- high expense ratio

    if expense_ratio > 90:

        recommendations.append({
            "recommendation_type": "risk_alert",
            "message": (
                f"{expense_ratio:.1f}% of revenue (₹{current_expenses:,.0f} of ₹{current_revenue:,.0f}) "
                f"is consumed by expenses, leaving almost no margin for profit."
            ),
            "priority": "high"
        })

    # -- revenue decline

    if revenue_growth < 0:

        recommendations.append({
            "recommendation_type": "risk_alert",
            "message": (
                f"Revenue has declined by {abs(revenue_growth):.1f}%, "
                f"dropping to ₹{current_revenue:,.0f} this month. Assess sales and market conditions."
            ),
            "priority": "medium"
        })

    return recommendations