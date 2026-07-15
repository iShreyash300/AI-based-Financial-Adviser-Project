const { pool } = require("../config/db");

// ─── Ensure goals table exists ────────────────────────────────────────────────
const ensureGoalsTable = async () => {
  // Create table if it doesn't exist (no CHECK constraint on status so we can use any value)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS goals (
      id             SERIAL PRIMARY KEY,
      user_id        INTEGER NOT NULL,
      goal_title     VARCHAR(255) NOT NULL,
      description    TEXT,
      target_amount  NUMERIC(15,2) NOT NULL,
      current_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
      start_date     DATE NOT NULL,
      target_date    DATE NOT NULL,
      category       VARCHAR(100) DEFAULT 'General',
      status         VARCHAR(50) DEFAULT 'active',
      created_at     TIMESTAMP DEFAULT NOW(),
      updated_at     TIMESTAMP DEFAULT NOW()
    )
  `);

  // Add missing columns if they don't exist (safe for existing tables)
  await pool.query(`ALTER TABLE goals ADD COLUMN IF NOT EXISTS goal_title VARCHAR(255)`);
  await pool.query(`ALTER TABLE goals ADD COLUMN IF NOT EXISTS description TEXT`);
  await pool.query(`ALTER TABLE goals ADD COLUMN IF NOT EXISTS target_amount NUMERIC(15,2)`);
  await pool.query(`ALTER TABLE goals ADD COLUMN IF NOT EXISTS current_amount NUMERIC(15,2) DEFAULT 0`);
  await pool.query(`ALTER TABLE goals ADD COLUMN IF NOT EXISTS start_date DATE`);
  await pool.query(`ALTER TABLE goals ADD COLUMN IF NOT EXISTS target_date DATE`);
  await pool.query(`ALTER TABLE goals ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'General'`);
  await pool.query(`ALTER TABLE goals ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active'`);

  // Drop the old restrictive CHECK constraint on status if it exists
  // (old schema only allowed 'active','completed','failed' — but we need free-form values)
  await pool.query(`
    DO $$
    DECLARE
      con_name TEXT;
    BEGIN
      SELECT conname INTO con_name
      FROM pg_constraint
      WHERE conrelid = 'goals'::regclass
        AND contype = 'c'
        AND pg_get_constraintdef(oid) LIKE '%status%';
      IF con_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE goals DROP CONSTRAINT ' || quote_ident(con_name);
      END IF;
    END;
    $$;
  `);

  // Drop old 'message' column if it exists (leftover from a previous schema version)
  await pool.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'goals' AND column_name = 'message'
      ) THEN
        ALTER TABLE goals DROP COLUMN message;
      END IF;
    END;
    $$;
  `);

  // Migrate old 'title' column data into 'goal_title' if 'title' column still exists
  const titleColumn = await pool.query(`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'goals' AND column_name = 'title'
    ) AS has_title_col
  `);

  if (titleColumn.rows[0].has_title_col) {
    await pool.query(`
      UPDATE goals
      SET goal_title = COALESCE(NULLIF(goal_title, ''), title)
      WHERE goal_title IS NULL OR goal_title = ''
    `);
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Compute progress % and status from current vs target amount.
 * Status logic:
 *   >= 90%  → Completed
 *   50-89%  → On Track
 *   < 50%   → At Risk
 */
const computeStatus = (current, target) => {
  if (target <= 0) return { progress: 0, status: "At Risk" };
  const pct = Math.min(
    100,
    Math.round((Number(current) / Number(target)) * 100),
  );
  let status = "At Risk";
  if (pct >= 90) status = "Completed";
  else if (pct >= 50) status = "On Track";
  return { progress: pct, status };
};

/**
 * Compute how much net revenue a user has accumulated since a goal's start_date.
 * Net amount = total revenues - total expenses since start_date.
 * This is used as the real-time "current_amount" basis for goals.
 */
const computeNetSinceStart = async (userId, startDate) => {
  const revQ = await pool.query(
    `SELECT COALESCE(SUM(amount), 0) AS total
     FROM revenue
     WHERE user_id = $1 AND revenue_date >= $2`,
    [userId, startDate],
  );
  const expQ = await pool.query(
    `SELECT COALESCE(SUM(amount), 0) AS total
     FROM expenses
     WHERE user_id = $1 AND expense_date >= $2`,
    [userId, startDate],
  );
  const net = Number(revQ.rows[0].total) - Number(expQ.rows[0].total);
  return Math.max(0, net);
};

const buildGoalResponse = async (row, userId) => {
  // Use the stored current_amount OR recompute from live DB data
  const liveNet = await computeNetSinceStart(userId, row.start_date);
  // current_amount = max of stored value vs live net (stored can be manually updated)
  const effectiveCurrent = Math.max(Number(row.current_amount), liveNet);
  const { progress, status } = computeStatus(
    effectiveCurrent,
    row.target_amount,
  );

  const goalTitle = row.goal_title || row.title || "Untitled Goal";

  return {
    id: row.id,
    title: goalTitle,
    goal_title: goalTitle,
    description: row.description,
    target_amount: Number(row.target_amount),
    current_amount: Number(effectiveCurrent.toFixed(2)),
    start_date: row.start_date,
    target_date: row.target_date,
    category: row.category || "General",
    progress,
    status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
};

// ─── Controllers ──────────────────────────────────────────────────────────────

const getGoals = async (req, res) => {
  try {
    await ensureGoalsTable();
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT * FROM goals WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId],
    );

    const goals = await Promise.all(
      result.rows.map((row) => buildGoalResponse(row, userId)),
    );

    res.status(200).json({ success: true, data: goals });
  } catch (error) {
    console.error("GET GOALS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const createGoal = async (req, res) => {
  try {
    await ensureGoalsTable();
    const userId = req.user.id;
    const title = req.body.title ?? req.body.goal_title ?? "";
    const description = req.body.description;
    const target_amount = req.body.target_amount;
    const current_amount = req.body.current_amount;
    const start_date = req.body.start_date;
    const target_date = req.body.target_date;
    const category = req.body.category;

    if (!title || !target_amount || !start_date || !target_date) {
      return res.status(400).json({
        success: false,
        message:
          "title, target_amount, start_date, and target_date are required.",
      });
    }

    const targetVal = Number(target_amount);
    const currentVal =
      current_amount !== undefined ? Number(current_amount) : 0;

    if (isNaN(targetVal) || targetVal <= 0) {
      return res.status(400).json({
        success: false,
        message: "target_amount must be a positive number.",
      });
    }

    const result = await pool.query(
      `INSERT INTO goals (user_id, goal_title, description, target_amount, current_amount, start_date, target_date, category, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        userId,
        title.trim(),
        description?.trim() || null,
        targetVal,
        currentVal,
        start_date,
        target_date,
        category?.trim() || "General",
        "active", // Always store 'active' in DB; display status is computed dynamically
      ],
    );

    const goal = await buildGoalResponse(result.rows[0], userId);

    res.status(201).json({
      success: true,
      message: "Goal created successfully",
      data: goal,
    });
  } catch (error) {
    console.error("CREATE GOAL ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateGoal = async (req, res) => {
  try {
    await ensureGoalsTable();
    const userId = req.user.id;
    const { id } = req.params;
    const title = req.body.title ?? req.body.goal_title;
    const description = req.body.description;
    const target_amount = req.body.target_amount;
    const current_amount = req.body.current_amount;
    const start_date = req.body.start_date;
    const target_date = req.body.target_date;
    const category = req.body.category;

    // Fetch existing
    const existing = await pool.query(
      `SELECT * FROM goals WHERE id = $1 AND user_id = $2`,
      [id, userId],
    );
    if (existing.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Goal not found or unauthorized." });
    }
    const cur = existing.rows[0];

    const newTitle =
      title !== undefined ? title.trim() : cur.goal_title || cur.title;
    const newDescription =
      description !== undefined ? description.trim() : cur.description;
    const newTarget =
      target_amount !== undefined
        ? Number(target_amount)
        : Number(cur.target_amount);
    const newCurrent =
      current_amount !== undefined
        ? Number(current_amount)
        : Number(cur.current_amount);
    const newStartDate = start_date !== undefined ? start_date : cur.start_date;
    const newTargetDate =
      target_date !== undefined ? target_date : cur.target_date;
    const newCategory = category !== undefined ? category.trim() : cur.category;

    const result = await pool.query(
      `UPDATE goals
       SET goal_title = $1, description = $2, target_amount = $3, current_amount = $4,
           start_date = $5, target_date = $6, category = $7, updated_at = NOW()
       WHERE id = $8 AND user_id = $9
       RETURNING *`,
      [
        newTitle,
        newDescription,
        newTarget,
        newCurrent,
        newStartDate,
        newTargetDate,
        newCategory,
        id,
        userId,
      ],
    );

    const goal = await buildGoalResponse(result.rows[0], userId);

    res.status(200).json({
      success: true,
      message: "Goal updated successfully",
      data: goal,
    });
  } catch (error) {
    console.error("UPDATE GOAL ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteGoal = async (req, res) => {
  try {
    await ensureGoalsTable();
    const userId = req.user.id;
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM goals WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Goal not found or unauthorized." });
    }

    res
      .status(200)
      .json({ success: true, message: "Goal deleted successfully" });
  } catch (error) {
    console.error("DELETE GOAL ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getGoals, createGoal, updateGoal, deleteGoal };
