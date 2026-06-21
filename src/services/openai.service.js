// ======================================
// services/openai.service.js
// Layboka AI
// OpenAI Service
// Production Ready
// ======================================

const OpenAI = require("openai");

const {

    buildPrompt

} = require("./prompt.service");

// ======================================
// OPENAI CLIENT
// ======================================

const client = new OpenAI({

    apiKey: process.env.OPENAI_API_KEY

});

// ======================================
// DEFAULT MODEL
// ======================================

const DEFAULT_MODEL =

    process.env.OPENAI_MODEL ||

    "gpt-5.5";

// ======================================
// CHAT COMPLETION
// ======================================

async function chat({

    store,

    customer,

    products,

    cart,

    history,

    message,

    temperature = 0.6,

    maxTokens = 700

}) {

    const prompt =

        buildPrompt({

            store,

            customer,

            products,

            cart,

            history,

            message

        });

    const response =

        await client.responses.create({

            model: DEFAULT_MODEL,

            temperature,

            max_output_tokens: maxTokens,

            input: [

                {

                    role: "system",

                    content: prompt.system

                },

                {

                    role: "system",

                    content: prompt.context

                },

                {

                    role: "user",

                    content: prompt.user

                }

            ]

        });

    return response.output_text;

}

// ======================================
// STREAM CHAT
// ======================================

async function streamChat({

    store,

    customer,

    products,

    cart,

    history,

    message,

    res

}) {

    const prompt =

        buildPrompt({

            store,

            customer,

            products,

            cart,

            history,

            message

        });

    const stream =

        await client.responses.stream({

            model: DEFAULT_MODEL,

            input: [

                {

                    role: "system",

                    content: prompt.system

                },

                {

                    role: "system",

                    content: prompt.context

                },

                {

                    role: "user",

                    content: prompt.user

                }

            ]

        });

    res.setHeader(

        "Content-Type",

        "text/event-stream"

    );

    res.setHeader(

        "Cache-Control",

        "no-cache"

    );

    res.setHeader(

        "Connection",

        "keep-alive"

    );

    for await (

        const event of stream

    ) {

        if(

            event.type ===

            "response.output_text.delta"

        ){

            res.write(

                event.delta

            );

        }

    }

    res.end();

}

// ======================================
// EMBEDDING
// ======================================

async function embedding(text){

    const result =

        await client.embeddings.create({

            model:

                "text-embedding-3-small",

            input: text

        });

    return result

        .data[0]

        .embedding;

}

// ======================================
// MODERATION
// ======================================

async function moderate(text){

    const result =

        await client.moderations.create({

            input:text

        });

    return result.results[0];

}

// ======================================
// EXPORT
// ======================================

module.exports={

    chat,

    streamChat,

    embedding,

    moderate

};
