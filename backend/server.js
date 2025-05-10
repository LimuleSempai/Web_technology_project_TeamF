// Created by LimuleSempai : 16/03/25
// Modified 13 times by LimuleSempai : last 10/05/25
// Modified 23 times by Warnex04 : last 21/04/25

// Server file that runs the backend

// Import core dependencies
const express = require("express"); // Express web server
const connectDB = require("./config/db"); // MongoDB connection
const cookieParser = require("cookie-parser"); // Middleware to parse cookies
const cors = require("cors"); // Middleware for handling CORS (Cross-Origin Resource Sharing)

// Load environment variables from .env file
require("dotenv").config();

// Connect to MongoDB
connectDB();

// Create an Express application instance
const app = express();

// Define port from environment or use default 5000
const PORT = process.env.PORT || 5000;

// Define current environment (development/production)
const NODE_ENV = process.env.NODE_ENV || 'development';

// Define list of frontend origins allowed to access backend API
const allowedOrigins = [
  'http://localhost:3000',
  'https://transit-ie-frontend.vercel.app',
  'https://transit-ie-frontend-ln0k14kfa-warnex04s-projects.vercel.app',
  'https://web-tech-teamf-frontend.vercel.app',
  'https://web-tech-teamf-frontend-git-main-limulesempais-projects.vercel.app'
];

// Log allowed origins and environment for debugging
console.log(`[CORS Setup] Allowed Origins: ${allowedOrigins.join(', ')}`);
console.log(`[CORS Setup] NODE_ENV: ${NODE_ENV}`);

// Apply CORS settings
app.use(cors({
  origin: NODE_ENV === 'development' 
    ? true // Allow all origins in development mode
    : function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true); // Allow access
        } else {
          console.log(`[CORS] Blocked request from: ${origin}`);
          callback(new Error('Not allowed by CORS')); // Block request
        }
      },
  credentials: true, // Allow cookies and authentication headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'], // Allowed headers
  preflightContinue: false, // Don't pass OPTIONS to next handler
  optionsSuccessStatus: 204 // Standard success status for preflight
}));

// Parse incoming JSON requests
app.use(express.json());

// Parse cookies from client requests
app.use(cookieParser());

// Root route (health check)
app.get("/", (req, res) => {
  res.send("API root is running");
});

// Mount route files
app.use("/auth", require("./routes/authRoutes.js")); // Auth routes (login, register, profile, etc.)
app.use("/transport", require("./routes/transportRoutes.js")); // Transport API routes
app.use("/review", require("./routes/reviewRoutes.js")); // Review routes

// Export app for external usage (e.g. testing or serverless platforms)
module.exports = app;

// Start the server if this file is run directly (not imported)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
