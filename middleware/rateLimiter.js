// ======================================
// middleware/rateLimiter.js
// Layboka AI Rate Limiter
// Production Ready
// updated 2 Jun, 2026
// ======================================

const rateLimit =
  require("express-rate-limit");

// ======================================
// COMMON HANDLER
// ======================================

const rateLimitHandler =
  (message) => (

    req,
    res

  ) => {

    return res.status(429).json({

      success:false,

      message

    });

  };

// ======================================
// GLOBAL LIMITER
// ======================================

const globalLimiter =
  rateLimit({

    windowMs:
      15 * 60 * 1000,

    max:300,

    standardHeaders:true,

    legacyHeaders:false,

    trustProxy:true,

    handler:
      rateLimitHandler(
        "Too many requests"
      )

  });

// ======================================
// CHAT LIMITER
// ======================================

const chatLimiter =
  rateLimit({

    windowMs:
      60 * 1000,

    max:40,

    standardHeaders:true,

    legacyHeaders:false,

    trustProxy:true,

    handler:
      rateLimitHandler(
        "Chat limit exceeded"
      )

  });

// ======================================
// AUTH LIMITER
// ======================================

const authLimiter =
  rateLimit({

    windowMs:
      15 * 60 * 1000,

    max:10,

    standardHeaders:true,

    legacyHeaders:false,

    trustProxy:true,

    skipSuccessfulRequests:true,

    handler:
      rateLimitHandler(
        "Too many login attempts"
      )

  });

// ======================================
// EXPORTS
// ======================================

module.exports = {

  globalLimiter,

  chatLimiter,

  authLimiter

};
