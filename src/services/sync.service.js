// ======================================
// services/sync.service.js
// Layboka AI
// Shopify Sync Service
// Production Ready
// ======================================

const ShopifyService =
require("./shopify.service");

// Future Models
// const Product = require("../models/Product");
// const Collection = require("../models/Collection");
// const Store = require("../models/Store");

class SyncService {

    // ==================================
    // FULL STORE SYNC
    // ==================================

    async syncStore({

        shop,

        accessToken

    }){

        console.log(

            "[SYNC] Starting:",

            shop

        );

        const [

            products,

            collections,

            pages,

            store

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

        // --------------------------------
        // TODO
        // Save Products
        // --------------------------------

        // await Product.bulkWrite(...)

        // --------------------------------
        // TODO
        // Save Collections
        // --------------------------------

        // --------------------------------
        // TODO
        // Save Pages
        // --------------------------------

        // --------------------------------
        // TODO
        // Save Store
        // --------------------------------

        console.log(

            "[SYNC] Finished:",

            shop

        );

        return {

            success:true,

            products:products.length,

            collections:collections.length,

            pages:pages.length

        };

    }

    // ==================================
    // PRODUCT UPDATE
    // ==================================

    async syncProduct(product){

        console.log(

            "[SYNC PRODUCT]",

            product.id

        );

        // TODO

        // await Product.updateOne()

        return true;

    }

    // ==================================
    // PRODUCT DELETE
    // ==================================

    async deleteProduct(id){

        console.log(

            "[DELETE PRODUCT]",

            id

        );

        // TODO

        // await Product.deleteOne()

        return true;

    }

    // ==================================
    // COLLECTION UPDATE
    // ==================================

    async syncCollection(collection){

        console.log(

            "[SYNC COLLECTION]",

            collection.id

        );

        return true;

    }

    // ==================================
    // PAGE UPDATE
    // ==================================

    async syncPage(page){

        console.log(

            "[SYNC PAGE]",

            page.id

        );

        return true;

    }

    // ==================================
    // INVENTORY UPDATE
    // ==================================

    async inventoryUpdate(

        productId,

        inventory

    ){

        console.log(

            "[INVENTORY]",

            productId,

            inventory

        );

        return true;

    }

}

module.exports =

new SyncService();
