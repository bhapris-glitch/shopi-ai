// ======================================
// services/shopify.js
// Layboka Shopify Service
// Part 1
// Config + GraphQL Engine + Auth Layer
// US / UK / CA / AUS Ready
// Updated Jun 2026
// ======================================

require("dotenv").config();

const fetch = require("node-fetch");

const Client = require("../models/Client");

// ======================================
// SHOPIFY API VERSION
// ======================================

const SHOPIFY_API_VERSION =

  process.env.SHOPIFY_API_VERSION ||

  "2025-10";

// ======================================
// BUILD SHOP URL
// ======================================

function getShopDomain(client) {

  if (!client) {

    throw new Error(
      "Client missing"
    );

  }

  let shop = client.store;

  if (!shop) {

    throw new Error(
      "Store missing"
    );

  }

  // already full domain

  if (
    shop.includes(".myshopify.com")
  ) {

    return shop;

  }

  return `${shop}.myshopify.com`;

}

// ======================================
// ACCESS TOKEN
// ======================================

function getAccessToken(client) {

  const token = client.token;

  if (!token) {

    throw new Error(
      "Shopify token missing"
    );

  }

  return token;

}

// ======================================
// SHOPIFY HEADERS
// ======================================

function getShopifyHeaders(client) {

  return {

    "Content-Type":
      "application/json",

    "X-Shopify-Access-Token":
      getAccessToken(client)

  };

}

// ======================================
// GRAPHQL URL
// ======================================

function getGraphqlUrl(client) {

  return `https://${getShopDomain(client)}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;

}

// ======================================
// GENERIC GRAPHQL REQUEST
// ======================================

async function graphqlRequest({

  client,

  query,

  variables = {}

}) {

  try {

    const response =
      await fetch(

        getGraphqlUrl(client),

        {

          method: "POST",

          headers:
            getShopifyHeaders(client),

          body: JSON.stringify({

            query,

            variables

          })

        }

      );
// ======================================
// HTTP RESPONSE VALIDATION
// ======================================

if (!response.ok) {

  throw new Error(

    `Shopify HTTP ${response.status}`

  );

}
    const data =
      await response.json();

    // ==================================
    // SHOPIFY ERRORS
    // ==================================

    if (data.errors) {

      console.log(
        "Shopify GraphQL Error:",
        data.errors
      );

      throw new Error(
        "Shopify GraphQL failed"
      );

    }

    return data.data;

  } catch (err) {

    console.log(
      "GraphQL Request Error:",
      err.message
    );

    throw err;

  }

}
// ======================================
// SHOPIFY GRAPHQL COMPATIBILITY WRAPPER
// Keeps legacy functions working
// ======================================

async function shopifyGraphQL(
  client,
  query,
  variables = {}
) {

  return graphqlRequest({

    client,

    query,

    variables

  });

}
// ======================================
// FIND CLIENT
// ======================================

async function getClient(clientId) {

  const client =
    await Client.findById(clientId);

  if (!client) {

    throw new Error(
      "Client not found"
    );

  }

  return client;

}

// ======================================
// GET CLIENT BY STORE
// ======================================

async function getClientByStore(store) {

  const client =
    await Client.findOne({

      store

    });

  if (!client) {

    throw new Error(
      "Store not found"
    );

  }

  return client;

}

// ======================================
// BASIC SHOP INFO
// ======================================

async function getShopInfo(client) {

  const query = `

  query {

    shop {

      id

      name

      email

      currencyCode

      plan {

        displayName

      }

    }

  }

  `;

  const data =
    await graphqlRequest({

      client,

      query

    });

  return data.shop;

}

// ======================================
// VERIFY CONNECTION
// ======================================

async function verifyConnection(client) {

  try {

    await getShopInfo(client);

    return true;

  } catch (err) {

    return false;

  }

}
// ======================================
// PRODUCT FUNCTIONS
// Part 2
// ======================================
// GET PRODUCTS
// ======================================

async function getProducts(client, limit = 50) {

  try {

    const query = `
    {
      products(first:${limit}) {

        edges {

          node {

            id
            title
            handle
            description

            vendor
            productType

            tags

            featuredImage {

              url

            }

            variants(first:20){

              edges{

                node{

                  id
                  title
                  sku
                  price

                  inventoryQuantity

                }

              }

            }

          }

        }

      }

    }
    `;

    const data =
      await shopifyGraphQL(
        client,
        query
      );

    return (
      data?.products?.edges || []
    ).map(x => x.node);

  } catch (err) {

    console.log(
      "getProducts Error:",
      err.message
    );

    return [];

  }

}

// ======================================
// GET SINGLE PRODUCT
// ======================================

async function getProductByHandle(
  client,
  handle
) {

  try {

    const query = `
    {
      productByHandle(
        handle:"${handle}"
      ) {

        id
        title
        handle

        description

        vendor
        productType

        tags

        featuredImage {

          url

        }

        variants(first:20){

          edges{

            node{

              id
              title
              sku
              price

              inventoryQuantity

            }

          }

        }

      }

    }
    `;

    const data =
      await shopifyGraphQL(
        client,
        query
      );

    return data?.productByHandle;

  } catch (err) {

    console.log(
      "getProductByHandle Error:",
      err.message
    );

    return null;

  }

}

// ======================================
// GET PRODUCT BY ID
// ======================================

async function getProductById(
  client,
  productId
) {

  try {

    const query = `
    {
      product(
        id:"${productId}"
      ){

        id
        title
        handle

        description

        vendor
        productType

        tags

        featuredImage {

          url

        }

      }

    }
    `;

    const data =
      await shopifyGraphQL(
        client,
        query
      );

    return data?.product;

  } catch (err) {

    console.log(
      "getProductById Error:",
      err.message
    );

    return null;

  }

}

// ======================================
// SEARCH PRODUCTS
// ======================================

async function searchProducts(
  client,
  keyword
) {

  try {

    const query = `
    {
      products(

        first:20,

        query:"title:*${keyword}*"

      ){

        edges{

          node{

            id
            title
            handle

            vendor
            productType

            featuredImage {

              url

            }

          }

        }

      }

    }
    `;

    const data =
      await shopifyGraphQL(
        client,
        query
      );

    return (
      data?.products?.edges || []
    ).map(x => x.node);

  } catch (err) {

    console.log(
      "searchProducts Error:",
      err.message
    );

    return [];

  }

}

// ======================================
// GET COLLECTION PRODUCTS
// ======================================

async function getCollectionProducts(
  client,
  collectionHandle
) {

  try {

    const query = `
    {
      collectionByHandle(
        handle:"${collectionHandle}"
      ){

        products(first:50){

          edges{

            node{

              id
              title
              handle

              vendor
              productType

              featuredImage{

                url

              }

            }

          }

        }

      }

    }
    `;

    const data =
      await shopifyGraphQL(
        client,
        query
      );

    return (
      data?.collectionByHandle
      ?.products?.edges || []
    ).map(x => x.node);

  } catch (err) {

    console.log(
      "Collection Products Error:",
      err.message
    );

    return [];

  }

}
// ======================================
// ORDER FUNCTIONS
// Part 3
// GET RECENT ORDERS
// ======================================

async function getRecentOrders(
  client,
  limit = 50
) {

  try {

    const query = `
    {
      orders(

        first:${limit},

        sortKey:CREATED_AT,

        reverse:true

      ){

        edges{

          node{

            id
            name

            createdAt

            totalPriceSet{

              shopMoney{

                amount
                currencyCode

              }

            }

            customer{

              id
              firstName
              lastName
              email

            }

          }

        }

      }

    }
    `;

    const data =
      await shopifyGraphQL(
        client,
        query
      );

    return (
      data?.orders?.edges || []
    ).map(x => x.node);

  } catch (err) {

    console.log(
      "getRecentOrders Error:",
      err.message
    );

    return [];

  }

}

// ======================================
// GET ORDER
// ======================================

async function getOrderById(
  client,
  orderId
) {

  try {

    const query = `
    {
      order(
        id:"${orderId}"
      ){

        id
        name

        createdAt

        totalPriceSet{

          shopMoney{

            amount
            currencyCode

          }

        }

        customer{

          id
          firstName
          lastName
          email

        }

      }

    }
    `;

    const data =
      await shopifyGraphQL(
        client,
        query
      );

    return data?.order;

  } catch (err) {

    console.log(
      "getOrderById Error:",
      err.message
    );

    return null;

  }

}

// ======================================
// CUSTOMER FUNCTIONS
// ======================================

async function getCustomer(
  client,
  customerId
) {

  try {

    const query = `
    {
      customer(
        id:"${customerId}"
      ){

        id

        firstName
        lastName

        email
        phone

        numberOfOrders

      }

    }
    `;

    const data =
      await shopifyGraphQL(
        client,
        query
      );

    return data?.customer;

  } catch (err) {

    console.log(
      "getCustomer Error:",
      err.message
    );

    return null;

  }

}

// ======================================
// SEARCH CUSTOMER
// ======================================

async function searchCustomerByEmail(
  client,
  email
) {

  try {

    const query = `
    {
      customers(

        first:1,

        query:"email:${email}"

      ){

        edges{

          node{

            id

            firstName
            lastName

            email
            phone

          }

        }

      }

    }
    `;

    const data =
      await shopifyGraphQL(
        client,
        query
      );

    return data?.customers
      ?.edges?.[0]?.node || null;

  } catch (err) {

    console.log(
      "searchCustomer Error:",
      err.message
    );

    return null;

  }

}

// ======================================
// CREATE CHECKOUT URL
// AI USES THIS FOR SALES
// ======================================

function generateCheckoutUrl(
  client,
  variantId
) {

  try {

    const shop =

      client.store.includes(
        ".myshopify.com"
      )

      ?

      client.store

      :

      `${client.store}.myshopify.com`;

    return `https://${shop}/cart/${variantId}:1`;

  } catch (err) {

    return "#";

  }

}

// ======================================
// PRODUCT CARD
// ======================================

function generateProductCard(
  product,
  checkoutUrl
) {

  return `

<div class="layboka-product-card">

  <img
    src="${product.image || ""}"
    alt="${product.title}"
  />

  <h4>
    ${product.title}
  </h4>

  <p>
    $${product.price || 0}
  </p>

  <a href="${checkoutUrl}">
    Buy Now
  </a>

</div>

`;

        }
// ======================================
// DISCOUNT CODE CREATION - PART- 4
// ======================================

async function createDiscountCode(
  client,
  code,
  percentage = 10
) {

  try {

    const mutation = `

    mutation {

      discountCodeBasicCreate(

        basicCodeDiscount: {

          title: "${code}"

          code: "${code}"

          customerGets: {

            value: {

              percentage: ${percentage / 100}

            }

            items: {

              all: true

            }

          }

          startsAt: "${new Date().toISOString()}"

        }

      ) {

        codeDiscountNode {

          id

        }

      }

    }

    `;

    const data =
      await shopifyGraphQL(
        client,
        mutation
      );

    return data;

  } catch (err) {

    console.log(
      "createDiscountCode Error:",
      err.message
    );

    return null;

  }

}

// ======================================
// TRACK ORDER
// ======================================

async function trackOrder(
  client,
  orderName
) {

  try {

    const query = `
    {
      orders(

        first:1,

        query:"name:${orderName}"

      ){

        edges{

          node{

            id
            name

            displayFulfillmentStatus

            createdAt

          }

        }

      }

    }
    `;

    const data =
      await shopifyGraphQL(
        client,
        query
      );

    return data?.orders
      ?.edges?.[0]?.node || null;

  } catch (err) {

    console.log(
      "trackOrder Error:",
      err.message
    );

    return null;

  }

}

// ======================================
// GET ABANDONED CHECKOUTS
// ======================================

async function getAbandonedCheckouts(
  client
) {

  try {

    const query = `
    {
      abandonedCheckouts(
        first:50
      ){

        edges{

          node{

            id

            email

            completedAt

          }

        }

      }

    }
    `;

    const data =
      await shopifyGraphQL(
        client,
        query
      );

    return (
      data?.abandonedCheckouts
      ?.edges || []
    ).map(x => x.node);

  } catch (err) {

    console.log(
      "Abandoned Checkout Error:",
      err.message
    );

    return [];

  }

}

// ======================================
// AI REVENUE TRACKING
// ======================================

async function recordAIRevenue(
  client,
  amount
) {

  try {

    client.aiInfluencedRevenue =

      (client.aiInfluencedRevenue || 0)

      + Number(amount);

    await client.save();

    return true;

  } catch (err) {

    console.log(
      "AI Revenue Error:",
      err.message
    );

    return false;

  }

}

// ======================================
// AI CONVERSION TRACKING
// ======================================

async function recordConversion(
  client
) {

  try {

    client.conversions =

      (client.conversions || 0)

      + 1;

    await client.save();

    return true;

  } catch (err) {

    console.log(
      "Conversion Error:",
      err.message
    );

    return false;

  }

}

// ======================================
// EXPORTS
// ======================================

module.exports = {

  // Core
  getClient,
  getClientByStore,

  getShopDomain,
  getAccessToken,

  getShopifyHeaders,

  getGraphqlUrl,
  
  graphqlRequest,
  shopifyGraphQL,
  verifyConnection,

  verifyConnection,
  getShopInfo,

  // Products
  getProducts,
  getProductById,
  getProductByHandle,

  searchProducts,
  getCollectionProducts,

  // Orders
  getRecentOrders,
  getOrderById,

  // Customers
  getCustomer,
  searchCustomerByEmail,

  // Checkout
  generateCheckoutUrl,
  generateProductCard,

  // Recovery
  getAbandonedCheckouts,

  // Discounts
  createDiscountCode,

  // Tracking
  trackOrder,
  recordAIRevenue,
  recordConversion

};
