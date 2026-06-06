// ======================================
// services/ai.js
// Premium AI Engine
// ======================================

const fetch = require("node-fetch");

// ======================================
// GENERATE AI RESPONSE
// ======================================

async function generateAIResponse({

  message,
  client,
  customerName,
  cart,
  products

}){

  try{

    // ==================================
    // PLAN
    // ==================================

    const isPremium =
      client.plan === "premium";

    // ==================================
    // SYSTEM PROMPT
    // ==================================

    let systemPrompt = `

You are Layboka AI.

You are a world-class Shopify
sales assistant trained to:

- increase conversions
- recover abandoned carts
- answer customer questions
- upsell products
- push customers to checkout
- increase average order value

Your tone:
- friendly
- persuasive
- premium
- short
- confident

Rules:
- Keep responses concise
- Focus on sales
- Always guide toward purchase
- Recommend products naturally
- Create urgency when needed
- Mention offers/discounts
- Push checkout softly

`;

    // ==================================
    // PREMIUM PROMPT
    // ==================================

    if(isPremium){

      systemPrompt += `

Premium AI Features Enabled:

- Smart upselling
- Cart recovery persuasion
- Checkout closer mode
- Emotional sales psychology
- High-converting copywriting
- Dynamic urgency tactics

`;

    }

    // ==================================
    // CUSTOMER INFO
    // ==================================

    if(customerName){

      systemPrompt += `

Customer Name:
${customerName}

`;

    }

    // ==================================
    // CART DATA
    // ==================================

    if(cart){

  const cartSummary = {
    items: cart.items,
    total: cart.total
  };

  systemPrompt += `

Customer Cart:
${JSON.stringify(cartSummary)}

`;

}

    // ==================================
    // PRODUCT DATA
    // ==================================

    if(products){

  const relevantProducts =
    products
      .slice(0,10)
      .map(p => ({
        title: p.title,
        price: p.price,
        url: p.url
      }));

  systemPrompt += `

Store Products:
${JSON.stringify(relevantProducts)}

`;

}

    // ==================================
    // OPENAI REQUEST
    // ==================================

    const response =
      await fetch(

        "https://api.openai.com/v1/chat/completions",

        {

          method:"POST",

          headers:{

            "Authorization":
            `Bearer ${process.env.OPENAI_API_KEY}`,

            "Content-Type":
            "application/json"

          },

          body: JSON.stringify({

            model:"gpt-4o-mini",

            messages:[

              {

                role:"system",

                content:systemPrompt

              },

              {

                role:"user",

                content:message

              }

            ],

            temperature:0.7,

            max_tokens:300

          })

        }

      );

    // ==================================
    // DATA
    // ==================================

    if(!response.ok){
  throw new Error(
    `OpenAI API Error: ${response.status}`
  );
}

const data =
  await response.json();
    // ==================================
    // AI TEXT
    // ==================================

    let reply =
      data?.choices?.[0]?.message?.content
      || "⚠️ AI unavailable";

    // ==================================
    // AUTO SALES PUSH
    // ==================================

    if(

      message.toLowerCase().includes("buy") ||

      message.toLowerCase().includes("price") ||

      message.toLowerCase().includes("checkout") ||

      message.toLowerCase().includes("discount")

    ){

      reply += `

<div style="
margin-top:14px;
">

<a href="/checkout"
style="
display:inline-block;
padding:12px 18px;
border-radius:12px;
background:linear-gradient(135deg,#00ffc3,#00aaff);
color:#000;
font-weight:bold;
text-decoration:none;
box-shadow:0 10px 30px rgba(0,255,200,0.3);
">
⚡ Complete Checkout
</a>

</div>

`;

    }

    // ==================================
    // PREMIUM UPSELL
    // ==================================

    if(isPremium){

      if(
        Math.random() > 0.6
      ){

        reply += `

<div style="
margin-top:12px;
padding:12px;
background:#111827;
border-radius:14px;
border:1px solid rgba(255,255,255,0.06);
">

🔥 Customers are buying this fast today.

</div>

`;

      }

    }

    // ==================================
    // RETURN
    // ==================================

    return {

      success:true,

      reply

    };

  }catch(err){

    console.log(
      "AI SERVICE ERROR:",
      err
    );

    return {

      success:false,

      reply:"⚠️ AI service unavailable"

    };

  }

}

// ======================================
// PRODUCT CARD GENERATOR
// ======================================

function generateProductCard(product){

  return `

<div style="
background:#111827;
padding:14px;
border-radius:18px;
margin-top:12px;
border:1px solid rgba(255,255,255,0.06);
">

<img
src="${product.image}"
style="
width:100%;
border-radius:14px;
margin-bottom:10px;
"
/>

<h3 style="
color:#fff;
font-size:16px;
margin-bottom:8px;
">
${product.title}
</h3>

<p style="
color:#00ffc3;
font-size:18px;
font-weight:bold;
margin-bottom:12px;
">
₹${product.price}
</p>

<button
onclick="window.location.href='${product.url}'"
style="
width:100%;
padding:12px;
border:none;
border-radius:12px;
background:linear-gradient(135deg,#00ffc3,#00aaff);
color:#000;
font-weight:bold;
cursor:pointer;
">
🛒 Add To Cart
</button>

</div>

`;

}

// ======================================
// CART RECOVERY MESSAGE
// ======================================

function generateRecoveryMessage(name){

  return `

Hey ${name || "there"} 👋

You left items in your cart.

🔥 Complete your order before
the products go out of stock.

👉 Return to checkout now.

`;

}

// ======================================
// EXPORTS
// ======================================

module.exports = {

  generateAIResponse,

  generateProductCard,

  generateRecoveryMessage

};
