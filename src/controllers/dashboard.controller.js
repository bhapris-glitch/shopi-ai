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
        // ==============================
        // TODAY STATS
        // PART 2
        // Dashboard Statistics + Response
        // ==============================

        let todayChats = 0;

        let totalResponseTime = 0;

        let totalTokens = 0;

        let totalConversions = 0;

        let totalSatisfied = 0;

        analytics.forEach(item=>{

            todayChats +=

                item.totalChats || 0;

            totalResponseTime +=

                item.aiResponseTime || 0;

            totalTokens +=

                item.tokens || 0;

            totalConversions +=

                item.conversions || 0;

            totalSatisfied +=

                item.satisfied || 0;

        });

        // ==============================
        // AVERAGES
        // ==============================

        const avgResponseTime =

            analytics.length

            ?

            Math.round(

                totalResponseTime /

                analytics.length

            )

            :

            0;

        const satisfaction =

            analytics.length

            ?

            Math.round(

                (

                    totalSatisfied /

                    analytics.length

                ) * 100

            )

            :

            100;

        // ==============================
        // DASHBOARD
        // ==============================

        return res.json({

            success:true,

            dashboard:{

                store:{

                    name:

                        store.storeName ||

                        "",

                    plan:

                        store.plan ||

                        "starter",

                    shop,

                    currency:

                        store.currency ||

                        "USD"

                },

                overview:{

                    totalCustomers,

                    totalChats,

                    activeChats,

                    todayChats,

                    recommendations

                },

                ai:{

                    avgResponseTime,

                    satisfaction,

                    totalTokens,

                    totalConversions

                }

            }

        });

    }

    catch(error){

        console.error(

            "Dashboard Error",

            error

        );

        return res.status(500).json({

            success:false,

            message:

                "Dashboard error."

        });

    }

};

// ======================================
// END
// ======================================
