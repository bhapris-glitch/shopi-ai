// ======================================
// models/Conversation.js
// Layboka AI
// AI Conversation Model
// Production Ready
// ======================================

const mongoose =
require("mongoose");

// ======================================
// MESSAGE
// ======================================

const MessageSchema =
new mongoose.Schema({

    role:{
        type:String,
        enum:[
            "user",
            "assistant",
            "system"
        ],
        required:true
    },

    content:{
        type:String,
        required:true
    },

    createdAt:{
        type:Date,
        default:Date.now
    }

},
{
    _id:false
});

// ======================================
// CONVERSATION
// ======================================

const ConversationSchema =
new mongoose.Schema({

    // ==================================
    // STORE
    // ==================================

    shop:{
        type:String,
        required:true,
        index:true
    },

    // ==================================
    // SESSION
    // ==================================

    sessionId:{
        type:String,
        required:true,
        index:true
    },

    customerId:{
        type:String,
        default:"",
        index:true
    },

    visitorId:{
        type:String,
        default:"",
        index:true
    },

    // ==================================
    // CHAT
    // ==================================

    messages:[MessageSchema],

    // ==================================
    // AI MEMORY
    // ==================================

    lastIntent:{
        type:String,
        default:""
    },

    detectedLanguage:{
        type:String,
        default:"English"
    },

    sentiment:{
        type:String,
        enum:[
            "positive",
            "neutral",
            "negative"
        ],
        default:"neutral"
    },

    // ==================================
    // CUSTOMER PREFERENCES
    // ==================================

    preferences:{

        budget:{
            type:Number,
            default:0
        },

        size:{
            type:String,
            default:""
        },

        color:{
            type:String,
            default:""
        },

        brand:{
            type:String,
            default:""
        }

    },

    // ==================================
    // PRODUCTS
    // ==================================

    viewedProducts:[{

        type:String

    }],

    recommendedProducts:[{

        type:String

    }],

    clickedProducts:[{

        type:String

    }],

    // ==================================
    // CART
    // ==================================

    cartValue:{
        type:Number,
        default:0
    },

    cartItems:{
        type:Number,
        default:0
    },

    abandonedCart:{
        type:Boolean,
        default:false
    },

    // ==================================
    // AI RESULT
    // ==================================

    resolved:{
        type:Boolean,
        default:false
    },

    transferredToHuman:{
        type:Boolean,
        default:false
    },

    rating:{
        type:Number,
        default:0
    },

    feedback:{
        type:String,
        default:""
    },

    // ==================================
    // STATUS
    // ==================================

    active:{
        type:Boolean,
        default:true
    },

    lastActivity:{
        type:Date,
        default:Date.now,
        index:true
    }

},
{
    timestamps:true,
    versionKey:false
});

// ======================================
// INDEXES
// ======================================

ConversationSchema.index({

    shop:1,

    sessionId:1

});

ConversationSchema.index({

    customerId:1

});

ConversationSchema.index({

    lastActivity:-1

});

// ======================================
// EXPORT
// ======================================

module.exports =
mongoose.model(
    "Conversation",
    ConversationSchema
);
