// ======================================
// controllers/analytics.controller.js
// Layboka AI
// Analytics Controller
// Production Ready
// PART 1
// ======================================

const Analytics =
require("../models/Analytics");

const Conversation =
require("../models/Conversation");

const Customer =
require("../models/Customer");

const Recommendation =
require("../models/Recommendation");

// ======================================
// ANALYTICS OVERVIEW
// ======================================

exports.overview =
async(req,res)=>{

    try{

        // ==============================
        // SHOP
        // ==============================

        const shop =

            req.shop ||

            req.query.shop ||

            req.body.shop ||

            "";

        if(!shop){

            return res.status(400).json({

                success:false,

                message:"Shop is required."

            });

        }

        // ==============================
        // PERIOD
        // ==============================

        const period =

            req.query.period ||

            "today";

        const startDate =

            new Date();

        switch(period){

            case "week":

                startDate.setDate(

                    startDate.getDate()-7

                );

                break;

            case "month":

                startDate.setMonth(

                    startDate.getMonth()-1

                );

                break;

            case "year":

                startDate.setFullYear(

                    startDate.getFullYear()-1

                );

                break;

            default:

                startDate.setHours(

                    0,

                    0,

                    0,

                    0

                );

                break;

        }

        // ==============================
        // LOAD DATA
        // ==============================

        const [

            analytics,

            conversations,

            customers,

            recommendations

        ] = await Promise.all([

            Analytics.find({

                shop,

                createdAt:{

                    $gte:startDate

                }

            }),

            Conversation.find({

                shop,

                createdAt:{

                    $gte:startDate

                }

            }),

            Customer.find({

                shop

            }),

            Recommendation.find({

                shop

            })

        ]);

        // ==============================
        // PLACEHOLDERS
        // ==============================

        let totalChats = 0;

        let totalTokens = 0;

        let totalRevenue = 0;

        let totalConversions = 0;

        let totalSatisfied = 0;

        let totalResponseTime = 0;
                // ==============================
        // CALCULATE TOTALS
        // ==============================

        analytics.forEach(item=>{

            totalChats +=
                item.totalChats || 0;

            totalTokens +=
                item.tokens || 0;

            totalRevenue +=
                item.revenue || 0;

            totalConversions +=
                item.conversions || 0;

            totalSatisfied +=
                item.satisfied || 0;

            totalResponseTime +=
                item.aiResponseTime || 0;

        });

        // ==============================
        // AVERAGES
        // ==============================

        const averageResponseTime =

            analytics.length > 0

            ?

            Math.round(

                totalResponseTime /

                analytics.length

            )

            :

            0;

        const satisfactionRate =

            analytics.length > 0

            ?

            Number(

                (

                    totalSatisfied /

                    analytics.length

                ) * 100

            ).toFixed(2)

            :

            100;

        const conversionRate =

            totalChats > 0

            ?

            Number(

                (

                    totalConversions /

                    totalChats

                ) * 100

            ).toFixed(2)

            :

            0;

        // ==============================
        // ACTIVE CHATS
        // ==============================

        const activeChats =

            conversations.filter(

                chat=>

                    chat.status==="active"

            ).length;

        // ==============================
        // TOP RECOMMENDATIONS
        // ==============================

        const topRecommendations =

            recommendations

            .sort(

                (a,b)=>

                    (b.purchases || 0) -

                    (a.purchases || 0)

            )

            .slice(0,10);

        // ==============================
        // RESPONSE
        // ==============================

        return res.json({

            success:true,

            analytics:{

                shop,

                period,

                overview:{

                    totalCustomers:

                        customers.length,

                    totalChats,

                    activeChats,

                    totalRevenue,

                    totalTokens,

                    totalConversions,

                    conversionRate,

                    satisfactionRate,

                    averageResponseTime

                },

                topRecommendations

            }

        });

    }

    catch(error){

        console.error(

            "Analytics Controller Error:",

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
// EXPORT
// ======================================

module.exports =

exports;
