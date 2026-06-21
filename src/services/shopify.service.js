// ======================================
// services/shopify.service.js
// Layboka AI
// Shopify Service
// Production Ready
// ======================================

const axios = require("axios");

// ======================================
// SHOPIFY CLIENT
// ======================================

class ShopifyService {

    constructor(){

        this.timeout = 15000;

    }

    // ==================================
    // GRAPHQL REQUEST
    // ==================================

    async graphql(store, accessToken, query, variables = {}){

        const url =
            `https://${store}/admin/api/2025-01/graphql.json`;

        const response = await

            // ======================================
// PRODUCTS
// ======================================

async getProducts(

    store,

    accessToken,

    first = 250

){

    const query = `

    query Products($first:Int!){

      products(first:$first){

        edges{

          node{

            id

            title

            handle

            description

            vendor

            productType

            tags

            totalInventory

            createdAt

            updatedAt

            onlineStoreUrl

            featuredImage{

              url

            }

            priceRangeV2{

              minVariantPrice{

                amount

                currencyCode

              }

            }

            compareAtPriceRange{

              maxVariantCompareAtPrice{

                amount

              }

            }

            collections(first:20){

              edges{

                node{

                  id

                  title

                }

              }

            }

          }

        }

      }

    }

    `;

    const result =

        await this.graphql(

            store,

            accessToken,

            query,

            { first }

        );

    return result.products.edges.map(

        edge=>{

            const p = edge.node;

            return{

                id:p.id,

                title:p.title,

                handle:p.handle,

                description:p.description,

                vendor:p.vendor,

                productType:p.productType,

                tags:p.tags,

                inventory:p.totalInventory,

                createdAt:p.createdAt,

                updatedAt:p.updatedAt,

                url:p.onlineStoreUrl,

                available:

                    p.totalInventory>0,

                price:

                    Number(

                        p.priceRangeV2

                        .minVariantPrice

                        .amount

                    ),

                currency:

                    p.priceRangeV2

                    .minVariantPrice

                    .currencyCode,

                compareAtPrice:

                    Number(

                        p.compareAtPriceRange

                        ?.maxVariantCompareAtPrice

                        ?.amount || 0

                    ),

                image:

                    p.featuredImage?.url || "",

                collections:

                    p.collections.edges.map(

                        c=>c.node.title

                    )

            };

        }

    );

}

// ======================================
// COLLECTIONS
// ======================================

async getCollections(

    store,

    accessToken,

    first=100

){

    const query=`

    query Collections($first:Int!){

      collections(first:$first){

        edges{

          node{

            id

            title

            handle

            description

          }

        }

      }

    }

    `;

    const result=

        await this.graphql(

            store,

            accessToken,

            query,

            {first}

        );

    return result.collections.edges.map(

        edge=>edge.node

    );

}

// ======================================
// STORE INFO
// ======================================

async getShop(

    store,

    accessToken

){

    const query=`

    {

      shop{

        id

        name

        email

        currencyCode

        primaryDomain{

          url

        }

      }

    }

    `;

    const result=

        await this.graphql(

            store,

            accessToken,

            query

        );

    return result.shop;

    }
