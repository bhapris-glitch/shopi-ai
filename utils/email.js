// ======================================
// utils/email.js
// Layboka AI Email Service
// Production Ready
// Updated 1 Jun 2026
// ======================================

require("dotenv").config();

const nodemailer = require("nodemailer");

// ======================================
// SMTP CONFIG
// ======================================

const transporter = nodemailer.createTransport({

  host:
    process.env.EMAIL_HOST ||
    "smtp.gmail.com",

  port:
    Number(process.env.EMAIL_PORT) || 587,

  secure:
    Number(process.env.EMAIL_PORT) === 465,

  auth: {

    user:
      process.env.EMAIL_USER,

    pass:
      process.env.EMAIL_PASS

  }

});

// ======================================
// VERIFY CONNECTION
// ======================================

async function verifyEmailConnection(){

  try{

    await transporter.verify();

    console.log(
      "📧 Email server connected"
    );

    return true;

  }catch(err){

    console.log(
      "❌ Email connection failed:",
      err.message
    );

    return false;

  }

}

// ======================================
// SEND EMAIL
// ======================================

async function sendEmail({

  to,
  subject,
  html,
  text = "",
  attachments = []

}){

  try{

    const result =
      await transporter.sendMail({

        from:

          process.env.EMAIL_FROM ||

          `"Layboka AI" <${process.env.EMAIL_USER}>`,

        to,

        subject,

        html,

        text,

        attachments

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
// SEND RECOVERY EMAIL
// ======================================

async function sendRecoveryEmail({

  to,
  name = "Customer",
  store = "Store",
  recoveryUrl,
  secondReminder = false

}){

  try{

    const subject = secondReminder

      ? `⏰ Last Chance To Complete Your Order`

      : `🛒 You Left Something Behind`;

    const html = `

      <div style="font-family:Arial;padding:20px;">

        <h2>Hello ${name},</h2>

        <p>
          You left items in your cart at
          <strong>${store}</strong>.
        </p>

        <p>
          Complete your order before it expires.
        </p>

        <a
          href="${recoveryUrl}"
          style="
            display:inline-block;
            padding:12px 20px;
            background:#000;
            color:#fff;
            text-decoration:none;
            border-radius:8px;
          "
        >
          Complete Order
        </a>

      </div>

    `;

    return await sendEmail({

      to,

      subject,

      html

    });

  }catch(err){

    console.log(
      "Recovery Email Error:",
      err.message
    );

    return {

      success:false

    };

  }

}

// ======================================
// SEND REFERRAL EMAIL
// ======================================

async function sendReferralEmail({

  to,
  name,
  referralLink

}){

  const html = `

    <h2>Hello ${name}</h2>

    <p>
      Invite friends and earn rewards.
    </p>

    <p>

      <a href="${referralLink}">
        ${referralLink}
      </a>

    </p>

  `;

  return sendEmail({

    to,

    subject:
      "🎁 Your Referral Rewards",

    html

  });

}

// ======================================
// SEND SUBSCRIPTION EMAIL
// ======================================

async function sendSubscriptionEmail({

  to,
  plan,
  amount

}){

  const html = `

    <h2>Subscription Activated</h2>

    <p>
      Plan:
      <strong>${plan}</strong>
    </p>

    <p>
      Amount:
      <strong>${amount}</strong>
    </p>

  `;

  return sendEmail({

    to,

    subject:
      "✅ Subscription Activated",

    html

  });

}

// ======================================
// EXPORTS
// ======================================

module.exports = {

  sendEmail,

  sendRecoveryEmail,

  sendReferralEmail,

  sendSubscriptionEmail,

  verifyEmailConnection

};
