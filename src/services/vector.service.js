// ======================================
// services/vector.service.js
// Layboka AI
// Vector Search Engine
// Production Ready
// ======================================

const OpenAI =
require("openai");

const client =
new OpenAI({

    apiKey:
        process.env.OPENAI_API_KEY

});

// ======================================
// EMBEDDING MODEL
// ======================================

const MODEL =

"text-embedding-3-small";

// ======================================
// CREATE EMBEDDING
// ======================================

async function createEmbedding(text=""){

    if(!text){

        return [];

    }

    const response =

        await client.embeddings.create({

            model:MODEL,

            input:text

        });

    return response

        .data[0]

        .embedding;

}

// ======================================
// COSINE SIMILARITY
// ======================================

function cosineSimilarity(a,b){

    if(

        !a.length ||

        !b.length ||

        a.length!==b.length

    ){

        return 0;

    }

    let dot = 0;

    let normA = 0;

    let normB = 0;

    for(

        let i=0;

        i<a.length;

        i++

    ){

        dot +=

            a[i]*b[i];

        normA +=

            a[i]*a[i];

        normB +=

            b[i]*b[i];

    }

    return dot/

    (

        Math.sqrt(normA)*

        Math.sqrt(normB)

    );

}

// ======================================
// SEARCH
// ======================================

async function semanticSearch(

    query,

    products=[],

    limit=5

){

    if(

        !query ||

        !products.length

    ){

        return [];

    }

    const queryEmbedding =

        await createEmbedding(

            query

        );

    const scored =

        products.map(product=>{

            const score =

                cosineSimilarity(

                    queryEmbedding,

                    product.embedding||[]

                );

            return{

                ...product,

                score

            };

        });

    return scored

        .sort(

            (a,b)=>

            b.score-a.score

        )

        .slice(0,limit);

}

// ======================================
// PRODUCT TEXT
// ======================================

function buildProductText(product={}){

    return [

        product.title,

        product.description,

        product.vendor,

        product.productType,

        (product.tags||[]).join(" "),

        (product.collections||[]).join(" ")

    ]

    .filter(Boolean)

    .join(" ");

}

// ======================================
// BUILD EMBEDDINGS
// ======================================

async function generateProductEmbeddings(

    products=[]

){

    const result=[];

    for(

        const product

        of products

    ){

        const embedding=

        await createEmbedding(

            buildProductText(

                product

            )

        );

        result.push({

            ...product,

            embedding

        });

    }

    return result;

}

// ======================================
// EXPORT
// ======================================

module.exports={

    createEmbedding,

    cosineSimilarity,

    semanticSearch,

    buildProductText,

    generateProductEmbeddings

};
