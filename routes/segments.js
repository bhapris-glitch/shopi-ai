// ======================================
// routes/segments.js
// ======================================

const express =
require("express");

const Segment =
require("../models/Segment");

const {
  detectSegment
} = require("../utils/segmentation");

const router =
express.Router();

// ======================================
// SAVE CUSTOMER
// ======================================

router.post(
  "/segments/save",
  async(req,res)=>{

    try{

      const data =
        req.body;

      const segment =
        detectSegment(data);

      const customer =
        await Segment.create({

          ...data,

          segment

        });

      res.json({

        success:true,
        customer

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
// GET SEGMENTS
// ======================================

router.get(
  "/segments",
  async(req,res)=>{

    const customers =
      await Segment.find()
      .sort({ createdAt:-1 });

    res.json(customers);

  }
);

module.exports = router;
