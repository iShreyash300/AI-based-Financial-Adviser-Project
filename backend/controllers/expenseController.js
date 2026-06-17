const { pool } = require("../config/db");

// Get all expenses for logged-in user
const getExpenses = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT 
        e.id,
        e.title,
        e.description,
        e.amount,
        e.payment_method,
        TO_CHAR(e.expense_date, 'YYYY-MM-DD') as date,
        e.recurring_frequency,
        c.category_name as category,
        d.department_name as department
      FROM expenses e
      LEFT JOIN expense_categories c ON e.category_id = c.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE e.user_id = $1
      ORDER BY e.expense_date DESC, e.created_at DESC
    `;

    const result = await pool.query(query, [userId]);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("GET EXPENSES ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create a new expense
const createExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      title,
      description,
      amount,
      category,      // category name (string)
      department,    // department name (string)
      payment_method,
      recurring_frequency,
      date,          // date (YYYY-MM-DD string)
    } = req.body;

    if (!title || !amount || !category || !department || !payment_method || !recurring_frequency || !date) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields.",
      });
    }

    // 1. Resolve Category ID (case-insensitive lookup)
    let categoryId;
    const catQuery = 'SELECT id FROM expense_categories WHERE LOWER(category_name) = LOWER($1)';
    const catResult = await pool.query(catQuery, [category.trim()]);

    if (catResult.rows.length > 0) {
      categoryId = catResult.rows[0].id;
    } else {
      // Determine a safe category type matching DB constraint
      let categoryType = "operational";
      const lowerCat = category.toLowerCase();
      if (lowerCat.includes("salary") || lowerCat.includes("payroll") || lowerCat.includes("wages")) {
        categoryType = "salary";
      } else if (lowerCat.includes("rent") || lowerCat.includes("lease")) {
        categoryType = "fixed";
      } else if (lowerCat.includes("emergency") || lowerCat.includes("urgent")) {
        categoryType = "emergency";
      } else if (lowerCat.includes("ads") || lowerCat.includes("food") || lowerCat.includes("supply") || lowerCat.includes("inventory")) {
        categoryType = "variable";
      }

      // Insert new category
      const insertCat = `
        INSERT INTO expense_categories (category_name, category_type)
        VALUES ($1, $2)
        RETURNING id
      `;
      const newCatResult = await pool.query(insertCat, [category.trim(), categoryType]);
      categoryId = newCatResult.rows[0].id;
    }

    // 2. Resolve Department ID (case-insensitive lookup per user)
    let departmentId;
    const deptQuery = 'SELECT id FROM departments WHERE user_id = $1 AND LOWER(department_name) = LOWER($2)';
    const deptResult = await pool.query(deptQuery, [userId, department.trim()]);

    if (deptResult.rows.length > 0) {
      departmentId = deptResult.rows[0].id;
    } else {
      // Insert new department
      const insertDept = `
        INSERT INTO departments (user_id, department_name)
        VALUES ($1, $2)
        RETURNING id
      `;
      const newDeptResult = await pool.query(insertDept, [userId, department.trim()]);
      departmentId = newDeptResult.rows[0].id;
    }

    // 3. Insert Expense
    const insertExpense = `
      INSERT INTO expenses (
        user_id,
        department_id,
        category_id,
        title,
        description,
        amount,
        payment_method,
        expense_date,
        recurring_frequency
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `;

    const expenseResult = await pool.query(insertExpense, [
      userId,
      departmentId,
      categoryId,
      title.trim(),
      description ? description.trim() : null,
      amount,
      payment_method,
      date,
      recurring_frequency,
    ]);

    const newExpenseId = expenseResult.rows[0].id;

    // 4. Fetch the fully joined inserted expense
    const fetchQuery = `
      SELECT 
        e.id,
        e.title,
        e.description,
        e.amount,
        e.payment_method,
        TO_CHAR(e.expense_date, 'YYYY-MM-DD') as date,
        e.recurring_frequency,
        c.category_name as category,
        d.department_name as department
      FROM expenses e
      LEFT JOIN expense_categories c ON e.category_id = c.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE e.id = $1
    `;
    const finalResult = await pool.query(fetchQuery, [newExpenseId]);

    res.status(201).json({
      success: true,
      message: "Expense added successfully",
      data: finalResult.rows[0],
    });
  } catch (error) {
    console.error("CREATE EXPENSE ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete an expense
const deleteExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const query = "DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING id";
    const result = await pool.query(query, [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Expense not found or unauthorized.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    console.error("DELETE EXPENSE ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getExpenses,
  createExpense,
  deleteExpense,
};
