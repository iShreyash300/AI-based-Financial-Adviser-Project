const express = require("express");
const router = express.Router();

const { signup, login } = require("../controllers/authController");
const { pool } = require("../config/db");

const verifyToken = require("../middleware/authMiddleware");

// Public Routes
router.post("/signup", signup);
router.post("/login", login);

// Protected Route
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const { pool } = require("../config/db");

    const result = await pool.query(
      'SELECT id, owner_name as name, business_name, email FROM "users" WHERE id = $1',
      [req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile Access Granted",
      user: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.put("/profile", verifyToken, async (req, res) => {
  try {
    const { name, business_name, email } = req.body;
    const userId = req.user.id;

    const existingUser = await pool.query(
      'SELECT owner_name, business_name, email FROM "users" WHERE id = $1',
      [userId],
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const currentEmail = existingUser.rows[0].email;
    const currentName = existingUser.rows[0].owner_name;
    const currentBusinessName = existingUser.rows[0].business_name;

    if (email && email !== currentEmail) {
      const emailTaken = await pool.query(
        'SELECT id FROM "users" WHERE email = $1 AND id != $2',
        [email, userId],
      );

      if (emailTaken.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }
    }

    const updatedResult = await pool.query(
      `UPDATE "users"
       SET owner_name = $1,
           business_name = $2,
           email = $3
       WHERE id = $4
       RETURNING id, owner_name AS name, business_name, email`,
      [
        name || currentName,
        business_name || currentBusinessName,
        email || currentEmail,
        userId,
      ],
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedResult.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
