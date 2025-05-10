// Created by LimuleSempai : 16/03/25
// Modified 8 times by LimuleSempai : last 10/05/25
// Modified 6 times by Warnex04 : last 21/04/25

// Route file to define calls to the API for User managment

// Import required modules
const express = require("express");
const bcrypt = require("bcryptjs"); // Used to hash and compare passwords
const jwt = require("jsonwebtoken"); // Used to sign and verify JWTs
const User = require("../models/User"); // User model for MongoDB
const { validateUserRegistration } = require("../middleware/validation"); // Middleware to validate registration fields
const router = express.Router(); // Create Express router

// Load secret and token expiry duration from environment or use defaults
const JWT_SECRET = process.env.JWT_SECRET || "superjwtsecretkey";
const JWT_EXPIRES_IN = "1d";

// Middleware to protect routes by verifying JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"]; // Get Authorization header
  const token = authHeader && authHeader.split(" ")[1]; // Extract token from "Bearer <token>"
  if (!token) return res.status(401).json({ message: "No token, authorization denied" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid or expired token" });
    req.user = user; // Attach user payload to request
    next();
  });
}

// Public route to check if token is valid (for auto-login on frontend)
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
    // Check if email is already in use
    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ message: "Email is already in use" });

    // Check if username is taken
    const existingName = await User.findOne({ name });
    if (existingName) return res.status(400).json({ message: "Username is already taken" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save new user
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration", error: error.message });
  }
});

// Login user and return JWT
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Compare password with hash
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT
    const payload = { id: user._id, name: user.name, email: user.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Return token and user info
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

// Get user profile (protected route)
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update user profile (protected route)
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, email, password } = req.body;

    // Check if new name is already taken
    if (name && name !== user.name) {
      const existingName = await User.findOne({ name });
      if (existingName) return res.status(400).json({ message: "Username is already taken" });
      user.name = name;
    }

    // Check if new email is already taken
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) return res.status(400).json({ message: "Email is already in use by another account" });
      user.email = email;
    }

    // If new password is provided, hash and update it
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

// Logout route (JWT-based logout is handled by client deleting the token)
router.post("/logout", (req, res) => {
  // For JWT, logout is handled client-side by deleting the token
  res.status(200).json({ message: "Logout successful" });
});

// Export the router for use in server.js
module.exports = router;
