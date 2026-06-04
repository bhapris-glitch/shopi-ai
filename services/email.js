//===============================
//services/email.js
// Layboka 
// Updated 04 Jun 2026
//==============================
const nodemailer = require("nodemailer");

let transporter = null;

// ======================================
// CREATE TRANSPORTER
// ======================================

function getTransporter() {

if (transporter) {
return transporter;
}

transporter = nodemailer.createTransport({

```
host: process.env.EMAIL_HOST,

port: Number(
  process.env.EMAIL_PORT || 587
),

secure:
  Number(process.env.EMAIL_PORT) === 465,

auth: {

  user: process.env.EMAIL_USER,

  pass: process.env.EMAIL_PASS

}
```

});

return transporter;
}

// ======================================
// VERIFY SMTP
// ======================================

async function verifySMTP() {

try {

```
await getTransporter().verify();

console.log(
  "✅ SMTP Connected"
);

return true;
```

} catch (err) {

```
console.log(
  "❌ SMTP Error:",
  err.message
);

return false;
```

}

}

// ======================================
// TEMPLATE
// ======================================

function template(title, content) {

return `

<div style="
background:#f4f7fb;
padding:30px;
font-family:Arial,sans-serif;
">

<div style="
max-width:650px;
margin:auto;
background:#ffffff;
border-radius:18px;
overflow:hidden;
">

<div style="
padding:25px;
background:#111827;
color:#fff;
font-size:24px;
font-weight:bold;
">
🚀 Layboka AI
</div>

<div style="
padding:30px;
">

<h2>${title}</h2>

${content}

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

```
if (!to) {

  return {

    success: false,

    error: "Missing recipient"

  };

}

const info =
  await getTransporter()
  .sendMail({

    from:
      `"Layboka AI" <${process.env.EMAIL_USER}>`,

    to,

    subject,

    html,

    text:
      text ||
      subject

  });

return {

  success: true,

  messageId:
    info.messageId

};
```

} catch (err) {

```
console.log(
  "EMAIL ERROR:",
  err.message
);

return {

  success: false,

  error:
    err.message

};
```

}

}

// ======================================
// CART RECOVERY
// ======================================

async function sendCartRecovery({

email,
customerName,
productTitle,
checkoutUrl,
discountCode

}) {

return sendEmail({

```
to: email,

subject:
  "🛒 Complete Your Checkout",

html: template(

  "Cart Reminder",

  `
```

<p>
Hi ${customerName || "there"},
</p>

<p>
You left
<b>${productTitle}</b>
in your cart.
</p>

<p>
Discount:
<b>${discountCode || "SAVE10"}</b>
</p>

<p>
<a href="${checkoutUrl}">
Complete Checkout
</a>
</p>

`

```
)
```

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

```
to: email,

subject:
  "Payment Successful",

html: template(

  "Payment Successful",

  `
```

<p>
Hi ${customerName},
</p>

<p>
Payment received:
<b>₹${amount}</b>
</p>

<p>
Plan:
<b>${plan}</b>
</p>

`

```
)
```

});

}

// ======================================
// RENEWAL REMINDER
// ======================================

async function sendRenewalReminder({

email,
customerName,
renewDate,
paymentUrl

}) {

return sendEmail({

```
to: email,

subject:
  "Subscription Renewal Reminder",

html: template(

  "Renewal Reminder",

  `
```

<p>
Hi ${customerName},
</p>

<p>
Renewal Date:
<b>${renewDate}</b>
</p>

<p>
<a href="${paymentUrl}">
Manage Subscription
</a>
</p>

`

```
)
```

});

}

// ======================================
// SALES PUSH
// ======================================

async function sendSalesPush({

email,
customerName,
product,
checkoutUrl

}) {

return sendEmail({

```
to: email,

subject:
  "Trending Product",

html: template(

  "Trending Product",

  `
```

<p>
Hi ${customerName},
</p>

<p>
🔥 ${product}
</p>

<p>
<a href="${checkoutUrl}">
Buy Now
</a>
</p>

`

```
)
```

});

}

// ======================================
// CONTACT FORM
// ======================================

async function sendContactForm({

name,
email,
message

}) {

return sendEmail({

```
to:
  process.env.ADMIN_EMAIL,

subject:
  "New Contact Form",

html: template(

  "Contact Request",

  `
```

<p>
<b>Name:</b>
${name}
</p>

<p>
<b>Email:</b>
${email}
</p>

<p>
${message}
</p>

`

```
)
```

});

}

// ======================================
// EXPORTS
// ======================================

module.exports = {

verifySMTP,

sendEmail,

sendCartRecovery,

sendPaymentSuccess,

sendRenewalReminder,

sendSalesPush,

sendContactForm

};
