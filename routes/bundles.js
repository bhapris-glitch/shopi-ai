// ======================================
// routes/bundles.js
// AI Bundle Routes
// Production Ready
// ======================================

const express =
require("express");

const router =
express.Router();

const {

  generateBundles,

  recommendBundle

} = require(
  "../utils/bundles"
);

// ======================================
// GENERATE BUNDLES
// ======================================

router.post(

  "/bundles",

  async(req,res)=>{

    try{

      const {

        products,

        country,

        customerType

      } = req.body;

      const bundles =

        generateBundles({

          products,

          country,

          customerType

        });

      res.json({

        success:true,

        total:
          bundles.length,

        bundles

      });

    }catch(err){

      console.log(
        "BUNDLES API ERROR:",
        err
      );

      res.status(500).json({

        success:false,

        error:
          "Bundle generation failed"

      });

    }

  }

);

// ======================================
// RECOMMEND BEST BUNDLE
// ======================================

router.post(

  "/bundles/recommend",

  async(req,res)=>{

    try{

      const {

        bundles,

        cartValue

      } = req.body;

      const recommendation =

        recommendBundle({

          bundles,

          cartValue

        });

      res.json({

        success:true,

        recommendation

      });

    }catch(err){

      console.log(
        "RECOMMEND API ERROR:",
        err
      );

      res.status(500).json({

        success:false

      });

    }

  }

);

// ======================================
// TEST API
// ======================================

router.get(

  "/bundles/test",

  async(req,res)=>{

    const sampleProducts = [

      {

        id:1,

        title:"Premium Hoodie",

        price:79,

        image:
          "https://via.placeholder.com/300"

      },

      {

        id:2,

        title:"Sneakers",

        price:120,

        image:
          "https://via.placeholder.com/300"

      },

      {

        id:3,

        title:"Cap",

        price:35,

        image:
          "https://via.placeholder.com/300"

      },

      {

        id:4,

        title:"Backpack",

        price:95,

        image:
          "https://via.placeholder.com/300"

      }

    ];

    const bundles =

      generateBundles({

        products:
          sampleProducts,

        country:"US",

        customerType:"vip"

      });

    const recommendation =

      recommendBundle({

        bundles,

        cartValue:250

      });

    res.json({

      success:true,

      bundles,

      recommendation

    });

  }

);

module.exports = router;
