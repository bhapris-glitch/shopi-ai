// ======================================
// models/Order.js
// Layboka AI
// Production Order Model
// updated 4Jun 2026
// ======================================
const mongoose = require("mongoose");

// ======================================
// LINE ITEM
// ======================================

const LineItemSchema = new mongoose.Schema(
  {
    productId: String,

    variantId: String,

    title: String,

    sku: String,

    quantity: {
      type: Number,
      default: 1
    },

    price: {
      type: Number,
      default: 0
    },

    image: {
      type: String,
      default: ""
    }
  },
  { _id: false }
);

// ======================================
// ADDRESS
// ======================================

const AddressSchema = new mongoose.Schema(
  {
    first_name: String,
    last_name: String,
    company: String,
    address1: String,
    address2: String,
    city: String,
    province: String,
    country: String,
    zip: String,
    phone: String
  },
  { _id: false }
);

// ======================================
// ORDER
// ======================================

const OrderSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true
    },

    store: {
      type: String,
      index: true
    },

    shopifyOrderId: {
  type: String,
  required: true
    },

    orderNumber: {
      type: String,
      index: true
    },

    email: {
      type: String,
      lowercase: true,
      index: true
    },

    customerName: {
      type: String,
      default: ""
    },

    phone: {
      type: String,
      default: ""
    },

    currency: {
      type: String,
      default: "USD"
    },

    totalPrice: {
      type: Number,
      default: 0
    },

    subtotalPrice: {
      type: Number,
      default: 0
    },

    totalTax: {
      type: Number,
      default: 0
    },

    financialStatus: {
      type: String,
      default: ""
    },

    fulfillmentStatus: {
      type: String,
      default: "unfulfilled"
    },

    orderStatusUrl: {
      type: String,
      default: ""
    },

    tags: {
      type: [String],
      default: []
    },

    shippingAddress: {
      type: AddressSchema,
      default: {}
    },

    billingAddress: {
      type: AddressSchema,
      default: {}
    },

    lineItems: {
      type: [LineItemSchema],
      default: []
    },

    note: {
      type: String,
      default: ""
    },

    cancelledAt: {
      type: Date
    },

    processedAt: {
      type: Date
    },

    shopifyCreatedAt: {
      type: Date
    },

    shopifyUpdatedAt: {
      type: Date
    },

    aiRecovered: {
      type: Boolean,
      default: false
    },

    aiInfluenced: {
      type: Boolean,
      default: false
    },

    recoveredRevenue: {
      type: Number,
      default: 0
    }
  },
  OrderSchema.index(
{
  clientId: 1,
  shopifyOrderId: 1
},
{
  unique: true
});
  // ======================================
// AI ANALYTICS
// ======================================

conversationId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Conversation"
},

aiAgent: {
  type: String,
  default: "Emma"
},

aiRevenueAttributed: {
  type: Number,
  default: 0
},

upsellRevenue: {
  type: Number,
  default: 0
},

crossSellRevenue: {
  type: Number,
  default: 0
},

checkoutRecovered: {
  type: Boolean,
  default: false
},

abandonedCartRecovered: {
  type: Boolean,
  default: false
},

// ======================================
// CUSTOMER
// ======================================

customerId: {
  type: String,
  default: "",
  index: true
},

country: {
  type: String,
  default: ""
},

city: {
  type: String,
  default: ""
},

// ======================================
// SUBSCRIPTION
// ======================================

subscriptionOrder: {
  type: Boolean,
  default: false
},

subscriptionId: {
  type: String,
  default: ""
},

// ======================================
// ATTRIBUTION
// ======================================

source: {
  type: String,
  default: "shopify"
},

channel: {
  type: String,
  default: "website"
}
  {
    timestamps: true,
    versionKey: false
  }
);

// ======================================
// INDEXES
// ======================================

OrderSchema.index({
  clientId: 1,
  createdAt: -1
});

OrderSchema.index({
  email: 1
});

OrderSchema.index({
  orderNumber: 1
});

OrderSchema.index({
  financialStatus: 1
});

OrderSchema.index({
  fulfillmentStatus: 1
});
OrderSchema.index({
  customerId: 1
});

OrderSchema.index({
  aiInfluenced: 1
});

OrderSchema.index({
  aiRecovered: 1
});

OrderSchema.index({
  clientId: 1,
  aiInfluenced: 1
});

OrderSchema.index({
  clientId: 1,
  createdAt: -1
});

// ======================================
// EXPORT
// ======================================

module.exports =
  mongoose.model(
    "Order",
    OrderSchema
  );
