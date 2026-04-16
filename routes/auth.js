const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const auth = require("../middleware/authMiddleware");

// ✅ Validate email format
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ✅ Register - POST /auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    
    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ 
      email, 
      password: hashedPassword 
    });
    await user.save();

    return res.status(201).json({ 
      message: "User registered successfully",
      user: { _id: user._id, email: user.email }
    });
  } catch (err) {
    console.log("Register Error:", err);
    return res.status(500).json({ message: err.message });
  }
});

// ✅ Login - POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    console.log("Login Attempt:", user);

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "dfbvsjdfbigberbguoerhuo",
      { expiresIn: "24h" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: { _id: user._id, email: user.email }
    });
  } catch (err) {
    console.log("Login Error:", err);
    return res.status(500).json({ message: err.message });
  }
});

// ✅ Get Current User - GET /auth/me
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    return res.json({ user });
  } catch (err) {
    console.log("Get User Error:", err);
    return res.status(500).json({ message: err.message });
  }
});

// ✅ Logout - POST /auth/logout (client-side token removal)
router.post("/logout", auth, (req, res) => {
  // JWT is stateless, so logout is handled client-side by removing the token
  return res.json({ message: "Logged out successfully" });
});

module.exports = router;