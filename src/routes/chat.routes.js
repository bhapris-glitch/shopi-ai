// ======================================
// routes/chat.routes.js
// Layboka AI
// Chat Routes
// Production Ready
// ======================================

const express =
require("express");

const router =
express.Router();

// ======================================
// CONTROLLER
// ======================================

const ChatController =
require("../controllers/chat.controller");

// ======================================
// MIDDLEWARE
// ======================================

// Uncomment when available

// const auth =
// require("../middleware/auth");

// const rateLimiter =
// require("../middleware/rateLimiter");

// ======================================
// HEALTH
// ======================================

router.get(

    "/health",

    ChatController.health

);

// ======================================
// CHAT
// ======================================

router.post(

    "/",

    // auth,

    // rateLimiter,

    ChatController.chat

);

// ======================================
// STREAMING CHAT
// (Future GPT Streaming)
// ======================================

router.post(

    "/stream",

    (req,res)=>{

        return res.status(501).json({

            success:false,

            message:

            "Streaming endpoint coming soon."

        });

    }

);

// ======================================
// FEEDBACK
// ======================================

router.post(

    "/feedback",

    async(req,res)=>{

        try{

            const{

                sessionId,

                messageId,

                rating,

                comment

            }=req.body;

            // TODO:
            // Save feedback

            return res.json({

                success:true

            });

        }

        catch(error){

            return res.status(500).json({

                success:false,

                message:

                "Unable to save feedback."

            });

        }

    }

);

// ======================================
// CLEAR MEMORY
// ======================================

router.delete(

    "/memory/:sessionId",

    async(req,res)=>{

        try{

            const memory=

            require(

                "../services/memory.service"

            );

            memory.clear(

                req.params.sessionId

            );

            return res.json({

                success:true

            });

        }

        catch(error){

            return res.status(500).json({

                success:false

            });

        }

    }

);

// ======================================
// EXPORT
// ======================================

module.exports =
router;
