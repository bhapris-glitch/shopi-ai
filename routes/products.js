// ======================================
// routes/products.js
// Shopify Product Sync API
// ======================================

const express =
  require("express");

const fetch =
  require("node-fetch");

const router =
  express.Router();

const mongoose =
  require("mongoose");

const Client =
  require("../models/Client");

const Product =
  require("../models/Product");

// ======================================
// SYNC PRODUCTS
// ======================================

router.post(

  "/sync-products",

  async(req,res)=>{

    try{

      const {
        clientId
      } = req.body;

      if(

        !mongoose.Types.ObjectId
        .isValid(clientId)

      ){

        return res.status(400)
        .json({

          success:false,

          error:"Invalid client"

        });

      }

      const client =
        await Client.findById(
          clientId
        );

      if(!client){

        return res.status(404)
        .json({

          success:false,

          error:"Client not found"

        });

      }

      // ======================================
      // SHOPIFY PRODUCTS
      // ======================================

      const response =
        await fetch(

          `https://${client.store}/admin/api/2023-10/products.json?limit=250`,

          {

            headers:{

              "X-Shopify-Access-Token":
                client.token,

              "Content-Type":
                "application/json"

            }

          }

        );

      const data =
        await response.json();

      if(!data.products){

        return res.status(500)
        .json({

          success:false,

          error:"Failed to fetch products"

        });

      }

      let synced = 0;

      // ======================================
      // LOOP PRODUCTS
      // ======================================

      for(const item of data.products){

        const firstVariant =
          item.variants?.[0];

        const firstImage =
          item.image?.src || "";

        await Product.findOneAndUpdate(

          {

            clientId,

            productId:
              String(item.id)

          },

          {

            clientId,

            shop:
              client.store,

            productId:
              String(item.id),

            title:
              item.title || "",

            description:
              item.body_html || "",

            image:
              firstImage,

            handle:
              item.handle || "",

            vendor:
              item.vendor || "",

            productType:
              item.product_type || "",

            tags:
              item.tags
              ? item.tags.split(",")
              : [],

            variants:
              item.variants.map(v=>({

                id:
                  String(v.id),

                title:
                  v.title,

                price:
                  Number(v.price),

                compareAtPrice:
                  Number(
                    v.compare_at_price
                  ) || 0,

                inventory:
                  v.inventory_quantity || 0,

                sku:
                  v.sku || ""

              })),

            price:
              Number(
                firstVariant?.price || 0
              ),

            currency:"USD",

            active:true,

            syncedAt:new Date()

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

        total:
          data.products.length

      });

    }catch(err){

      console.log(err);

      res.status(500)
      .json({

        success:false,

        error:"Sync failed"

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
            req.params.clientId,

          active:true

        })

        .sort({
          createdAt:-1
        })

        .limit(50);

      res.json({

        success:true,

        products

      });

    }catch(err){

      console.log(err);

      res.status(500)
      .json({

        success:false
      });

    }

  }

);


// ======================================
// SEARCH PRODUCTS
// ======================================

router.get(

  "/search-products",

  async(req,res)=>{

    try{

      const {
        clientId,
        q
      } = req.query;

      if(!clientId){

        return res.status(400)
        .json({

          success:false,

          error:"clientId required"

        });

      }

      const search =
        (q || "").trim();

      let query = {

        clientId,

        active:true

      };

      if(search){

        query.$or = [

          {
            title:{
              $regex:search,
              $options:"i"
            }
          },

          {
            description:{
              $regex:search,
              $options:"i"
            }
          },

          {
            vendor:{
              $regex:search,
              $options:"i"
            }
          },

          {
            productType:{
              $regex:search,
              $options:"i"
            }
          }

        ];

      }

      const products =
        await Product.find(query)

        .limit(20)

        .sort({
          createdAt:-1
        });

      res.json({

        success:true,

        count:
          products.length,

        products

      });

    }catch(err){

      console.log(err);

      res.status(500)
      .json({

        success:false,

        error:"Search failed"

      });

    }

  }

);

// ======================================
// UPSELL PRODUCTS
// ======================================

router.get(

  "/upsells/:clientId",

  async(req,res)=>{

    try{

      const {
        getUpsells
      } = require("../utils/upsells");

      const upsells =
        await getUpsells({

          clientId:
            req.params.clientId

        });

      res.json({

        success:true,

        upsells

      });

    }catch(err){

      console.log(err);

      res.status(500).json({

        success:false

      });

    }

  }

);

module.exports = router;
