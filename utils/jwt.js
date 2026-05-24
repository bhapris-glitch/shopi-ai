// ======================================
// utils/jwt.js
// Layboka AI JWT Utilities
// ======================================

const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "layboka_super_secret";

// ======================================
// CREATE TOKEN
// ======================================

function createToken(payload){

  return jwt.sign(

    payload,

    JWT_SECRET,

    {
      expiresIn:"30d"
    }

  );

}

// ======================================
// VERIFY TOKEN
// ======================================

function verifyToken(token){

  try{

    return jwt.verify(
      token,
      JWT_SECRET
    );

  }catch(err){

    return null;

  }

}

// ======================================
// DECODE TOKEN
// ======================================

function decodeToken(token){

  try{

    return jwt.decode(token);

  }catch(err){

    return null;

  }

}

module.exports = {

  createToken,
  verifyToken,
  decodeToken

};
