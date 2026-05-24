// ======================================
// utils/encryption.js
// Layboka AI Encryption Utilities
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
      crypto.randomBytes(IV_LENGTH);

    const cipher =
      crypto.createCipheriv(
        "aes-256-cbc",
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

    return (
      iv.toString("hex") +
      ":" +
      encrypted
    );

  }catch(err){

    console.log(
      "ENCRYPT ERROR:",
      err
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
        parts.shift(),
        "hex"
      );

    const encryptedText =
      parts.join(":");

    const decipher =
      crypto.createDecipheriv(
        "aes-256-cbc",
        SECRET_KEY,
        iv
      );

    let decrypted =
      decipher.update(
        encryptedText,
        "hex",
        "utf8"
      );

    decrypted +=
      decipher.final("utf8");

    return decrypted;

  }catch(err){

    console.log(
      "DECRYPT ERROR:",
      err
    );

    return null;

  }

}

module.exports = {

  encrypt,
  decrypt

};
