// ======================================
// routes/admin.js
// Layboka AI Admin APIs
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

module.exports = router;
