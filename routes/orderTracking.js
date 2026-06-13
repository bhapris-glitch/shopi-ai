const express = require("express");

const router = express.Router();

const fetch = require("node-fetch");

const Client =
require("../models/Client");

// ======================================
// TRACK ORDER
// ======================================

router.post(
  "/track-order",
  async(req,res)=>{

    try{

      const {
        clientId,
        orderNumber
      } = req.body;

      const client =
        await Client.findById(
          clientId
        );

      if(!client){

        return res.json({
          success:false
        });

      }

      const response =
        await fetch(

`https://${client.store}/admin/api/2024-01/orders.json?status=any&name=${orderNumber}`,

          {

            headers:{

              "X-Shopify-Access-Token":
                client.token

            }

          }

        );

      const data =
        await response.json();

      const order =
        data.orders?.[0];

      if(!order){

        return res.json({

          success:false,

          reply:
            "❌ Order not found"

        });

      }

      res.json({

  success:true,

  order:{

    name:
      order.name,

    orderId:
      order.id,

    financial_status:
      order.financial_status,

    fulfillment_status:
      order.fulfillment_status,

    total_price:
      order.total_price,

    currency:
      order.currency,

    created_at:
      order.created_at,

    tracking_number:
      order.fulfillments?.[0]
        ?.tracking_number || "",

    tracking_company:
      order.fulfillments?.[0]
        ?.tracking_company || "",

    tracking_url:
      order.fulfillments?.[0]
        ?.tracking_urls?.[0] || "",

    customer_email:
      order.email || ""

  }

});

    }catch(err){

      console.log(err);

      res.json({
        success:false
      });

    }

  }

);

module.exports = router;
