// ======================================
// services/recommendation.service.js
// Layboka AI
// Product Recommendation Engine
// Production Ready
// ======================================

// ======================================
// REMOVE DUPLICATES
// ======================================

function uniqueProducts(products = []) {

    const map = new Map();

    products.forEach(product => {

        if (!product) return;

        const id =
            product.id ||
            product._id ||
            product.handle;

        if (!map.has(id)) {

            map.set(id, product);

        }

    });

    return [...map.values()];

}

// ======================================
// SORT BEST SELLERS
// ======================================

function bestSellers(products = [], limit = 4) {

    return [...products]

        .sort((a, b) =>

            (b.sales || 0) -

            (a.sales || 0)

        )

        .slice(0, limit);

}

// ======================================
// NEW ARRIVALS
// ======================================

function newArrivals(products = [], limit = 4) {

    return [...products]

        .sort((a, b) =>

            new Date(b.createdAt || 0) -

            new Date(a.createdAt || 0)

        )

        .slice(0, limit);

}

// ======================================
// RELATED PRODUCTS
// ======================================

function relatedProducts(

    product,

    allProducts = [],

    limit = 4

) {

    if (!product) return [];

    const tags =
        product.tags || [];

    const type =
        product.productType || "";

    return allProducts

        .filter(p => {

            if (p.id === product.id) {

                return false;

            }

            const sameType =

                p.productType === type;

            const sameTag =

                (p.tags || [])

                .some(tag =>

                    tags.includes(tag)

                );

            return sameType || sameTag;

        })

        .slice(0, limit);

}

// ======================================
// CART UPSELL
// ======================================

function cartUpsell(

    cart = [],

    allProducts = [],

    limit = 3

) {

    if (!cart.length) {

        return [];

    }

    let recommendations = [];

    cart.forEach(item => {

        recommendations.push(

            ...relatedProducts(

                item,

                allProducts,

                limit

            )

        );

    });

    return uniqueProducts(

        recommendations

    ).slice(0, limit);

}

// ======================================
// COLLECTION PRODUCTS
// ======================================

function collectionProducts(

    collection,

    products = [],

    limit = 6

) {

    return products

        .filter(product =>

            product.collection === collection

        )

        .slice(0, limit);

}

// ======================================
// PRICE RANGE
// ======================================

function productsByPrice(

    products = [],

    min = 0,

    max = Number.MAX_SAFE_INTEGER,

    limit = 6

) {

    return products

        .filter(product => {

            const price =

                Number(product.price || 0);

            return (

                price >= min &&

                price <= max

            );

        })

        .slice(0, limit);

}

// ======================================
// SEARCH
// ======================================

function searchProducts(

    keyword,

    products = [],

    limit = 6

) {

    if (!keyword) {

        return [];

    }

    const query =

        keyword.toLowerCase();

    return products

        .filter(product => {

            const text = [

                product.title,

                product.description,

                product.vendor,

                product.productType,

                ...(product.tags || [])

            ]

                .join(" ")

                .toLowerCase();

            return text.includes(query);

        })

        .slice(0, limit);

}

// ======================================
// EXPORT
// ======================================

module.exports = {

    uniqueProducts,

    bestSellers,

    newArrivals,

    relatedProducts,

    cartUpsell,

    collectionProducts,

    productsByPrice,

    searchProducts

};
