// ======================================
// utils/email.js
// Layboka AI Email Service
// updated 1 Jun, 2026
// ======================================

const nodemailer = require("nodemailer");

// ======================================
// TRANSPORTER
// ======================================

const transporter = nodemailer.createTransport({

  host:
    process.env.EMAIL_HOST ||
    "smtp.gmail.com",

  port:
    Number(
      process.env.EMAIL_PORT
    ) || 587,

  secure:false,

  auth:{

    user:
      process.env.EMAIL_USER,

    pass:
      process.env.EMAIL_PASS

  }

});

// ======================================
// SEND EMAIL
// ======================================

async function sendEmail(

  to,
  subject,
  html

){

  try{

    const result =
      await transporter.sendMail({

        from:
          process.env.EMAIL_FROM ||
          process.env.EMAIL_USER,

        to,

        subject,

        html

      });

    return {

      success:true,

      messageId:
        result.messageId

    };

  }catch(err){

    console.log(
      "EMAIL ERROR:",
      err.message
    );

    return {

      success:false,

      error:
        err.message

    };

  }

}

// ======================================
// EXPORT
// ======================================

module.exports =
  sendEmail;
