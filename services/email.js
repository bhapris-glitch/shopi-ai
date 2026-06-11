// ======================================
// services/email.js
// Layboka AI Email Service
// SMTP + Templates
// Production Ready
// Updated Jun 2026 - PART 1
// ======================================

const nodemailer = require("nodemailer");

// ======================================
// TRANSPORTER
// ======================================

let transporter = null;

// ======================================
// CREATE TRANSPORTER
// ======================================

function getTransporter() {

  if (transporter) {
    return transporter;
  }

  transporter =
    nodemailer.createTransport({

      host:
        process.env.EMAIL_HOST,

      port:
        Number(
          process.env.EMAIL_PORT || 587
        ),

      secure:
        Number(
          process.env.EMAIL_PORT
        ) === 465,

      auth: {

        user:
          process.env.EMAIL_USER,

        pass:
          process.env.EMAIL_PASS

      }

    });

  return transporter;

}

// ======================================
// VERIFY SMTP
// ======================================

async function verifySMTP() {

  try {

    await getTransporter().verify();

    console.log(
      "✅ SMTP Connected"
    );

    return true;

  } catch (err) {

    console.log(
      "❌ SMTP Error:",
      err.message
    );

    return false;

  }

}

// ======================================
// MAIN TEMPLATE
// ======================================

function template(
  title,
  content
) {

  return `

  <div style="
  background:#f5f7fb;
  padding:40px;
  font-family:
  Arial,
  Helvetica,
  sans-serif;
  ">

    <div style="
    max-width:700px;
    margin:auto;
    background:#ffffff;
    border-radius:18px;
    overflow:hidden;
    box-shadow:
    0 8px 30px rgba(0,0,0,.08);
    ">

      <!-- HEADER -->

      <div style="
      padding:28px;
      background:#111827;
      color:#ffffff;
      font-size:26px;
      font-weight:700;
      ">
      🚀 Layboka AI
      </div>

      <!-- BODY -->

      <div style="
      padding:35px;
      color:#111827;
      font-size:16px;
      line-height:1.7;
      ">

        <h2 style="
        margin-top:0;
        color:#111827;
        ">
        ${title}
        </h2>

        ${content}

      </div>

      <!-- FOOTER -->

      <div style="
      padding:20px;
      background:#f9fafb;
      text-align:center;
      font-size:13px;
      color:#6b7280;
      ">

      Layboka AI • Shopify AI Sales Agent

      <br>

      ${process.env.BASE_URL || ""}

      </div>

    </div>

  </div>

  `;

}

// ======================================
// SEND EMAIL
// ======================================

async function sendEmail({

  to,
  subject,
  html,
  text

}) {

  try {

    if (!to) {

      return {

        success: false,

        error:
          "Recipient missing"

      };

    }

    const mailOptions = {

      from:
        `"Layboka AI" <${process.env.EMAIL_USER}>`,

      to,

      subject,

      html,

      text:
        text ||
        subject

    };

    const info =
      await getTransporter()
      .sendMail(
        mailOptions
      );

    console.log(
      `📧 Email Sent: ${to}`
    );

    return {

      success: true,

      messageId:
        info.messageId

    };

  } catch (err) {

    console.log(
      "EMAIL ERROR:",
      err.message
    );

    return {

      success: false,

      error:
        err.message

    };

  }

}
// ======================================
// CART RECOVERY - PART - 2
// ======================================

async function sendCartRecovery({

  email,
  customerName,
  productTitle,
  checkoutUrl,
  discountCode

}) {

  return sendEmail({

    to: email,

    subject:
      "🛒 You left something behind",

    html: template(

      "Complete Your Checkout",

      `

      <p>
      Hi ${customerName || "there"},
      </p>

      <p>
      You left
      <strong>${productTitle}</strong>
      in your cart.
      </p>

      <p>
      Discount Code:
      <strong>
      ${discountCode || "SAVE10"}
      </strong>
      </p>

      <p>

      <a href="${checkoutUrl}"
      style="
      background:#111827;
      color:#fff;
      padding:12px 18px;
      text-decoration:none;
      border-radius:10px;
      ">
      Complete Checkout
      </a>

      </p>

      `

    )

  });

}

// ======================================
// PAYMENT SUCCESS
// ======================================

async function sendPaymentSuccess({

  email,
  customerName,
  amount,
  plan

}) {

  return sendEmail({

    to: email,

    subject:
      "✅ Payment Successful",

    html: template(

      "Payment Received",

      `

      <p>
      Hi ${customerName || "there"},
      </p>

      <p>
      Your payment was received.
      </p>

      <p>

      Amount:
      <strong>
      $${amount}
      </strong>

      </p>

      <p>

      Plan:
      <strong>
      ${plan}
      </strong>

      </p>

      <p>
      Your Layboka AI account
      is now active.
      </p>

      `

    )

  });

}

// ======================================
// PAYMENT FAILED
// ======================================

async function sendPaymentFailed({

  email,
  customerName,
  billingUrl

}) {

  return sendEmail({

    to: email,

    subject:
      "⚠ Payment Failed",

    html: template(

      "Payment Failed",

      `

      <p>
      Hi ${customerName || "there"},
      </p>

      <p>
      We could not process
      your latest payment.
      </p>

      <p>
      Your AI chatbot may
      become unavailable if
      billing is not updated.
      </p>

      <p>

      <a href="${billingUrl}"
      style="
      background:#dc2626;
      color:#fff;
      padding:12px 18px;
      text-decoration:none;
      border-radius:10px;
      ">
      Update Billing
      </a>

      </p>

      `

    )

  });

}

// ======================================
// TRIAL EXPIRED
// ======================================

async function sendTrialExpired({

  email,
  customerName,
  pricingUrl

}) {

  return sendEmail({

    to: email,

    subject:
      "🚀 Your Trial Has Ended",

    html: template(

      "Trial Expired",

      `

      <p>
      Hi ${customerName || "there"},
      </p>

      <p>
      Your Layboka AI free trial
      has ended.
      </p>

      <p>
      Upgrade now to continue:

      <ul>
        <li>AI Sales Agent</li>
        <li>Checkout Closer</li>
        <li>Cart Recovery</li>
        <li>Revenue Tracking</li>
      </ul>

      </p>

      <p>

      <a href="${pricingUrl}"
      style="
      background:#111827;
      color:#fff;
      padding:12px 18px;
      text-decoration:none;
      border-radius:10px;
      ">
      View Plans
      </a>

      </p>

      `

    )

  });

}

// ======================================
// SUBSCRIPTION CANCELLED
// ======================================

async function sendSubscriptionCancelled({

  email,
  customerName,
  reActivateUrl

}) {

  return sendEmail({

    to: email,

    subject:
      "Subscription Cancelled",

    html: template(

      "We're Sorry To See You Go",

      `

      <p>
      Hi ${customerName || "there"},
      </p>

      <p>
      Your Layboka AI subscription
      has been cancelled.
      </p>

      <p>
      Your account features will
      remain available until the
      current billing cycle ends.
      </p>

      <p>

      <a href="${reActivateUrl}"
      style="
      background:#111827;
      color:#fff;
      padding:12px 18px;
      text-decoration:none;
      border-radius:10px;
      ">
      Reactivate Subscription
      </a>

      </p>

      `

    )

  });

    }
// ======================================
// RENEWAL REMINDER - PART - 3
// ======================================

async function sendRenewalReminder({

  email,
  customerName,
  renewalDate,
  billingUrl

}) {

  return sendEmail({

    to: email,

    subject:
      "⏰ Subscription Renewal Reminder",

    html: template(

      "Renewal Reminder",

      `

      <p>
      Hi ${customerName || "there"},
      </p>

      <p>
      Your Layboka AI subscription
      renews on:
      </p>

      <p>
      <strong>
      ${renewalDate}
      </strong>
      </p>

      <p>
      No action is required if
      auto-renew is enabled.
      </p>

      <p>

      <a href="${billingUrl}"
      style="
      background:#111827;
      color:#fff;
      padding:12px 18px;
      border-radius:10px;
      text-decoration:none;
      ">
      Manage Subscription
      </a>

      </p>

      `

    )

  });

}

// ======================================
// RENEWAL SUCCESS
// ======================================

async function sendRenewalSuccess({

  email,
  customerName,
  plan,
  amount

}) {

  return sendEmail({

    to: email,

    subject:
      "✅ Subscription Renewed",

    html: template(

      "Renewal Successful",

      `

      <p>
      Hi ${customerName || "there"},
      </p>

      <p>
      Your subscription has been
      successfully renewed.
      </p>

      <p>

      Plan:
      <strong>${plan}</strong>

      </p>

      <p>

      Amount:
      <strong>$${amount}</strong>

      </p>

      <p>
      Your chatbot remains active.
      </p>

      `

    )

  });

}

// ======================================
// RENEWAL FAILURE
// ======================================

async function sendRenewalFailure({

  email,
  customerName,
  billingUrl

}) {

  return sendEmail({

    to: email,

    subject:
      "⚠ Renewal Payment Failed",

    html: template(

      "Renewal Failed",

      `

      <p>
      Hi ${customerName || "there"},
      </p>

      <p>
      We couldn't process your
      subscription renewal payment.
      </p>

      <p>
      Your account has entered
      grace period mode.
      </p>

      <p>
      Please update billing to
      avoid service interruption.
      </p>

      <p>

      <a href="${billingUrl}"
      style="
      background:#dc2626;
      color:#fff;
      padding:12px 18px;
      border-radius:10px;
      text-decoration:none;
      ">
      Update Billing
      </a>

      </p>

      `

    )

  });

}

// ======================================
// SUBSCRIPTION PAUSED
// ======================================

async function sendSubscriptionPaused({

  email,
  customerName,
  resumeUrl

}) {

  return sendEmail({

    to: email,

    subject:
      "⏸ Subscription Paused",

    html: template(

      "Subscription Paused",

      `

      <p>
      Hi ${customerName || "there"},
      </p>

      <p>
      Your Layboka AI subscription
      has been paused.
      </p>

      <p>
      AI services may be unavailable
      until the subscription resumes.
      </p>

      <p>

      <a href="${resumeUrl}"
      style="
      background:#111827;
      color:#fff;
      padding:12px 18px;
      border-radius:10px;
      text-decoration:none;
      ">
      Resume Subscription
      </a>

      </p>

      `

    )

  });

}

// ======================================
// SUBSCRIPTION RESUMED
// ======================================

async function sendSubscriptionResumed({

  email,
  customerName

}) {

  return sendEmail({

    to: email,

    subject:
      "▶ Subscription Resumed",

    html: template(

      "Welcome Back",

      `

      <p>
      Hi ${customerName || "there"},
      </p>

      <p>
      Your subscription has been
      successfully resumed.
      </p>

      <p>
      All Layboka AI services are
      now active again.
      </p>

      <p>
      Thank you for continuing
      with us.
      </p>

      `

    )

  });

}
// ======================================
// SALES PUSH - PART - 4
// ======================================

async function sendSalesPush({

  email,
  customerName,
  productTitle,
  productUrl,
  price

}) {

  return sendEmail({

    to: email,

    subject:
      `🔥 Trending: ${productTitle}`,

    html: template(

      "Recommended For You",

      `

      <p>
      Hi ${customerName || "there"},
      </p>

      <p>
      One of our most popular
      products right now:
      </p>

      <p>

      <strong>
      ${productTitle}
      </strong>

      </p>

      <p>

      Price:
      <strong>
      $${price}
      </strong>

      </p>

      <p>

      <a href="${productUrl}"
      style="
      background:#111827;
      color:#ffffff;
      padding:12px 18px;
      border-radius:10px;
      text-decoration:none;
      ">
      View Product
      </a>

      </p>

      `

    )

  });

}

// ======================================
// AI RECOMMENDATION
// ======================================

async function sendAIRecommendation({

  email,
  customerName,
  recommendation,
  productUrl

}) {

  return sendEmail({

    to: email,

    subject:
      "🤖 AI Product Recommendation",

    html: template(

      "Picked By Layboka AI",

      `

      <p>
      Hi ${customerName || "there"},
      </p>

      <p>
      Based on browsing behavior,
      our AI recommends:
      </p>

      <p>

      <strong>
      ${recommendation}
      </strong>

      </p>

      <p>

      <a href="${productUrl}"
      style="
      background:#111827;
      color:#fff;
      padding:12px 18px;
      border-radius:10px;
      text-decoration:none;
      ">
      View Recommendation
      </a>

      </p>

      `

    )

  });

}

// ======================================
// AI ABANDONED CART
// ======================================

async function sendAbandonedCartAI({

  email,
  customerName,
  cartValue,
  checkoutUrl,
  discountCode

}) {

  return sendEmail({

    to: email,

    subject:
      "🛒 Your Cart Is Waiting",

    html: template(

      "Complete Your Purchase",

      `

      <p>
      Hi ${customerName || "there"},
      </p>

      <p>
      You still have items waiting
      in your cart.
      </p>

      <p>

      Cart Value:
      <strong>
      $${cartValue}
      </strong>

      </p>

      <p>

      Discount Code:
      <strong>
      ${discountCode || "SAVE10"}
      </strong>

      </p>

      <p>

      <a href="${checkoutUrl}"
      style="
      background:#16a34a;
      color:#fff;
      padding:12px 18px;
      border-radius:10px;
      text-decoration:none;
      ">
      Complete Checkout
      </a>

      </p>

      `

    )

  });

}

// ======================================
// VIP OFFER
// ======================================

async function sendVIPOffer({

  email,
  customerName,
  offerTitle,
  offerDescription,
  offerUrl

}) {

  return sendEmail({

    to: email,

    subject:
      "⭐ Exclusive VIP Offer",

    html: template(

      "VIP Member Reward",

      `

      <p>
      Hi ${customerName || "there"},
      </p>

      <p>

      <strong>
      ${offerTitle}
      </strong>

      </p>

      <p>
      ${offerDescription}
      </p>

      <p>

      <a href="${offerUrl}"
      style="
      background:#7c3aed;
      color:#fff;
      padding:12px 18px;
      border-radius:10px;
      text-decoration:none;
      ">
      Claim Offer
      </a>

      </p>

      `

    )

  });

        }
// ======================================
// CONTACT FORM - PART - 5
// ======================================

async function sendContactForm({

  name,
  email,
  message

}) {

  return sendEmail({

    to:
      process.env.ADMIN_EMAIL,

    subject:
      "📩 New Contact Form Submission",

    html: template(

      "New Contact Request",

      `

      <p>
      <strong>Name:</strong>
      ${name}
      </p>

      <p>
      <strong>Email:</strong>
      ${email}
      </p>

      <p>
      <strong>Message:</strong>
      </p>

      <p>
      ${message}
      </p>

      `

    )

  });

}

// ======================================
// ENTERPRISE LEAD
// ======================================

async function sendEnterpriseLead({

  company,
  name,
  email,
  phone,
  message

}) {

  return sendEmail({

    to:
      process.env.ADMIN_EMAIL,

    subject:
      "🏢 New Enterprise Lead",

    html: template(

      "Enterprise Inquiry",

      `

      <p>
      <strong>Company:</strong>
      ${company}
      </p>

      <p>
      <strong>Name:</strong>
      ${name}
      </p>

      <p>
      <strong>Email:</strong>
      ${email}
      </p>

      <p>
      <strong>Phone:</strong>
      ${phone || "N/A"}
      </p>

      <p>
      <strong>Message:</strong>
      </p>

      <p>
      ${message || ""}
      </p>

      `

    )

  });

}

// ======================================
// NEW CLIENT ALERT
// ======================================

async function sendNewClientAlert({

  store,
  email,
  plan

}) {

  return sendEmail({

    to:
      process.env.ADMIN_EMAIL,

    subject:
      "🎉 New Layboka Client",

    html: template(

      "New Store Registered",

      `

      <p>
      <strong>Store:</strong>
      ${store}
      </p>

      <p>
      <strong>Email:</strong>
      ${email}
      </p>

      <p>
      <strong>Plan:</strong>
      ${plan}
      </p>

      <p>
      A new merchant has joined
      Layboka AI.
      </p>

      `

    )

  });

}

// ======================================
// SYSTEM ALERT
// ======================================

async function sendSystemAlert({

  title,
  error,
  server,
  severity

}) {

  return sendEmail({

    to:
      process.env.ADMIN_EMAIL,

    subject:
      `🚨 SYSTEM ALERT - ${severity || "HIGH"}`,

    html: template(

      title || "System Alert",

      `

      <p>
      <strong>Severity:</strong>
      ${severity || "HIGH"}
      </p>

      <p>
      <strong>Server:</strong>
      ${server || "Production"}
      </p>

      <p>
      <strong>Error:</strong>
      </p>

      <pre style="
      background:#f3f4f6;
      padding:15px;
      border-radius:10px;
      overflow:auto;
      ">
${error}
      </pre>

      `

    )

  });

    }
// ======================================
// EXPORTS PART - 6
// ======================================

module.exports = {

  // SMTP
  verifySMTP,

  // Core
  sendEmail,

  // Cart Recovery
  sendCartRecovery,
  sendAbandonedCartAI,

  // Payments
  sendPaymentSuccess,
  sendPaymentFailed,

  // Trial
  sendTrialExpired,

  // Subscription
  sendSubscriptionCancelled,
  sendRenewalReminder,
  sendRenewalSuccess,
  sendRenewalFailure,
  sendSubscriptionPaused,
  sendSubscriptionResumed,

  // Revenue
  sendSalesPush,
  sendAIRecommendation,
  sendVIPOffer,

  // Admin
  sendContactForm,
  sendEnterpriseLead,
  sendNewClientAlert,
  sendSystemAlert

};
