// ======================================
// routes/analyticsDashboard.js
// AI Analytics APIs
// ======================================

const express =
require("express");

const router =
express.Router();

const Client =
require("../models/Client");

const Analytics =
require("../models/Analytics");

// ======================================
// DASHBOARD
// ======================================

router.get(
"/dashboard-analytics/:clientId",
adminAuth,
async(req,res)=>{

try{

  const {
    clientId
  } = req.params;

  const client =
    await Client.findById(
      clientId
    );

  const analytics =
    await Analytics.find({
      clientId
    });

  let chats = 0;
  let sales = 0;
  let revenue = 0;
  let carts = 0;

  analytics.forEach((a)=>{

    if(a.type === "chat"){
      chats++;
    }

    if(a.type === "sale"){
      sales++;
      revenue += a.value || 0;
    }

    if(a.type === "cart"){
      carts++;
    }

  });

  res.json({

    success:true,

    metrics:{

      chats,
      sales,
      carts,
      revenue,

      conversionRate:
      sales > 0
      ? (
          sales /
          Math.max(chats,1)
        ) * 100
      : 0

    }

  });

}catch(err){

  console.log(err);

  res.status(500).json({
    error:"Dashboard failed"
  });

}

});

module.exports =
router;
