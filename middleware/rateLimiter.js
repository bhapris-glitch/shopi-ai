// ======================================
// middleware/rateLimiter.js
// Production Rate Limiter
// AI Chat Protection + API Security
// ======================================

const rateLimit = require("express-rate-limit");

// ======================================
// GLOBAL API LIMITER
// ======================================

const apiLimiter = rateLimit({

  windowMs:
    15 * 60 * 1000,

  max: 300,

  standardHeaders: true,

  legacyHeaders: false,

  message: {

    success:false,

    message:
      "⚠️ Too many requests. Please try again later."

  }

});

// ======================================
// CHAT LIMITER
// AI CHAT PROTECTION
// ======================================

const chatLimiter = rateLimit({

  windowMs:
    1 * 60 * 1000,

  max: 25,

  standardHeaders: true,

  legacyHeaders: false,

  keyGenerator:(req)=>{

    return (

      req.body.clientId ||

      req.ip

    );

  },

  message: {

    success:false,

    locked:true,

    reply:
      "⚠️ Too many AI messages. Please wait a moment."

  }

});

// ======================================
// PAYMENT LIMITER
// Prevent Payment Spam
// ======================================

const paymentLimiter = rateLimit({

  windowMs:
    10 * 60 * 1000,

  max: 10,

  standardHeaders: true,

  legacyHeaders: false,

  message: {

    success:false,

    message:
      "⚠️ Too many payment attempts."

  }

});

// ======================================
// LOGIN LIMITER
// ======================================

const loginLimiter = rateLimit({

  windowMs:
    15 * 60 * 1000,

  max: 10,

  standardHeaders: true,

  legacyHeaders: false,

  message: {

    success:false,

    message:
      "⚠️ Too many login attempts."

  }

});

// ======================================
// CONTACT FORM LIMITER
// ======================================

const contactLimiter = rateLimit({

  windowMs:
    60 * 60 * 1000,

  max: 5,

  standardHeaders: true,

  legacyHeaders: false,

  message: {

    success:false,

    message:
      "⚠️ Too many contact requests."

  }

});

// ======================================
// WEBHOOK LIMITER
// ======================================

const webhookLimiter = rateLimit({

  windowMs:
    1 * 60 * 1000,

  max: 100,

  standardHeaders: true,

  legacyHeaders: false,

  message: {

    success:false,

    message:
      "⚠️ Webhook limit exceeded."

  }

});

// ======================================
// AI SALES LIMITER
// ======================================

const aiSalesLimiter = rateLimit({

  windowMs:
    5 * 60 * 1000,

  max: 50,

  standardHeaders: true,

  legacyHeaders: false,

  message: {

    success:false,

    reply:
      "⚠️ AI sales system busy. Try again."

  }

});

// ======================================
// EXPORTS
// ======================================

module.exports = {

  apiLimiter,

  chatLimiter,

  paymentLimiter,

  loginLimiter,

  contactLimiter,

  webhookLimiter,

  aiSalesLimiter

};
