// ======================================
// models/Product.js
// Layboka AI
// AI Optimized Product Model
// Production Ready
// ======================================

const mongoose =
require("mongoose");

// ======================================
// PRODUCT
// ======================================

const ProductSchema =
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

        required:true,

        index:true

    },

    handle:{

        type:String,

        index:true

    },

    // ==================================
    // BASIC
    // ==================================

    title:{

        type:String,

        required:true,

        index:true

    },

    description:{

        type:String,

        default:""

    },

    vendor:{

        type:String,

        default:"",

        index:true

    },

    productType:{

        type:String,

        default:"",

        index:true

    },

    tags:[{

        type:String,

        index:true

    }],

    // ==================================
    // COLLECTIONS
    // ==================================

    collections:[{

        type:String,

        index:true

    }],

    // ==================================
    // PRICE
    // ==================================

    price:{

        type:Number,

        default:0,

        index:true

    },

    compareAtPrice:{

        type:Number,

        default:0

    },

    currency:{

        type:String,

        default:"USD"

    },

    // ==================================
    // INVENTORY
    // ==================================

    inventory:{

        type:Number,

        default:0

    },

    available:{

        type:Boolean,

        default:true,

        index:true

    },

    // ==================================
    // MEDIA
    // ==================================

    image:{

        type:String,

        default:""

    },

    images:[String],

    url:{

        type:String,

        default:""

    },

    // ==================================
    // AI
    // ==================================

    embedding:[{

        type:Number

    }],

    searchableText:{

        type:String,

        default:""

    },

    keywords:[String],

    // ==================================
    // AI SCORES
    // ==================================

    popularityScore:{

        type:Number,

        default:0,

        index:true

    },

    recommendationScore:{

        type:Number,

        default:0

    },

    trendingScore:{

        type:Number,

        default:0

    },

    salesCount:{

        type:Number,

        default:0

    },

    views:{

        type:Number,

        default:0

    },

    wishlist:{

        type:Number,

        default:0

    },

    cartAdds:{

        type:Number,

        default:0

    },

    purchases:{

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

    deleted:{

        type:Boolean,

        default:false

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

ProductSchema.index({

    shop:1,

    shopifyId:1

},
{

    unique:true

});

ProductSchema.index({

    title:"text",

    description:"text",

    searchableText:"text"

});

ProductSchema.index({

    productType:1,

    available:1

});

ProductSchema.index({

    vendor:1

});

ProductSchema.index({

    popularityScore:-1

});

ProductSchema.index({

    trendingScore:-1

});

ProductSchema.index({

    price:1

});

// ======================================
// EXPORT
// ======================================

module.exports =

mongoose.model(

    "Product",

    ProductSchema

);
