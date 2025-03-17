const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { validateUserRegistration } = require("../middleware/validation");
const router = express.Router();

// Check if user is logged in
router.get("/", (req, res) => {
  if (req.session.user) {
    return res.json({ loggedIn: true, user: req.session.user });
  }
  res.json({ loggedIn: false });
});


// Register a new user
router.post("/register", validateUserRegistration, async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Login user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Store user data in session
    req.session.user = { id: user._id, name: user.name, email: user.email };

    console.log("Session after login:", req.session); // Debugging

    res.json({ message: "Login successful", user: req.session.user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


// Check Session-Based Authentication
router.get("/profile", (req, res) => {
  console.log("Checking session:", req.session); // Debugging

  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized - No active session" });
  }
  res.json(req.session.user);
});


// Logout User
router.post("/logout", (req, res) => {
  console.log("Before destroying session:", req.session.user); // Debugging

  req.session.destroy(err => {
    if (err) {
      console.error("Session destruction error:", err);
      return res.status(500).json({ message: "Logout failed" });
    }

    res.clearCookie("connect.sid"); // Ensure session cookie is cleared

    console.log("After destroying session:", req.session); // Debugging
    res.json({ message: "Logged out successfully" });
  });
});

module.exports = router;
