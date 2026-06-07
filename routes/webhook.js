// ======================================
// routes/webhook.js
// Production Webhook System
// Razorpay + Auto Renewal + Lock System
// Updated 7Jun 2026
// ======================================
const express = require("express");
const crypto = require("crypto");
const Stripe = require("stripe");

const Client = require("../models/Client");
const Subscription = require("../models/Subscription");

const router = express.Router();

const stripe = process.env.STRIPE_SECRET_KEY
? new Stripe(process.env.STRIPE_SECRET_KEY)
: null;

const DAYS_30 =
30 * 24 * 60 * 60 * 1000;

// ======================================
// ACTIVATE SUBSCRIPTION
// ======================================

async function activateSubscription({
clientId,
plan,
paymentId,
subscriptionId
}) {

const renewalDate =
new Date(Date.now() + DAYS_30);

await Client.findByIdAndUpdate(
clientId,
{
paid: true,
status: "active",
plan,
paymentId,
subscriptionId,
renewalDate
}
);

await Subscription.findOneAndUpdate(
{ clientId },
{
paid: true,
status: "active",
plan,
paymentId,
subscriptionId,
renewalDate,
autoRenew: true,
locked: false
},
{
upsert: true,
new: true
}
);

}

// ======================================
// FAIL SUBSCRIPTION
// ======================================

async function failSubscription(
subscriptionId
) {

const subscription =
await Subscription.findOne({
subscriptionId
});

if (!subscription) return;

await Subscription.updateOne(
{ subscriptionId },
{
paid: false,
status: "past_due",
locked: true
}
);

await Client.updateOne(
{
_id: subscription.clientId
},
{
paid: false,
status: "payment_failed"
}
);

}

// ======================================
// CANCEL SUBSCRIPTION
// ======================================

async function cancelSubscription(
subscriptionId
) {

const subscription =
await Subscription.findOne({
subscriptionId
});

if (!subscription) return;

await Subscription.updateOne(
{ subscriptionId },
{
paid: false,
status: "cancelled",
autoRenew: false,
cancelledAt: new Date(),
locked: true
}
);

await Client.updateOne(
{
_id: subscription.clientId
},
{
paid: false,
status: "cancelled"
}
);

}

// ======================================
// RAZORPAY WEBHOOK
// ======================================

router.post(
"/razorpay",
express.json(),
async (req, res) => {

```
try {

  const signature =
    req.headers[
      "x-razorpay-signature"
    ];

  const expected =
    crypto
      .createHmac(
        "sha256",
        process.env
          .RAZORPAY_WEBHOOK_SECRET
      )
      .update(
        JSON.stringify(req.body)
      )
      .digest("hex");

  if (signature !== expected) {

    return res
      .status(400)
      .json({
        success: false
      });

  }

  const event =
    req.body.event;

  // =============================
  // PAYMENT CAPTURED
  // =============================

  if (
    event ===
    "payment.captured"
  ) {

    const payment =
      req.body.payload
        .payment.entity;

    await activateSubscription({

      clientId:
        payment.notes.clientId,

      plan:
        payment.notes.plan ||
        "starter",

      paymentId:
        payment.id,

      subscriptionId:
        payment.notes
          .subscriptionId || ""

    });

  }

  // =============================
  // SUBSCRIPTION ACTIVATED
  // =============================

  if (
    event ===
    "subscription.activated"
  ) {

    const sub =
      req.body.payload
        .subscription.entity;

    const dbSub =
      await Subscription.findOne({
        subscriptionId:
          sub.id
      });

    if (dbSub) {

      await activateSubscription({

        clientId:
          dbSub.clientId,

        plan:
          dbSub.plan,

        paymentId: "",

        subscriptionId:
          sub.id

      });

    }

  }

  // =============================
  // RENEWAL SUCCESS
  // =============================

  if (
    event ===
    "subscription.charged"
  ) {

    const sub =
      req.body.payload
        .subscription.entity;

    const renewalDate =
      new Date(
        Date.now() + DAYS_30
      );

    await Subscription.updateOne(
      {
        subscriptionId:
          sub.id
      },
      {
        paid: true,
        status: "active",
        locked: false,
        renewalDate
      }
    );

  }

  // =============================
  // PAYMENT FAILED
  // =============================

  if (
    event ===
    "payment.failed"
  ) {

    const payment =
      req.body.payload
        .payment.entity;

    if (
      payment.notes
        ?.subscriptionId
    ) {

      await failSubscription(
        payment.notes
          .subscriptionId
      );

    }

  }

  // =============================
  // CANCELLED
  // =============================

  if (
    event ===
      "subscription.cancelled" ||
    event ===
      "subscription.halted"
  ) {

    const sub =
      req.body.payload
        .subscription.entity;

    await cancelSubscription(
      sub.id
    );

  }

  // =============================
  // PAUSED
  // =============================

  if (
    event ===
    "subscription.paused"
  ) {

    await Subscription.updateOne(
      {
        subscriptionId:
          req.body.payload
            .subscription.entity.id
      },
      {
        status: "paused",
        locked: true
      }
    );

  }

  // =============================
  // RESUMED
  // =============================

  if (
    event ===
    "subscription.resumed"
  ) {

    await Subscription.updateOne(
      {
        subscriptionId:
          req.body.payload
            .subscription.entity.id
      },
      {
        status: "active",
        locked: false,
        paid: true
      }
    );

  }

  return res.json({
    success: true
  });

} catch (err) {

  console.error(
    "Razorpay Webhook:",
    err
  );

  return res
    .status(500)
    .json({
      success: false
    });

}
```

}
);

// ======================================
// STRIPE WEBHOOK
// ======================================

router.post(
"/stripe",
express.raw({
type: "application/json"
}),
async (req, res) => {

```
try {

  if (!stripe) {

    return res
      .status(500)
      .end();

  }

  const signature =
    req.headers[
      "stripe-signature"
    ];

  const event =
    stripe.webhooks
      .constructEvent(
        req.body,
        signature,
        process.env
          .STRIPE_WEBHOOK_SECRET
      );

  // =============================
  // CHECKOUT SUCCESS
  // =============================

  if (
    event.type ===
    "checkout.session.completed"
  ) {

    const session =
      event.data.object;

    await activateSubscription({

      clientId:
        session.metadata
          .clientId,

      plan:
        session.metadata
          .plan || "starter",

      paymentId:
        session.payment_intent,

      subscriptionId:
        session.subscription

    });

  }

  // =============================
  // PAYMENT FAILED
  // =============================

  if (
    event.type ===
    "invoice.payment_failed"
  ) {

    const invoice =
      event.data.object;

    await failSubscription(
      invoice.subscription
    );

  }

  // =============================
  // SUBSCRIPTION DELETED
  // =============================

  if (
    event.type ===
    "customer.subscription.deleted"
  ) {

    const sub =
      event.data.object;

    await cancelSubscription(
      sub.id
    );

  }

  return res.json({
    received: true
  });

} catch (err) {

  console.error(
    "Stripe Webhook:",
    err
  );

  return res
    .status(400)
    .send(
      `Webhook Error: ${err.message}`
    );

}
```

}
);

module.exports = router;
