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

const buildRevenueResponse = (row) => ({
  id: row.id,
  department_name: row.department_name,
  source: row.source,
  description: row.description,
  amount: Number(row.amount),
  revenue_date: row.revenue_date,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

const getRevenues = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT
        r.id,
        d.department_name,
        r.source,
        r.description,
        r.amount,
        TO_CHAR(r.revenue_date, 'YYYY-MM-DD') AS revenue_date,
        TO_CHAR(r.created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at,
        TO_CHAR(r.updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
      FROM revenue r
      LEFT JOIN departments d ON r.department_id = d.id
      WHERE r.user_id = $1
      ORDER BY r.revenue_date DESC, r.created_at DESC
    `;

    const result = await pool.query(query, [userId]);

    res.status(200).json({
      success: true,
      data: result.rows.map(buildRevenueResponse),
    });
  } catch (error) {
    console.error("GET REVENUE ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createRevenue = async (req, res) => {
  try {
    const userId = req.user.id;
    const { department_name, source, description, amount, revenue_date } =
      req.body;

    if (!source || amount === undefined || amount === null || !revenue_date) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields.",
      });
    }

    const amountValue = Number(amount);

    if (Number.isNaN(amountValue) || amountValue < 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a non-negative number.",
      });
    }

    const departmentId =
      department_name && department_name.trim()
        ? await resolveDepartmentId(userId, department_name)
        : null;

    const insertQuery = `
      INSERT INTO revenue (
        user_id,
        department_id,
        source,
        description,
        amount,
        revenue_date
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;

    const insertResult = await pool.query(insertQuery, [
      userId,
      departmentId,
      source.trim(),
      description ? description.trim() : null,
      amountValue,
      revenue_date,
    ]);

    const fetchQuery = `
      SELECT
        r.id,
        d.department_name,
        r.source,
        r.description,
        r.amount,
        TO_CHAR(r.revenue_date, 'YYYY-MM-DD') AS revenue_date,
        TO_CHAR(r.created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at,
        TO_CHAR(r.updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
      FROM revenue r
      LEFT JOIN departments d ON r.department_id = d.id
      WHERE r.id = $1 AND r.user_id = $2
    `;

    const finalResult = await pool.query(fetchQuery, [
      insertResult.rows[0].id,
      userId,
    ]);

    res.status(201).json({
      success: true,
      message: "Revenue created successfully",
      data: buildRevenueResponse(finalResult.rows[0]),
    });
  } catch (error) {
    console.error("CREATE REVENUE ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateRevenue = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { department_name, source, description, amount, revenue_date } =
      req.body;

    const existingQuery = `
      SELECT id, department_id, source, description, amount, revenue_date
      FROM revenue
      WHERE id = $1 AND user_id = $2
    `;

    const existingResult = await pool.query(existingQuery, [id, userId]);

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Revenue not found or unauthorized.",
      });
    }

    const currentRow = existingResult.rows[0];
    let departmentId = currentRow.department_id;

    if (department_name && department_name.trim()) {
      departmentId = await resolveDepartmentId(userId, department_name);
    }

    const sourceValue =
      source !== undefined ? source.trim() : currentRow.source;
    const descriptionValue =
      description !== undefined ? description.trim() : currentRow.description;
    const amountValue =
      amount !== undefined ? Number(amount) : currentRow.amount;
    const revenueDateValue =
      revenue_date !== undefined ? revenue_date : currentRow.revenue_date;

    if (Number.isNaN(Number(amountValue)) || Number(amountValue) < 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a non-negative number.",
      });
    }

    const updateQuery = `
      UPDATE revenue
      SET department_id = $1,
          source = $2,
          description = $3,
          amount = $4,
          revenue_date = $5
      WHERE id = $6 AND user_id = $7
      RETURNING id
    `;

    await pool.query(updateQuery, [
      departmentId,
      sourceValue,
      descriptionValue,
      amountValue,
      revenueDateValue,
      id,
      userId,
    ]);

    const fetchQuery = `
      SELECT
        r.id,
        d.department_name,
        r.source,
        r.description,
        r.amount,
        TO_CHAR(r.revenue_date, 'YYYY-MM-DD') AS revenue_date,
        TO_CHAR(r.created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at,
        TO_CHAR(r.updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
      FROM revenue r
      LEFT JOIN departments d ON r.department_id = d.id
      WHERE r.id = $1 AND r.user_id = $2
    `;

    const finalResult = await pool.query(fetchQuery, [id, userId]);

    res.status(200).json({
      success: true,
      message: "Revenue updated successfully",
      data: buildRevenueResponse(finalResult.rows[0]),
    });
  } catch (error) {
    console.error("UPDATE REVENUE ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteRevenue = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const query = `
      DELETE FROM revenue
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `;

    const result = await pool.query(query, [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Revenue not found or unauthorized.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Revenue deleted successfully",
    });
  } catch (error) {
    console.error("DELETE REVENUE ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getRevenues,
  createRevenue,
  updateRevenue,
  deleteRevenue,
};
