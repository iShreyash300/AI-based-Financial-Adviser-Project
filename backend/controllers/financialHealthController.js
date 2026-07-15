const { pool } = require("../config/db");

/**
 * GET /api/financial-health
 * Computes 5 financial metrics for the current month (and previous month
 * for Revenue Growth) then returns a weighted overall score (0-100).
 *
 * Weights:
 *   Profitability   : 30%
 *   Expense Ratio   : 20%
 *   Revenue Growth  : 20%
 *   Budget Efficiency: 20%
 *   Cash Flow Mgmt  : 10%
 */
const getFinancialHealth = async (req, res) => {
  try {
    const userId = req.user.id;

    // ── Current & Previous Month Boundaries ─────────────────────────────────
    const now = new Date();
    const currYear  = now.getFullYear();
    const currMonth = now.getMonth() + 1; // 1-12

    const prevDate  = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevYear  = prevDate.getFullYear();
    const prevMonth = prevDate.getMonth() + 1;

    // ── 1. Current-month Revenue ─────────────────────────────────────────────
    const revCurrQ = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total
       FROM revenue
       WHERE user_id = $1
         AND EXTRACT(YEAR  FROM revenue_date) = $2
         AND EXTRACT(MONTH FROM revenue_date) = $3`,
      [userId, currYear, currMonth]
    );
    const revCurr = Number(revCurrQ.rows[0].total);

    // ── 2. Previous-month Revenue ────────────────────────────────────────────
    const revPrevQ = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total
       FROM revenue
       WHERE user_id = $1
         AND EXTRACT(YEAR  FROM revenue_date) = $2
         AND EXTRACT(MONTH FROM revenue_date) = $3`,
      [userId, prevYear, prevMonth]
    );
    const revPrev = Number(revPrevQ.rows[0].total);

    // ── 3. Current-month Expenses ────────────────────────────────────────────
    const expCurrQ = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total
       FROM expenses
       WHERE user_id = $1
         AND EXTRACT(YEAR  FROM expense_date) = $2
         AND EXTRACT(MONTH FROM expense_date) = $3`,
      [userId, currYear, currMonth]
    );
    const expCurr = Number(expCurrQ.rows[0].total);

    // ── 4. Current-month Budget ──────────────────────────────────────────────
    const budgetQ = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total
       FROM budgets
       WHERE user_id = $1
         AND budget_year  = $2
         AND budget_month = $3`,
      [userId, currYear, currMonth]
    );
    const budgetTotal = Number(budgetQ.rows[0].total);

    // ── 5. All-time totals (fallback if current month is empty) ──────────────
    const revAllQ = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total
       FROM revenue WHERE user_id = $1`,
      [userId]
    );
    const expAllQ = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total
       FROM expenses WHERE user_id = $1`,
      [userId]
    );
    const budAllQ = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total
       FROM budgets WHERE user_id = $1`,
      [userId]
    );

    const revAll  = Number(revAllQ.rows[0].total);
    const expAll  = Number(expAllQ.rows[0].total);
    const budAll  = Number(budAllQ.rows[0].total);

    // ── Monthly-vs-all-time context ──────────────────────────────────────────
    // Prefer current-month figures; fall back to all-time when no data exists
    // for the current month (new users, etc.).
    const useMonthly = revCurr > 0 || expCurr > 0;
    const revenue  = useMonthly ? revCurr  : revAll;
    const expenses = useMonthly ? expCurr  : expAll;
    const budget   = budgetTotal > 0 ? budgetTotal : budAll;

    // ── Per-month revenue breakdown for the last 12 months ──────────────────
    const monthlyBreakdownQ = await pool.query(
      `SELECT
         EXTRACT(YEAR FROM revenue_date)  AS yr,
         EXTRACT(MONTH FROM revenue_date) AS mo,
         SUM(amount) AS total
       FROM revenue
       WHERE user_id = $1
       GROUP BY yr, mo
       ORDER BY yr DESC, mo DESC
       LIMIT 12`,
      [userId]
    );
    const monthlyRevenue = monthlyBreakdownQ.rows;

    // ── Metric Calculations ──────────────────────────────────────────────────

    // 1. Profitability Score  = (Rev - Exp) / Rev × 100  → clamped 0-100
    let profitabilityScore = 0;
    if (revenue > 0) {
      const raw = ((revenue - expenses) / revenue) * 100;
      profitabilityScore = Math.min(100, Math.max(0, raw));
    }

    // 2. Expense Ratio  = Exp / Rev × 100 → inverted so lower = better
    //    score = max(0, 100 - expenseRatio)
    let expenseRatioScore = 0;
    let expenseRatioRaw   = 0;
    if (revenue > 0) {
      expenseRatioRaw  = (expenses / revenue) * 100;
      expenseRatioScore = Math.min(100, Math.max(0, 100 - expenseRatioRaw));
    }

    // 3. Revenue Growth = (curr - prev) / prev × 100  → clamped 0-100
    //    If no prev-month data, fall back to 0 growth (neutral = 50).
    let revenueGrowthScore = 50; // neutral default
    let revenueGrowthRaw   = null;
    if (revPrev > 0) {
      revenueGrowthRaw  = ((revCurr - revPrev) / revPrev) * 100;
      // Map: -100% → 0pts, 0% → 50pts, +50% → 100pts  (linear, clamped)
      revenueGrowthScore = Math.min(100, Math.max(0, 50 + revenueGrowthRaw));
    } else if (revCurr > 0) {
      revenueGrowthScore = 75; // we have revenue, no prior → positive signal
    }

    // 4. Budget Efficiency = (Budget - Exp) / Budget × 100  → clamped 0-100
    let budgetEfficiencyScore = 0;
    let budgetEfficiencyRaw   = 0;
    if (budget > 0) {
      budgetEfficiencyRaw  = ((budget - expenses) / budget) * 100;
      budgetEfficiencyScore = Math.min(100, Math.max(0, budgetEfficiencyRaw));
    } else {
      // No budget set — treat as neutral
      budgetEfficiencyScore = 50;
    }

    // 5. Cash Flow Management = (Rev - Exp) / Exp × 100  → clamped 0-100
    //    Map: negative CF → 0; 0% → 50pts; 50%+ → 100pts (linear, clamped)
    let cashFlowScore = 0;
    let cashFlowRaw   = null;
    if (expenses > 0) {
      cashFlowRaw  = ((revenue - expenses) / expenses) * 100;
      cashFlowScore = Math.min(100, Math.max(0, 50 + cashFlowRaw));
    } else if (revenue > 0) {
      cashFlowScore = 100; // All revenue, no expenses — perfect
    }

    // ── Weighted Overall Score ───────────────────────────────────────────────
    const overallScore =
      profitabilityScore  * 0.30 +
      expenseRatioScore   * 0.20 +
      revenueGrowthScore  * 0.20 +
      budgetEfficiencyScore * 0.20 +
      cashFlowScore       * 0.10;

    const finalScore = Math.round(Math.min(100, Math.max(0, overallScore)));

    // ── Status ───────────────────────────────────────────────────────────────
    let status;
    if (finalScore >= 80)      status = "Good";
    else if (finalScore >= 60) status = "Average";
    else                       status = "Poor";

    // ── Dynamic Message ──────────────────────────────────────────────────────
    let message;
    if (finalScore >= 80) {
      message =
        "Excellent financial health! Your business is profitable, well-budgeted, and growing steadily.";
    } else if (finalScore >= 60) {
      message =
        "Your finances are on a stable track. Focus on reducing expenses and improving budget efficiency to reach the next level.";
    } else {
      message =
        "Your financial health needs attention. Review your expense categories, align spending with budgets, and look for revenue growth opportunities.";
    }

    // ── Response ─────────────────────────────────────────────────────────────
    res.status(200).json({
      success: true,
      data: {
        overall_score: finalScore,
        status,
        message,
        metrics: {
          profitability: {
            label: "Profitability",
            score: Math.round(profitabilityScore),
            raw_value: revenue > 0 ? +((revenue - expenses) / revenue * 100).toFixed(2) : 0,
            description: "Net profit as % of revenue",
          },
          expense_ratio: {
            label: "Expense Ratio",
            score: Math.round(expenseRatioScore),
            raw_value: revenue > 0 ? +expenseRatioRaw.toFixed(2) : 0,
            description: "Expenses as % of revenue (lower is better)",
          },
          revenue_growth: {
            label: "Revenue Growth",
            score: Math.round(revenueGrowthScore),
            raw_value: revenueGrowthRaw !== null ? +revenueGrowthRaw.toFixed(2) : null,
            description: "Month-over-month revenue change",
          },
          budget_efficiency: {
            label: "Budget Efficiency",
            score: Math.round(budgetEfficiencyScore),
            raw_value: budget > 0 ? +budgetEfficiencyRaw.toFixed(2) : null,
            description: "Remaining budget as % of total budget",
          },
          cash_flow: {
            label: "Cash Flow Mgmt",
            score: Math.round(cashFlowScore),
            raw_value: cashFlowRaw !== null ? +cashFlowRaw.toFixed(2) : null,
            description: "Net cash flow as % of expenses",
          },
        },
        period: {
          current_month: currMonth,
          current_year: currYear,
          prev_month: prevMonth,
          prev_year: prevYear,
        },
        raw: {
          revenue,
          expenses,
          budget,
          rev_current_month: revCurr,
          rev_previous_month: revPrev,
          using_monthly_data: useMonthly,
        },
      },
    });
  } catch (error) {
    console.error("FINANCIAL HEALTH ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { getFinancialHealth };
