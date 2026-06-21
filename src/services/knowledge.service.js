// ======================================
// services/knowledge.service.js
// Layboka AI
// Store Knowledge Engine
// Production Ready
// ======================================

// ======================================
// PRODUCT KNOWLEDGE
// ======================================

function productKnowledge(products = []) {

    return products.map(product => ({

        id: product.id,

        title: product.title,

        handle: product.handle,

        description: product.description || "",

        vendor: product.vendor || "",

        productType: product.productType || "",

        tags: product.tags || [],

        collections: product.collections || [],

        price: Number(product.price || 0),

        compareAtPrice: Number(product.compareAtPrice || 0),

        available: !!product.available,

        inventory: product.inventory || 0,

        images: product.images || [],

        url: product.url || "",

        createdAt: product.createdAt,

        updatedAt: product.updatedAt

    }));

}

// ======================================
// COLLECTION KNOWLEDGE
// ======================================

function collectionKnowledge(collections = []) {

    return collections.map(collection => ({

        id: collection.id,

        title: collection.title,

        handle: collection.handle,

        description: collection.description || ""

    }));

}

// ======================================
// PAGE KNOWLEDGE
// ======================================

function pageKnowledge(pages = []) {

    return pages.map(page => ({

        title: page.title,

        handle: page.handle,

        body: page.body || ""

    }));

}

// ======================================
// POLICY KNOWLEDGE
// ======================================

function policyKnowledge(store = {}) {

    return {

        shipping: store.shippingPolicy || "",

        returns: store.returnPolicy || "",

        privacy: store.privacyPolicy || "",

        terms: store.terms || ""

    };

}

// ======================================
// FAQ KNOWLEDGE
// ======================================

function faqKnowledge(faqs = []) {

    return faqs.map(item => ({

        question: item.question,

        answer: item.answer

    }));

}

// ======================================
// STORE KNOWLEDGE
// ======================================

function storeKnowledge(store = {}) {

    return {

        storeName: store.storeName || "",

        niche: store.niche || "",

        currency: store.currency || "USD",

        language: store.language || "English",

        supportEmail: store.supportEmail || "",

        supportPhone: store.supportPhone || "",

        businessHours: store.businessHours || "",

        customInstructions:

            store.customInstructions || ""

    };

}

// ======================================
// BUILD KNOWLEDGE
// ======================================

function buildKnowledge({

    store = {},

    products = [],

    collections = [],

    pages = [],

    faqs = []

}) {

    return {

        store:

            storeKnowledge(store),

        policies:

            policyKnowledge(store),

        products:

            productKnowledge(products),

        collections:

            collectionKnowledge(collections),

        pages:

            pageKnowledge(pages),

        faqs:

            faqKnowledge(faqs)

    };

}

// ======================================
// SEARCH FAQ
// ======================================

function searchFAQ(

    question,

    faqs = []

) {

    const query =

        question.toLowerCase();

    return faqs.find(item =>

        item.question

            .toLowerCase()

            .includes(query)

    );

}

// ======================================
// EXPORT
// ======================================

module.exports = {

    buildKnowledge,

    productKnowledge,

    collectionKnowledge,

    pageKnowledge,

    policyKnowledge,

    faqKnowledge,

    storeKnowledge,

    searchFAQ

};
