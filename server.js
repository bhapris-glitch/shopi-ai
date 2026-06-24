// ======================================
// server.js
// Layboka AI - Production Server Entry
// CLEAN ARCHITECTURE BOOTSTRAP
// ======================================

require("dotenv").config();

// ======================================
// CORE DEPENDENCIES
// ======================================

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const compression = require("compression");

// ======================================
// APP INIT
// ======================================

const app = express();

// ======================================
// SECURITY MIDDLEWARE
// ======================================

app.use(helmet());

app.use(
  cors({
    origin: "*",
    credentials: true
  })
);

app.use(compression());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ======================================
// DATABASE CONNECTION
// ======================================

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log("✅ MongoDB Connected Successfully");

  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  }
}

// ======================================
// HEALTH CHECK ROUTE
// ======================================

app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "OK",
    service: "Layboka AI Server",
    timestamp: new Date().toISOString()
  });
});

// ======================================
// BASIC ROOT
// ======================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Layboka AI API Running",
    version: "1.0.0"
  });
});

// ======================================
// MODULE ROUTES (PLACEHOLDER IMPORTS)
// ======================================

// We will connect full routes in Part 2

module.exports = { app, connectDB };
