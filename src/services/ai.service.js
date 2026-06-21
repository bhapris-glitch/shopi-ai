// ======================================
// services/ai.service.js
// Layboka AI
// AI Orchestrator
// Production Ready
// ======================================

const memory =
require("./memory.service");

const intent =
require("./intent.service");

const recommendation =
require("./recommendation.service");

const knowledge =
require("./knowledge.service");

const openai =
require("./openai.service");

// ======================================
// AI SERVICE
// ======================================

class AIService{

    // ==================================
    // CHAT
    // ==================================

    async chat({

        sessionId,

        store,

        customer,

        products,

        collections,

        pages,

        faqs,

        cart,

        message

    }){

        // ------------------------------
        // Detect Intent
        // ------------------------------

        const detectedIntent =

            intent.detectIntent(

                message

            );

        memory.setIntent(

            sessionId,

            detectedIntent

        );

        // ------------------------------
        // Conversation Memory
        // ------------------------------

        memory.addMessage(

            sessionId,

            "user",

            message

        );

        memory.setCart(

            sessionId,

            cart

        );

        // ------------------------------
        // Store Knowledge
        // ------------------------------

        const storeKnowledge =

            knowledge.buildKnowledge({

                store,

                products,

                collections,

                pages,

                faqs

            });

        // ------------------------------
        // Recommendation
        // ------------------------------

        let recommendedProducts = [];

        if(

            detectedIntent ===

            intent.INTENTS.PRODUCT_SEARCH ||

            detectedIntent ===

            intent.INTENTS.PRODUCT_RECOMMENDATION

        ){

            recommendedProducts =

                recommendation.bestSellers(

                    products,

                    4

                );

        }

        // ------------------------------
        // GPT
        // ------------------------------

        const reply =

            await openai.chat({

                store,

                customer,

                products:

                    recommendedProducts,

                cart,

                history:

                    memory.getHistory(

                        sessionId

                    ),

                message

            });

        // ------------------------------
        // Save AI Reply
        // ------------------------------

        memory.addMessage(

            sessionId,

            "assistant",

            reply

        );

        // ------------------------------
        // Final Response
        // ------------------------------

        return{

            success:true,

            intent:

                detectedIntent,

            reply,

            recommendations:

                recommendedProducts

        };

    }

}

// ======================================
// EXPORT
// ======================================

module.exports=

new AIService();
