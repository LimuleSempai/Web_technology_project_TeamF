const express = require("express");
const Review = require("../models/Review");
const router = express.Router();

// Default route for testing
router.get("/", (req, res) => {
  res.send("Review API is running...");
});

// Post a review
router.post("/transport/:id/review", async (req, res) => {
  const { rating, comment } = req.body;

  try {
    const newReview = new Review({
      transportId: req.params.id,
      userId: req.user.id,
      rating,
      comment,
    });

    await newReview.save();
    res.json({ message: "Review added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error adding review" });
  }
});

// Update review
router.put("/review/:id", async (req, res) => {
  const { rating, comment } = req.body;

  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    review.rating = rating;
    review.comment = comment;
    await review.save();

    res.json({ message: "Review updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating review" });
  }
});


// Delete review
router.delete("/review/:id", async (req, res) => {

  try {
    const review = await Review.findById(req.params.id);
    if (!review)
      return res.status(404).json({ message: "Review is not found" });
    await Review.deleteOne(req.params.id);

    res.json({ message: "Review has been deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error review deleting" });
  }
});

module.exports = router;
