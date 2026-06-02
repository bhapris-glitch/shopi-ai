// ======================================
// middleware/adminAuth.js
// Layboka AI Admin Protection
// updated 2 Jun 2026
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

    const role =
      req.user?.role || "";

    // ======================================
    // ADMIN CHECK
    // ======================================

    if(

      role !== "admin" &&

      role !== "superadmin"

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

    return res.status(500)
    .json({

      success:false,

      message:
        "Internal server error"

    });

  }

};
