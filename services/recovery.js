// ======================================
// services/recovery.js
// Real-Time Abandoned Cart Recovery
// WhatsApp + Email Automation
// ======================================

require("dotenv").config();

const nodemailer = require("nodemailer");
const twilio = require("twilio");

const Client = require("../models/Client");

// ======================================
// TWILIO WHATSAPP
// ======================================

const twilioClient = twilio(

  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN

);

// ======================================
// EMAIL TRANSPORT
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
// SEND WHATSAPP RECOVERY
// ======================================

async function sendWhatsAppRecovery({

  phone,
  customerName,
  checkoutUrl,
  productTitle

}){

  try{

    const message = `

🛒 Hi ${customerName || "there"}!

You left something amazing behind.

🔥 ${productTitle || "Your selected items"} are still waiting in your cart.

⚡ Complete your order now before stock runs out.

👉 ${checkoutUrl}

- Team Layboka

`;

    const response =
      await twilioClient.messages.create({

        from:
          `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,

        to:
          `whatsapp:${phone}`,

        body: message

      });

    console.log(
      "✅ WhatsApp Recovery Sent:",
      response.sid
    );

    return {

      success:true,
      sid:response.sid

    };

  }catch(err){

    console.log(
      "❌ WhatsApp Recovery Error:",
      err.message
    );

    return {

      success:false

    };

  }

}

// ======================================
// SEND EMAIL RECOVERY
// ======================================

async function sendEmailRecovery({

  email,
  customerName,
  checkoutUrl,
  productTitle,
  storeName

}){

  try{

    const html = `

<div style="
font-family:Arial;
background:#f4f7fb;
padding:40px;
">

<div style="
max-width:600px;
margin:auto;
background:#fff;
border-radius:20px;
padding:40px;
">

<h1 style="
font-size:30px;
margin-bottom:10px;
">
🛒 Your cart is waiting
</h1>

<p style="
font-size:18px;
color:#555;
line-height:1.7;
">
Hi ${customerName || "there"},
</p>

<p style="
font-size:16px;
color:#555;
line-height:1.7;
">
You added
<b>${productTitle || "items"}</b>
to your cart but didn’t finish checkout.
</p>

<p style="
font-size:16px;
color:#555;
line-height:1.7;
">
Complete your purchase before stock runs out.
</p>

<a href="${checkoutUrl}"
style="
display:inline-block;
margin-top:20px;
padding:14px 24px;
background:linear-gradient(135deg,#00ffc3,#00aaff);
color:#000;
font-weight:bold;
text-decoration:none;
border-radius:12px;
">
⚡ Complete Checkout
</a>

<p style="
margin-top:30px;
font-size:13px;
color:#888;
">
${storeName || "Layboka Store"}
</p>

</div>

</div>

`;

    await transporter.sendMail({

      from:
        `"${storeName || "Layboka"}" <${process.env.EMAIL_USER}>`,

      to: email,

      subject:
        "🛒 Complete your order",

      html

    });

    console.log(
      "✅ Recovery Email Sent:",
      email
    );

    return {

      success:true

    };

  }catch(err){

    console.log(
      "❌ Recovery Email Error:",
      err.message
    );

    return {

      success:false

    };

  }

}

// ======================================
// AUTO RECOVERY FLOW
// ======================================

async function triggerRecovery(customer){

  try{

    // ==========================
    // REQUIRED DATA
    // ==========================

    if(!customer.checkoutUrl){

      return;

    }

    // ==========================
    // EMAIL RECOVERY
    // ==========================

    if(customer.email){

      await sendEmailRecovery({

        email:
          customer.email,

        customerName:
          customer.name,

        checkoutUrl:
          customer.checkoutUrl,

        productTitle:
          customer.productTitle,

        storeName:
          customer.storeName

      });

    }

    // ==========================
    // WHATSAPP RECOVERY
    // ==========================

    if(customer.phone){

      await sendWhatsAppRecovery({

        phone:
          customer.phone,

        customerName:
          customer.name,

        checkoutUrl:
          customer.checkoutUrl,

        productTitle:
          customer.productTitle

      });

    }

    console.log(
      "✅ Recovery Flow Completed"
    );

  }catch(err){

    console.log(
      "❌ Recovery Flow Error:",
      err.message
    );

  }

}

// ======================================
// AUTO CRON RECOVERY
// ======================================

async function autoRecoveryCron(){

  try{

    console.log(
      "🔄 Running Recovery Cron..."
    );

    // ==========================
    // FIND CARTS
    // ==========================

    const clients =
      await Client.find({

        abandonedCart:true,

        recoverySent:false

      });

    // ==========================
    // LOOP
    // ==========================

    for(const client of clients){

      await triggerRecovery({

        email:
          client.customerEmail,

        phone:
          client.customerPhone,

        customerName:
          client.customerName,

        checkoutUrl:
          client.checkoutUrl,

        productTitle:
          client.productTitle,

        storeName:
          client.store

      });

      // ========================
      // MARK SENT
      // ========================

      client.recoverySent = true;

      await client.save();

      console.log(
        "✅ Recovery sent to:",
        client.customerEmail
      );

    }

  }catch(err){

    console.log(
      "❌ Cron Recovery Error:",
      err.message
    );

  }

}

// ======================================
// EXPORTS
// ======================================

module.exports = {

  sendWhatsAppRecovery,

  sendEmailRecovery,

  triggerRecovery,

  autoRecoveryCron

};
