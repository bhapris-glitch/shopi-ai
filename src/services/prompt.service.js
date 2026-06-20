// ======================================
// services/prompt.service.js
// Layboka AI
// Production Ready
// ======================================

// ======================================
// BUILD SYSTEM PROMPT
// ======================================

function buildSystemPrompt(store = {}) {

    const {

        storeName = "Our Store",

        niche = "General Store",

        currency = "USD",

        language = "English",

        shippingPolicy = "",

        returnPolicy = "",

        businessHours = "",

        supportEmail = "",

        supportPhone = "",

        customInstructions = "",

        tone = "friendly"

    } = store;

    return `

You are Layboka AI.

You are an intelligent Shopify sales assistant.

Store Name:
${storeName}

Store Category:
${niche}

Language:
${language}

Currency:
${currency}

---------------------------------------

YOUR GOALS

1.
Help customers.

2.
Increase sales naturally.

3.
Recommend products.

4.
Cross-sell.

5.
Upsell.

6.
Never sound like a robot.

7.
Be short.

8.
Be friendly.

9.
Answer honestly.

10.
Never invent products.

---------------------------------------

STORE INFORMATION

Shipping Policy:

${shippingPolicy}

Return Policy:

${returnPolicy}

Business Hours:

${businessHours}

Support Email:

${supportEmail}

Support Phone:

${supportPhone}

---------------------------------------

SALES RULES

• Recommend products only from the provided catalog.

• If no product matches,
politely explain.

• Never create fake discounts.

• Never create fake inventory.

• Never create fake shipping times.

• Never guess product prices.

• Encourage customers politely.

• Do not pressure customers.

---------------------------------------

PERSONALITY

Tone:

${tone}

Examples:

Friendly

Professional

Luxury

Minimal

Playful

---------------------------------------

IMPORTANT

If the answer needs product data,

wait for the product context.

Never hallucinate products.

---------------------------------------

Merchant Instructions

${customInstructions}

---------------------------------------

End of System Prompt.

`;

}

// ======================================
// PRODUCT CONTEXT
// ======================================

function buildProductContext(products = []) {

    if (!products.length) {

        return "";

    }

    let context =

        "PRODUCTS\n\n";

    products.forEach((product, index) => {

        context += `

Product ${index + 1}

Title:
${product.title || ""}

Price:
${product.price || ""}

Description:
${product.description || ""}

Vendor:
${product.vendor || ""}

Type:
${product.productType || ""}

Tags:
${(product.tags || []).join(", ")}

Available:
${product.available ? "Yes" : "No"}

URL:
${product.url || ""}

---------------------------------------

`;

    });

    return context;

}

// ======================================
// CUSTOMER CONTEXT
// ======================================

function buildCustomerContext(customer = {}) {

    return `

CUSTOMER

Name:

${customer.name || ""}

Country:

${customer.country || ""}

Language:

${customer.language || ""}

Previous Purchases:

${customer.orders || 0}

Returning Customer:

${customer.returning ? "Yes" : "No"}

`;

}

// ======================================
// CART CONTEXT
// ======================================

function buildCartContext(cart = []) {

    if (!cart.length) {

        return "Cart is empty.";

    }

    let text =

        "CURRENT CART\n\n";

    cart.forEach(item => {

        text += `

${item.title}

Quantity:

${item.quantity}

Price:

${item.price}

`;

    });

    return text;

}

// ======================================
// CHAT CONTEXT
// ======================================

function buildConversation(history = []) {

    if (!history.length) {

        return "";

    }

    return history

        .slice(-12)

        .map(msg =>

            `${msg.role}: ${msg.content}`

        )

        .join("\n");

}

// ======================================
// FINAL PROMPT
// ======================================

function buildPrompt({

    store,

    customer,

    products,

    cart,

    history,

    message

}) {

    return {

        system:

            buildSystemPrompt(store),

        context: [

            buildCustomerContext(customer),

            buildProductContext(products),

            buildCartContext(cart),

            buildConversation(history)

        ].join("\n\n"),

        user:

            message

    };

}

// ======================================
// EXPORT
// ======================================

module.exports = {

    buildPrompt,

    buildSystemPrompt,

    buildProductContext,

    buildCustomerContext,

    buildCartContext,

    buildConversation

};
