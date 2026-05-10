// ======================================
// middleware/authMiddleware.js
// JWT Auth Middleware
// Protect API Routes
// ======================================

require("dotenv").config();

const jwt = require("jsonwebtoken");

// ======================================
// VERIFY TOKEN
// ======================================

const authMiddleware = async (req, res, next) => {

  try {

    // ======================================
    // GET TOKEN
    // ======================================

    const authHeader =
      req.headers.authorization;

    if (!authHeader) {

      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided."
      });

    }

    // ======================================
    // FORMAT:
    // Bearer TOKEN
    // ======================================

    const token =
      authHeader.split(" ")[1];

    if (!token) {

      return res.status(401).json({
        success: false,
        message: "Invalid token format."
      });

    }

    // ======================================
    // VERIFY JWT
    // ======================================

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    // ======================================
    // SAVE USER
    // ======================================

    req.user = decoded;

    next();

  } catch (err) {

    console.log(
      "❌ Auth Error:",
      err.message
    );

    return res.status(401).json({

      success: false,

      message:
        "Unauthorized access"

    });

  }

};

// ======================================
// ADMIN ONLY
// ======================================

const adminMiddleware = (req, res, next) => {

  try {

    if (!req.user) {

      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });

    }

    if (req.user.role !== "admin") {

      return res.status(403).json({
        success: false,
        message: "Admin access required"
      });

    }

    next();

  } catch (err) {

    return res.status(500).json({
      success: false,
      message: "Middleware error"
    });

  }

};

// ======================================
// OPTIONAL AUTH
// Continue even without token
// ======================================

const optionalAuth = (req, res, next) => {

  try {

    const authHeader =
      req.headers.authorization;

    if (!authHeader) {

      return next();

    }

    const token =
      authHeader.split(" ")[1];

    if (!token) {

      return next();

    }

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    req.user = decoded;

    next();

  } catch (err) {

    next();

  }

};

// ======================================
// EXPORTS
// ======================================

module.exports = {

  authMiddleware,

  adminMiddleware,

  optionalAuth

};
