// ======================================
// controllers/chat.controller.js
// Layboka AI
// Chat Controller
// Production Ready
// ======================================

const AIService =
require("../services/ai.service");

const ShopifyService =
require("../services/shopify.service");

// ======================================
// CHAT
// ======================================

exports.chat = async (req, res) => {

    try {

        const {

            message,

            sessionId,

            customer = {},

            cart = []

        } = req.body;

        if (!message) {

            return res.status(400).json({

                success: false,

                message: "Message is required."

            });

        }

        const shop =
            req.shop;

        const accessToken =
            req.accessToken;

        // ==============================
        // LOAD SHOPIFY DATA
        // ==============================

        const [

            products,

            collections,

            pages,

            shopInfo

        ] = await Promise.all([

            ShopifyService.getProducts(

                shop,

                accessToken

            ),

            ShopifyService.getCollections(

                shop,

                accessToken

            ),

            ShopifyService.getPages(

                shop,

                accessToken

            ),

            ShopifyService.getShop(

                shop,

                accessToken

            )

        ]);

        // ==============================
        // STORE OBJECT
        // ==============================

        const store = {

            storeName:
                shopInfo.name,

            currency:
                shopInfo.currencyCode,

            supportEmail:
                shopInfo.email,

            domain:
                shopInfo.primaryDomain?.url || ""

        };

        // ==============================
        // AI
        // ==============================

        const result =
            await AIService.chat({

                sessionId,

                store,

                customer,

                products,

                collections,

                pages,

                faqs: [],

                cart,

                message

            });

        return res.json({

            success: true,

            data: result

        });

    }

    catch (error) {

        console.error(

            "CHAT ERROR",

            error

        );

        return res.status(500).json({

            success: false,

            message:
                "Internal server error."

        });

    }

};

// ======================================
// HEALTH
// ======================================

exports.health = async (req, res) => {

    return res.json({

        success: true,

        service: "Layboka AI",

        status: "running",

        timestamp: new Date()

    });

};
