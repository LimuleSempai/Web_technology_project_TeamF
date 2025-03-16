const express = require("express");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");

require("dotenv").config();
connectDB();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/transport", require("./routes/transportRoutes"));
app.use("/api/review", require("./routes/reviewRoutes"));

app.listen(3000, () => console.log("Server running on port 3000"));
