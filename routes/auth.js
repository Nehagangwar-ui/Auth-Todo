const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

// ✅ Register
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

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

// ✅ Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

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

module.exports = router;