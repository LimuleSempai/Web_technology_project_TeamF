const express = require("express"); // Import the Express web framework
const connectDB = require("./config/db"); // Import custom MongoDB connection function
const cookieParser = require("cookie-parser"); // Parse cookies from incoming requests
const cors = require("cors"); // Handle Cross-Origin Resource Sharing (CORS)
const session = require("express-session"); // Manage user sessions on the server
const MongoStore = require("connect-mongo"); // Store session data in MongoDB

require("dotenv").config(); // Load environment variables from .env file
connectDB(); // Connect to the MongoDB database

const app = express(); // Create an instance of the Express application
const PORT = process.env.PORT || 5000; // Define the port to run the server on (from env or default to 5000)
const NODE_ENV = process.env.NODE_ENV || 'development'; // Determine environment

// Define which frontends are allowed to connect to the API in production
const allowedOrigins = [
  'http://localhost:3000', // Keep localhost for local testing convenience
  'https://web-tech-teamf-frontend.vercel.app',
  'https://web-tech-teamf-frontend-git-main-limulesempais-projects.vercel.app'
];

console.log(`[CORS Setup] Allowed Origins: ${allowedOrigins.join(', ')}`);
console.log(`[CORS Setup] NODE_ENV: ${NODE_ENV}`);

// Set up CORS middleware
app.use(cors({
  // Revert back to function-based origin check with logging
  origin: function (origin, callback) {
    console.log(`[CORS Check] Request Origin: ${origin}`); // Log the incoming origin

    // Allow requests with no origin (like mobile apps or curl requests)
    // Also allow if origin is undefined (server-to-server, etc.)
    if (!origin) {
        console.log(`[CORS Check] Allowing request with no origin.`);
        return callback(null, true);
    }

    // Check if the origin is in the allowed list
    if (allowedOrigins.includes(origin)) {
      console.log(`[CORS Check] Allowing origin: ${origin}`);
      callback(null, true); // Allow access
    } else {
      console.warn(`[CORS Check] Blocking origin: ${origin}`); // Log denied origin
      callback(new Error('Not allowed by CORS')); // Reject access
    }
  },
  credentials: true // Allow cookies and session credentials
}));

// Built-in middleware to parse JSON request bodies
app.use(express.json());
// Parse cookies attached to the client request
app.use(cookieParser());

// Configure Sessions & Cookies
app.use(session({
  secret: process.env.SESSION_SECRET || "supersecretkey", // Secret key to sign the session ID
  resave: true, // Force session to be saved even if unmodified
  saveUninitialized: true, // Save uninitialized sessions
  store: MongoStore.create({ // Use MongoDB as session store
    mongoUrl: process.env.MONGO_URI, // MongoDB connection URI
    collectionName: "sessions" // Name of collection to store sessions
  }),
  cookie: {
    secure: false, // Should be true in production with HTTPS
    httpOnly: true, // Prevent client-side JS from accessing the cookie 
    maxAge: 1000 * 60 * 60 * 2, // 2 hours session expiration
  }
}));

// Add a test route back at /api
app.get("/api", (req, res) => {
  console.log("[/api] Test route hit");
  res.setHeader('Access-Control-Allow-Origin', '*'); // Temporarily allow all for this test route
  res.send("🚀 API root is running...");
});

// Mount routes WITH /api prefix again
app.use("/api/auth", require("./routes/authRoutes.js"));
app.use("/api/transport", require("./routes/transportRoutes.js"));
app.use("/api/review", require("./routes/reviewRoutes.js"));

// Export the app instance for Vercel
module.exports = app;
