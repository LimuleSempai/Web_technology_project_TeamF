// Created by LimuleSempai : 16/03/25
// Modified 3 times by LimuleSempai : last 10/05/25

// Makes the connection to the MongoDB database

const mongoose = require("mongoose"); // Import the Mongoose library to connect to MongoDB
require("dotenv").config(); // Load environment variables from the .env file
// Define an asynchronous function to connect to the MongoDB database
const connectDB = async () => {
  try { // Wrap the connection logic in a try-catch block to handle errors
    await mongoose.connect(process.env.MONGO_URI); // Attempt to connect using the URI from environment variables
    console.log("MongoDB connected successfully"); // Log a success message if the connection is established
  } catch (error) {
    console.error("MongoDB connection error:", error); // If an error occurs during connection, log the error
    process.exit(1); // Exit the process with failure code if connection fails
  }
};
// Export the connectDB function to be used in server.js
module.exports = connectDB;
