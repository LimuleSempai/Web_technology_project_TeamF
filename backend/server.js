const express = require("express");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const cors = require('cors');

require("dotenv").config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
app.use(cors());

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
