require("dotenv").config();
const express = require("express");
const connectDB = require("./data/db");
const path = require("path");
const cors = require("cors"); // ✅ add this

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors()); // ✅ important for frontend-backend connection
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(__dirname));

// API Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/todos", require("./routes/Todo"));

// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ❗ 404 handler (VERY IMPORTANT)
app.use((req, res) => {
  res.status(404).json({ message: "Route Not Found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ message: err.message || "Server Error" });
});

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});