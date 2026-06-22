// ======================================
// controllers/recommendation.controller.js
// Layboka AI
// Recommendation Controller
// List + Generate Recommendations
// Production Ready
// PART 1
// ======================================

const Recommendation =
require("../models/Recommendation");

const RecommendationService =
require("../services/recommendation.service");

// ======================================
// LIST
// ======================================

exports.list =
async(req,res)=>{

    try{

        const shop =

            req.shop ||

            req.query.shop ||

            req.body.shop;

        if(!shop){

            return res.status(400).json({

                success:false,

                message:"Shop is required."

            });

        }

        const recommendations =

            await Recommendation.find({

                shop,

                active:true

            })

            .sort({

                score:-1,

                purchases:-1

            });

        return res.json({

            success:true,

            total:

                recommendations.length,

            recommendations

        });

    }

    catch(error){

        console.error(

            "Recommendation List Error",

            error

        );

        return res.status(500).json({

            success:false,

            message:

                "Internal Server Error."

        });

    }

};

// ======================================
// GENERATE
// ======================================

exports.generate =
async(req,res)=>{

    try{

        const {

            shop,

            productId,

            customerId

        } = req.body;

        if(

            !shop ||

            !productId

        ){

            return res.status(400).json({

                success:false,

                message:

                    "Missing required fields."

            });

        }

        const result =

            await RecommendationService.getRecommendations({

                shop,

                productId,

                customerId

            });

        return res.json({

            success:true,

            recommendations:

                result

        });

    }

    catch(error){

        console.error(

            "Recommendation Generate Error",

            error

        );

        return res.status(500).json({

            success:false,

            message:

                "Internal Server Error."

        });

    }

};
// ======================================
// UPDATE SCORE
// ======================================

exports.update =
async(req,res)=>{

    try{

        const id =

            req.params.id;

        const {

            score,

            confidence,

            active

        } = req.body;

        const recommendation =

            await Recommendation.findByIdAndUpdate(

                id,

                {

                    score,

                    confidence,

                    active

                },

                {

                    new:true

                }

            );

        if(!recommendation){

            return res.status(404).json({

                success:false,

                message:

                    "Recommendation not found."

            });

        }

        return res.json({

            success:true,

            recommendation

        });

    }

    catch(error){

        console.error(

            "Recommendation Update Error",

            error

        );

        return res.status(500).json({

            success:false,

            message:

                "Internal Server Error."

        });

    }

};

// ======================================
// DELETE
// ======================================

exports.remove =
async(req,res)=>{

    try{

        const id =

            req.params.id;

        const recommendation =

            await Recommendation.findByIdAndDelete(

                id

            );

        if(!recommendation){

            return res.status(404).json({

                success:false,

                message:

                    "Recommendation not found."

            });

        }

        return res.json({

            success:true,

            message:

                "Recommendation deleted."

        });

    }

    catch(error){

        console.error(

            "Recommendation Delete Error",

            error

        );

        return res.status(500).json({

            success:false,

            message:

                "Internal Server Error."

        });

    }

};

// ======================================
// ANALYTICS
// ======================================

exports.analytics =
async(req,res)=>{

    try{

        const shop =

            req.query.shop;

        if(!shop){

            return res.status(400).json({

                success:false,

                message:

                    "Shop is required."

            });

        }

        const recommendations =

            await Recommendation.find({

                shop

            });

        const total =

            recommendations.length;

        let totalClicks = 0;

        let totalPurchases = 0;

        let totalRevenue = 0;

        recommendations.forEach(item=>{

            totalClicks +=

                item.clicks || 0;

            totalPurchases +=

                item.purchases || 0;

            totalRevenue +=

                item.revenue || 0;

        });

        return res.json({

            success:true,

            analytics:{

                totalRecommendations:

                    total,

                totalClicks,

                totalPurchases,

                totalRevenue

            }

        });

    }

    catch(error){

        console.error(

            "Recommendation Analytics Error",

            error

        );

        return res.status(500).json({

            success:false,

            message:

                "Internal Server Error."

        });

    }

};

// ======================================
// HEALTH
// ======================================

exports.health =
async(req,res)=>{

    return res.json({

        success:true,

        service:

            "Recommendation",

        status:

            "running",

        timestamp:

            new Date()

    });

};

// ======================================
// EXPORT
// ======================================

module.exports =

exports;
