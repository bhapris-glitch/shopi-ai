// ======================================
// routes/shopifyOrders.js
// Layboka AI
// Shopify Orders Engine
// GPT-4o-mini Optimized - PART - 1
// ======================================

const express = require("express");

const router = express.Router();

const auth =
require("../middleware/auth");

const Order =
require("../models/Order");

const Client =
require("../models/Client");

const {

  getRecentOrders

} = require("../services/shopify");

// ======================================
// SYNC ORDERS
// ======================================

router.post(

  "/sync-orders",

  auth,

  async (req,res)=>{

    try{

      const client =

        await Client.findById(
          req.user.id
        );

      if(!client){

        return res.status(404).json({

          success:false,

          message:"Client not found"

        });

      }

      // ==============================
      // SHOPIFY
      // ==============================

      const shopifyOrders =

        await getRecentOrders(
          client,
          250
        );

      let synced = 0;

      for(

        const order of shopifyOrders

      ){

        await Order.findOneAndUpdate(

          {

            shopifyOrderId:
              String(order.id)

          },

          {

            clientId:
              client._id,

            store:
              client.store,

            shopifyOrderId:
              String(order.id),

            orderNumber:
              order.name,

            email:
              order.customer?.email || "",

            customerName:
              `${order.customer?.firstName || ""}
               ${order.customer?.lastName || ""}`.trim(),

            totalPrice:

              Number(

                order.totalPriceSet
                ?.shopMoney
                ?.amount || 0

              ),

            currency:

              order.totalPriceSet
              ?.shopMoney
              ?.currencyCode || "USD",

            financialStatus:
              order.displayFinancialStatus || "",

            fulfillmentStatus:
              order.displayFulfillmentStatus || "",

            createdAt:
              order.createdAt

          },

          {

            upsert:true,

            new:true

          }

        );

        synced++;

      }

      res.json({

        success:true,

        synced,

        totalOrders:
          shopifyOrders.length

      });

    }catch(err){

      console.log(err);

      res.status(500).json({

        success:false,

        message:
          "Order sync failed"

      });

    }

  }

);
// ======================================
// GET ORDERS - PART 2-
// ======================================

router.get(

  "/orders",

  auth,

  async (req,res)=>{

    try{

      const page =

        Number(
          req.query.page || 1
        );

      const limit =

        Number(
          req.query.limit || 25
        );

      const skip =

        (page - 1) * limit;

      const orders =

        await Order.find({

          clientId:
            req.user.id

        })

        .sort({

          createdAt:-1

        })

        .skip(skip)

        .limit(limit)

        .lean();

      const total =

        await Order.countDocuments({

          clientId:
            req.user.id

        });

      res.json({

        success:true,

        page,

        limit,

        total,

        pages:

          Math.ceil(
            total / limit
          ),

        orders

      });

    }catch(err){

      console.log(err);

      res.status(500).json({

        success:false,

        message:
          "Failed to load orders"

      });

    }

  }

);

// ======================================
// GET SINGLE ORDER
// ======================================

router.get(

  "/orders/:id",

  auth,

  async (req,res)=>{

    try{

      const order =

        await Order.findOne({

          _id:
            req.params.id,

          clientId:
            req.user.id

        })

        .lean();

      if(!order){

        return res.status(404).json({

          success:false,

          message:
            "Order not found"

        });

      }

      res.json({

        success:true,

        order

      });

    }catch(err){

      console.log(err);

      res.status(500).json({

        success:false,

        message:
          "Failed to load order"

      });

    }

  }

);
// ======================================
// CUSTOMER ORDER HISTORY
// ======================================

router.get(

  "/customer-orders/:email",

  async (req,res)=>{

    try{

      const email =

        String(
          req.params.email || ""
        )

        .trim()

        .toLowerCase();

      if(!email){

        return res.status(400).json({

          success:false,

          message:
            "Email required"

        });

      }

      const orders =

        await Order.find({

          email

        })

        .sort({

          createdAt:-1

        })

        .limit(100)

        .lean();

      res.json({

        success:true,

        count:
          orders.length,

        orders

      });

    }catch(err){

      console.log(err);

      res.status(500).json({

        success:false,

        message:
          "Unable to fetch orders"

      });

    }

  }

);

// ======================================
// LIVE ORDER TRACKING
// Used By AI Agent
// ======================================

router.post(

  "/track",

  async (req,res)=>{

    try{

      const {

        orderNumber,

        email

      } = req.body;

      if(

        !orderNumber ||

        !email

      ){

        return res.status(400).json({

          success:false,

          reply:
            "Order number and email required"

        });

      }

      const order =

        await Order.findOne({

          orderNumber,

          email:
            email.toLowerCase()

        })

        .lean();

      if(!order){

        return res.json({

          success:false,

          reply:
            "I couldn't find that order. Please check the order number and email."

        });

      }

      let statusMessage =

        `Order ${order.orderNumber}\n\n`;

      statusMessage +=

        `Payment: ${order.financialStatus}\n`;

      statusMessage +=

        `Fulfillment: ${order.fulfillmentStatus}\n`;

      statusMessage +=

        `Total: ${order.currency} ${order.totalPrice}\n`;

      if(order.orderStatusUrl){

        statusMessage +=

          `\nTrack Here:\n${order.orderStatusUrl}`;

      }

      res.json({

        success:true,

        order:{

          id:
            order._id,

          orderNumber:
            order.orderNumber,

          totalPrice:
            order.totalPrice,

          currency:
            order.currency,

          financialStatus:
            order.financialStatus,

          fulfillmentStatus:
            order.fulfillmentStatus,

          trackingUrl:
            order.orderStatusUrl || ""

        },

        reply:
          statusMessage

      });

    }catch(err){

      console.log(err);

      res.status(500).json({

        success:false,

        reply:
          "Tracking service unavailable"

      });

    }

  }

);
// ======================================
// AI CONVERSION TRACKING
// ======================================

router.post(

  "/conversion",

  auth,

  async (req,res)=>{

    try{

      const {

        orderId,

        revenue = 0,

        aiInfluenced = true,

        recovered = false

      } = req.body;

      const client =

        await Client.findById(
          req.user.id
        );

      if(!client){

        return res.status(404).json({

          success:false

        });

      }

      // ==============================
      // UPDATE CLIENT ANALYTICS
      // ==============================

      client.orders =

        (client.orders || 0) + 1;

      client.revenue =

        (client.revenue || 0) +
        Number(revenue);

      client.conversions =

        (client.conversions || 0) + 1;

      // ==============================
      // AI REVENUE
      // ==============================

      if(aiInfluenced){

        client.aiInfluencedRevenue =

          (client.aiInfluencedRevenue || 0) +

          Number(revenue);

      }

      // ==============================
      // RECOVERED CART
      // ==============================

      if(recovered){

        client.recoveredRevenue =

          (client.recoveredRevenue || 0) +

          Number(revenue);

        client.recoveredCarts =

          (client.recoveredCarts || 0) + 1;

      }

      await client.save();

      res.json({

        success:true,

        revenue,

        totalRevenue:
          client.revenue,

        aiRevenue:
          client.aiInfluencedRevenue

      });

    }catch(err){

      console.log(err);

      res.status(500).json({

        success:false

      });

    }

  }

);

// ======================================
// AOV ANALYTICS
// ======================================

router.get(

  "/analytics",

  auth,

  async (req,res)=>{

    try{

      const client =

        await Client.findById(
          req.user.id
        )

        .lean();

      if(!client){

        return res.status(404).json({

          success:false

        });

      }

      const orders =

        client.orders || 0;

      const revenue =

        client.revenue || 0;

      const aov =

        orders > 0

          ?

          revenue / orders

          :

          0;

      res.json({

        success:true,

        orders,

        revenue,

        conversions:
          client.conversions || 0,

        aiRevenue:
          client.aiInfluencedRevenue || 0,

        recoveredRevenue:
          client.recoveredRevenue || 0,

        recoveredCarts:
          client.recoveredCarts || 0,

        aov:
          Number(aov.toFixed(2))

      });

    }catch(err){

      console.log(err);

      res.status(500).json({

        success:false

      });

    }

  }

);

// ======================================
// EXPORT
// ======================================

module.exports = router;
