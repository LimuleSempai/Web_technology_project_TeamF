// Import required modules
const express = require("express");
const Review = require("../models/Review"); // Review model
const User = require("../models/User"); // User model (used for populating names)
const jwt = require("jsonwebtoken"); // Used for token-based auth
const router = express.Router(); // Create Express router

// Load secret key from environment or fallback
const JWT_SECRET = process.env.JWT_SECRET || "superjwtsecretkey";

// JWT authentication middleware to protect routes
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"]; // Get Authorization header
  const token = authHeader && authHeader.split(" ")[1]; // Extract token
  if (!token) return res.status(401).json({ message: "No token, authorization denied" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid or expired token" });
    req.user = user; // Attach user to request
    next(); // Proceed to next middleware or route
  });
}

// Default test route
router.get("/", (req, res) => {
  res.send("Review API is running...");
});

// Fetch all reviews for a given routeId
router.get("/route/:routeId/reviews", async (req, res) => {
  try {
    const reviews = await Review.find({ routeId: req.params.routeId })
      .populate('userId', 'name') // Show user names, not just IDs
      .sort({ createdAt: -1 }); // Sort by newest first
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews", error: error.message });
  }
});

// Post a new review — requires JWT authentication
router.post("/route/:routeId/review", authenticateToken, async (req, res) => {
  const { rating, comment } = req.body;
  const routeId = req.params.routeId;

  // Validate input
  if (!rating || !comment || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Invalid input: Rating (1-5) and comment are required." });
  }

  try {
    // Create and save new review
    const newReview = new Review({
      routeId: routeId,
      userId: req.user.id,
      rating,
      comment,
    });

    await newReview.save();

    // Populate user name in response
    const populatedReview = await Review.findById(newReview._id).populate('userId', 'name');

    res.status(201).json(populatedReview);
  } catch (error) {
    res.status(500).json({ message: "Error adding review", error: error.message });
  }
});

// Update an existing review — requires JWT auth & ownership
router.put("/review/:id", authenticateToken, async (req, res) => {
  const { rating, comment } = req.body;
  const reviewId = req.params.id;
  const userId = req.user.id;

  // Validate input
  if (!rating || !comment || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Invalid input: Rating (1-5) and comment are required." });
  }

  try {
    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    // Ensure the logged-in user owns the review
    if (review.userId.toString() !== userId) {
      return res.status(403).json({ message: "Forbidden: You can only edit your own reviews." });
    }

    // Update and save
    review.rating = rating;
    review.comment = comment;
    await review.save();

    const populatedReview = await Review.findById(review._id).populate('userId', 'name');
    res.json(populatedReview);
  } catch (error) {
    res.status(500).json({ message: "Error updating review", error: error.message });
  }
});

// Delete a review — requires JWT auth & ownership
router.delete("/review/:id", authenticateToken, async (req, res) => {
  const reviewId = req.params.id;
  const userId = req.user.id;

  try {
    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    // Ensure the user owns the review
    if (review.userId.toString() !== userId) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own reviews." });
    }

    // Delete review
    await Review.findByIdAndDelete(reviewId);
    res.json({ message: "Review has been deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting review", error: error.message });
  }
});

// Export the router to be used in server.js
module.exports = router;
