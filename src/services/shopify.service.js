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
