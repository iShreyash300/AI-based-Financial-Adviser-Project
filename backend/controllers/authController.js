// const jwt = require("jsonwebtoken");

// const signup = (req, res) => {
//   console.log("BODY:", req.body);
//   if (!req.body) {
//     return res.status(400).json({
//       message: "Request body is missing",
//     });
//   }
//   const { name, email, password } = req.body;

//   res.status(201).json({
//     success: true,
//     message: "User registered successfully",
//     user: {
//       name,
//       email,
//     },
//   });
// };

// const login = (req, res) => {
//   const { email, password } = req.body;

//   if (email === "rishil@gmail.com" && password === "123456") {
//     const token = jwt.sign({ email: email }, process.env.JWT_SECRET, {
//       expiresIn: "1h",
//     });
//     return res.status(200).json({
//       success: true,
//       message: "Login Successful",
//       token,
//     });
//   }
//   res.status(401).json({
//     success: false,
//     message: "Invalid Credentials",
//   });
// };

// module.exports = {
//   signup,
//   login,
// };
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/Users");

// Signup
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
    });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  signup,
  login,
};
