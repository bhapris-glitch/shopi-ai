// ======================================
// routes/support.js
// Layboka AI Support System
// ======================================

const express = require("express");
const router = express.Router();

const Ticket = require("../models/Ticket");
const Client = require("../models/Client");

let Order = null;

try{
  Order = require("../models/Order");
}catch(err){
  console.log("Order model not found");
}

// ======================================
// SIMPLE AI SUPPORT REPLIES
// ======================================

function getAIReply(message=""){

  const text = message.toLowerCase();

  if(
    text.includes("order") ||
    text.includes("tracking")
  ){
    return {
      reply:
      "📦 I can help track your order. Please provide your order number.",
      resolved:false
    };
  }

  if(
    text.includes("refund")
  ){
    return {
      reply:
      "💳 Refund requests are reviewed according to the store policy. A support specialist may contact you shortly.",
      resolved:true
    };
  }

  if(
    text.includes("shipping")
  ){
    return {
      reply:
      "🚚 Shipping times depend on destination and carrier. Please share your order number for exact details.",
      resolved:true
    };
  }

  if(
    text.includes("cancel")
  ){
    return {
      reply:
      "⚠️ Order cancellation depends on fulfillment status. Please provide your order number.",
      resolved:false
    };
  }

  return {
    reply:
    "👋 Thanks for contacting support. Our AI assistant has received your request and a team member may follow up if needed.",
    resolved:false
  };
}

// ======================================
// CREATE TICKET
// ======================================

router.post(
  "/support/ticket",
  async(req,res)=>{

    try{

      const {

        clientId,
        customerName,
        customerEmail,
        customerPhone,
        subject,
        message,
        orderNumber

      } = req.body;

      const ai =
        getAIReply(message);

      const ticket =
        await Ticket.create({

          clientId,

          customerName,

          customerEmail,

          customerPhone,

          subject:
            subject ||
            "Support Request",

          message,

          orderNumber,

          aiHandled:true,

          aiResolved:
            ai.resolved,

          status:
            ai.resolved
            ? "resolved"
            : "open",

          messages:[

            {
              sender:"customer",
              message
            },

            {
              sender:"ai",
              message:ai.reply
            }

          ]

        });

      res.json({

        success:true,

        ticketId:
          ticket._id,

        aiReply:
          ai.reply,

        ticket

      });

    }catch(err){

      console.log(err);

      res.status(500).json({

        success:false,
        message:"Unable to create ticket"

      });

    }

  }
);

// ======================================
// ADD MESSAGE
// ======================================

router.post(
  "/support/reply/:id",
  async(req,res)=>{

    try{

      const {
        sender,
        message
      } = req.body;

      const ticket =
        await Ticket.findById(
          req.params.id
        );

      if(!ticket){

        return res.status(404).json({

          success:false,
          message:"Ticket not found"

        });

      }

      ticket.messages.push({

        sender:
          sender || "customer",

        message

      });

      await ticket.save();

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

// ======================================
// GET SINGLE TICKET
// ======================================

router.get(
  "/support/ticket/:id",
  async(req,res)=>{

    try{

      const ticket =
        await Ticket.findById(
          req.params.id
        );

      if(!ticket){

        return res.status(404).json({

          success:false

        });

      }

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
// GET ALL TICKETS
// ======================================

router.get(
  "/support/tickets",
  async(req,res)=>{

    try{

      const tickets =
        await Ticket.find()
        .sort({
          createdAt:-1
        });

      res.json({

        success:true,
        count:tickets.length,
        tickets

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
// CLOSE TICKET
// ======================================

router.put(
  "/support/close/:id",
  async(req,res)=>{

    try{

      const ticket =
        await Ticket.findById(
          req.params.id
        );

      if(!ticket){

        return res.status(404).json({

          success:false

        });

      }

      ticket.status =
        "closed";

      ticket.closedAt =
        new Date();

      await ticket.save();

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

// ======================================
// REOPEN TICKET
// ======================================

router.put(
  "/support/reopen/:id",
  async(req,res)=>{

    try{

      const ticket =
        await Ticket.findById(
          req.params.id
        );

      if(!ticket){

        return res.status(404).json({

          success:false

        });

      }

      ticket.status =
        "open";

      await ticket.save();

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

// ======================================
// ESCALATE TO HUMAN
// ======================================

router.put(
  "/support/escalate/:id",
  async(req,res)=>{

    try{

      const ticket =
        await Ticket.findById(
          req.params.id
        );

      if(!ticket){

        return res.status(404).json({

          success:false

        });

      }

      ticket.escalatedToHuman =
        true;

      ticket.priority =
        "high";

      ticket.status =
        "pending";

      await ticket.save();

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

// ======================================
// SUPPORT STATS
// ======================================

router.get(
  "/support/stats",
  async(req,res)=>{

    try{

      const total =
        await Ticket.countDocuments();

      const open =
        await Ticket.countDocuments({
          status:"open"
        });

      const closed =
        await Ticket.countDocuments({
          status:"closed"
        });

      const escalated =
        await Ticket.countDocuments({
          escalatedToHuman:true
        });

      const resolved =
        await Ticket.countDocuments({
          aiResolved:true
        });

      res.json({

        success:true,

        total,

        open,

        closed,

        escalated,

        aiResolved:
          resolved

      });

    }catch(err){

      console.log(err);

      res.status(500).json({

        success:false

      });

    }

  }
);

module.exports = router;
