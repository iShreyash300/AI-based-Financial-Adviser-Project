const PDFDocument = require("pdfkit");
const { pool } = require("../config/db");

const parseDateRange = (query) => {
  const now = new Date();
  const { filter, fromDate, toDate } = query;
  const clampToMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

  let startDate;
  let endDate = clampToMonth(now);
  let label = "This Month";

  const createRange = (monthsBack) => {
    const start = new Date(
      now.getFullYear(),
      now.getMonth() - monthsBack + 1,
      1,
    );
    return start;
  };

  if (filter === "last_3_months") {
    startDate = createRange(3);
    label = "Last 3 Months";
  } else if (filter === "last_6_months") {
    startDate = createRange(6);
    label = "Last 6 Months";
  } else if (filter === "last_12_months") {
    startDate = createRange(12);
    label = "Last 12 Months";
  } else if (filter === "custom" && fromDate && toDate) {
    startDate = new Date(fromDate);
    endDate = new Date(toDate);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = clampToMonth(now);
      label = "This Month";
    } else {
      if (startDate > endDate) {
        const temp = startDate;
        startDate = endDate;
        endDate = temp;
      }
      label = `${startDate.toISOString().slice(0, 10)} to ${endDate.toISOString().slice(0, 10)}`;
    }
  } else {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    label = "This Month";
  }

  const startDateIso = startDate.toISOString().slice(0, 10);
  const endDateIso = endDate.toISOString().slice(0, 10);
  const startYearMonth =
    startDate.getFullYear() * 100 + (startDate.getMonth() + 1);
  const endYearMonth = endDate.getFullYear() * 100 + (endDate.getMonth() + 1);

  return {
    startDateIso,
    endDateIso,
    startYearMonth,
    endYearMonth,
    label,
  };
};

const normalizeTrendRow = (row) => ({
  month: row.month ? row.month.toISOString().slice(0, 7) : null,
  total: Number(row.total || 0),
});

const buildInsights = ({ summary, health, predictions }) => {
  const insights = [];
  const revenue = summary.totalRevenue;
  const expenses = summary.totalExpenses;
  const profit = summary.netProfitLoss;
  const profitMargin = summary.profitMargin;
  const budgetUtil = summary.budgetUtilization;
  const healthScore = health?.score ?? null;

  insights.push({
    title: "Revenue & Expense Analysis",
    message:
      revenue === 0 && expenses === 0
        ? "No revenue or expense activity was recorded in this period. Connect your financial entries to start generating insights."
        : `Revenue was ${revenue.toLocaleString(undefined, { style: "currency", currency: "USD" })} and expenses were ${expenses.toLocaleString(undefined, { style: "currency", currency: "USD" })}. Your net ${profit >= 0 ? "profit" : "loss"} is ${profit.toLocaleString(undefined, { style: "currency", currency: "USD" })}, resulting in a profit margin of ${profitMargin.toFixed(1)}%.`,
  });

  insights.push({
    title: "Budget Analysis",
    message:
      budgetUtil === null
        ? "No budget has been defined for this period. Add budget allocations to compare planned spending against actual expenses."
        : budgetUtil < 70
          ? `Spending is well within budget, at ${budgetUtil.toFixed(1)}% utilization. You have room to reallocate funds toward growth or savings.`
          : budgetUtil <= 90
            ? `Budget utilization is ${budgetUtil.toFixed(1)}%, which is healthy. Maintain focus on controlling discretionary costs.`
            : `Budget utilization is high at ${budgetUtil.toFixed(1)}%. Review the largest expense categories and identify opportunities to reduce non-essential spend.`,
  });

  insights.push({
    title: "Profit & Loss Summary",
    message:
      profit >= 0
        ? `Your business generated a positive profit of ${profit.toLocaleString(undefined, { style: "currency", currency: "USD" })}. Keep monitoring expense growth to protect margins.`
        : `The period ended with a loss of ${Math.abs(profit).toLocaleString(undefined, { style: "currency", currency: "USD" })}. Investigate the largest expense drivers and find ways to support revenue growth.`,
  });

  insights.push({
    title: "Financial Health",
    message:
      healthScore === null
        ? "Financial health data is not available. Run the health engine or create financial score records to get a health-grade overview."
        : `Your current financial health score is ${healthScore}. ${"Review the recommendations to improve stability and growth."}`,
  });

  if (predictions.length > 0) {
    const latestPrediction = predictions[0];
    insights.push({
      title: "Growth Opportunities",
      message: `The latest forecast for ${latestPrediction.prediction_type} is ${latestPrediction.predicted_value.toLocaleString(undefined, { style: "currency", currency: "USD" })} for ${latestPrediction.prediction_month}/${latestPrediction.prediction_year} with ${latestPrediction.confidence_score}% confidence. Use this projection to align your spending plan and revenue targets.`,
    });
  } else {
    insights.push({
      title: "Growth Opportunities",
      message:
        "No prediction data is available yet. Add forecasts or run prediction routines to identify growth windows and market opportunities.",
    });
  }

  const riskMessages = [];
  if (profitMargin < 10) {
    riskMessages.push(
      "Low profit margins mean your business is vulnerable to cost increases.",
    );
  }
  if (budgetUtil !== null && budgetUtil > 90) {
    riskMessages.push(
      "Budget utilization is very high, increasing the risk of overspending.",
    );
  }
  if (healthScore !== null && healthScore < 60) {
    riskMessages.push(
      "Financial health is below the recommended threshold. Prioritize liquidity and expense discipline.",
    );
  }

  insights.push({
    title: "Risk Alerts",
    message:
      riskMessages.length > 0
        ? riskMessages.join(" ")
        : "No urgent risks detected. Continue monitoring expenses and cash flow to preserve momentum.",
  });

  insights.push({
    title: "Business Recommendations",
    message:
      profit >= 0
        ? "Focus on scaling revenue-generating activities while keeping budget utilization under control. Consider investing in the highest ROI categories."
        : "Reduce discretionary spending and strengthen revenue drivers. Prioritize high-margin services or products and improve billing efficiency.",
  });

  return insights;
};

const getReportData = async (userId, query) => {
  const { startDateIso, endDateIso, startYearMonth, endYearMonth, label } =
    parseDateRange(query);

  const [
    revenueRes,
    expenseRes,
    budgetRes,
    healthRes,
    trendRevenueRes,
    trendExpenseRes,
    categoryRes,
    predictionRes,
  ] = await Promise.all([
    pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total
       FROM revenue
       WHERE user_id = $1
         AND revenue_date BETWEEN $2 AND $3`,
      [userId, startDateIso, endDateIso],
    ),
    pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total
       FROM expenses
       WHERE user_id = $1
         AND expense_date BETWEEN $2 AND $3`,
      [userId, startDateIso, endDateIso],
    ),
    pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total
       FROM budgets
       WHERE user_id = $1
         AND (budget_year * 100 + budget_month) BETWEEN $2 AND $3`,
      [userId, startYearMonth, endYearMonth],
    ),
    pool.query(
      `SELECT score, profitability_score, expense_ratio_score, revenue_growth_score, budget_efficiency_score, generated_at
       FROM financial_health_scores
       WHERE user_id = $1
       ORDER BY generated_at DESC
       LIMIT 1`,
      [userId],
    ),
    pool.query(
      `SELECT date_trunc('month', revenue_date) AS month, COALESCE(SUM(amount), 0) AS total
       FROM revenue
       WHERE user_id = $1 AND revenue_date BETWEEN $2 AND $3
       GROUP BY month
       ORDER BY month ASC`,
      [userId, startDateIso, endDateIso],
    ),
    pool.query(
      `SELECT date_trunc('month', expense_date) AS month, COALESCE(SUM(amount), 0) AS total
       FROM expenses
       WHERE user_id = $1 AND expense_date BETWEEN $2 AND $3
       GROUP BY month
       ORDER BY month ASC`,
      [userId, startDateIso, endDateIso],
    ),
    pool.query(
      `SELECT COALESCE(c.category_name, 'Uncategorized') AS category, COALESCE(SUM(e.amount), 0) AS total
       FROM expenses e
       LEFT JOIN expense_categories c ON e.category_id = c.id
       WHERE e.user_id = $1
         AND e.expense_date BETWEEN $2 AND $3
       GROUP BY category
       ORDER BY total DESC
       LIMIT 10`,
      [userId, startDateIso, endDateIso],
    ),
    pool.query(
      `SELECT prediction_type, predicted_value, confidence_score, prediction_month, prediction_year
       FROM predictions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 5`,
      [userId],
    ),
  ]);

  const totalRevenue = Number(revenueRes.rows[0].total || 0);
  const totalExpenses = Number(expenseRes.rows[0].total || 0);
  const totalBudget = Number(budgetRes.rows[0].total || 0);
  const netProfitLoss = totalRevenue - totalExpenses;
  const profitMargin =
    totalRevenue > 0 ? (netProfitLoss / totalRevenue) * 100 : 0;
  const budgetUtilization =
    totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : null;
  const health = healthRes.rows[0] || null;

  const revenueTrend = trendRevenueRes.rows.map(normalizeTrendRow);
  const expenseTrend = trendExpenseRes.rows.map(normalizeTrendRow);
  const categoryBreakdown = categoryRes.rows.map((row) => ({
    category: row.category,
    total: Number(row.total || 0),
  }));
  const predictions = predictionRes.rows.map((row) => ({
    prediction_type: row.prediction_type,
    predicted_value: Number(row.predicted_value || 0),
    confidence_score: Number(row.confidence_score || 0),
    prediction_month: row.prediction_month,
    prediction_year: row.prediction_year,
  }));

  return {
    periodLabel: label,
    summary: {
      totalRevenue,
      totalExpenses,
      netProfitLoss,
      profitMargin,
      budgetUtilization,
      financialHealthScore: health ? Number(health.score || 0) : null,
      currentBudget: totalBudget,
      currentFinancialHealth: health,
    },
    charts: {
      revenueTrend,
      expenseTrend,
      revenueVsExpense: revenueTrend.map((item, index) => ({
        month: item.month,
        revenue: item.total,
        expense: expenseTrend[index] ? expenseTrend[index].total : 0,
      })),
      expenseCategoryBreakdown: categoryBreakdown,
    },
    insights: buildInsights({
      summary: {
        totalRevenue,
        totalExpenses,
        netProfitLoss,
        profitMargin,
        budgetUtilization,
      },
      health,
      predictions,
    }),
    predictions,
    health,
  };
};

const getSummary = async (req, res) => {
  try {
    const report = await getReportData(req.user.id, req.query);
    res
      .status(200)
      .json({
        success: true,
        data: { period: report.periodLabel, ...report.summary },
      });
  } catch (error) {
    console.error("REPORT SUMMARY ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCharts = async (req, res) => {
  try {
    const report = await getReportData(req.user.id, req.query);
    res
      .status(200)
      .json({
        success: true,
        data: { period: report.periodLabel, ...report.charts },
      });
  } catch (error) {
    console.error("REPORT CHARTS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getInsights = async (req, res) => {
  try {
    const report = await getReportData(req.user.id, req.query);
    res
      .status(200)
      .json({
        success: true,
        data: {
          period: report.periodLabel,
          insights: report.insights,
          predictions: report.predictions,
          financialHealth: report.health,
        },
      });
  } catch (error) {
    console.error("REPORT INSIGHTS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const renderLineChart = (doc, x, y, width, height, labels, data, color) => {
  const max = Math.max(...data, 10);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const padding = 8;
  const plotWidth = width - padding * 2;
  const plotHeight = height - padding * 2;

  doc.rect(x, y, width, height).stroke("#dfe2e8");
  const baseY = y + height - padding;
  const stepX = plotWidth / Math.max(labels.length - 1, 1);

  labels.forEach((label, idx) => {
    const px = x + padding + idx * stepX;
    doc
      .fontSize(7)
      .fillColor("#333")
      .text(label, px - 12, y + height - 12, { width: 24, align: "center" });
  });

  data.forEach((value, idx) => {
    const px = x + padding + idx * stepX;
    const py = baseY - ((value - min) / range) * plotHeight;
    if (idx === 0) {
      doc.moveTo(px, py);
    } else {
      doc.lineTo(px, py);
    }
  });

  doc.strokeColor(color).lineWidth(2).stroke();
};

const renderBarChart = (
  doc,
  x,
  y,
  width,
  height,
  labels,
  dataset1,
  dataset2,
) => {
  const max = Math.max(...dataset1, ...dataset2, 10);
  const range = max || 1;
  const padding = 8;
  const barGroupWidth = (width - padding * 2) / labels.length;
  const barWidth = Math.max(10, barGroupWidth * 0.35);

  doc.rect(x, y, width, height).stroke("#dfe2e8");

  labels.forEach((label, idx) => {
    const centerX = x + padding + idx * barGroupWidth + barGroupWidth / 2;
    const bar1Height = ((dataset1[idx] || 0) / range) * (height - padding * 2);
    const bar2Height = ((dataset2[idx] || 0) / range) * (height - padding * 2);

    doc
      .rect(
        centerX - barWidth - 4,
        y + height - padding - bar1Height,
        barWidth,
        bar1Height,
      )
      .fillOpacity(1)
      .fill("#5B5FEF");
    doc
      .rect(
        centerX + 4,
        y + height - padding - bar2Height,
        barWidth,
        bar2Height,
      )
      .fill("#ffb300");

    doc
      .fillColor("#333")
      .fontSize(7)
      .text(label, centerX - 15, y + height - padding + 2, {
        width: 30,
        align: "center",
      });
  });
};

const renderPieChart = (doc, x, y, radius, items) => {
  const total = items.reduce((sum, item) => sum + item.total, 0) || 1;
  let startAngle = 0;
  const colors = [
    "#5B5FEF",
    "#ffb300",
    "#4caf50",
    "#f44336",
    "#9c27b0",
    "#2196f3",
    "#ff9800",
    "#009688",
  ];

  items.forEach((item, idx) => {
    const slice = (item.total / total) * Math.PI * 2;
    const endAngle = startAngle + slice;
    doc.fillColor(colors[idx % colors.length]);
    doc.moveTo(x, y);
    doc.arc(x, y, radius, startAngle, endAngle).lineTo(x, y).fill();
    startAngle = endAngle;
  });

  let legendY = y - radius;
  items.forEach((item, idx) => {
    const color = colors[idx % colors.length];
    doc.circle(x + radius + 20, legendY + 6, 4).fill(color);
    const text = `${item.category}: ${((item.total / total) * 100).toFixed(1)}%`;
    doc
      .fillColor("#333")
      .fontSize(8)
      .text(text, x + radius + 30, legendY, { width: 120 });
    legendY += 14;
  });
};

const downloadReport = async (req, res) => {
  try {
    const report = await getReportData(req.user.id, req.query);
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=financial-report.pdf",
    );
    doc.pipe(res);

    doc
      .fontSize(20)
      .fillColor("#181818")
      .text("Financial Report", { align: "center" });
    doc.moveDown(0.5);
    doc
      .fontSize(10)
      .fillColor("#555")
      .text(`Reporting period: ${report.periodLabel}`, { align: "center" });
    doc.moveDown(1);

    doc
      .fontSize(14)
      .fillColor("#2f3b59")
      .text("Executive Summary", { underline: true });
    doc.moveDown(0.5);
    doc
      .fontSize(11)
      .fillColor("#222")
      .text(
        `Total Revenue: ${report.summary.totalRevenue.toLocaleString(undefined, { style: "currency", currency: "USD" })}`,
      );
    doc.text(
      `Total Expenses: ${report.summary.totalExpenses.toLocaleString(undefined, { style: "currency", currency: "USD" })}`,
    );
    doc.text(
      `Net ${report.summary.netProfitLoss >= 0 ? "Profit" : "Loss"}: ${report.summary.netProfitLoss.toLocaleString(undefined, { style: "currency", currency: "USD" })}`,
    );
    doc.text(`Profit Margin: ${report.summary.profitMargin.toFixed(1)}%`);
    doc.text(
      `Budget Utilization: ${report.summary.budgetUtilization === null ? "N/A" : `${report.summary.budgetUtilization.toFixed(1)}%`}`,
    );
    doc.text(
      `Financial Health Score: ${report.summary.financialHealthScore === null ? "Not available" : `${report.summary.financialHealthScore.toFixed(1)} / 100`}`,
    );
    doc.moveDown(1);

    doc
      .fontSize(14)
      .fillColor("#2f3b59")
      .text("Key Insights", { underline: true });
    doc.moveDown(0.5);
    report.insights.slice(0, 4).forEach((insight) => {
      doc
        .fontSize(11)
        .fillColor("#071d40")
        .text(insight.title, { continued: true })
        .fillColor("#444")
        .text(`: ${insight.message}`);
      doc.moveDown(0.5);
    });

    doc.addPage();
    doc
      .fontSize(14)
      .fillColor("#2f3b59")
      .text("Visual Trends", { underline: true });
    doc.moveDown(0.5);

    const chartWidth = 250;
    const chartHeight = 130;
    const leftX = doc.x;
    const topY = doc.y;

    doc
      .fontSize(11)
      .fillColor("#333")
      .text("Revenue Trend", leftX, topY - 6);
    renderLineChart(
      doc,
      leftX,
      topY + 10,
      chartWidth,
      chartHeight,
      report.charts.revenueTrend.map((item) => item.month),
      report.charts.revenueTrend.map((item) => item.total),
      "#5B5FEF",
    );

    const rightX = leftX + chartWidth + 30;
    doc
      .fontSize(11)
      .fillColor("#333")
      .text("Expense Trend", rightX, topY - 6);
    renderLineChart(
      doc,
      rightX,
      topY + 10,
      chartWidth,
      chartHeight,
      report.charts.expenseTrend.map((item) => item.month),
      report.charts.expenseTrend.map((item) => item.total),
      "#ff6b4c",
    );

    doc.moveDown(8);
    const nextPageY = doc.y;
    doc
      .fontSize(11)
      .fillColor("#333")
      .text("Revenue vs Expense", leftX, nextPageY - 6);
    renderBarChart(
      doc,
      leftX,
      nextPageY + 10,
      chartWidth,
      chartHeight,
      report.charts.revenueVsExpense.map((item) => item.month),
      report.charts.revenueVsExpense.map((item) => item.revenue),
      report.charts.revenueVsExpense.map((item) => item.expense),
    );

    doc
      .fontSize(11)
      .fillColor("#333")
      .text("Expense Breakdown", rightX, nextPageY - 6);
    renderPieChart(
      doc,
      rightX + 90,
      nextPageY + 75,
      55,
      report.charts.expenseCategoryBreakdown.slice(0, 6),
    );

    doc.addPage();
    doc
      .fontSize(14)
      .fillColor("#2f3b59")
      .text("Full AI-Powered Insights", { underline: true });
    doc.moveDown(0.5);
    report.insights.forEach((insight) => {
      doc.fontSize(12).fillColor("#071d40").text(insight.title);
      doc
        .fontSize(11)
        .fillColor("#444")
        .text(insight.message, { indent: 12, paragraphGap: 6 });
      doc.moveDown(0.5);
    });

    if (report.predictions.length > 0) {
      doc.moveDown(0.5);
      doc
        .fontSize(14)
        .fillColor("#2f3b59")
        .text("Recent Forecasts", { underline: true });
      doc.moveDown(0.5);
      report.predictions.forEach((prediction) => {
        doc
          .fontSize(11)
          .fillColor("#333")
          .text(
            `${prediction.prediction_type.charAt(0).toUpperCase() + prediction.prediction_type.slice(1)} forecast for ${prediction.prediction_month}/${prediction.prediction_year}: ${prediction.predicted_value.toLocaleString(undefined, { style: "currency", currency: "USD" })} (${prediction.confidence_score}% confidence)`,
          );
        doc.moveDown(0.3);
      });
    }

    doc.end();
  } catch (error) {
    console.error("REPORT DOWNLOAD ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSummary,
  getCharts,
  getInsights,
  downloadReport,
};
