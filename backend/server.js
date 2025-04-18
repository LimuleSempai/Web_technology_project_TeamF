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

// Define which frontends are allowed to connect to the API
const allowedOrigins = [
  'http://localhost:3000',
  'https://web-tech-teamf-frontend.vercel.app',
  'https://web-tech-teamf-frontend-git-main-limulesempais-projects.vercel.app'
];

// Set up CORS middleware to allow only whitelisted origins and enable cookies
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow access
    } else {
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

// Mount authentication-related routes at /api/auth
app.use("/api/auth", require("./routes/authRoutes.js"));
// Mount transport-related routes at /api/transport
app.use("/api/transport", require("./routes/transportRoutes.js"));
// Mount review-related routes at /api/review
app.use("/api/review", require("./routes/reviewRoutes.js"));

// Default root route to test if the API is running
app.get("/", (req, res) => {
  res.send("🚀 API is running...");
});

 // Start the server and listen on the defined port
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
