// ======================================
// utils/aiReply.js
// ======================================

const fetch =
require("node-fetch");

async function generateAIReply({

  message,
  platform = "Website"

}){

  try{

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

You are Layboka AI.

Platform:
${platform}

Rules:
- Friendly
- Human tone
- Sales focused
- Short replies
- Help users buy

`

              },

              {

                role:"user",

                content:message

              }

            ],

            temperature:0.8,

            max_tokens:180

          })

        }

      );

    const data =
      await response.json();

    return (

      data?.choices?.[0]
      ?.message?.content

      ||

      "😊 How can I help you today?"

    );

  }catch(err){

    console.log(err);

    return "😊 How can I help you today?";

  }

}

module.exports = {
  generateAIReply
};
