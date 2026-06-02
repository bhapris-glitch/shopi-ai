
// ======================================
// middleware/auth.js
// Layboka AI Auth Middleware
// updated 2 Jun 2026
// ======================================

const {
  verifyToken
} = require("../utils/jwt");

// ======================================
// AUTH MIDDLEWARE
// ======================================

module.exports = (
  req,
  res,
  next
)=>{

  try{

    const authHeader =

      req.headers.authorization ||

      "";

    // ======================================
    // EXTRACT TOKEN
    // ======================================

    const token =

      authHeader
        .replace(/^Bearer\s+/i, "")
        .trim();

    if(!token){

      return res.status(401)
      .json({

        success:false,

        message:
          "Unauthorized"

      });

    }

    // ======================================
    // VERIFY TOKEN
    // ======================================

    const decoded =
      verifyToken(token);

    if(!decoded){

      return res.status(401)
      .json({

        success:false,

        message:
          "Invalid token"

      });

    }

    req.user = decoded;

    next();

  }catch(err){

    console.log(
      "AUTH ERROR:",
      err
    );

    return res.status(500)
    .json({

      success:false,

      message:
        "Authentication failed"

    });

  }

};
