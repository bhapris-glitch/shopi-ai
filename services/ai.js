// ======================================
// services/ai.js
// Layboka AI Engine v2
// GPT-4o-mini Optimized
// Production Ready
// Updated Jun 7, 2026
// ======================================

const fetch = require('node-fetch');

const Client = require('../models/Client');
const Product = require('../models/Product');
const Conversation = require('../models/Conversation');
const Subscription = require('../models/Subscription');

// ======================================
// CONFIG
// ======================================

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// ======================================
// BUILD SYSTEM PROMPT
// ======================================

function buildSystemPrompt(client) {
  let prompt = `
You are Layboka AI.
You are an elite ecommerce sales assistant.

Main goals:
1. Increase conversions
2. Increase AOV
3. Recover carts
4. Reduce bounce rate
5. Help customers buy

Communication style:
* Friendly
* Premium
* Helpful
* Persuasive
* Concise

Rules:
* Keep answers short.
* Never overwhelm users.
* Recommend products naturally.
* Encourage checkout.
* Mention offers when relevant.
* Focus on solving customer needs.
`;

  if (client?.plan === 'premium' || client?.plan === 'enterprise') {
    prompt += `
Premium Mode Enabled:
* Advanced upsells
* Cross-sell recommendations
* Cart recovery psychology
* Checkout closer mode
* Scarcity messaging
* Revenue optimization
`;
  }

  if (client?.storeDisplayName) {
    prompt += `
Store Name: ${client.storeDisplayName}
`;
  }

  if (client?.agentName) {
    prompt += `
Agent Name: ${client.agentName}
`;
  }

  return prompt;
}

// ======================================
// CUSTOMER MEMORY
// ======================================

function buildCustomerMemory(conversation) {
  if (!conversation) return '';

  let memory = `
Customer Profile:
Name: ${conversation.customerName || ''}
Email: ${conversation.email || ''}
Interested Product: ${conversation.interestedProduct || ''}
Converted: ${conversation.converted ? 'YES' : 'NO'}
`;

  if (conversation.summary) {
    memory += `
Conversation Summary:
${conversation.summary}
`;
  }

  return memory;
}

// ======================================
// PRODUCT RECOMMENDATIONS
// ======================================

function buildProductRecommendations(products = []) {
  if (!products.length) return '';

  const topProducts = products.slice(0, 10);
  let block = `
Available Products:
`;

  topProducts.forEach((p) => {
    block += `
Product: ${p.title}
Price: $${p.price}
Category: ${p.productType}
Vendor: ${p.vendor}
`;
  });

  return block;
}

// ======================================
// CART RECOVERY
// ======================================

function buildCartRecovery(cart = []) {
  if (!cart.length) return '';

  return `
Customer Cart:
${JSON.stringify(cart, null, 2)}

Cart Recovery Goal:
Encourage customer to complete checkout.
`;
}

// ======================================
// CHECKOUT CLOSER
// ======================================

function buildCheckoutCloser() {
  return `
Checkout Closer Rules:
* Reduce hesitation
* Emphasize benefits
* Use confidence
* Suggest checkout
* Avoid pressure
`;
}

// ======================================
// UPSELL SUGGESTIONS
// ======================================

function buildUpsellSuggestions(products = []) {
  if (!products.length) return '';

  const upsells = products
    .sort((a, b) => (b.upsellScore || 0) - (a.upsellScore || 0))
    .slice(0, 5);

  let text = `
Upsell Products:
`;

  upsells.forEach((p) => {
    text += `
- ${p.title} (Price: $${p.price})
`;
  });

  return text;
}

// ======================================
// BUILD FULL CONTEXT
// ======================================

function buildFullContext(options = {}) {
  const {
    client,
    conversation,
    products,
    cart,
    enableUpsell = false,
    enableCheckoutCloser = false,
    enableCartRecovery = false,
  } = options;

  let context = '';

  context += buildSystemPrompt(client);
  context += buildCustomerMemory(conversation);
  context += buildProductRecommendations(products);

  if (enableCartRecovery) {
    context += buildCartRecovery(cart);
  }

  if (enableCheckoutCloser) {
    context += buildCheckoutCloser();
  }

  if (enableUpsell) {
    context += buildUpsellSuggestions(products);
  }

  return context;
}

// ======================================
// OPENAI API CALL
// ======================================

async function callOpenAI(systemPrompt, userMessage, conversationHistory = []) {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ];

  try {
    const response = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error.message}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API call failed:', error);
    throw error;
  }
}

// ======================================
// GENERATE AI RESPONSE
// ======================================

async function generateAIResponse(options = {}) {
  const {
    clientId,
    conversationId,
    userMessage,
    productList,
    cartItems,
  } = options;

  try {
    // Fetch client data
    const client = await Client.findById(clientId);
    if (!client) {
      throw new Error(`Client not found: ${clientId}`);
    }

    // Fetch conversation history
    const conversation = conversationId
      ? await Conversation.findById(conversationId)
      : null;

    // Determine context options
    const contextOptions = {
      client,
      conversation,
      products: productList || [],
      cart: cartItems || [],
      enableUpsell: client.plan !== 'free',
      enableCheckoutCloser: client.plan === 'premium' || client.plan === 'enterprise',
      enableCartRecovery: cartItems && cartItems.length > 0,
    };

    // Build system prompt
    const systemPrompt = buildFullContext(contextOptions);

    // Get conversation history
    const conversationHistory = conversation?.messages || [];

    // Call OpenAI
    const aiResponse = await callOpenAI(
      systemPrompt,
      userMessage,
      conversationHistory
    );

    // Update conversation
    if (conversation) {
      conversation.messages.push({ role: 'user', content: userMessage });
      conversation.messages.push({ role: 'assistant', content: aiResponse });
      await conversation.save();
    }

    return {
      success: true,
      response: aiResponse,
      conversationId: conversation?._id,
    };
  } catch (error) {
    console.error('Error generating AI response:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// ======================================
// ANALYZE CUSTOMER INTENT
// ======================================

async function analyzeCustomerIntent(userMessage, clientId) {
  const systemPrompt = `
Analyze the customer's message and determine their intent.
Return a JSON object with the following structure:
{
  "intent": "browse|search|product_inquiry|checkout|complaint|other",
  "sentiment": "positive|neutral|negative",
  "urgency": "low|medium|high",
  "keywords": []
}
`;

  try {
    const response = await callOpenAI(systemPrompt, userMessage);
    return JSON.parse(response);
  } catch (error) {
    console.error('Error analyzing customer intent:', error);
    return {
      intent: 'other',
      sentiment: 'neutral',
      urgency: 'low',
      keywords: [],
    };
  }
}

// ======================================
// EXPORTS
// ======================================

module.exports = {
  buildSystemPrompt,
  buildCustomerMemory,
  buildProductRecommendations,
  buildCartRecovery,
  buildCheckoutCloser,
  buildUpsellSuggestions,
  buildFullContext,
  callOpenAI,
  generateAIResponse,
  analyzeCustomerIntent,
};
