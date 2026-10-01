const { pool } = require("../config/db");

// Helper: Get list of last N months ending in current month
const getPastMonths = (count = 6) => {
  const list = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    list.push({
      key: `${yr}-${mo}`,
      label: d.toLocaleString("default", { month: "short", year: "numeric" }),
      year: yr,
      month: d.getMonth() + 1,
    });
  }
  return list;
};

// Helper: Get predicted next month
const getPredictedMonth = () => {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const yr = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  return {
    key: `${yr}-${mo}`,
    label: d.toLocaleString("default", { month: "short", year: "numeric" }),
    year: yr,
    month: d.getMonth() + 1,
  };
};

// Helper: Calculate linear regression prediction
const calculateLinearRegression = (yValues) => {
  const n = yValues.length;
  if (n === 0) return 0;
  if (n === 1) return yValues[0];

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i++) {
    const x = i;
    const y = yValues[i];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Predict for next index n
  const predicted = slope * n + intercept;
  return predicted;
};

// Helper: Calculate statistical confidence score based on R^2
const calculateConfidence = (yValues) => {
  const n = yValues.length;
  if (n < 2) return 65.0;

  const mean = yValues.reduce((a, b) => a + b, 0) / n;
  if (mean === 0) return 90.0;

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i++) {
    const x = i;
    const y = yValues[i];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) return 75.0;

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  let ssr = 0; // sum of squared residuals
  let sst = 0; // total sum of squares

  for (let i = 0; i < n; i++) {
    const actual = yValues[i];
    const predictedVal = slope * i + intercept;
    ssr += Math.pow(actual - predictedVal, 2);
    sst += Math.pow(actual - mean, 2);
  }

  const r2 = sst === 0 ? 1.0 : 1.0 - ssr / sst;
  
  // Map R^2 to confidence percentage (between 60% and 95%)
  let confidence = 65 + Math.max(0, r2) * 30;
  if (isNaN(confidence)) confidence = 75;
  return Math.max(60.0, Math.min(95.0, Math.round(confidence * 100) / 100));
};

// Helper: Upsert prediction in database
const upsertPrediction = async (userId, type, value, confidence, month, year) => {
  try {
    const checkQuery = `
      SELECT id FROM predictions
      WHERE user_id = $1 AND prediction_type = $2 AND prediction_month = $3 AND prediction_year = $4
      ORDER BY created_at DESC LIMIT 1
    `;
    const checkResult = await pool.query(checkQuery, [userId, type, month, year]);

    if (checkResult.rows.length > 0) {
      const updateQuery = `
        UPDATE predictions
        SET predicted_value = $1, confidence_score = $2, created_at = CURRENT_TIMESTAMP
        WHERE id = $3
      `;
      await pool.query(updateQuery, [value, confidence, checkResult.rows[0].id]);
    } else {
      const insertQuery = `
        INSERT INTO predictions (user_id, prediction_type, predicted_value, confidence_score, prediction_month, prediction_year)
        VALUES ($1, $2, $3, $4, $5, $6)
      `;
      await pool.query(insertQuery, [userId, type, value, confidence, month, year]);
    }
  } catch (error) {
    console.error(`Error upserting prediction of type ${type}:`, error);
  }
};

// Helper: Update user recommendation in database (fresh upsert)
const saveRecommendation = async (userId, recType, message, priority) => {
  try {
    // Clear older recommendation of the same type for this user to keep it clean
    await pool.query(
      "DELETE FROM ai_recommendations WHERE user_id = $1 AND recommendation_type = $2",
      [userId, recType]
    );

    // Insert new one
    await pool.query(
      "INSERT INTO ai_recommendations (user_id, recommendation_type, message, priority) VALUES ($1, $2, $3, $4)",
      [userId, recType, message, priority]
    );
  } catch (error) {
    console.error("Error saving recommendation:", error);
  }
};

// ==========================================
// 1. Expense Prediction Endpoint
// ==========================================
const getExpensePrediction = async (req, res) => {
  try {
    const userId = req.user.id;
    const pastMonths = getPastMonths(6);
    const predictedMonth = getPredictedMonth();

    // Query historical expenses
    const query = `
      SELECT amount, TO_CHAR(expense_date, 'YYYY-MM') as month_key
      FROM expenses
      WHERE user_id = $1
    `;
    const result = await pool.query(query, [userId]);

    // Map amounts to past 6 months
    const monthlyMap = {};
    pastMonths.forEach((m) => {
      monthlyMap[m.key] = 0;
    });

    result.rows.forEach((row) => {
      if (monthlyMap[row.month_key] !== undefined) {
        monthlyMap[row.month_key] += parseFloat(row.amount);
      }
    });

    const yValues = pastMonths.map((m) => monthlyMap[m.key]);
    
    // Calculate prediction (clamped to 0)
    let predictedAmount = calculateLinearRegression(yValues);
    predictedAmount = Math.max(0, Math.round(predictedAmount * 100) / 100);

    const confidenceScore = calculateConfidence(yValues);

    // Calculate growth percentage compared to the current month (the last element of yValues)
    const currentMonthVal = yValues[yValues.length - 1] || 0;
    const growthPercentage = currentMonthVal > 0 
      ? Math.round(((predictedAmount - currentMonthVal) / currentMonthVal) * 10000) / 100 
      : 0;

    // Save prediction in DB
    await upsertPrediction(userId, "expense", predictedAmount, confidenceScore, predictedMonth.month, predictedMonth.year);

    // Get current/predicted budget limits for comparison
    const budgetQuery = `
      SELECT SUM(amount) as total_budget
      FROM budgets
      WHERE user_id = $1 AND budget_month = $2 AND budget_year = $3
    `;
    const budgetResult = await pool.query(budgetQuery, [userId, predictedMonth.month, predictedMonth.year]);
    const budgetAmount = parseFloat(budgetResult.rows[0]?.total_budget) || 0;

    // Generate AI recommendations
    const recommendations = [];
    let summary = `Based on your spending over the last 6 months, expenses are projected to change by ${growthPercentage}% to ₹${predictedAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} next month (${predictedMonth.label}).`;

    if (budgetAmount > 0) {
      if (predictedAmount > budgetAmount) {
        const excess = predictedAmount - budgetAmount;
        const excessPct = Math.round((excess / budgetAmount) * 100);
        summary += ` This predicted amount exceeds your set budget of ₹${budgetAmount.toLocaleString("en-IN")} by ₹${excess.toLocaleString("en-IN")} (${excessPct}%).`;
        
        const recMessage = `Your predicted expenses for next month are ₹${predictedAmount.toLocaleString("en-IN")}, exceeding your monthly budget of ₹${budgetAmount.toLocaleString("en-IN")} by ${excessPct}%. We recommend reviewing variable categories (like Ads Spend or Software subscriptions) to cut operational overheads.`;
        await saveRecommendation(userId, "expense_reduction", recMessage, "high");
        recommendations.push({ recommendation_type: "expense_reduction", message: recMessage, priority: "high" });

        const recMessage2 = `Optimize department budgets immediately. Implement a pre-approval workflow for operational expenses exceeding ₹5,000 to manage the forecasted cash outflow.`;
        await saveRecommendation(userId, "budget_advice", recMessage2, "medium");
        recommendations.push({ recommendation_type: "budget_advice", message: recMessage2, priority: "medium" });
      } else {
        const savings = budgetAmount - predictedAmount;
        summary += ` Good news! This is within your monthly budget of ₹${budgetAmount.toLocaleString("en-IN")} (leaving ₹${savings.toLocaleString("en-IN")} in breathing room).`;
        
        const recMessage = `Your predicted expenses are well within your set budget. Take this opportunity to transfer the surplus ₹${savings.toLocaleString("en-IN")} to a corporate treasury or high-yield savings account.`;
        await saveRecommendation(userId, "saving_suggestion", recMessage, "low");
        recommendations.push({ recommendation_type: "saving_suggestion", message: recMessage, priority: "low" });
      }
    } else {
      summary += ` Currently, you don't have a budget set for ${predictedMonth.label}. Set a monthly budget to compare against predicted overheads.`;
      
      const recMessage = `No budget is configured for next month. Set a budget inside the budget manager to receive automated alerts and track utilization.`;
      await saveRecommendation(userId, "budget_advice", recMessage, "medium");
      recommendations.push({ recommendation_type: "budget_advice", message: recMessage, priority: "medium" });
    }

    // Prepare chart data (past 6 actuals + predicted month)
    const chartData = pastMonths.map((m, idx) => ({
      month: m.label,
      amount: yValues[idx],
      type: "actual",
    }));
    chartData.push({
      month: predictedMonth.label,
      amount: predictedAmount,
      type: "predicted",
    });

    res.status(200).json({
      success: true,
      data: {
        predictedAmount,
        growthPercentage,
        confidenceScore,
        predictedMonth: predictedMonth.label,
        chartData,
        budgetAmount,
        summary,
        recommendations,
      },
    });
  } catch (error) {
    console.error("GET EXPENSE PREDICTION ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 2. Revenue Prediction Endpoint
// ==========================================
const getRevenuePrediction = async (req, res) => {
  try {
    const userId = req.user.id;
    const pastMonths = getPastMonths(6);
    const predictedMonth = getPredictedMonth();

    // Query historical revenues
    const query = `
      SELECT amount, TO_CHAR(revenue_date, 'YYYY-MM') as month_key
      FROM revenue
      WHERE user_id = $1
    `;
    const result = await pool.query(query, [userId]);

    // Map amounts to past 6 months
    const monthlyMap = {};
    pastMonths.forEach((m) => {
      monthlyMap[m.key] = 0;
    });

    result.rows.forEach((row) => {
      if (monthlyMap[row.month_key] !== undefined) {
        monthlyMap[row.month_key] += parseFloat(row.amount);
      }
    });

    const yValues = pastMonths.map((m) => monthlyMap[m.key]);

    // Calculate prediction (clamped to 0)
    let predictedAmount = calculateLinearRegression(yValues);
    predictedAmount = Math.max(0, Math.round(predictedAmount * 100) / 100);

    const confidenceScore = calculateConfidence(yValues);

    // Calculate growth percentage compared to the current month (the last element of yValues)
    const currentMonthVal = yValues[yValues.length - 1] || 0;
    const growthPercentage = currentMonthVal > 0 
      ? Math.round(((predictedAmount - currentMonthVal) / currentMonthVal) * 10000) / 100 
      : 0;

    // Save prediction in DB
    await upsertPrediction(userId, "revenue", predictedAmount, confidenceScore, predictedMonth.month, predictedMonth.year);

    // Generate AI recommendations
    const recommendations = [];
    let summary = `Based on your inflows over the past 6 months, revenue is projected to change by ${growthPercentage}% to ₹${predictedAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} next month (${predictedMonth.label}).`;

    if (growthPercentage >= 0) {
      summary += " The business is experiencing a positive growth trajectory. Capitalize on this expansion.";
      
      const recMessage = `Revenue is predicted to increase by ${growthPercentage}%. We suggest allocating up to 15% of this surplus (₹${(predictedAmount * 0.15).toFixed(0)}) into expansion marketing to sustain this growth momentum.`;
      await saveRecommendation(userId, "investment_tip", recMessage, "medium");
      recommendations.push({ recommendation_type: "investment_tip", message: recMessage, priority: "medium" });
    } else {
      summary += " A downward trend in revenue is predicted. Immediate customer acquisition strategies are needed.";
      
      const recMessage = `Inflows are projected to drop by ${Math.abs(growthPercentage)}%. Engage key accounts, run re-engagement campaigns, or offer seasonal discount codes to offset the predicted dip.`;
      await saveRecommendation(userId, "risk_alert", recMessage, "high");
      recommendations.push({ recommendation_type: "risk_alert", message: recMessage, priority: "high" });

      const recMessage2 = `To cushion the projected lower revenue, suspend all non-essential hiring or capital expenditure until market conditions stabilize.`;
      await saveRecommendation(userId, "saving_suggestion", recMessage2, "medium");
      recommendations.push({ recommendation_type: "saving_suggestion", message: recMessage2, priority: "medium" });
    }

    // Prepare chart data (past 6 actuals + predicted month)
    const chartData = pastMonths.map((m, idx) => ({
      month: m.label,
      amount: yValues[idx],
      type: "actual",
    }));
    chartData.push({
      month: predictedMonth.label,
      amount: predictedAmount,
      type: "predicted",
    });

    res.status(200).json({
      success: true,
      data: {
        predictedAmount,
        growthPercentage,
        confidenceScore,
        predictedMonth: predictedMonth.label,
        chartData,
        summary,
        recommendations,
      },
    });
  } catch (error) {
    console.error("GET REVENUE PREDICTION ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 3. Cash Flow Prediction Endpoint
// ==========================================
const getCashFlowPrediction = async (req, res) => {
  try {
    const userId = req.user.id;
    const pastMonths = getPastMonths(6);
    const predictedMonth = getPredictedMonth();

    // Query historical revenues
    const revQuery = `
      SELECT amount, TO_CHAR(revenue_date, 'YYYY-MM') as month_key
      FROM revenue
      WHERE user_id = $1
    `;
    const revResult = await pool.query(revQuery, [userId]);

    // Query historical expenses
    const expQuery = `
      SELECT amount, TO_CHAR(expense_date, 'YYYY-MM') as month_key
      FROM expenses
      WHERE user_id = $1
    `;
    const expResult = await pool.query(expQuery, [userId]);

    // Map amounts to past 6 months
    const monthlyRev = {};
    const monthlyExp = {};
    pastMonths.forEach((m) => {
      monthlyRev[m.key] = 0;
      monthlyExp[m.key] = 0;
    });

    revResult.rows.forEach((row) => {
      if (monthlyRev[row.month_key] !== undefined) {
        monthlyRev[row.month_key] += parseFloat(row.amount);
      }
    });

    expResult.rows.forEach((row) => {
      if (monthlyExp[row.month_key] !== undefined) {
        monthlyExp[row.month_key] += parseFloat(row.amount);
      }
    });

    // Calculate Cash Flow (Revenue - Expense) for past months
    const yValues = pastMonths.map((m) => monthlyRev[m.key] - monthlyExp[m.key]);

    // Calculate prediction (NOT clamped to 0, since cash flow can be negative)
    let predictedAmount = calculateLinearRegression(yValues);
    predictedAmount = Math.round(predictedAmount * 100) / 100;

    const confidenceScore = calculateConfidence(yValues);

    // Calculate growth percentage compared to the current month (the last element of yValues)
    const currentMonthVal = yValues[yValues.length - 1] || 0;
    let growthPercentage = 0;
    if (currentMonthVal !== 0) {
      growthPercentage = Math.round(((predictedAmount - currentMonthVal) / Math.abs(currentMonthVal)) * 10000) / 100;
    }

    // Save prediction in DB
    await upsertPrediction(userId, "cashflow", predictedAmount, confidenceScore, predictedMonth.month, predictedMonth.year);

    // Generate AI recommendations
    const recommendations = [];
    let summary = `Based on your cash flow trends over the last 6 months, net cash flow is projected to change by ${growthPercentage}% to ₹${predictedAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} next month (${predictedMonth.label}).`;

    if (predictedAmount < 0) {
      summary += " Warning: Negative cash flow predicted. Your outflows are projected to exceed inflows, which could strain working capital.";
      
      const recMessage = `Your projected cash flow for next month is negative (₹${predictedAmount.toLocaleString("en-IN")}). We highly recommend deferring non-essential equipment maintenance, renegotiating payment cycles with suppliers, or drawing from emergency credit lines to support operational costs.`;
      await saveRecommendation(userId, "risk_alert", recMessage, "high");
      recommendations.push({ recommendation_type: "risk_alert", message: recMessage, priority: "high" });

      const recMessage2 = `Execute strict cost control measures immediately. Pause discretionary vendor renewals and audit the top 3 high-expense categories to identify quick saving opportunities.`;
      await saveRecommendation(userId, "expense_reduction", recMessage2, "high");
      recommendations.push({ recommendation_type: "expense_reduction", message: recMessage2, priority: "high" });
    } else {
      summary += " Positive cash flow predicted. The business is in a healthy liquidity position.";
      
      const recMessage = `Your net cash flow is projected to be positive at ₹${predictedAmount.toLocaleString("en-IN")}. Consider using this excess capital to settle outstanding short-term debts to reduce finance charges, or invest in highly-liquid cash funds.`;
      await saveRecommendation(userId, "investment_tip", recMessage, "medium");
      recommendations.push({ recommendation_type: "investment_tip", message: recMessage, priority: "medium" });

      if (growthPercentage < 0) {
        const recMessage2 = `Although positive, your cash flow growth is slowing down by ${Math.abs(growthPercentage)}%. Establish a cash reserve goal of ₹${(predictedAmount * 0.3).toFixed(0)} to maintain liquidity against future volatility.`;
        await saveRecommendation(userId, "saving_suggestion", recMessage2, "medium");
        recommendations.push({ recommendation_type: "saving_suggestion", message: recMessage2, priority: "medium" });
      }
    }

    // Prepare chart data (past 6 actuals + predicted month)
    const chartData = pastMonths.map((m, idx) => ({
      month: m.label,
      amount: yValues[idx],
      type: "actual",
    }));
    chartData.push({
      month: predictedMonth.label,
      amount: predictedAmount,
      type: "predicted",
    });

    res.status(200).json({
      success: true,
      data: {
        predictedAmount,
        growthPercentage,
        confidenceScore,
        predictedMonth: predictedMonth.label,
        chartData,
        summary,
        recommendations,
      },
    });
  } catch (error) {
    console.error("GET CASH FLOW PREDICTION ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getExpensePrediction,
  getRevenuePrediction,
  getCashFlowPrediction,
};
