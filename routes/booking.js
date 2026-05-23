// ======================================
// routes/booking.js
// Layboka AI Booking System
// ======================================

const express =
require("express");

const router =
express.Router();

// ======================================
// CREATE BOOKING
// ======================================

router.post(

  "/booking/create",

  async(req,res)=>{

    try{

      const {

        name,
        email,
        service,
        date

      } = req.body;

      console.log(
        "NEW BOOKING:",
        name,
        service
      );

      res.json({

        success:true,

        booking:{

          id:
            "BK-" + Date.now(),

          name,
          email,
          service,
          date,

          status:
            "confirmed"

        }

      });

    }catch(err){

      console.log(
        "BOOKING ERROR:",
        err
      );

      res.status(500).json({

        success:false

      });

    }

  }

);

// ======================================
// GET BOOKINGS
// ======================================

router.get(

  "/booking/all",

  async(req,res)=>{

    res.json({

      success:true,

      bookings:[]

    });

  }

);

module.exports = router;
