// ======================================
// middleware/auth.js
// Layboka AI Auth Middleware
// ======================================

const {
  verifyToken
} = require("../utils/jwt");

// ======================================
// AUTH MIDDLEWARE
// ======================================

module.exports = async(
  req,
  res,
  next
)=>{

  try{

    const authHeader =

      req.headers.authorization ||

      "";

    const token =
      authHeader.replace(
        "Bearer ",
        ""
      );

    if(!token){

      return res.status(401)
      .json({

        success:false,

        message:
          "Unauthorized"

      });

    }

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

    res.status(500).json({

      success:false,

      message:
        "Authentication failed"

    });

  }

};
