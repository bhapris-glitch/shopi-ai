// ======================================
// middleware/rateLimiter.js
// Layboka AI Rate Limiter
// ======================================

const rateLimit =
  require("express-rate-limit");

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

    message:{

      success:false,

      message:
        "Too many requests"

    }

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

    message:{

      success:false,

      message:
        "Chat limit exceeded"

    }

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

    message:{

      success:false,

      message:
        "Too many login attempts"

    }

  });

module.exports = {

  globalLimiter,
  chatLimiter,
  authLimiter

};
