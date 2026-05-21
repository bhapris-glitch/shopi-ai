const express =
require("express");

const router =
express.Router();

// ======================================
// PUSH NOTIFICATION
// ======================================

router.post(
  "/push/send",

  async(req,res)=>{

    try{

      const {

        title,
        message,
        token

      } = req.body;

      console.log(

        "🔔 PUSH:",
        title,
        message

      );

      // FIREBASE / ONESIGNAL HERE

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

module.exports =
router;
