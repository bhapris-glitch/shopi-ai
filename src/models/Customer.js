// ======================================
// models/Customer.js
// Layboka AI
// AI Customer Model
// Production Ready
// ======================================

const mongoose =
require("mongoose");

// ======================================
// CUSTOMER
// ======================================

const CustomerSchema =
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
    // SHOPIFY
    // ==================================

    shopifyId:{
        type:String,
        default:"",
        index:true
    },

    // ==================================
    // BASIC
    // ==================================

    firstName:{
        type:String,
        default:""
    },

    lastName:{
        type:String,
        default:""
    },

    email:{
        type:String,
        default:"",
        lowercase:true,
        index:true
    },

    phone:{
        type:String,
        default:""
    },

    country:{
        type:String,
        default:""
    },

    language:{
        type:String,
        default:"English"
    },

    // ==================================
    // CUSTOMER TYPE
    // ==================================

    segment:{
        type:String,
        enum:[
            "new",
            "returning",
            "vip",
            "inactive"
        ],
        default:"new",
        index:true
    },

    // ==================================
    // PURCHASE
    // ==================================

    totalOrders:{
        type:Number,
        default:0
    },

    totalSpent:{
        type:Number,
        default:0
    },

    averageOrderValue:{
        type:Number,
        default:0
    },

    lastPurchase:{
        type:Date,
        default:null
    },

    lifetimeValue:{
        type:Number,
        default:0
    },

    // ==================================
    // AI PREFERENCES
    // ==================================

    favouriteBrands:[String],

    favouriteCollections:[String],

    favouriteCategories:[String],

    favouriteColors:[String],

    favouriteSizes:[String],

    priceRange:{

        min:{
            type:Number,
            default:0
        },

        max:{
            type:Number,
            default:0
        }

    },

    // ==================================
    // AI BEHAVIOUR
    // ==================================

    viewedProducts:[String],

    searchedKeywords:[String],

    recommendedProducts:[String],

    clickedProducts:[String],

    purchasedProducts:[String],

    wishlistProducts:[String],

    abandonedCartProducts:[String],

    // ==================================
    // CHAT
    // ==================================

    totalChats:{
        type:Number,
        default:0
    },

    aiOrders:{
        type:Number,
        default:0
    },

    aiRevenue:{
        type:Number,
        default:0
    },

    satisfactionScore:{
        type:Number,
        default:0
    },

    // ==================================
    // AI
    // ==================================

    interests:[String],

    notes:{
        type:String,
        default:""
    },

    lastIntent:{
        type:String,
        default:""
    },

    embedding:[Number],

    // ==================================
    // STATUS
    // ==================================

    active:{
        type:Boolean,
        default:true
    },

    subscribed:{
        type:Boolean,
        default:false
    },

    acceptsMarketing:{
        type:Boolean,
        default:false
    }

},
{

    timestamps:true,

    versionKey:false

});

// ======================================
// INDEXES
// ======================================

CustomerSchema.index({

    shop:1,

    email:1

},

{

    unique:true

});

CustomerSchema.index({

    segment:1

});

CustomerSchema.index({

    totalSpent:-1

});

CustomerSchema.index({

    lifetimeValue:-1

});

// ======================================
// EXPORT
// ======================================

module.exports =
mongoose.model(
    "Customer",
    CustomerSchema
);
