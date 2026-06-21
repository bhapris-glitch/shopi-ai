// ======================================
// models/Recommendation.js
// Layboka AI
// AI Recommendation Model
// Production Ready
// ======================================

const mongoose =
require("mongoose");

// ======================================
// RECOMMENDATION
// ======================================

const RecommendationSchema =
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
    // SOURCE PRODUCT
    // ==================================

    productId:{
        type:String,
        required:true,
        index:true
    },

    productTitle:{
        type:String,
        default:""
    },

    // ==================================
    // RECOMMENDED PRODUCT
    // ==================================

    recommendedProductId:{
        type:String,
        required:true,
        index:true
    },

    recommendedTitle:{
        type:String,
        default:""
    },

    // ==================================
    // RECOMMENDATION TYPE
    // ==================================

    type:{
        type:String,
        enum:[
            "related",
            "upsell",
            "cross_sell",
            "frequently_bought",
            "similar",
            "trending",
            "ai"
        ],
        default:"related",
        index:true
    },

    // ==================================
    // AI SCORE
    // ==================================

    score:{
        type:Number,
        default:0,
        index:true
    },

    confidence:{
        type:Number,
        default:0
    },

    similarity:{
        type:Number,
        default:0
    },

    // ==================================
    // PERFORMANCE
    // ==================================

    impressions:{
        type:Number,
        default:0
    },

    clicks:{
        type:Number,
        default:0
    },

    addToCart:{
        type:Number,
        default:0
    },

    purchases:{
        type:Number,
        default:0
    },

    revenue:{
        type:Number,
        default:0
    },

    // ==================================
    // STATUS
    // ==================================

    active:{
        type:Boolean,
        default:true
    },

    generatedBy:{
        type:String,
        default:"Layboka AI"
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

RecommendationSchema.index({

    shop:1,

    productId:1,

    recommendedProductId:1

},
{

    unique:true

});

RecommendationSchema.index({

    score:-1

});

RecommendationSchema.index({

    type:1

});

RecommendationSchema.index({

    purchases:-1

});

// ======================================
// EXPORT
// ======================================

module.exports =
mongoose.model(
    "Recommendation",
    RecommendationSchema
);
