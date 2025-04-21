const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { validateUserRegistration } = require("../middleware/validation");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "superjwtsecretkey";
const JWT_EXPIRES_IN = "1d";

// Middleware to protect routes
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token, authorization denied" });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid or expired token" });
    req.user = user;
    next();
  });
}

// Check authentication status
router.get("/status", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(200).json({ isLoggedIn: false });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(200).json({ isLoggedIn: false });
    res.status(200).json({ isLoggedIn: true, user });
  });
});

// Register a new user
router.post("/register", validateUserRegistration, async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ message: "Email is already in use" });
    const existingName = await User.findOne({ name });
    if (existingName) return res.status(400).json({ message: "Username is already taken" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration", error: error.message });
  }
});

// Login user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
    const payload = { id: user._id, name: user.name, email: user.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.status(200).json({
      message: "Login successful",
      token,
      user: payload
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login", error: error.message });
  }
});

// Get user profile (protected)
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update user profile (protected)
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const { name, email, password } = req.body;
    if (name && name !== user.name) {
      const existingName = await User.findOne({ name });
      if (existingName) return res.status(400).json({ message: "Username is already taken" });
      user.name = name;
    }
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) return res.status(400).json({ message: "Email is already in use by another account" });
      user.email = email;
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }
    await user.save();
    res.json({ message: "Profile updated" });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
});

// Logout (client should just delete the token)
router.post("/logout", (req, res) => {
  // For JWT, logout is handled client-side by deleting the token
  res.status(200).json({ message: "Logout successful" });
});

module.exports = router;
