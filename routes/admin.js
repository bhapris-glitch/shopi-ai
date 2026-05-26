// ======================================
// routes/admin.js
// Layboka AI Admin APIs
// GPT-4o-mini Optimized
// ======================================

const express =
require("express");

const bcrypt =
require("bcryptjs");

const jwt =
require("jsonwebtoken");

const Admin =
require("../models/Admin");

const router =
express.Router();

// ======================================
// CREATE ADMIN
// ======================================

router.post(

  "/admin/create",

  async(req,res)=>{

    try{

      const {

        name,
        email,
        password

      } = req.body;

      // ================================
      // CHECK EXISTING
      // ================================

      const existing =
        await Admin.findOne({
          email
        });

      if(existing){

        return res.json({

          success:false,

          message:
          "Admin already exists"

        });

      }

      // ================================
      // HASH PASSWORD
      // ================================

      const hashed =
        await bcrypt.hash(
          password,
          10
        );

      // ================================
      // CREATE ADMIN
      // ================================

      const admin =
        await Admin.create({

          name,
          email,

          password:
            hashed

        });

      res.json({

        success:true,

        admin

      });

    }catch(err){

      console.log(
        "ADMIN CREATE ERROR:",
        err
      );

      res.status(500).json({

        success:false

      });

    }

  }

);

// ======================================
// LOGIN
// ======================================

router.post(

  "/admin/login",

  async(req,res)=>{

    try{

      const {

        email,
        password

      } = req.body;

      const admin =
        await Admin.findOne({
          email
        });

      if(!admin){

        return res.json({

          success:false,

          message:
          "Invalid credentials"

        });

      }

      // ================================
      // PASSWORD CHECK
      // ================================

      const match =
        await bcrypt.compare(

          password,
          admin.password

        );

      if(!match){

        return res.json({

          success:false,

          message:
          "Invalid credentials"

        });

      }

      // ================================
      // TOKEN
      // ================================

      const token =
        jwt.sign(

          {

            id:admin._id,

            role:admin.role

          },

          process.env.JWT_SECRET ||

          "layboka-secret",

          {

            expiresIn:"7d"

          }

        );

      admin.lastLogin =
        new Date();

      await admin.save();

      res.json({

        success:true,

        token,

        admin:{

          id:
            admin._id,

          name:
            admin.name,

          email:
            admin.email

        }

      });

    }catch(err){

      console.log(
        "ADMIN LOGIN ERROR:",
        err
      );

      res.status(500).json({

        success:false

      });

    }

  }

);

// ======================================
// GET ADMINS
// ======================================

router.get(

  "/admin/all",

  async(req,res)=>{

    try{

      const admins =
        await Admin.find()
        .select("-password");

      res.json({

        success:true,

        admins

      });

    }catch(err){

      console.log(err);

      res.status(500).json({

        success:false

      });

    }

  }

);

 //======================================
// GET ADMIN OVERVIEW
// ======================================

router.get(

  "/admin/overview",

  adminAuth,

  async(req,res)=>{

    try{

      const totalClients =
        await Client.countDocuments();

      const paidClients =
        await Client.countDocuments({
          paid:true
        });

      const totalProducts =
        await Product.countDocuments();

      const totalSubscriptions =
        await Subscription.countDocuments();

      const activeSubscriptions =
        await Subscription.countDocuments({
          status:"active"
        });

      const totalChats =
        await Analytics.countDocuments({
          type:"chat"
        });

      const totalSales =
        await Analytics.countDocuments({
          type:"sale"
        });

      res.json({

        success:true,

        overview:{

          totalClients,

          paidClients,

          totalProducts,

          totalSubscriptions,

          activeSubscriptions,

          totalChats,

          totalSales

        }

      });

    }catch(err){

      console.log(err);

      res.status(500).json({

        success:false,

        message:
          "Failed to load admin overview"

      });

    }

  }

);

// ======================================
// GET ALL CLIENTS
// ======================================

router.get(

  "/admin/clients",

  adminAuth,

  async(req,res)=>{

    try{

      const clients =
        await Client.find()

        .sort({
          createdAt:-1
        })

        .limit(200);

      res.json({

        success:true,

        clients

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
// GET SINGLE CLIENT
// ======================================

router.get(

  "/admin/client/:id",

  adminAuth,

  async(req,res)=>{

    try{

      const client =
        await Client.findById(
          req.params.id
        );

      if(!client){

        return res.status(404)
        .json({

          success:false,

          message:
            "Client not found"

        });

      }

      const products =
        await Product.countDocuments({

          clientId:
            client._id

        });

      const chats =
        await Analytics.countDocuments({

          clientId:
            client._id,

          type:"chat"

        });

      res.json({

        success:true,

        client,

        stats:{

          products,

          chats

        }

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
// UPDATE CLIENT PLAN
// ======================================

router.put(

  "/admin/client-plan/:id",

  adminAuth,

  async(req,res)=>{

    try{

      const {
        plan
      } = req.body;

      const client =
        await Client.findByIdAndUpdate(

          req.params.id,

          {
            plan,
            paid:true
          },

          {
            new:true
          }

        );

      res.json({

        success:true,

        client

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
// BLOCK CLIENT
// ======================================

router.put(

  "/admin/block-client/:id",

  adminAuth,

  async(req,res)=>{

    try{

      const client =
        await Client.findByIdAndUpdate(

          req.params.id,

          {
            status:"blocked"
          },

          {
            new:true
          }

        );

      res.json({

        success:true,

        client

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
// DELETE CLIENT
// ======================================

router.delete(

  "/admin/client/:id",

  adminAuth,

  async(req,res)=>{

    try{

      const clientId =
        req.params.id;

      if(
        !mongoose.Types.ObjectId
        .isValid(clientId)
      ){

        return res.status(400)
        .json({

          success:false,

          message:
            "Invalid client ID"

        });

      }

      await Client.findByIdAndDelete(
        clientId
      );

      await Product.deleteMany({
        clientId
      });

      await Analytics.deleteMany({
        clientId
      });

      await Subscription.deleteMany({
        clientId
      });

      res.json({

        success:true,

        message:
          "Client deleted successfully"

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
// GET SALES ANALYTICS
// ======================================

router.get(

  "/admin/sales",

  adminAuth,

  async(req,res)=>{

    try{

      const sales =
        await Analytics.find({

          type:"sale"

        })

        .sort({
          createdAt:-1
        })

        .limit(100);

      res.json({

        success:true,

        sales

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
// GET CHAT ANALYTICS
// ======================================

router.get(

  "/admin/chats",

  adminAuth,

  async(req,res)=>{

    try{

      const chats =
        await Analytics.find({

          type:"chat"

        })

        .sort({
          createdAt:-1
        })

        .limit(200);

      res.json({

        success:true,

        chats

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
