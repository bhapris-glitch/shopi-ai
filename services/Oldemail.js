// ======================================
// services/email.js
// Production Email Service
// Abandoned Cart + Payment + AI Sales
// ======================================

require("dotenv").config();

const nodemailer = require("nodemailer");

// ======================================
// MAIL TRANSPORTER
// ======================================

const transporter = nodemailer.createTransport({

  host: process.env.EMAIL_HOST,

  port: process.env.EMAIL_PORT,

  secure: false,

  auth: {

    user: process.env.EMAIL_USER,

    pass: process.env.EMAIL_PASS

  }

});

// ======================================
// VERIFY SMTP
// ======================================

transporter.verify((err)=>{

  if(err){

    console.log(
      "❌ Email SMTP Error:",
      err.message
    );

  }else{

    console.log(
      "✅ Email SMTP Connected"
    );

  }

});

// ======================================
// BASE TEMPLATE
// ======================================

function template(title,content){

  return `

<div style="
background:#f4f7fb;
padding:40px;
font-family:Arial;
">

<div style="
max-width:650px;
margin:auto;
background:#ffffff;
border-radius:24px;
overflow:hidden;
box-shadow:0 10px 40px rgba(0,0,0,0.08);
">

<div style="
padding:35px;
background:linear-gradient(135deg,#00ffc3,#00aaff);
color:#000;
font-size:30px;
font-weight:bold;
">
🚀 Layboka AI
</div>

<div style="padding:40px;">

<h1 style="
margin-top:0;
font-size:28px;
color:#111827;
">
${title}
</h1>

<div style="
font-size:16px;
line-height:1.8;
color:#4b5563;
">
${content}
</div>

</div>

<div style="
padding:20px;
text-align:center;
font-size:13px;
background:#f9fafb;
color:#6b7280;
">
© 2026 Layboka AI • All Rights Reserved
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
  html

}){

  try{

    const info =
      await transporter.sendMail({

        from:
          `"Layboka AI" <${process.env.EMAIL_USER}>`,

        to,

        subject,

        html

      });

    console.log(
      "✅ Email Sent:",
      info.messageId
    );

    return {

      success:true

    };

  }catch(err){

    console.log(
      "❌ Email Error:",
      err.message
    );

    return {

      success:false

    };

  }

}

// ======================================
// ABANDONED CART EMAIL
// ======================================

async function sendCartRecovery({

  email,
  customerName,
  productTitle,
  checkoutUrl,
  discountCode

}){

  const html = template(

    "🛒 Your Cart Is Waiting",

    `

<p>
Hi ${customerName || "there"},
</p>

<p>
You left
<b>${productTitle || "products"}</b>
in your cart.
</p>

<p>
🔥 Complete checkout now before
stock runs out.
</p>

<p>
🎁 Discount Code:
<b>${discountCode || "SAVE10"}</b>
</p>

<a href="${checkoutUrl}"
style="
display:inline-block;
margin-top:20px;
padding:16px 28px;
background:linear-gradient(135deg,#00ffc3,#00aaff);
border-radius:14px;
text-decoration:none;
color:#000;
font-weight:bold;
">
⚡ Complete Checkout
</a>

`

  );

  return await sendEmail({

    to:email,

    subject:"🛒 Complete Your Checkout",

    html

  });

}

// ======================================
// PAYMENT SUCCESS EMAIL
// ======================================

async function sendPaymentSuccess({

  email,
  customerName,
  amount,
  plan

}){

  const html = template(

    "💳 Payment Successful",

    `

<p>
Hi ${customerName || "there"},
</p>

<p>
Your payment of
<b>₹${amount}</b>
was successful.
</p>

<p>
✅ Your
<b>${plan}</b>
plan is now active.
</p>

<p>
🚀 Your AI Sales Agent is ready.
</p>

<a href="${process.env.BASE_URL}/dashboard.html"
style="
display:inline-block;
margin-top:20px;
padding:16px 28px;
background:#111827;
border-radius:14px;
text-decoration:none;
color:#fff;
font-weight:bold;
">
Open Dashboard
</a>

`

  );

  return await sendEmail({

    to:email,

    subject:"🚀 Your AI Agent Is Live",

    html

  });

}

// ======================================
// SUBSCRIPTION RENEWAL EMAIL
// ======================================

async function sendRenewalReminder({

  email,
  customerName,
  renewDate,
  paymentUrl

}){

  const html = template(

    "⚠️ Subscription Renewal Reminder",

    `

<p>
Hi ${customerName || "there"},
</p>

<p>
Your Layboka AI subscription
renews on:
</p>

<h2>
${renewDate}
</h2>

<p>
Please ensure autopay is active
to avoid chatbot interruption.
</p>

<a href="${paymentUrl}"
style="
display:inline-block;
margin-top:20px;
padding:16px 28px;
background:linear-gradient(135deg,#00ffc3,#00aaff);
border-radius:14px;
text-decoration:none;
color:#000;
font-weight:bold;
">
💳 Manage Subscription
</a>

`

  );

  return await sendEmail({

    to:email,

    subject:"⚠️ Subscription Renewal",

    html

  });

}

// ======================================
// AI SALES PUSH EMAIL
// ======================================

async function sendSalesPush({

  email,
  customerName,
  product,
  checkoutUrl

}){

  const html = template(

    "🔥 Trending Product Alert",

    `

<p>
Hi ${customerName || "there"},
</p>

<p>
Customers are buying:
</p>

<h2>
${product}
</h2>

<p>
⚡ Don’t miss out before
stock runs out.
</p>

<a href="${checkoutUrl}"
style="
display:inline-block;
margin-top:20px;
padding:16px 28px;
background:linear-gradient(135deg,#00ffc3,#00aaff);
border-radius:14px;
text-decoration:none;
color:#000;
font-weight:bold;
">
🛍 Buy Now
</a>

`

  );

  return await sendEmail({

    to:email,

    subject:"🔥 Selling Fast — Grab Yours",

    html

  });

}

// ======================================
// CONTACT FORM EMAIL
// ======================================

async function sendContactForm({

  name,
  email,
  message

}){

  const html = template(

    "📩 New Contact Form Submission",

    `

<p>
<b>Name:</b>
${name}
</p>

<p>
<b>Email:</b>
${email}
</p>

<p>
<b>Message:</b>
</p>

<p>
${message}
</p>

`

  );

  return await sendEmail({

    to:process.env.ADMIN_EMAIL,

    subject:"📩 New Contact Form",

    html

  });

}

// ======================================
// EXPORTS
// ======================================

module.exports = {

  sendEmail,

  sendCartRecovery,

  sendPaymentSuccess,

  sendRenewalReminder,

  sendSalesPush,

  sendContactForm

};
