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
  'https://transit-ie-frontend.vercel.app',
  'https://transit-ie-frontend-ln0k14kfa-warnex04s-projects.vercel.app',
  'https://web-tech-teamf-frontend.vercel.app',
  'https://web-tech-teamf-frontend-git-main-limulesempais-projects.vercel.app'
];

console.log(`[CORS Setup] Allowed Origins: ${allowedOrigins.join(', ')}`);
console.log(`[CORS Setup] NODE_ENV: ${NODE_ENV}`);

// Improved CORS configuration
app.use(cors({
  origin: NODE_ENV === 'development' 
    ? true // Allow any origin in development
    : function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.log(`[CORS] Blocked request from: ${origin}`);
          callback(new Error('Not allowed by CORS'));
        }
      },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Explicitly state allowed methods
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Add CORS headers directly to handle potential preflight issues
app.use((req, res, next) => {
  // Set CORS headers as a fallback mechanism
  const origin = req.headers.origin;
  if (NODE_ENV === 'development' || !origin || allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Built-in middleware to parse JSON request bodies
app.use(express.json());
// Parse cookies attached to the client request
app.use(cookieParser());

// Configure Sessions & Cookies
app.use(session({
  secret: process.env.SESSION_SECRET || "supersecretkey", // Secret key to sign the session ID
  resave: false, // Changed from true to prevent unnecessary session saves
  saveUninitialized: false, // Changed from true to comply with regulations and prevent empty sessions
  store: MongoStore.create({ // Use MongoDB as session store
    mongoUrl: process.env.MONGO_URI, // MongoDB connection URI
    collectionName: "sessions" // Name of collection to store sessions
  }),
  cookie: {
    secure: NODE_ENV === 'production', // Only set secure in production with HTTPS
    httpOnly: true, // Prevent client-side JS from accessing the cookie 
    maxAge: 1000 * 60 * 60 * 24, // Extended to 24 hours for better user experience
    sameSite: NODE_ENV === 'production' ? 'none' : 'lax' // Required for cross-origin cookies
  }
}));

// Keep the root test route
app.get("/", (req, res) => {
  res.send("API root is running");
});

// Mount routes directly without /api prefix
app.use("/auth", require("./routes/authRoutes.js"));
app.use("/transport", require("./routes/transportRoutes.js"));
app.use("/review", require("./routes/reviewRoutes.js"));

// Export the app instance for Vercel
module.exports = app;

// Start the server if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
