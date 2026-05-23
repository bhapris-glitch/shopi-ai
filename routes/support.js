// ======================================
// routes/support.js
// ======================================

const express = require("express");

const Ticket =
require("../models/Ticket");

const router =
  express.Router();

// ======================================
// CREATE TICKET
// ======================================

router.post(
  "/support/ticket",
  async(req,res)=>{

    try{

      const {
        name,
        email,
        message
      } = req.body;

      const ticket =
        await Ticket.create({

          name,
          email,
          message,
          status:"open"

        });

      res.json({

        success:true,
        ticket

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
// GET TICKETS
// ======================================

router.get(
  "/support/tickets",
  async(req,res)=>{

    const tickets =
      await Ticket.find()
      .sort({ createdAt:-1 });

    res.json(tickets);

  }
);

module.exports = router;
