// ======================================
// middleware/adminAuth.js
// Layboka AI Admin Protection
// ======================================

module.exports = (
  req,
  res,
  next
)=>{

  try{

    if(!req.user){

      return res.status(401)
      .json({

        success:false,

        message:
          "Unauthorized"

      });

    }

    // ======================================
    // ADMIN CHECK
    // ======================================

    if(

      req.user.role !== "admin" &&

      req.user.role !== "superadmin"

    ){

      return res.status(403)
      .json({

        success:false,

        message:
          "Admin access required"

      });

    }

    next();

  }catch(err){

    console.log(
      "ADMIN AUTH ERROR:",
      err
    );

    res.status(500).json({

      success:false

    });

  }

};
