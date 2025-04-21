const express = require("express");
const Review = require("../models/Review");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "superjwtsecretkey";

// JWT authentication middleware
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

// Default route for testing
router.get("/", (req, res) => {
  res.send("Review API is running...");
});

// Get all reviews for a specific route ID
router.get("/route/:routeId/reviews", async (req, res) => {
  try {
    const reviews = await Review.find({ routeId: req.params.routeId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews", error: error.message });
  }
});

// Post a review - Requires JWT authentication
router.post("/route/:routeId/review", authenticateToken, async (req, res) => {
  const { rating, comment } = req.body;
  const routeId = req.params.routeId;
  if (!rating || !comment || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Invalid input: Rating (1-5) and comment are required." });
  }
  try {
    const newReview = new Review({
      routeId: routeId,
      userId: req.user.id,
      rating,
      comment,
    });
    await newReview.save();
    const populatedReview = await Review.findById(newReview._id).populate('userId', 'name');
    res.status(201).json(populatedReview);
  } catch (error) {
    res.status(500).json({ message: "Error adding review", error: error.message });
  }
});

// Update review - Requires JWT authentication and authorization
router.put("/review/:id", authenticateToken, async (req, res) => {
  const { rating, comment } = req.body;
  const reviewId = req.params.id;
  const userId = req.user.id;
  if (!rating || !comment || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Invalid input: Rating (1-5) and comment are required." });
  }
  try {
    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });
    if (review.userId.toString() !== userId) {
      return res.status(403).json({ message: "Forbidden: You can only edit your own reviews." });
    }
    review.rating = rating;
    review.comment = comment;
    await review.save();
    const populatedReview = await Review.findById(review._id).populate('userId', 'name');
    res.json(populatedReview);
  } catch (error) {
    res.status(500).json({ message: "Error updating review", error: error.message });
  }
});

// Delete review - Requires JWT authentication and authorization
router.delete("/review/:id", authenticateToken, async (req, res) => {
  const reviewId = req.params.id;
  const userId = req.user.id;
  try {
    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });
    if (review.userId.toString() !== userId) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own reviews." });
    }
    await Review.findByIdAndDelete(reviewId);
    res.json({ message: "Review has been deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting review", error: error.message });
  }
});

module.exports = router;
