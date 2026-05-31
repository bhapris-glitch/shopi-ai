// ======================================
// utils/aiReply.js
// Layboka AI Reply Engine
// Production Version
// Updated 1Jun, 2026
// ======================================

const fetch =
  require("node-fetch");

const {
  getCachedReply,
  saveReply
} = require("./aiCache");

// ======================================
// GENERATE AI REPLY
// ======================================

async function generateAIReply({

  message = "",

  platform = "Website",

  agentName = "Emma",

  storeName = "Store",

  products = ""

}){

  try{

    // ==================================
    // EMPTY MESSAGE
    // ==================================

    if(!message){

      return "👋 How can I help you today?";

    }

    // ==================================
    // CACHE CHECK
    // ==================================

    const cachedReply =

      getCachedReply(message);

    if(cachedReply){

      return cachedReply;

    }

    // ==================================
    // OPENAI KEY CHECK
    // ==================================

    if(!process.env.OPENAI_API_KEY){

      return "⚠️ AI service unavailable.";

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

            Authorization:
              `Bearer ${process.env.OPENAI_API_KEY}`,

            "Content-Type":
              "application/json"

          },

          body:JSON.stringify({

            model:"gpt-4o-mini",

            messages:[

              {

                role:"system",

                content:`

You are ${agentName}.

You work for:
${storeName}

Platform:
${platform}

Products:
${products}

Rules:
- Friendly
- Human tone
- Sales focused
- Helpful
- Short replies
- Natural upsells
- Max 120 words
- Never sound robotic
- Encourage checkout when relevant

`

              },

              {

                role:"user",

                content:message

              }

            ],

            temperature:0.6,

            max_tokens:180

          })

        }

      );

    // ==================================
    // RESPONSE CHECK
    // ==================================

    if(!response.ok){

      throw new Error(
        `OpenAI Error ${response.status}`
      );

    }

    const data =
      await response.json();

    const reply =

      data?.choices?.[0]
      ?.message?.content

      ||

      "😊 How can I help you today?";

    // ==================================
    // SAVE CACHE
    // ==================================

    saveReply(

      message,

      reply

    );

    return reply;

  }catch(err){

    console.log(

      "AI REPLY ERROR:",

      err.message

    );

    return "😊 How can I help you today?";

  }

}

// ======================================
// EXPORTS
// ======================================

module.exports = {

  generateAIReply

};
