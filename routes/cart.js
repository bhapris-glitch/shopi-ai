const express =
require("express");

const router =
express.Router();

const Cart =
require("../models/Cart");

const {
  generateDiscount
} = require("../utils/discounts");

const {
  generateUpsell
} = require("../utils/upsells");

// ======================================
// SAVE CART
// ======================================

router.post(
  "/cart/save",

  async(req,res)=>{

    try{

      const {

        clientId,
        email,
        name,
        cartId,
        products,
        total,
        currency

      } = req.body;

      let cart =
        await Cart.findOne({

          cartId

        });

      if(cart){

        cart.products =
          products;

        cart.total =
          total;

        await cart.save();

      }else{

        cart =
          new Cart({

            clientId,
            email,
            name,
            cartId,
            products,
            total,
            currency

          });

        await cart.save();

      }

      // ===================================
      // SMART DISCOUNT
      // ===================================

      const discount =
        generateDiscount(total);

      // ===================================
      // AI UPSELL
      // ===================================

      const upsell =
        generateUpsell(products);

      res.json({

        success:true,

        discount,

        upsell

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
// MARK ABANDONED
// ======================================

router.post(
  "/cart/abandoned/:id",

  async(req,res)=>{

    try{

      await Cart.findByIdAndUpdate(

        req.params.id,

        {

          abandoned:true

        }

      );

      res.json({

        success:true

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
