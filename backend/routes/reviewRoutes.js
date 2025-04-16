const express = require("express"); // Import the Express framework
const Review = require("../models/Review"); // Import the Review model for MongoDB
const router = express.Router(); // Create a new Express router instance

// Default route for testing
router.get("/", (req, res) => {
  res.send("Review API is running..."); // Respond with a simple message confirming review routes are working
});

// Post a review
router.post("/transport/:id/review", async (req, res) => {
  const { rating, comment } = req.body; // Extract rating and comment from request body

  try { // Wrap logic in try-catch to handle errors
    const newReview = new Review({ // Create a new review document using request data and session user ID
      transportId: req.params.id, // Link the review to the transport by ID from the route parameter
      userId: req.session.user.id, // Link the review to the logged-in user via session
      rating, // Assign the rating value
      comment, // Assign the review comment
    });
    // Save the new review to the database
    await newReview.save();
    res.json({ message: "Review added successfully" }); // Respond with success message
  } catch (error) {
    res.status(500).json({ message: "Error adding review" }); // Catch any error and return server error message
  }
});

// Update review
router.put("/review/:id", async (req, res) => {
  const { rating, comment } = req.body; // Extract updated rating and comment from request body

  try { // Wrap logic in try-catch
    const review = await Review.findById(req.params.id); // Find the review by its MongoDB ID
    if (!review) return res.status(404).json({ message: "Review not found" }); // Return 404 if the review is not found

    review.rating = rating; // Update review's rating field
    review.comment = comment; // Update review's comment field
    await review.save(); // Save changes to the database

    res.json({ message: "Review updated successfully" }); // Respond with success message
  } catch (error) {
    res.status(500).json({ message: "Error updating review" }); // Catch errors and return failure response
  }
});


// Delete review
router.delete("/review/:id", async (req, res) => {

  try { // Wrap logic in try-catch block
    const review = await Review.findById(req.params.id); // Find the review document by its MongoDB ID
    if (!review)
      return res.status(404).json({ message: "Review is not found" }); // If not found, return 404 error
    await Review.deleteOne(req.params.id);  // Delete the review from the database using its ID

    res.json({ message: "Review has been deleted successfully" }); // Return a success message after deletion
  } catch (error) {
    res.status(500).json({ message: "Error review deleting" }); // Handle errors during deletion
  }
});
// Export the router so it can be used in server.js
module.exports = router;
