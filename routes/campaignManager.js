// ======================================
// routes/campaignManager.js
// AI Campaign Manager
// ======================================

const express =
require("express");

const router =
express.Router();

const Campaign =
require("../models/Campaign");

// ======================================
// CREATE CAMPAIGN
// ======================================

router.post(
"/campaign/create",
async(req,res)=>{

try{

  const {

    clientId,
    name,
    type,
    audience,
    content

  } = req.body;

  const campaign =
    await Campaign.create({

      clientId,
      name,
      type,
      audience,
      content,
      status:"active"

    });

  res.json({

    success:true,

    campaign

  });

}catch(err){

  console.log(err);

  res.status(500).json({

    error:"Campaign failed"

  });

}

});

// ======================================
// GET CAMPAIGNS
// ======================================

router.get(
"/campaigns/:clientId",
async(req,res)=>{

try{

  const campaigns =
    await Campaign.find({

      clientId:
        req.params.clientId

    })

    .sort({
      createdAt:-1
    });

  res.json({

    success:true,

    campaigns

  });

}catch(err){

  console.log(err);

  res.status(500).json({

    error:"Campaign load failed"

  });

}

});

module.exports =
router;
