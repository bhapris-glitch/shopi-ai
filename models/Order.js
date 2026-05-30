// ======================================
// models/Order.js
// Layboka AI
// Production Order Model
// ======================================

const mongoose = require("mongoose");

// ======================================
// ORDER ITEM
// ======================================

const OrderItemSchema =
new mongoose.Schema({

  productId:{
    type:String,
    default:""
  },

  variantId:{
    type:String,
    default:""
  },

  title:{
    type:String,
    default:""
  },

  sku:{
    type:String,
    default:""
  },

  quantity:{
    type:Number,
    default:1
  },

  price:{
    type:Number,
    default:0
  },

  image:{
    type:String,
    default:""
  }

},{
  _id:false
});

// ======================================
// TIMELINE EVENTS
// ======================================

const TimelineSchema =
new mongoose.Schema({

  status:{
    type:String,
    default:""
  },

  note:{
    type:String,
    default:""
  },

  location:{
    type:String,
    default:""
  },

  createdAt:{
    type:Date,
    default:Date.now
  }

},{
  _id:false
});

// ======================================
// MAIN ORDER
// ======================================

const OrderSchema =
new mongoose.Schema({

  // ======================================
  // STORE
  // ======================================

  clientId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Client",
    required:true,
    index:true
  },

  store:{
    type:String,
    default:"",
    index:true
  },

  // ======================================
  // SHOPIFY
  // ======================================

  shopifyOrderId:{
    type:String,
    default:"",
    index:true
  },

  orderNumber:{
    type:String,
    required:true,
    index:true
  },

  orderName:{
    type:String,
    default:""
  },

  // ======================================
  // CUSTOMER
  // ======================================

  customerId:{
    type:String,
    default:"",
    index:true
  },

  customerName:{
    type:String,
    default:""
  },

  customerEmail:{
    type:String,
    default:"",
    index:true
  },

  customerPhone:{
    type:String,
    default:""
  },

  country:{
    type:String,
    default:""
  },

  city:{
    type:String,
    default:""
  },

  // ======================================
  // ORDER DATA
  // ======================================

  currency:{
    type:String,
    default:"USD"
  },

  subtotal:{
    type:Number,
    default:0
  },

  discount:{
    type:Number,
    default:0
  },

  shippingCost:{
    type:Number,
    default:0
  },

  tax:{
    type:Number,
    default:0
  },

  total:{
    type:Number,
    default:0
  },

  profit:{
    type:Number,
    default:0
  },

  items:[OrderItemSchema],

  itemCount:{
    type:Number,
    default:0
  },

  // ======================================
  // PAYMENT
  // ======================================

  paymentStatus:{
    type:String,
    enum:[
      "pending",
      "paid",
      "partially_paid",
      "refunded",
      "failed"
    ],
    default:"pending",
    index:true
  },

  paymentMethod:{
    type:String,
    default:""
  },

  transactionId:{
    type:String,
    default:""
  },

  // ======================================
  // FULFILLMENT
  // ======================================

  fulfillmentStatus:{
    type:String,
    enum:[
      "unfulfilled",
      "processing",
      "packed",
      "shipped",
      "out_for_delivery",
      "delivered",
      "returned",
      "cancelled"
    ],
    default:"unfulfilled",
    index:true
  },

  trackingNumber:{
    type:String,
    default:""
  },

  courier:{
    type:String,
    default:""
  },

  trackingUrl:{
    type:String,
    default:""
  },

  estimatedDelivery:{
    type:Date
  },

  deliveredAt:{
    type:Date
  },

  // ======================================
  // AI SALES AGENT
  // ======================================

  aiRecovered:{
    type:Boolean,
    default:false
  },

  recoveredRevenue:{
    type:Number,
    default:0
  },

  recoveredFromCart:{
    type:Boolean,
    default:false
  },

  recoveredByAgent:{
    type:String,
    default:""
  },

  upsellAccepted:{
    type:Boolean,
    default:false
  },

  crossSellAccepted:{
    type:Boolean,
    default:false
  },

  // ======================================
  // CUSTOMER VALUE
  // ======================================

  customerLifetimeValue:{
    type:Number,
    default:0
  },

  customerOrders:{
    type:Number,
    default:1
  },

  vipCustomer:{
    type:Boolean,
    default:false
  },

  // ======================================
  // SUPPORT
  // ======================================

  supportTickets:{
    type:Number,
    default:0
  },

  lastSupportMessage:{
    type:String,
    default:""
  },

  // ======================================
  // REFUNDS
  // ======================================

  refunded:{
    type:Boolean,
    default:false
  },

  refundedAmount:{
    type:Number,
    default:0
  },

  refundReason:{
    type:String,
    default:""
  },

  // ======================================
  // MARKETING
  // ======================================

  referralCode:{
    type:String,
    default:""
  },

  couponCode:{
    type:String,
    default:""
  },

  source:{
    type:String,
    default:"direct"
  },

  campaign:{
    type:String,
    default:""
  },

  // ======================================
  // TIMELINE
  // ======================================

  timeline:[TimelineSchema],

  notes:{
    type:String,
    default:""
  },

  // ======================================
  // RAW SHOPIFY DATA
  // ======================================

  rawShopifyData:{
    type:Object,
    default:{}
  }

},{
  timestamps:true
});

// ======================================
// INDEXES
// ======================================

OrderSchema.index({
  clientId:1,
  createdAt:-1
});

OrderSchema.index({
  customerEmail:1
});

OrderSchema.index({
  orderNumber:1
});

OrderSchema.index({
  fulfillmentStatus:1
});

OrderSchema.index({
  paymentStatus:1
});

// ======================================
// EXPORT
// ======================================

module.exports =
mongoose.model(
  "Order",
  OrderSchema
);
