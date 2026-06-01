// ======================================
// utils/encryption.js
// Layboka AI Encryption Utilities
// updated 1 Jin, 2026
// ======================================

const crypto = require("crypto");

const SECRET_KEY = crypto
  .createHash("sha256")
  .update(
    process.env.ENCRYPTION_SECRET ||
    "layboka_encryption_key"
  )
  .digest();

const IV_LENGTH = 16;

// ======================================
// ENCRYPT
// ======================================

function encrypt(text){

  try{

    const iv =
      crypto.randomBytes(
        IV_LENGTH
      );

    const cipher =
      crypto.createCipheriv(
        "aes-256-gcm",
        SECRET_KEY,
        iv
      );

    let encrypted =
      cipher.update(
        text,
        "utf8",
        "hex"
      );

    encrypted +=
      cipher.final("hex");

    const authTag =
      cipher.getAuthTag();

    return [

      iv.toString("hex"),

      authTag.toString("hex"),

      encrypted

    ].join(":");

  }catch(err){

    console.log(
      "ENCRYPT ERROR:",
      err.message
    );

    return null;

  }

}

// ======================================
// DECRYPT
// ======================================

function decrypt(text){

  try{

    const parts =
      text.split(":");

    const iv =
      Buffer.from(
        parts[0],
        "hex"
      );

    const authTag =
      Buffer.from(
        parts[1],
        "hex"
      );

    const encrypted =
      parts[2];

    const decipher =
      crypto.createDecipheriv(
        "aes-256-gcm",
        SECRET_KEY,
        iv
      );

    decipher.setAuthTag(
      authTag
    );

    let decrypted =
      decipher.update(
        encrypted,
        "hex",
        "utf8"
      );

    decrypted +=
      decipher.final(
        "utf8"
      );

    return decrypted;

  }catch(err){

    console.log(
      "DECRYPT ERROR:",
      err.message
    );

    return null;

  }

}

// ======================================
// EXPORTS
// ======================================

module.exports = {

  encrypt,
  decrypt

};
