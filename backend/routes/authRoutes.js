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
    res.status(500).json({ message: "Server error" }); // Handle errors during registration
  }
});

// Login user
router.post("/login", async (req, res) => {
  const { email, password } = req.body; // Extract credentials from request body

  try {
    const user = await User.findOne({ email }); // Attempt to find the user by email
    if (!user) return res.status(400).json({ message: "Invalid email or password" }); // If user not found, return error

    const isMatch = await bcrypt.compare(password, user.password); // Compare provided password with hashed one in DB
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" }); // If password doesn't match, return error

    // Store user data in session
    req.session.user = { id: user._id, name: user.name, email: user.email };

    console.log("Session after login:", req.session); // Debugging

    res.json({ message: "Login successful", user: req.session.user }); // Respond with success and session-stored user info
  } catch (error) {
    res.status(500).json({ message: "Server error" }); // Handle any login errors
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
  console.log("Before destroying session:", req.session.user); // Debugging

  req.session.destroy(err => { // Destroy the session from server memory and MongoDB store
    if (err) { // If there's an error destroying the session, handle it
      console.error("Session destruction error:", err);
      return res.status(500).json({ message: "Logout failed" });
    }

    res.clearCookie("connect.sid"); // Ensure session cookie is cleared

    console.log("After destroying session:", req.session); // Debugging
    res.json({ message: "Logged out successfully" }); // Respond with logout success
  });
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
// Export the router for use in server.js
module.exports = router;
