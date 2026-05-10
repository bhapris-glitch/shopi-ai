// ======================================
// routes/analytics.js
// Premium SaaS Analytics
// ======================================

const express = require("express");

const Client = require("../models/Client");

const router = express.Router();

// ======================================
// DASHBOARD ANALYTICS
// ======================================

router.get("/:clientId", async (req,res)=>{

  try{

    const client =
      await Client.findById(
        req.params.clientId
      );

    if(!client){

      return res.status(404).json({

        success:false

      });

    }

    // ==================================
    // RESPONSE
    // ==================================

    res.json({

      success:true,

      analytics:{

        messages:
        client.messages || 0,

        opens:
        client.opens || 0,

        conversions:
        client.conversions || 0,

        revenue:
        client.revenue || 0,

        abandonedCart:
        client.abandonedCart || false,

        plan:
        client.plan || "starter",

        paid:
        client.paid || false,

        status:
        client.status || "trial"

      }

    });

  }catch(err){

    console.log(err);

    res.status(500).json({

      success:false

    });

  }

});

// ======================================
// TRACK CONVERSION
// ======================================

router.post("/conversion", async (req,res)=>{

  try{

    const {

      clientId,
      amount

    } = req.body;

    await Client.findByIdAndUpdate(

      clientId,

      {

        $inc:{

          conversions:1,

          revenue:amount || 0

        }

      }

    );

    res.json({

      success:true

    });

  }catch(err){

    console.log(err);

    res.json({

      success:false

    });

  }

});

// ======================================
// TRACK MESSAGE
// ======================================

router.post("/message", async (req,res)=>{

  try{

    const {

      clientId

    } = req.body;

    await Client.findByIdAndUpdate(

      clientId,

      {

        $inc:{

          messages:1

        }

      }

    );

    res.json({

      success:true

    });

  }catch(err){

    res.json({

      success:false

    });

  }

});

// ======================================
// TRACK OPEN
// ======================================

router.post("/open", async (req,res)=>{

  try{

    const {

      clientId

    } = req.body;

    await Client.findByIdAndUpdate(

      clientId,

      {

        $inc:{

          opens:1

        }

      }

    );

    res.json({

      success:true

    });

  }catch(err){

    res.json({

      success:false

    });

  }

});

// ======================================
// EXPORT
// ======================================

module.exports = router;
