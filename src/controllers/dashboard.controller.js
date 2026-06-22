// ======================================
// controllers/dashboard.controller.js
// Layboka AI
// Dashboard Controller
// Production Ready
// PART 1
// ======================================

const Conversation =
require("../models/Conversation");

const Analytics =
require("../models/Analytics");

const Recommendation =
require("../models/Recommendation");

const Store =
require("../models/Store");

const Customer =
require("../models/Customer");

// ======================================
// OVERVIEW
// ======================================

exports.overview =
async(req,res)=>{

    try{

        const shop =

            req.shop ||

            req.query.shop ||

            req.body.shop;

        if(!shop){

            return res.status(400).json({

                success:false,

                message:"Shop missing."

            });

        }

        // ==============================
        // STORE
        // ==============================

        const store =

            await Store.findOne({

                shop

            });

        if(!store){

            return res.status(404).json({

                success:false,

                message:"Store not found."

            });

        }

        // ==============================
        // TODAY
        // ==============================

        const today =

            new Date();

        today.setHours(

            0,

            0,

            0,

            0

        );

        // ==============================
        // COUNTS
        // ==============================

        const [

            totalCustomers,

            totalChats,

            activeChats,

            recommendations,

            analytics

        ] = await Promise.all([

            Customer.countDocuments({

                shop

            }),

            Conversation.countDocuments({

                shop

            }),

            Conversation.countDocuments({

                shop,

                status:"active"

            }),

            Recommendation.countDocuments({

                shop

            }),

            Analytics.find({

                shop,

                createdAt:{

                    $gte:today

                }

            })

        ]);
