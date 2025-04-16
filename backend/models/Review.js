const mongoose = require("mongoose"); // Import the Mongoose library for MongoDB object modeling
// Define a new schema for reviews
const ReviewSchema = new mongoose.Schema({
  transportId: { type: mongoose.Schema.Types.ObjectId, ref: "TransportData", required: true }, // Reference to the associated transport entry (foreign key to TransportData)
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to the user who created the review (foreign key to User)
  rating: { type: Number, required: true, min: 1, max: 5 }, // Rating value: required number between 1 and 5
  comment: { type: String, required: true }, // Comment content: required string provided by the user
  createdAt: { type: Date, default: Date.now }, // Timestamp of when the review was created; defaults to current time
});
// Export the Review model so it can be used across the app
module.exports = mongoose.model("Review", ReviewSchema);
