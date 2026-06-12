from ml_model.database.db_connection import engine
from ml_model.utils.build_financial_metrics import get_financial_metrics
from ml_model.recommendations.expense_reduction import generate as expense_reduction
from ml_model.recommendations.budget_advice import generate as budget_advice
from ml_model.recommendations.investment_tip import generate as investment_tip
from ml_model.recommendations.saving_suggestion import generate as saving_suggestion
from ml_model.recommendations.risk_alert import generate as risk_alert


# -------------------------
# === Priority Weighting Engine ===
# -------------------------

PRIORITY_TO_SCORE = {
    "high": 3,
    "medium": 2,
    "low": 1
}

SCORE_TO_PRIORITY = {
    3: "high",
    2: "medium",
    1: "low"
}


def calculate_priority(rec, financial_metrics):

    try:
        rec_type = rec["recommendation_type"]
        score = PRIORITY_TO_SCORE.get(rec["priority"], 1)

        predicted_profit = financial_metrics["predicted_profit"]
        expense_ratio = financial_metrics["expense_ratio"]
        expense_growth = financial_metrics["expense_growth"]
        revenue_growth = financial_metrics["revenue_growth"]
        budget_utilization = financial_metrics["budget_utilization"]

    except KeyError as e:
        print(f"[ERROR] Missing key: {e}")
        raise
    except Exception as e:
        print(f"[ERROR] Failed to calculate priority: {e}")
        raise

    # -- context boosts

    if rec_type == "risk_alert":

        if predicted_profit < 0:
            score += 1

        if expense_ratio > 80:
            score += 1

    elif rec_type == "expense_reduction":

        if predicted_profit < 0:
            score += 1

        if expense_growth > 30:
            score += 1

    elif rec_type == "budget_advice":

        if budget_utilization > 100:
            score += 1

        if expense_ratio > 80:
            score += 1

    elif rec_type == "saving_suggestion":

        if predicted_profit < 0:
            score += 1

    elif rec_type == "investment_tip":

        if predicted_profit < 0:
            score -= 1

        if revenue_growth < 0:
            score -= 1

    # -- clamp score

    score = max(1, min(3, score))

    return SCORE_TO_PRIORITY[score]


# -------------------------
# === Main Engine ===
# -------------------------

def generate_and_store_recommendations(user_id):

    # -- financial metrics

    try:
        financial_metrics = get_financial_metrics(user_id)
    except Exception as e:
        print(f"[ERROR] Failed to fetch financial metrics: {e}")
        raise

    modules = [
        risk_alert,
        expense_reduction,
        budget_advice,
        investment_tip,
        saving_suggestion
    ]

    recommendations = []
    silent_modules = []

    # -- run modules

    for module in modules:

        try:
            results = module(financial_metrics)
        except Exception as e:
            print(f"[ERROR] Module execution failed: {e}")
            raise

        module_name = module.__name__

        if results:
            for r in results:
                r["priority"] = calculate_priority(
                    r,
                    financial_metrics
                )
                recommendations.append(r)
        else:
            silent_modules.append(module_name)

    # -- global fallback

    if not recommendations:
        recommendations.append({
            "recommendation_type": "saving_suggestion",
            "message": "All financial modules report stable conditions. No actions required.",
            "priority": "low"
        })

    # -- partial silence insight

    elif len(silent_modules) > 0:
        recommendations.append({
            "recommendation_type": "saving_suggestion",
            "message": f"{len(silent_modules)} modules found no actionable insights.",
            "priority": "low"
        })

    # -- guaranteed slot per module

    TOTAL_LIMIT = 10

    seen_types = set()
    guaranteed = []
    leftover = []

    for r in recommendations:
        rec_type = r["recommendation_type"]

        if rec_type not in seen_types:
            guaranteed.append(r)
            seen_types.add(rec_type)
        else:
            leftover.append(r)

    # -- fill remaining slots

    priority_order = {
        "high": 0,
        "medium": 1,
        "low": 2
    }

    try:
        leftover_sorted = sorted(
            leftover,
            key=lambda x: priority_order[x["priority"]]
        )
    except KeyError as e:
        print(f"[ERROR] Invalid priority: {e}")
        raise
    except Exception as e:
        print(f"[ERROR] Failed to sort recommendations: {e}")
        raise

    remaining_slots = TOTAL_LIMIT - len(guaranteed)

    final_recommendations = (
        guaranteed
        + leftover_sorted[:remaining_slots]
    )

    # -- store in database

    try:
        with engine.begin() as conn:
            for rec in final_recommendations:
                conn.execute(
                    """
                    INSERT INTO ai_recommendations
                    (user_id, recommendation_type, message, priority, created_at)
                    VALUES (%s, %s, %s, %s, NOW())
                    """,
                    (
                        user_id,
                        rec["recommendation_type"],
                        rec["message"],
                        rec["priority"]
                    )
                )
    except Exception as e:
        print(f"[ERROR] Failed to store recommendations: {e}")
        raise

    return final_recommendations