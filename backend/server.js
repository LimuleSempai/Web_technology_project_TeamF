const express = require("express");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");

require("dotenv").config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = [
  'http://localhost:3000',
  'https://web-tech-teamf-frontend-git-main-limulesempais-projects.vercel.app/'
];

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: allowedOrigins, // Allow frontend to send cookies
  credentials: true // Allow sending cookies with requests
}));

// Configure Sessions & Cookies
app.use(session({
  secret: process.env.SESSION_SECRET || "supersecretkey",
  resave: true,
  saveUninitialized: true, // Prevents empty sessions
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI, // Store sessions in MongoDB
    collectionName: "sessions"
  }),
  cookie: {
    secure: false,
    httpOnly: true, // Prevent client-side access
    maxAge: 1000 * 60 * 60 * 2, // 2 hours session expiration
  }
}));

// API Routes
app.use("/api/auth", require("./routes/authRoutes.js"));
app.use("/api/transport", require("./routes/transportRoutes.js"));
app.use("/api/review", require("./routes/reviewRoutes.js"));

// Default route
app.get("/", (req, res) => {
  res.send("🚀 API is running...");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
