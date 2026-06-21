// ======================================
// services/intent.service.js
// Layboka AI
// Intent Detection Engine
// Production Ready
// ======================================

// ======================================
// INTENT TYPES
// ======================================

const INTENTS = {

    GREETING: "greeting",

    PRODUCT_SEARCH: "product_search",

    PRODUCT_RECOMMENDATION: "product_recommendation",

    PRODUCT_COMPARE: "product_compare",

    PRODUCT_PRICE: "product_price",

    PRODUCT_AVAILABILITY: "product_availability",

    SHIPPING: "shipping",

    RETURN: "return",

    PAYMENT: "payment",

    ORDER_TRACKING: "order_tracking",

    CART: "cart",

    DISCOUNT: "discount",

    SUPPORT: "support",

    COMPLAINT: "complaint",

    THANKS: "thanks",

    GOODBYE: "goodbye",

    UNKNOWN: "unknown"

};

// ======================================
// KEYWORDS
// ======================================

const rules = [

{

intent:INTENTS.GREETING,

keywords:[

"hi",

"hello",

"hey",

"good morning",

"good evening"

]

},

{

intent:INTENTS.PRODUCT_SEARCH,

keywords:[

"looking",

"find",

"search",

"show",

"need",

"want"

]

},

{

intent:INTENTS.PRODUCT_COMPARE,

keywords:[

"compare",

"difference",

"better",

"vs"

]

},

{

intent:INTENTS.PRODUCT_PRICE,

keywords:[

"price",

"cost",

"cheap",

"expensive"

]

},

{

intent:INTENTS.PRODUCT_AVAILABILITY,

keywords:[

"stock",

"available",

"inventory",

"left"

]

},

{

intent:INTENTS.SHIPPING,

keywords:[

"shipping",

"delivery",

"arrive",

"ship"

]

},

{

intent:INTENTS.RETURN,

keywords:[

"return",

"refund",

"exchange"

]

},

{

intent:INTENTS.PAYMENT,

keywords:[

"payment",

"pay",

"credit card",

"paypal",

"upi"

]

},

{

intent:INTENTS.ORDER_TRACKING,

keywords:[

"track",

"tracking",

"order status",

"where is my order"

]

},

{

intent:INTENTS.CART,

keywords:[

"cart",

"basket",

"checkout"

]

},

{

intent:INTENTS.DISCOUNT,

keywords:[

"discount",

"coupon",

"promo",

"offer",

"sale"

]

},

{

intent:INTENTS.SUPPORT,

keywords:[

"agent",

"human",

"support",

"help"

]

},

{

intent:INTENTS.COMPLAINT,

keywords:[

"bad",

"issue",

"problem",

"complaint"

]

},

{

intent:INTENTS.THANKS,

keywords:[

"thanks",

"thank you",

"great"

]

},

{

intent:INTENTS.GOODBYE,

keywords:[

"bye",

"goodbye",

"see you"

]

}

];

// ======================================
// DETECT INTENT
// ======================================

function detectIntent(message=""){

const text=

message.toLowerCase();

for(const rule of rules){

const found=

rule.keywords.some(keyword=>

text.includes(keyword)

);

if(found){

return rule.intent;

}

}

return INTENTS.UNKNOWN;

}

// ======================================
// PRODUCT QUERY
// ======================================

function isProductQuery(message=""){

const text=

message.toLowerCase();

return [

"show",

"find",

"looking",

"need",

"want",

"recommend"

].some(word=>

text.includes(word)

);

}

// ======================================
// SUPPORT REQUEST
// ======================================

function needsHuman(message=""){

const text=

message.toLowerCase();

return [

"human",

"agent",

"customer service",

"real person"

].some(word=>

text.includes(word)

);

}

// ======================================
// EXPORT
// ======================================

module.exports={

INTENTS,

detectIntent,

isProductQuery,

needsHuman

};
