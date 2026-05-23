// ======================================
// routes/automation.js
// ======================================

const express =
require("express");

const Workflow =
require("../models/Workflow");

const router =
express.Router();

// ======================================
// CREATE WORKFLOW
// ======================================

router.post(
  "/automation/create",
  async(req,res)=>{

    try{

      const workflow =
        await Workflow.create(
          req.body
        );

      res.json({

        success:true,
        workflow

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
// GET WORKFLOWS
// ======================================

router.get(
  "/automation/list",
  async(req,res)=>{

    const workflows =
      await Workflow.find()
      .sort({ createdAt:-1 });

    res.json(workflows);

  }
);

module.exports = router;
