// ======================================
// routes/shopifyOrders.js
// Layboka AI
// Shopify Order Sync Engine
// ======================================

const express = require("express");
const router = express.Router();

const fetch = require("node-fetch");

const Client = require("../models/Client");
const Order = require("../models/Order");

const auth = require("../middleware/auth");

// ======================================
// SYNC ORDERS
// ======================================

router.post(
  "/shopify/sync-orders",
  auth,
  async (req, res) => {

    try {

      const client =
        await Client.findById(
          req.user.id
        );

      if (!client) {

        return res.status(404).json({
          success: false,
          message: "Client not found"
        });

      }

      if (!client.store || !client.token) {

        return res.status(400).json({
          success: false,
          message: "Shopify not connected"
        });

      }

      const response =
        await fetch(
          `https://${client.store}/admin/api/2024-01/orders.json?status=any&limit=250`,
          {
            headers: {
              "X-Shopify-Access-Token":
                client.token,
              "Content-Type":
                "application/json"
            }
          }
        );

      const data =
        await response.json();

      const orders =
        data.orders || [];

      let synced = 0;

      for (const order of orders) {

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
              order.email || "",

            customerName:
              `${order.customer?.first_name || ""}
               ${order.customer?.last_name || ""}`.trim(),

            phone:
              order.phone || "",

            currency:
              order.currency,

            totalPrice:
              Number(order.total_price || 0),

            subtotalPrice:
              Number(order.subtotal_price || 0),

            totalTax:
              Number(order.total_tax || 0),

            financialStatus:
              order.financial_status || "",

            fulfillmentStatus:
              order.fulfillment_status || "unfulfilled",

            orderStatusUrl:
              order.order_status_url || "",

            tags:
              order.tags
                ? order.tags.split(",")
                : [],

            shippingAddress:
              order.shipping_address || {},

            billingAddress:
              order.billing_address || {},

            lineItems:
              order.line_items || [],

            note:
              order.note || "",

            cancelledAt:
              order.cancelled_at,

            processedAt:
              order.processed_at,

            createdAt:
              order.created_at,

            updatedAt:
              order.updated_at

          },

          {
            upsert: true,
            new: true
          }

        );

        synced++;

      }

      res.json({

        success: true,

        synced,

        totalOrders:
          orders.length

      });

    } catch (err) {

      console.log(err);

      res.status(500).json({

        success: false,

        message:
          "Order sync failed"

      });

    }

  }
);

// ======================================
// GET ORDERS
// ======================================

router.get(
  "/orders",
  auth,
  async (req, res) => {

    try {

      const page =
        Number(req.query.page || 1);

      const limit =
        Number(req.query.limit || 25);

      const skip =
        (page - 1) * limit;

      const orders =
        await Order.find({

          clientId:
            req.user.id

        })

        .sort({
          createdAt: -1
        })

        .skip(skip)

        .limit(limit);

      const total =
        await Order.countDocuments({

          clientId:
            req.user.id

        });

      res.json({

        success: true,

        total,

        page,

        orders

      });

    } catch (err) {

      console.log(err);

      res.status(500).json({
        success: false
      });

    }

  }
);

// ======================================
// ORDER DETAILS
// ======================================

router.get(
  "/orders/:id",
  auth,
  async (req, res) => {

    try {

      const order =
        await Order.findOne({

          _id:
            req.params.id,

          clientId:
            req.user.id

        });

      if (!order) {

        return res.status(404).json({

          success: false,

          message:
            "Order not found"

        });

      }

      res.json({

        success: true,

        order

      });

    } catch (err) {

      console.log(err);

      res.status(500).json({
        success: false
      });

    }

  }
);

// ======================================
// CUSTOMER ORDERS
// ======================================

router.get(
  "/customer-orders/:email",
  async (req, res) => {

    try {

      const orders =
        await Order.find({

          email:
            req.params.email

        })

        .sort({
          createdAt: -1
        });

      res.json({

        success: true,

        count:
          orders.length,

        orders

      });

    } catch (err) {

      console.log(err);

      res.status(500).json({
        success: false
      });

    }

  }
);

// ======================================
// LIVE ORDER TRACKING
// ======================================

router.post(
  "/orders/track",
  async (req, res) => {

    try {

      const {
        orderNumber,
        email
      } = req.body;

      const order =
        await Order.findOne({

          orderNumber,

          email

        });

      if (!order) {

        return res.json({

          success: false,

          reply:
            "Order not found"

        });

      }

      res.json({

        success: true,

        order: {

          orderNumber:
            order.orderNumber,

          status:
            order.fulfillmentStatus,

          financialStatus:
            order.financialStatus,

          total:
            order.totalPrice,

          tracking:
            order.orderStatusUrl

        }

      });

    } catch (err) {

      console.log(err);

      res.status(500).json({

        success: false

      });

    }

  }
);

module.exports = router;
