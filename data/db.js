const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/todo";
    
    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB Connected Successfully!");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    console.log("⚠️  Running without database. Some features may not work.");
  }
};

module.exports = connectDB;