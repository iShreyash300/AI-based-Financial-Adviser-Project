const { pool } = require("../config/db");

const resolveDepartmentId = async (userId, departmentName) => {
  const lookupQuery = `
    SELECT id
    FROM departments
    WHERE user_id = $1 AND LOWER(department_name) = LOWER($2)
  `;

  const lookupResult = await pool.query(lookupQuery, [
    userId,
    departmentName.trim(),
  ]);

  if (lookupResult.rows.length > 0) {
    return lookupResult.rows[0].id;
  }

  const insertQuery = `
    INSERT INTO departments (user_id, department_name)
    VALUES ($1, $2)
    RETURNING id
  `;

  const insertResult = await pool.query(insertQuery, [
    userId,
    departmentName.trim(),
  ]);
  return insertResult.rows[0].id;
};

const buildBudgetResponse = (row) => ({
  id: row.id,
  department_name: row.department_name,
  budget_month: row.budget_month,
  budget_year: row.budget_year,
  amount: Number(row.amount),
  created_at: row.created_at,
  updated_at: row.updated_at,
});

const getBudgets = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT
        b.id,
        d.department_name,
        b.budget_month,
        b.budget_year,
        b.amount,
        TO_CHAR(b.created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at,
        TO_CHAR(b.updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
      FROM budgets b
      LEFT JOIN departments d ON b.department_id = d.id
      WHERE b.user_id = $1
      ORDER BY b.budget_year DESC, b.budget_month DESC, b.created_at DESC
    `;

    const result = await pool.query(query, [userId]);

    res.status(200).json({
      success: true,
      data: result.rows.map(buildBudgetResponse),
    });
  } catch (error) {
    console.error("GET BUDGETS ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const { department_name, budget_month, budget_year, amount } = req.body;

    if (
      !department_name ||
      !budget_month ||
      !budget_year ||
      amount === undefined ||
      amount === null
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields.",
      });
    }

    const monthValue = Number(budget_month);
    const yearValue = Number(budget_year);
    const amountValue = Number(amount);

    if (!Number.isInteger(monthValue) || monthValue < 1 || monthValue > 12) {
      return res.status(400).json({
        success: false,
        message: "Budget month must be between 1 and 12.",
      });
    }

    if (!Number.isInteger(yearValue) || yearValue < 1) {
      return res.status(400).json({
        success: false,
        message: "Budget year must be a valid year.",
      });
    }

    if (Number.isNaN(amountValue) || amountValue < 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a non-negative number.",
      });
    }

    const departmentId = await resolveDepartmentId(userId, department_name);

    const insertQuery = `
      INSERT INTO budgets (
        user_id,
        department_id,
        budget_month,
        budget_year,
        amount
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;

    const insertResult = await pool.query(insertQuery, [
      userId,
      departmentId,
      monthValue,
      yearValue,
      amountValue,
    ]);

    const fetchQuery = `
      SELECT
        b.id,
        d.department_name,
        b.budget_month,
        b.budget_year,
        b.amount,
        TO_CHAR(b.created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at,
        TO_CHAR(b.updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
      FROM budgets b
      LEFT JOIN departments d ON b.department_id = d.id
      WHERE b.id = $1 AND b.user_id = $2
    `;

    const finalResult = await pool.query(fetchQuery, [
      insertResult.rows[0].id,
      userId,
    ]);

    res.status(201).json({
      success: true,
      message: "Budget created successfully",
      data: buildBudgetResponse(finalResult.rows[0]),
    });
  } catch (error) {
    console.error("CREATE BUDGET ERROR:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "A budget for this department and period already exists.",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { department_name, budget_month, budget_year, amount } = req.body;

    const existingQuery = `
      SELECT id, department_id, budget_month, budget_year, amount
      FROM budgets
      WHERE id = $1 AND user_id = $2
    `;

    const existingResult = await pool.query(existingQuery, [id, userId]);

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Budget not found or unauthorized.",
      });
    }

    const currentRow = existingResult.rows[0];
    let departmentId = currentRow.department_id;

    if (department_name && department_name.trim()) {
      departmentId = await resolveDepartmentId(userId, department_name);
    }

    const monthValue =
      budget_month !== undefined
        ? Number(budget_month)
        : currentRow.budget_month;
    const yearValue =
      budget_year !== undefined ? Number(budget_year) : currentRow.budget_year;
    const amountValue =
      amount !== undefined ? Number(amount) : currentRow.amount;

    if (!Number.isInteger(monthValue) || monthValue < 1 || monthValue > 12) {
      return res.status(400).json({
        success: false,
        message: "Budget month must be between 1 and 12.",
      });
    }

    if (!Number.isInteger(yearValue) || yearValue < 1) {
      return res.status(400).json({
        success: false,
        message: "Budget year must be a valid year.",
      });
    }

    if (Number.isNaN(amountValue) || amountValue < 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a non-negative number.",
      });
    }

    const updateQuery = `
      UPDATE budgets
      SET department_id = $1,
          budget_month = $2,
          budget_year = $3,
          amount = $4
      WHERE id = $5 AND user_id = $6
      RETURNING id
    `;

    await pool.query(updateQuery, [
      departmentId,
      monthValue,
      yearValue,
      amountValue,
      id,
      userId,
    ]);

    const fetchQuery = `
      SELECT
        b.id,
        d.department_name,
        b.budget_month,
        b.budget_year,
        b.amount,
        TO_CHAR(b.created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at,
        TO_CHAR(b.updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
      FROM budgets b
      LEFT JOIN departments d ON b.department_id = d.id
      WHERE b.id = $1 AND b.user_id = $2
    `;

    const finalResult = await pool.query(fetchQuery, [id, userId]);

    res.status(200).json({
      success: true,
      message: "Budget updated successfully",
      data: buildBudgetResponse(finalResult.rows[0]),
    });
  } catch (error) {
    console.error("UPDATE BUDGET ERROR:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "A budget for this department and period already exists.",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const query = `
      DELETE FROM budgets
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `;

    const result = await pool.query(query, [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Budget not found or unauthorized.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Budget deleted successfully",
    });
  } catch (error) {
    console.error("DELETE BUDGET ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
};
