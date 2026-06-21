// ======================================
// models/Store.js
// Layboka AI
// AI Optimized Store Model
// Production Ready
// ======================================

const mongoose =
require("mongoose");

// ======================================
// STORE
// ======================================

const StoreSchema =
new mongoose.Schema({

    // ==================================
    // SHOPIFY
    // ==================================

    shop:{

        type:String,

        required:true,

        unique:true,

        index:true

    },

    accessToken:{

        type:String,

        required:true,

        select:false

    },

    shopifyId:{

        type:String,

        default:"",

        index:true

    },

    // ==================================
    // BASIC
    // ==================================

    storeName:{

        type:String,

        default:""

    },

    email:{

        type:String,

        default:""

    },

    domain:{

        type:String,

        default:""

    },

    currency:{

        type:String,

        default:"USD"

    },

    language:{

        type:String,

        default:"English"

    },

    timezone:{

        type:String,

        default:"UTC"

    },

    country:{

        type:String,

        default:""

    },

    niche:{

        type:String,

        default:"General Store"

    },

    // ==================================
    // AI SETTINGS
    // ==================================

    aiEnabled:{

        type:Boolean,

        default:true

    },

    aiModel:{

        type:String,

        default:"gpt-5.5"

    },

    tone:{

        type:String,

        enum:[

            "friendly",

            "professional",

            "luxury",

            "minimal",

            "playful"

        ],

        default:"friendly"

    },

    customInstructions:{

        type:String,

        default:""

    },

    // ==================================
    // AVATAR
    // ==================================

    avatarType:{

        type:String,

        enum:[

            "female",

            "male",

            "custom",

            "logo"

        ],

        default:"female"

    },

    customAvatar:{

        type:String,

        default:""

    },

    // ==================================
    // CHAT APPEARANCE
    // ==================================

    primaryColor:{

        type:String,

        default:"#4F46E5"

    },

    secondaryColor:{

        type:String,

        default:"#ffffff"

    },

    bubbleColor:{

        type:String,

        default:"#4F46E5"

    },

    backgroundColor:{

        type:String,

        default:"#ffffff"

    },

    borderRadius:{

        type:Number,

        default:18

    },

    darkMode:{

        type:Boolean,

        default:false

    },

    // ==================================
    // POLICIES
    // ==================================

    shippingPolicy:{

        type:String,

        default:""

    },

    returnPolicy:{

        type:String,

        default:""

    },

    privacyPolicy:{

        type:String,

        default:""

    },

    terms:{

        type:String,

        default:""

    },

    businessHours:{

        type:String,

        default:""

    },

    supportEmail:{

        type:String,

        default:""

    },

    supportPhone:{

        type:String,

        default:""

    },

    // ==================================
    // ANALYTICS
    // ==================================

    totalChats:{

        type:Number,

        default:0

    },

    resolvedChats:{

        type:Number,

        default:0

    },

    aiSales:{

        type:Number,

        default:0

    },

    aiRevenue:{

        type:Number,

        default:0

    },

    syncedAt:{

        type:Date,

        default:Date.now

    },

    active:{

        type:Boolean,

        default:true

    }

},
{

    timestamps:true,

    versionKey:false

});

// ======================================
// INDEXES
// ======================================

StoreSchema.index({

    shop:1

});

StoreSchema.index({

    email:1

});

// ======================================
// EXPORT
// ======================================

module.exports =
mongoose.model(

    "Store",

    StoreSchema

);
