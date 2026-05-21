const express =
require("express");

const router =
express.Router();

const Product =
require("../models/Product");

const Client =
require("../models/Client");

const fetch =
require("node-fetch");

// ======================================
// SHOPIFY PRODUCT SYNC
// ======================================

router.post(
  "/sync-products/:clientId",

  async(req,res)=>{

    try{

      const client =
        await Client.findById(
          req.params.clientId
        );

      if(!client){

        return res.status(404)
        .json({
          error:"Client not found"
        });

      }

      // ===================================
      // SHOPIFY PRODUCTS
      // ===================================

      const response =
        await fetch(

          `https://${client.store}/admin/api/2023-10/products.json`,

          {

            headers:{

              "X-Shopify-Access-Token":
                client.token

            }

          }

        );

      const data =
        await response.json();

      // ===================================
      // SAVE PRODUCTS
      // ===================================

      for(const item of data.products){

        await Product.findOneAndUpdate(

          {
            shopifyId:item.id
          },

          {

            clientId:
              client._id,

            shopifyId:
              item.id,

            title:
              item.title,

            description:
              item.body_html,

            image:
              item.image?.src || "",

            price:
              Number(
                item.variants?.[0]?.price || 0
              ),

            currency:"USD",

            url:
              `https://${client.store}/products/${item.handle}`,

            synced:true

          },

          {
            upsert:true
          }

        );

      }

      res.json({

        success:true,

        total:
          data.products.length

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
// GET PRODUCTS
// ======================================

router.get(
  "/products/:clientId",

  async(req,res)=>{

    try{

      const products =
        await Product.find({

          clientId:
            req.params.clientId

        })

        .sort({
          createdAt:-1
        })

        .limit(20);

      res.json({

        success:true,

        products

      });

    }catch(err){

      console.log(err);

      res.status(500).json({

        success:false

      });

    }

  }
);

module.exports =
router;
