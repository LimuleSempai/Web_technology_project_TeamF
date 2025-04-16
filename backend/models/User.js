const mongoose = require("mongoose"); // Import the Mongoose ODM (Object Data Modeling) library

// Define a new Mongoose schema for the User collection
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Define 'name' field: required string and must be unique across users
  email: { type: String, required: true, unique: true }, // Define 'email' field: required string and must be unique across users
  password: { type: String, required: true }, // Define 'password' field: required string (hashed before saving)
  createdAt: { type: Date, default: Date.now }, // Define 'createdAt' field: stores account creation date, defaults to now
});
// Export the User model based on the schema to be used throughout the app
module.exports = mongoose.model("User", UserSchema);
