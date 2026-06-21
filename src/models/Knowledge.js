// ======================================
// models/Knowledge.js
// Layboka AI
// AI Knowledge Base Model
// Production Ready
// ======================================

const mongoose =
require("mongoose");

// ======================================
// KNOWLEDGE
// ======================================

const KnowledgeSchema =
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
    // KNOWLEDGE TYPE
    // ==================================

    type:{
        type:String,
        enum:[

            "faq",

            "shipping",

            "returns",

            "payments",

            "business",

            "product",

            "collection",

            "policy",

            "custom",

            "document"

        ],
        default:"custom",

        index:true
    },

    // ==================================
    // TITLE
    // ==================================

    title:{
        type:String,
        required:true,
        index:true
    },

    // ==================================
    // QUESTION
    // ==================================

    question:{
        type:String,
        default:"",
        index:true
    },

    // ==================================
    // ANSWER
    // ==================================

    answer:{
        type:String,
        required:true
    },

    // ==================================
    // SEARCH
    // ==================================

    searchableText:{
        type:String,
        default:""
    },

    keywords:[{

        type:String,

        index:true

    }],

    embedding:[{

        type:Number

    }],

    // ==================================
    // AI
    // ==================================

    confidence:{
        type:Number,
        default:1
    },

    priority:{
        type:Number,
        default:1
    },

    language:{
        type:String,
        default:"English"
    },

    // ==================================
    // ANALYTICS
    // ==================================

    views:{
        type:Number,
        default:0
    },

    usageCount:{
        type:Number,
        default:0
    },

    helpful:{
        type:Number,
        default:0
    },

    notHelpful:{
        type:Number,
        default:0
    },

    // ==================================
    // STATUS
    // ==================================

    active:{
        type:Boolean,
        default:true,
        index:true
    },

    generatedByAI:{
        type:Boolean,
        default:false
    },

    source:{
        type:String,
        default:"merchant"
    },

    syncedAt:{
        type:Date,
        default:Date.now
    }

},
{

    timestamps:true,

    versionKey:false

});

// ======================================
// INDEXES
// ======================================

KnowledgeSchema.index({

    shop:1,

    type:1

});

KnowledgeSchema.index({

    title:"text",

    question:"text",

    answer:"text",

    searchableText:"text"

});

KnowledgeSchema.index({

    priority:-1

});

KnowledgeSchema.index({

    active:1

});

// ======================================
// EXPORT
// ======================================

module.exports =
mongoose.model(

    "Knowledge",

    KnowledgeSchema

);
