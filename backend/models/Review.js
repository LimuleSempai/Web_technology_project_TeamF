// Created by LimuleSempai : 16/03/25
// Modified 2 times by LimuleSempai : last 10/05/25
// Modified 1 time by Warnex04 : last 20/04/25

// Database model for the review element

const mongoose = require("mongoose"); // Import the Mongoose library for MongoDB object modeling
// Define a new schema for reviews
const ReviewSchema = new mongoose.Schema({
  routeId: { type: String, required: true, index: true }, // Reference the route identifier (e.g., "1-1-A")
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to the user who created the review (foreign key to User)
  rating: { type: Number, required: true, min: 1, max: 5 }, // Rating value: required number between 1 and 5
  comment: { type: String, required: true }, // Comment content: required string provided by the user
  createdAt: { type: Date, default: Date.now }, // Timestamp of when the review was created; defaults to current time
});
// Export the Review model so it can be used across the app
module.exports = mongoose.model("Review", ReviewSchema);
