const { pool } = require("../config/db");

/**
 * GET /api/growth-plan/recommendations
 *
 * Queries real DB data (revenues, expenses, budgets, goals) and generates
 * dynamic AI recommendation strings. No hardcoded dummy data.
 */
const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const currYear  = now.getFullYear();
    const currMonth = now.getMonth() + 1;

    const prevDate  = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevYear  = prevDate.getFullYear();
    const prevMonth = prevDate.getMonth() + 1;

    // ── Fetch all-time totals ──────────────────────────────────────────────────
    const [revAllQ, expAllQ, budAllQ] = await Promise.all([
      pool.query(`SELECT COALESCE(SUM(amount), 0) AS total FROM revenue WHERE user_id = $1`, [userId]),
      pool.query(`SELECT COALESCE(SUM(amount), 0) AS total FROM expenses WHERE user_id = $1`, [userId]),
      pool.query(`SELECT COALESCE(SUM(amount), 0) AS total FROM budgets WHERE user_id = $1`,  [userId]),
    ]);
    const totalRevenue  = Number(revAllQ.rows[0].total);
    const totalExpenses = Number(expAllQ.rows[0].total);
    const totalBudget   = Number(budAllQ.rows[0].total);

    // ── Fetch current-month totals ─────────────────────────────────────────────
    const [revCurrQ, expCurrQ, revPrevQ] = await Promise.all([
      pool.query(
        `SELECT COALESCE(SUM(amount), 0) AS total FROM revenue
         WHERE user_id = $1 AND EXTRACT(YEAR FROM revenue_date)=$2 AND EXTRACT(MONTH FROM revenue_date)=$3`,
        [userId, currYear, currMonth]
      ),
      pool.query(
        `SELECT COALESCE(SUM(amount), 0) AS total FROM expenses
         WHERE user_id = $1 AND EXTRACT(YEAR FROM expense_date)=$2 AND EXTRACT(MONTH FROM expense_date)=$3`,
        [userId, currYear, currMonth]
      ),
      pool.query(
        `SELECT COALESCE(SUM(amount), 0) AS total FROM revenue
         WHERE user_id = $1 AND EXTRACT(YEAR FROM revenue_date)=$2 AND EXTRACT(MONTH FROM revenue_date)=$3`,
        [userId, prevYear, prevMonth]
      ),
    ]);
    const revCurr = Number(revCurrQ.rows[0].total);
    const expCurr = Number(expCurrQ.rows[0].total);
    const revPrev = Number(revPrevQ.rows[0].total);

    // ── Fetch goals ────────────────────────────────────────────────────────────
    let goals = [];
    try {
      const goalsQ = await pool.query(
        `SELECT * FROM goals WHERE user_id = $1 ORDER BY target_date ASC`,
        [userId]
      );
      goals = goalsQ.rows;
    } catch (_) {
      // goals table may not exist yet — skip gracefully
    }

    // ── Compute ratios ────────────────────────────────────────────────────────
    const expenseRatio    = totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0;
    const profitMargin    = totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0;
    const revenueGrowthPct = revPrev > 0 ? ((revCurr - revPrev) / revPrev) * 100 : null;
    const budgetUtilPct   = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : null;
    const netCashFlow     = totalRevenue - totalExpenses;

    // ── Generate dynamic recommendations ─────────────────────────────────────
    const recommendations = [];

    // 1. Revenue growth recommendation
    if (revenueGrowthPct !== null) {
      if (revenueGrowthPct < 0) {
        const needed = Math.abs(revenueGrowthPct).toFixed(1);
        recommendations.push({
          id: 1,
          type: "revenue",
          priority: "high",
          title: "Revenue Recovery Needed",
          message: `Your revenue declined by ${needed}% compared to last month. Increase revenue by at least ${needed}% to restore momentum and accelerate goal progress.`,
          icon: "TrendingUp",
        });
      } else if (revenueGrowthPct < 10) {
        recommendations.push({
          id: 1,
          type: "revenue",
          priority: "medium",
          title: "Boost Revenue Growth",
          message: `Revenue grew only ${revenueGrowthPct.toFixed(1)}% month-over-month. Targeting a 15% increase will significantly improve your financial health score and goal achievement speed.`,
          icon: "TrendingUp",
        });
      } else {
        recommendations.push({
          id: 1,
          type: "revenue",
          priority: "low",
          title: "Strong Revenue Growth",
          message: `Excellent! Revenue increased by ${revenueGrowthPct.toFixed(1)}% this month. Maintain this trajectory to achieve your expansion goals ahead of schedule.`,
          icon: "TrendingUp",
        });
      }
    } else if (revCurr > 0) {
      recommendations.push({
        id: 1,
        type: "revenue",
        priority: "medium",
        title: "Scale Revenue Streams",
        message: `Current monthly revenue stands at $${revCurr.toLocaleString()}. Diversifying revenue sources by 15% can boost your goal completion rate significantly.`,
        icon: "TrendingUp",
      });
    } else {
      recommendations.push({
        id: 1,
        type: "revenue",
        priority: "high",
        title: "Establish Revenue Streams",
        message: "No revenue data detected for this period. Add your income sources to enable accurate goal tracking and AI-powered financial planning.",
        icon: "TrendingUp",
      });
    }

    // 2. Expense reduction recommendation
    if (expenseRatio > 80) {
      const reductionNeeded = (expenseRatio - 70).toFixed(1);
      recommendations.push({
        id: 2,
        type: "expense",
        priority: "high",
        title: "Critical: Reduce Operational Expenses",
        message: `Your expenses consume ${expenseRatio.toFixed(1)}% of revenue — well above the healthy 70% threshold. Reducing operational expenses by ${reductionNeeded}% would free up capital to meet savings targets faster.`,
        icon: "TrendingDown",
      });
    } else if (expenseRatio > 60) {
      recommendations.push({
        id: 2,
        type: "expense",
        priority: "medium",
        title: "Optimize Expense Management",
        message: `Expense ratio is at ${expenseRatio.toFixed(1)}%. A 10% reduction in operational costs will improve your profit margin from ${profitMargin.toFixed(1)}% to approximately ${(profitMargin + expenseRatio * 0.1).toFixed(1)}%.`,
        icon: "TrendingDown",
      });
    } else if (totalExpenses > 0) {
      recommendations.push({
        id: 2,
        type: "expense",
        priority: "low",
        title: "Expense Management is Healthy",
        message: `Your expense-to-revenue ratio of ${expenseRatio.toFixed(1)}% is well-managed. Maintaining this discipline will help all your active goals stay on track.`,
        icon: "TrendingDown",
      });
    }

    // 3. Budget utilization recommendation
    if (budgetUtilPct !== null) {
      if (budgetUtilPct > 100) {
        const over = (budgetUtilPct - 100).toFixed(1);
        recommendations.push({
          id: 3,
          type: "budget",
          priority: "high",
          title: "Budget Overrun Detected",
          message: `Spending has exceeded your budget by ${over}%. Revise budget allocations or reduce discretionary spending immediately to protect your financial goals.`,
          icon: "AccountBalance",
        });
      } else if (budgetUtilPct > 85) {
        recommendations.push({
          id: 3,
          type: "budget",
          priority: "medium",
          title: "Approaching Budget Limit",
          message: `You've used ${budgetUtilPct.toFixed(1)}% of your total budget. Careful monitoring for the remainder of the period will prevent overruns and keep goals on track.`,
          icon: "AccountBalance",
        });
      } else {
        recommendations.push({
          id: 3,
          type: "budget",
          priority: "low",
          title: "Budget Utilization is Optimal",
          message: `Budget utilization stands at ${budgetUtilPct.toFixed(1)}% — within the healthy range. The remaining ${(100 - budgetUtilPct).toFixed(1)}% can be reallocated to accelerate high-priority goals.`,
          icon: "AccountBalance",
        });
      }
    } else {
      recommendations.push({
        id: 3,
        type: "budget",
        priority: "medium",
        title: "Set Departmental Budgets",
        message: "No budget data found. Setting monthly budgets enables intelligent spending controls and improves your overall financial health score.",
        icon: "AccountBalance",
      });
    }

    // 4. Goal-specific recommendations
    if (goals.length > 0) {
      const atRisk = goals.filter((g) => {
        const progress = Number(g.target_amount) > 0
          ? Math.min(100, (Number(g.current_amount) / Number(g.target_amount)) * 100)
          : 0;
        return progress < 50;
      });
      const onTrack = goals.filter((g) => {
        const progress = Number(g.target_amount) > 0
          ? Math.min(100, (Number(g.current_amount) / Number(g.target_amount)) * 100)
          : 0;
        return progress >= 50 && progress < 90;
      });
      const completed = goals.filter((g) => {
        const progress = Number(g.target_amount) > 0
          ? Math.min(100, (Number(g.current_amount) / Number(g.target_amount)) * 100)
          : 0;
        return progress >= 90;
      });

      if (atRisk.length > 0) {
        const goal = atRisk[0];
        const remaining = (Number(goal.target_amount) - Number(goal.current_amount)).toFixed(0);
        const daysLeft = Math.max(0, Math.ceil((new Date(goal.target_date) - now) / (1000 * 60 * 60 * 24)));
        const monthsLeft = Math.max(1, Math.ceil(daysLeft / 30));
        const monthlyNeeded = (remaining / monthsLeft).toFixed(0);

        recommendations.push({
          id: 4,
          type: "goal",
          priority: "high",
          title: `At Risk: "${goal.goal_title || goal.title || 'Untitled Goal'}"`,
          message: `This goal needs $${Number(remaining).toLocaleString()} more to complete. To meet the target date (${goal.target_date}), you need approximately $${Number(monthlyNeeded).toLocaleString()} per month over the next ${monthsLeft} month(s).`,
          icon: "Flag",
        });
      }

      if (onTrack.length > 0) {
        const goal = onTrack[0];
        const progress = Math.min(100, Math.round((Number(goal.current_amount) / Number(goal.target_amount)) * 100));
        recommendations.push({
          id: 5,
          type: "goal",
          priority: "low",
          title: `On Track: "${goal.goal_title || goal.title || 'Untitled Goal'}"`,
          message: `Current financial trends indicate "${goal.goal_title || goal.title || 'Untitled Goal'}" (${progress}% complete) can be achieved within the target date. Sustain current revenue levels to stay on course.`,
          icon: "CheckCircle",
        });
      }

      if (completed.length > 0) {
        recommendations.push({
          id: 6,
          type: "goal",
          priority: "low",
          title: `${completed.length} Goal${completed.length > 1 ? "s" : ""} Completed!`,
          message: `You've achieved ${completed.length} financial goal${completed.length > 1 ? "s" : ""}. Consider setting new stretch targets to keep your financial growth momentum going.`,
          icon: "EmojiEvents",
        });
      }
    } else {
      recommendations.push({
        id: 4,
        type: "goal",
        priority: "medium",
        title: "Set Your First Financial Goal",
        message: "No goals defined yet. Creating specific financial targets enables precise tracking and AI-powered progress recommendations tied to your real revenue and expense data.",
        icon: "Flag",
      });
    }

    // 5. Cash flow recommendation
    if (netCashFlow < 0) {
      recommendations.push({
        id: 7,
        type: "cashflow",
        priority: "high",
        title: "Negative Cash Flow Alert",
        message: `Net cash flow is -$${Math.abs(netCashFlow).toLocaleString()}. Immediate action is needed: either increase revenue streams or reduce non-essential expenses to restore positive cash flow.`,
        icon: "Warning",
      });
    } else if (netCashFlow > 0 && profitMargin > 20) {
      recommendations.push({
        id: 7,
        type: "cashflow",
        priority: "low",
        title: "Strong Cash Flow — Invest the Surplus",
        message: `Net cash flow of $${netCashFlow.toLocaleString()} with a ${profitMargin.toFixed(1)}% profit margin is excellent. Consider allocating surplus cash toward your highest-priority financial goals.`,
        icon: "Savings",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        recommendations: recommendations.slice(0, 6), // cap at 6
        summary: {
          total_revenue: totalRevenue,
          total_expenses: totalExpenses,
          net_cash_flow: netCashFlow,
          expense_ratio: parseFloat(expenseRatio.toFixed(2)),
          profit_margin: parseFloat(profitMargin.toFixed(2)),
          revenue_growth_pct: revenueGrowthPct !== null ? parseFloat(revenueGrowthPct.toFixed(2)) : null,
          active_goals: goals.length,
        },
      },
    });
  } catch (error) {
    console.error("GET RECOMMENDATIONS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getRecommendations };
