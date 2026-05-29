// ======================================
// utils/salesCloser.js
// ======================================

function generateSalesCloser({

  message,
  products = [],
  currency = "USD"

}) {

  const lower =
    (message || "")
    .toLowerCase();

  let reply = "";

  // ======================================
  // URGENCY
  // ======================================

  if (

    lower.includes("price") ||

    lower.includes("discount") ||

    lower.includes("offer")

  ) {

    reply +=
    "🔥 Today's offer may expire soon. ";

  }

  // ======================================
  // STOCK PRESSURE
  // ======================================

  if (products.length) {

    reply +=
    `⚡ ${products[0].title} is trending right now. `;

  }

  // ======================================
  // SHIPPING PUSH
  // ======================================

  reply +=
  "🚚 Fast shipping available.";

  return reply;

}

module.exports = {
  generateSalesCloser
};
