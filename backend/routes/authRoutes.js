const express = require("express"); // Import the Express framework
const bcrypt = require("bcryptjs"); // Import bcrypt for password hashing
const User = require("../models/User"); // Import the User model
const { validateUserRegistration } = require("../middleware/validation"); // Import middleware for user registration validation
const router = express.Router(); // Create a new Express router

// Check if user is logged in
router.get("/", (req, res) => {
  // If session exists, respond with user info and loggedIn status
  if (req.session.user) {
    return res.json({ loggedIn: true, user: req.session.user });
  }
  res.json({ loggedIn: false }); // Otherwise, return loggedIn: false
});

// Register a new user with validation middleware
router.post("/register", validateUserRegistration, async (req, res) => {
  const { name, email, password } = req.body; // Destructure name, email, password from the request body

  try {
    const existingEmail = await User.findOne({ email }); // Check if email is already taken
    if (existingEmail) return res.status(400).json({ message: "Email is already in use" }); // If yes, respond with an error

    const existingName = await User.findOne({ name }); // Check if username is already taken
    if (existingName) return res.status(400).json({ message: "Username is already taken" }); // If yes, respond with an error

    const hashedPassword = await bcrypt.hash(password, 10); // Hash the user's password before saving to DB
    const newUser = new User({ name, email, password: hashedPassword }); // Create new user with hashed password
    await newUser.save(); // Save user to MongoDB

    res.status(201).json({ message: "User registered successfully" }); // Respond with success message
  } catch (error) {
    console.error("Registration error:", error); // Keep server log
    res.status(500).json({ message: "Server error during registration", error: error.message }); // Send error message to client
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

    // Set session
    req.session.user = { id: user._id, name: user.name, email: user.email }; // Store relevant info in session

    console.log('Session after login:', req.session); // Debug log

    // Send back user info along with success message/status
    res.status(200).json({
      message: "Login successful",
      user: { // Send necessary user details to frontend
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Login error:", error); // Keep server log
    res.status(500).json({ message: "Server error during login", error: error.message }); // Send error message to client
  }
});

// Check Session-Based Authentication
router.get("/profile", (req, res) => {
  console.log("Checking session:", req.session); // Debugging

  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized - No active session" }); // If session has no user, return unauthorized
  }
  res.json(req.session.user); // If session is active, return the user data
});

// Logout User
router.post("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy((err) => { // Destroy the session
      if (err) {
        console.error("Logout error:", err); // Keep server log
        return res.status(500).json({ message: "Could not log out, please try again.", error: err.message });
      }
      
      // Clear the session cookie - adjust cookie name if different
      res.clearCookie('connect.sid', {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
      });
      
      res.status(200).json({ message: "Logout successful" });
    });
  } else {
    // No session exists
    res.status(200).json({ message: "No active session to log out" });
  }
});

// Route to update user profile (name, email, password)
router.put("/profile", async (req, res) => {
  console.log("Session:", req.session); // Log current session and incoming request data
  console.log("Request body:", req.body);

  try {
    const userId = req.session?.user?.id; // Extract user ID from the session

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" }); // If not authenticated, return unauthorized
    }

    const user = await User.findById(userId); // Find the user in the database by their session ID
    if (!user) return res.status(404).json({ message: "User not found" }); // Return 404 if user does not exist

    const { name, email, password } = req.body; // Destructure updated fields from request body

    // Only check for duplicates if name is being changed
    if (name && name !== user.name) {
      const existingName = await User.findOne({ name }); // Check the database for an existing user with that name
      if (existingName) {
        return res.status(400).json({ message: "Username is already taken" }); // If taken, return error
      }
    }

    user.name = name || user.name; // Update user name
    
    // Only check for duplicates if email is being changed
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email }); // Check for another user with that email
      if (existingEmail) {
        return res.status(400).json({ message: "Email is already in use by another account" }); // If email is already used, return error
      }
    }

    user.email = email || user.email; // Update email if valid and not duplicate

    if (password) { // If password is provided, hash it before saving
      const hashedPassword = await bcrypt.hash(password, 10); // Hash the new password
      user.password = hashedPassword; // Save the hashed password
    }

    await user.save(); // Save the updated user to the database
    res.json({ message: "Profile updated" }); // Respond with a profile update success message

    // Update the session user info without re-logging in
    req.session.user.name = user.name;
    req.session.user.email = user.email;

    req.session.save(err => { // Save session to persist the changes to the session store
      if (err) {
        console.error("Error saving session after update:", err); // Log an error if saving the session fails
      } else {
        console.log("Session updated and saved"); // Log successful session update
      }
    });

    console.log("Session after modification:", req.session); // Debugging

  } catch (error) { // Catch any server-side errors during update
    console.error("Profile update error:", error); // Log the error in the server console
    res.status(500).json({ message: "Update failed", error: error.message }); // Return 500 with the error message
  }
});

// Check authentication status
router.get("/status", (req, res) => {
  if (req.session && req.session.user) {
    // If session exists, send back user data
    res.status(200).json({ isLoggedIn: true, user: req.session.user });
  } else {
    // If no session, indicate user is not logged in
    res.status(200).json({ isLoggedIn: false });
  }
});

// Export the router for use in server.js
module.exports = router;
