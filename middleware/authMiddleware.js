// ======================================
// middleware/authMiddleware.js
// JWT Auth Middleware
// Protect API Routes
// updated 2 Jun, 2026
// ======================================

require("dotenv").config();

const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "layboka_super_secret";

// ======================================
// VERIFY TOKEN
// ======================================

const authMiddleware = (req, res, next) => {

  try {

    const authHeader =
      req.headers.authorization || "";

    if (!authHeader) {

      return res.status(401).json({
        success: false,
        message:
          "Access denied. No token provided."
      });

    }

    // ======================================
    // FORMAT:
    // Bearer TOKEN
    // ======================================

    const token =
      authHeader
        .replace(/^Bearer\s+/i, "")
        .trim();

    if (!token) {

      return res.status(401).json({
        success: false,
        message:
          "Invalid token format."
      });

    }

    // ======================================
    // VERIFY JWT
    // ======================================

    const decoded =
      jwt.verify(
        token,
        JWT_SECRET
      );

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

        message:
          "Unauthorized"

      });

    }

    const role =
      req.user?.role || "";

    if (

      role !== "admin" &&

      role !== "superadmin"

    ) {

      return res.status(403).json({

        success: false,

        message:
          "Admin access required"

      });

    }

    next();

  } catch (err) {

    return res.status(500).json({

      success: false,

      message:
        "Middleware error"

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
      req.headers.authorization || "";

    if (!authHeader) {

      return next();

    }

    const token =
      authHeader
        .replace(/^Bearer\s+/i, "")
        .trim();

    if (!token) {

      return next();

    }

    const decoded =
      jwt.verify(
        token,
        JWT_SECRET
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
