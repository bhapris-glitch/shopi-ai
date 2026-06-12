//================================
// Layboka AI
// routes/recovery.js
// Updated 12 Jun, 2026
//=================================
const express = require("express");
const router = express.Router();

const Abandoned = require("../models/Abandoned");

const sendWhatsApp =
require("../utils/whatsapp");

const sendEmail =
require("../utils/email");

// =====================================
// TRACK CART
// =====================================

router.post(
"/track-cart",
async (req,res)=>{

try{

const {
clientId,
product,
email,
phone,
store
} = req.body;

await Abandoned.create({

clientId,

product,

email,

phone,

store,

recoveryAgent:"Emma",

recoveryScore:50,

nextReminderAt:
new Date(
Date.now() +
60 * 60 * 1000
)

});

return res.json({
success:true
});

}catch(err){

console.error(err);

return res.status(500)
.json({
success:false
});

}

});
// =====================================
// RUN RECOVERY
// =====================================

router.get(
"/run-recovery",
async (req,res)=>{

try{

const now =
Date.now();

const carts =
await Abandoned.find({
recovered:false
});

for(const c of carts){

const diff =
now -
new Date(
c.createdAt
).getTime();

// ==============================
// REMINDER #1
// 1 HOUR
// ==============================

if(

diff > 3600000 &&

!c.reminder1Sent

){

const checkoutUrl =
c.checkoutUrl ||
`https://${c.store}/cart`;

const msg =

`🔥 You left something in your cart!

${c.product.title}

Complete your order now 👇

${checkoutUrl}`;

if(c.phone){

await sendWhatsApp(
c.phone,
msg
);

}

if(c.email){

await sendEmail(

c.email,

"🛒 You forgot something!",

`<h3>${c.product.title}</h3>

<a href="${checkoutUrl}">
Complete Order
</a>`

);

}
  c.reminder1Sent = true;

c.aiMessagesSent += 1;

c.lastReminderAt =
new Date();

c.nextReminderAt =
new Date(
Date.now() +
24 * 60 * 60 * 1000
);

await c.save();

}

// ==============================
// REMINDER #2
// 24 HOURS
// ==============================

if(

diff > 86400000 &&

c.reminder1Sent &&

!c.reminder2Sent

){

const checkoutUrl =
c.checkoutUrl ||
`https://${c.store}/cart`;

const msg =

`🎁 Special Discount!

Use code SAVE10

Complete your order 👇

${checkoutUrl}`;

if(c.phone){

await sendWhatsApp(
c.phone,
msg
);

}

if(c.email){

await sendEmail(

c.email,

"🎁 10% OFF Just for You",

`<h2>Use code SAVE10</h2>

<a href="${checkoutUrl}">
Shop Now
</a>`

);

}
c.reminder2Sent = true;

c.aiMessagesSent += 1;

c.lastReminderAt =
new Date();

// ==============================
// RESPONSE
// ==============================

res.json({

success:true,

processed:carts.length

});

}catch(error){

console.error(

"Recovery Error:",

error

);

res.status(500).json({

success:false,

message:error.message

});

}

});
// =====================================
// EXPORT
// =====================================

module.exports = router;
