const express = require("express"); // Import the Express framework
const Review = require("../models/Review"); // Import the Review model for MongoDB
const User = require("../models/User"); // Import User model to populate user details
const router = express.Router(); // Create a new Express router instance

// Middleware to check if user is authenticated (assuming session middleware is set up)
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized: Please log in." });
};

// Default route for testing
router.get("/", (req, res) => {
  res.send("Review API is running..."); // Respond with a simple message confirming review routes are working
});

// --- NEW: Get all reviews for a specific route ID ---
router.get("/route/:routeId/reviews", async (req, res) => {
  console.log(`[${new Date().toISOString()}] GET /route/${req.params.routeId}/reviews - Request received`); // Log request
  try {
    const reviews = await Review.find({ routeId: req.params.routeId })
      .populate('userId', 'name') // Populate the 'userId' field and select only the 'name'
      .sort({ createdAt: -1 }); // Sort by creation date, newest first
    console.log(`[${new Date().toISOString()}] GET /route/${req.params.routeId}/reviews - Found ${reviews.length} reviews`); // Log success
    res.json(reviews);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] GET /route/${req.params.routeId}/reviews - Error:`, error); // Log error
    res.status(500).json({ message: "Error fetching reviews" });
  }
});

// Post a review - Requires authentication
router.post("/route/:routeId/review", isAuthenticated, async (req, res) => {
  const { rating, comment } = req.body; // Extract rating and comment from request body
  const routeId = req.params.routeId; // Get routeId from URL parameter

  // Basic validation
  if (!rating || !comment || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Invalid input: Rating (1-5) and comment are required." });
  }

  try { // Wrap logic in try-catch to handle errors
    const newReview = new Review({ // Create a new review document using request data and session user ID
      routeId: routeId, // Use routeId from the URL parameter
      userId: req.session.user.id, // Link the review to the logged-in user via session
      rating, // Assign the rating value
      comment, // Assign the review comment
    });
    // Save the new review to the database
    await newReview.save();
    // Populate user name for the response
    const populatedReview = await Review.findById(newReview._id).populate('userId', 'name');
    res.status(201).json(populatedReview); // Respond with the created review (including user name)
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ message: "Error adding review" }); // Catch any error and return server error message
  }
});

// Update review - Requires authentication and authorization
router.put("/review/:id", isAuthenticated, async (req, res) => {
  const { rating, comment } = req.body; // Extract updated rating and comment from request body
  const reviewId = req.params.id;
  const userId = req.session.user.id;

  // Basic validation
  if (!rating || !comment || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Invalid input: Rating (1-5) and comment are required." });
  }

  try { // Wrap logic in try-catch
    const review = await Review.findById(reviewId); // Find the review by its MongoDB ID
    if (!review) return res.status(404).json({ message: "Review not found" }); // Return 404 if the review is not found

    // --- AUTHORIZATION CHECK ---
    if (review.userId.toString() !== userId) {
      return res.status(403).json({ message: "Forbidden: You can only edit your own reviews." });
    }
    // --- END AUTHORIZATION CHECK ---

    review.rating = rating; // Update review's rating field
    review.comment = comment; // Update review's comment field
    // Optionally update a 'updatedAt' timestamp if you add one to the schema
    await review.save(); // Save changes to the database

    // Populate user name for the response
    const populatedReview = await Review.findById(review._id).populate('userId', 'name');
    res.json(populatedReview); // Respond with the updated review
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ message: "Error updating review" }); // Catch errors and return failure response
  }
});


// Delete review - Requires authentication and authorization
router.delete("/review/:id", isAuthenticated, async (req, res) => {
  const reviewId = req.params.id;
  const userId = req.session.user.id;

  try { // Wrap logic in try-catch block
    const review = await Review.findById(reviewId); // Find the review document by its MongoDB ID
    if (!review)
      return res.status(404).json({ message: "Review not found" }); // If not found, return 404 error

    // --- AUTHORIZATION CHECK ---
    if (review.userId.toString() !== userId) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own reviews." });
    }
    // --- END AUTHORIZATION CHECK ---

    // Use deleteOne with the review instance or findByIdAndDelete
    await Review.findByIdAndDelete(reviewId);

    res.json({ message: "Review has been deleted successfully" }); // Return a success message after deletion
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: "Error deleting review" }); // Handle errors during deletion
  }
});
// Export the router so it can be used in server.js
module.exports = router;
