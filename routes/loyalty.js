// ======================================
// routes/loyalty.js
// Layboka AI Loyalty Engine
// ======================================

const express =
  require("express");

const crypto =
  require("crypto");

const Loyalty =
  require("../models/Loyalty");

const router =
  express.Router();

// ======================================
// CALCULATE TIER
// ======================================

function calculateTier({

  totalSpent,
  orders

}){

  if(
    totalSpent >= 5000 ||
    orders >= 50
  ){

    return "vip";

  }

  if(
    totalSpent >= 2000 ||
    orders >= 20
  ){

    return "gold";

  }

  if(
    totalSpent >= 500 ||
    orders >= 5
  ){

    return "silver";

  }

  return "bronze";

}

// ======================================
// GENERATE COUPON
// ======================================

function generateCoupon(){

  return (
    "LAY-" +

    crypto
    .randomBytes(3)
    .toString("hex")
    .toUpperCase()

  );

}

// ======================================
// ADD POINTS
// ======================================

router.post(
  "/loyalty/add-points",

  async(req,res)=>{

    try{

      const {

        clientId,
        customerEmail,
        customerName,
        amount

      } = req.body;

      if(
        !clientId ||
        !customerEmail
      ){

        return res.status(400)
        .json({

          success:false,
          error:"Missing fields"

        });

      }

      let customer =

        await Loyalty.findOne({

          clientId,
          customerEmail

        });

      // =========================
      // CREATE CUSTOMER
      // =========================

      if(!customer){

        customer =
          new Loyalty({

            clientId,
            customerEmail,
            customerName

          });

      }

      // =========================
      // POINTS LOGIC
      // =========================

      const earnedPoints =

        Math.floor(
          Number(amount || 0)
        );

      customer.points +=
        earnedPoints;

      customer.totalSpent +=
        Number(amount || 0);

      customer.orders += 1;

      customer.lastPurchase =
        new Date();

      customer.tier =
        calculateTier({

          totalSpent:
            customer.totalSpent,

          orders:
            customer.orders

        });

      await customer.save();

      res.json({

        success:true,

        earnedPoints,

        totalPoints:
          customer.points,

        tier:
          customer.tier

      });

    }catch(err){

      console.log(
        "LOYALTY ERROR:",
        err
      );

      res.status(500).json({

        success:false

      });

    }

  }

);

// ======================================
// GET CUSTOMER
// ======================================

router.get(
  "/loyalty/customer",

  async(req,res)=>{

    try{

      const {
        clientId,
        email
      } = req.query;

      const customer =

        await Loyalty.findOne({

          clientId,
          customerEmail:email

        });

      if(!customer){

        return res.json({

          success:false

        });

      }

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
// REDEEM REWARD
// ======================================

router.post(
  "/loyalty/redeem",

  async(req,res)=>{

    try{

      const {

        clientId,
        customerEmail,
        points

      } = req.body;

      const customer =

        await Loyalty.findOne({

          clientId,
          customerEmail

        });

      if(!customer){

        return res.status(404)
        .json({

          success:false,
          error:"Customer not found"

        });

      }

      if(customer.points < points){

        return res.status(400)
        .json({

          success:false,
          error:"Not enough points"

        });

      }

      // =========================
      // DISCOUNT LOGIC
      // =========================

      let discount = 5;

      if(points >= 1000){

        discount = 25;

      }else if(points >= 500){

        discount = 15;

      }else if(points >= 200){

        discount = 10;

      }

      customer.points -= points;

      const couponCode =
        generateCoupon();

      customer.rewards.push({

        code:couponCode,

        discount

      });

      await customer.save();

      res.json({

        success:true,

        code:couponCode,

        discount,

        remainingPoints:
          customer.points

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
// TOP CUSTOMERS
// ======================================

router.get(
  "/loyalty/top-customers",

  async(req,res)=>{

    try{

      const {
        clientId
      } = req.query;

      const customers =

        await Loyalty.find({

          clientId

        })

        .sort({
          totalSpent:-1
        })

        .limit(20);

      res.json({

        success:true,

        customers

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
// VIP CUSTOMERS
// ======================================

router.get(
  "/loyalty/vip",

  async(req,res)=>{

    try{

      const {
        clientId
      } = req.query;

      const customers =

        await Loyalty.find({

          clientId,
          tier:"vip"

        })

        .sort({
          totalSpent:-1
        });

      res.json({

        success:true,

        customers

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
// EXPORT
// ======================================

module.exports = router;
