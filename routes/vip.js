// ======================================
// routes/vip.js
// ======================================

const express =
require("express");

const VIPCustomer =
require("../models/VIPCustomer");

const router =
express.Router();

// ======================================
// CREATE VIP
// ======================================

router.post(
  "/vip/save",
  async(req,res)=>{

    try{

      const vip =
        await VIPCustomer.create(
          req.body
        );

      res.json({

        success:true,
        vip

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
// GET VIPS
// ======================================

router.get(
  "/vip/list",
  async(req,res)=>{

    const vip =
      await VIPCustomer.find()
      .sort({ totalSpent:-1 });

    res.json(vip);

  }
);

module.exports = router;
