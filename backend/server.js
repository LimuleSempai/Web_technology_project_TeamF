const express = require("express");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const allowedOrigins = [
  'http://localhost:3000',
  'https://transit-ie-frontend.vercel.app',
  'https://transit-ie-frontend-ln0k14kfa-warnex04s-projects.vercel.app',
  'https://web-tech-teamf-frontend.vercel.app',
  'https://web-tech-teamf-frontend-git-main-limulesempais-projects.vercel.app'
];

console.log(`[CORS Setup] Allowed Origins: ${allowedOrigins.join(', ')}`);
console.log(`[CORS Setup] NODE_ENV: ${NODE_ENV}`);

app.use(cors({
  origin: NODE_ENV === 'development' 
    ? true
    : function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.log(`[CORS] Blocked request from: ${origin}`);
          callback(new Error('Not allowed by CORS'));
        }
      },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use(express.json());
app.use(cookieParser());

// Keep the root test route
app.get("/", (req, res) => {
  res.send("API root is running");
});

app.use("/auth", require("./routes/authRoutes.js"));
app.use("/transport", require("./routes/transportRoutes.js"));
app.use("/review", require("./routes/reviewRoutes.js"));

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
