// ======================================
// models/Analytics.js
// Layboka AI
// AI Analytics Model
// Production Ready
// ======================================

const mongoose =
require("mongoose");

// ======================================
// ANALYTICS
// ======================================

const AnalyticsSchema =
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
    // DATE
    // ==================================

    date:{
        type:Date,
        required:true,
        index:true
    },

    // ==================================
    // CHAT
    // ==================================

    totalChats:{
        type:Number,
        default:0
    },

    uniqueVisitors:{
        type:Number,
        default:0
    },

    returningVisitors:{
        type:Number,
        default:0
    },

    averageChatDuration:{
        type:Number,
        default:0
    },

    resolvedChats:{
        type:Number,
        default:0
    },

    transferredChats:{
        type:Number,
        default:0
    },

    abandonedChats:{
        type:Number,
        default:0
    },

    // ==================================
    // SALES
    // ==================================

    aiOrders:{
        type:Number,
        default:0
    },

    aiRevenue:{
        type:Number,
        default:0
    },

    conversionRate:{
        type:Number,
        default:0
    },

    averageOrderValue:{
        type:Number,
        default:0
    },

    cartRecovered:{
        type:Number,
        default:0
    },

    recoveredRevenue:{
        type:Number,
        default:0
    },

    // ==================================
    // PRODUCTS
    // ==================================

    viewedProducts:{
        type:Number,
        default:0
    },

    recommendedProducts:{
        type:Number,
        default:0
    },

    clickedProducts:{
        type:Number,
        default:0
    },

    topProducts:[{

        productId:String,

        title:String,

        views:Number,

        clicks:Number,

        purchases:Number

    }],

    // ==================================
    // QUESTIONS
    // ==================================

    shippingQuestions:{
        type:Number,
        default:0
    },

    returnQuestions:{
        type:Number,
        default:0
    },

    productQuestions:{
        type:Number,
        default:0
    },

    discountQuestions:{
        type:Number,
        default:0
    },

    supportQuestions:{
        type:Number,
        default:0
    },

    // ==================================
    // AI
    // ==================================

    satisfactionScore:{
        type:Number,
        default:0
    },

    feedbackCount:{
        type:Number,
        default:0
    },

    aiResponseTime:{
        type:Number,
        default:0
    },

    tokensUsed:{
        type:Number,
        default:0
    },

    openaiCost:{
        type:Number,
        default:0
    }

},
{

    timestamps:true,

    versionKey:false

});

// ======================================
// INDEXES
// ======================================

AnalyticsSchema.index({

    shop:1,

    date:1

},

{

    unique:true

});

AnalyticsSchema.index({

    aiRevenue:-1

});

AnalyticsSchema.index({

    totalChats:-1

});

AnalyticsSchema.index({

    conversionRate:-1

});

// ======================================
// EXPORT
// ======================================

module.exports =
mongoose.model(

    "Analytics",

    AnalyticsSchema

);
