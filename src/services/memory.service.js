// ======================================
// services/memory.service.js
// Layboka AI
// Customer Memory Engine
// Production Ready
// ======================================

// ======================================
// MEMORY CLASS
// ======================================

class MemoryService {

    constructor(){

        this.sessions = new Map();

    }

    // ==================================
    // GET SESSION
    // ==================================

    get(sessionId){

        if(!this.sessions.has(sessionId)){

            this.sessions.set(sessionId,{

                history:[],

                preferences:{},

                viewedProducts:[],

                recentSearches:[],

                cart:[],

                lastIntent:"",

                updatedAt:new Date()

            });

        }

        return this.sessions.get(sessionId);

    }

    // ==================================
    // SAVE MESSAGE
    // ==================================

    addMessage(

        sessionId,

        role,

        content

    ){

        const session =

            this.get(sessionId);

        session.history.push({

            role,

            content,

            createdAt:new Date()

        });

        // Keep last 20 messages
        if(session.history.length>20){

            session.history.shift();

        }

        session.updatedAt=new Date();

    }

    // ==================================
    // PRODUCT VIEW
    // ==================================

    addViewedProduct(

        sessionId,

        product

    ){

        const session=

            this.get(sessionId);

        const exists=

            session.viewedProducts.find(

                p=>p.id===product.id

            );

        if(!exists){

            session.viewedProducts.push(product);

        }

        if(session.viewedProducts.length>15){

            session.viewedProducts.shift();

        }

    }

    // ==================================
    // SEARCH
    // ==================================

    addSearch(

        sessionId,

        keyword

    ){

        const session=

            this.get(sessionId);

        session.recentSearches.push(keyword);

        if(session.recentSearches.length>10){

            session.recentSearches.shift();

        }

    }

    // ==================================
    // SAVE PREFERENCE
    // ==================================

    setPreference(

        sessionId,

        key,

        value

    ){

        const session=

            this.get(sessionId);

        session.preferences[key]=value;

    }

    // ==================================
    // GET PREFERENCE
    // ==================================

    getPreference(

        sessionId,

        key

    ){

        return this

            .get(sessionId)

            .preferences[key];

    }

    // ==================================
    // CART
    // ==================================

    setCart(

        sessionId,

        cart=[]

    ){

        const session=

            this.get(sessionId);

        session.cart=cart;

    }

    getCart(sessionId){

        return this

            .get(sessionId)

            .cart;

    }

    // ==================================
    // INTENT
    // ==================================

    setIntent(

        sessionId,

        intent

    ){

        this.get(sessionId)

            .lastIntent=intent;

    }

    getIntent(sessionId){

        return this

            .get(sessionId)

            .lastIntent;

    }

    // ==================================
    // HISTORY
    // ==================================

    getHistory(sessionId){

        return this

            .get(sessionId)

            .history;

    }

    // ==================================
    // CLEAR
    // ==================================

    clear(sessionId){

        this.sessions.delete(sessionId);

    }

}

// ======================================
// SINGLETON
// ======================================

module.exports=

new MemoryService();
