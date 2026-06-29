// =====================================
// public/chatbot.js
// Layboka AI Sales Executive
// Production Ready
// PART 1
// Configuration + Bootstrap
// =====================================

(function(){

"use strict";

// =====================================
// CONFIG
// =====================================

const CONFIG={

    API_BASE:
    "https://shopi-ai.onrender.com",

    BRAND_NAME:
    "Layboka AI",

    DEFAULT_EXECUTIVE:
    "female",

    DEFAULT_EXECUTIVE_NAME:
    "Emily",

    POSITION:
    "bottom-right",

    CHAT_DELAY:
    3500,

    MORPH_DELAY:
    6500,

    BLINK_MIN:
    4000,

    BLINK_MAX:
    7000,

    HEAD_MOVE_MIN:
    20000,

    HEAD_MOVE_MAX:
    40000,

    CURSOR_TRACK_RADIUS:
    300,

    VERSION:
    "2.0.0"

};

// =====================================
// SALES EXECUTIVE
// =====================================

const EXECUTIVE={

    name:
    CONFIG.DEFAULT_EXECUTIVE_NAME,

    gender:
    CONFIG.DEFAULT_EXECUTIVE,

    country:
    "US",

    personality:
    "friendly",

    welcomeAvatar:"",
    chatAvatar:"",
    logo:"",
    welcomeMessage:"",
    returningMessage:"",
    online:true

};

// =====================================
// VISITOR
// =====================================

const VISITOR={

    id:null,

    firstName:"",

    returning:false,

    language:navigator.language,

    country:"",

    timezone:
    Intl.DateTimeFormat()

    .resolvedOptions()

    .timeZone

};

// =====================================
// SUBSCRIPTION
// =====================================

const SUBSCRIPTION={

    plan:"starter",

    status:"trial",

    active:true,

    expiresAt:null,

    countdown:true

};

// =====================================
// CHAT STATE
// =====================================

const CHAT={

    opened:false,

    typing:false,

    minimized:false,

    initialized:false,

    messages:[],

    products:[]

};

// =====================================
// SALES FEATURES
// =====================================

const SALES={

    recommendProducts:true,

    crossSell:true,

    upsell:true,

    bundleOffer:true,

    abandonedCart:true,

    couponSupport:true,

    checkoutSupport:true,

    referralSupport:true,

    leadCapture:true,

    analytics:true

};

// =====================================
// DOM
// =====================================

let wrapper=null;
let welcomePopup=null;
let executiveAvatar=null;
let chatWindow=null;

// =====================================
// LOCAL STORAGE
// =====================================

const STORAGE={

    FIRST_VISIT:
    "layboka_first_visit",

    VISITOR_ID:
    "layboka_visitor",

    EXECUTIVE:
    "layboka_executive"

};

// =====================================
// UTIL
// =====================================

function uuid(){

    return(

        Date.now()

        +

        "-"

        +

        Math.random()

        .toString(36)

        .substring(2,10)

    );

}

// =====================================
// VISITOR INIT
// =====================================

function initializeVisitor(){

    VISITOR.id=

    localStorage.getItem(

        STORAGE.VISITOR_ID

    );

    if(!VISITOR.id){

        VISITOR.id=uuid();

        localStorage.setItem(

            STORAGE.VISITOR_ID,

            VISITOR.id

        );

    }

    VISITOR.returning=

    localStorage.getItem(

        STORAGE.FIRST_VISIT

    )==="true";

}

// =====================================
// START
// =====================================

initializeVisitor();

// =====================================
// NEXT
// =====================================
//
// PART 2
//
// • Sales Executive Loader
// • Merchant Settings Loader
// • Executive Selection
// • Plan Validation
// • Custom Executive Support
//
})();
// =====================================
// PART 2
// Sales Executive Loader
// Merchant Settings
// =====================================

// =====================================
// LOAD SALES EXECUTIVE
// =====================================

async function loadSalesExecutive(){

    try{

        const response = await fetch(

            `${CONFIG.API_BASE}/api/chat/executive`,

            {

                method:"POST",

                headers:{

                    "Content-Type":"application/json"

                },

                body:JSON.stringify({

                    hostname:location.hostname,

                    visitorId:VISITOR.id

                })

            }

        );

        if(!response.ok)
            return;

        const data = await response.json();

        if(!data.success)
            return;

        applyExecutiveSettings(

            data.executive

        );

    }

    catch(error){

        console.error(

            "Sales Executive Load Error",

            error

        );

    }

}

// =====================================
// APPLY SETTINGS
// =====================================

function applyExecutiveSettings(executive){

    if(!executive)
        return;

    EXECUTIVE.name =
        executive.name ||
        EXECUTIVE.name;

    EXECUTIVE.gender =
        executive.gender ||
        EXECUTIVE.gender;

    EXECUTIVE.country =
        executive.country ||
        EXECUTIVE.country;

    EXECUTIVE.personality =
        executive.personality ||
        EXECUTIVE.personality;

    EXECUTIVE.logo =
        executive.logo ||
        "";

    EXECUTIVE.welcomeAvatar =
        executive.welcomeAvatar ||
        "";

    EXECUTIVE.chatAvatar =
        executive.chatAvatar ||
        "";

    EXECUTIVE.welcomeMessage =
        executive.welcomeMessage ||
        "";

    EXECUTIVE.returningMessage =
        executive.returningMessage ||
        "";

    SUBSCRIPTION.plan =
        executive.plan ||
        "starter";

}

// =====================================
// PLAN VALIDATION
// =====================================

function canUseCustomExecutive(){

    return(

        SUBSCRIPTION.plan==="growth" ||

        SUBSCRIPTION.plan==="premium"

    );

}

function canUsePremiumExecutives(){

    return(

        SUBSCRIPTION.plan==="premium"

    );

}

// =====================================
// STARTUP
// =====================================

loadSalesExecutive();

// =====================================
// NEXT
// =====================================
//
// PART 3
//
// • First-time visitor detection
// • Welcome popup
// • Returning visitor greeting
// • Greeting scheduler
// =====================================
// PART 3
// Visitor Detection
// Welcome Scheduler
// =====================================

// =====================================
// VISITOR STATUS
// =====================================

function isFirstTimeVisitor(){

    return !VISITOR.returning;

}

function markVisitorAsReturning(){

    localStorage.setItem(

        STORAGE.FIRST_VISIT,

        "true"

    );

    VISITOR.returning = true;

}

// =====================================
// VISITOR NAME
// =====================================

function getVisitorName(){

    if(

        VISITOR.firstName &&

        VISITOR.firstName.trim()

    ){

        return VISITOR.firstName;

    }

    return "there";

}

// =====================================
// GREETING
// =====================================

function buildGreeting(){

    if(

        EXECUTIVE.welcomeMessage &&

        EXECUTIVE.welcomeMessage.trim()

    ){

        return EXECUTIVE.welcomeMessage

            .replace(

                "{name}",

                getVisitorName()

            );

    }

    return `Hi ${getVisitorName()}! Welcome to our store. I'm ${EXECUTIVE.name}, your shopping assistant. I'm here to help you find the perfect products and today's best offers.`;

}

function buildReturningGreeting(){

    if(

        EXECUTIVE.returningMessage &&

        EXECUTIVE.returningMessage.trim()

    ){

        return EXECUTIVE.returningMessage

            .replace(

                "{name}",

                getVisitorName()

            );

    }

    return `Hi ${getVisitorName()}! I'm here whenever you need me.`;

}

// =====================================
// SCHEDULER
// =====================================

function scheduleGreeting(){

    if(

        isFirstTimeVisitor()

    ){

        setTimeout(

            ()=>{

                showWelcomePopup();

                markVisitorAsReturning();

            },

            CONFIG.CHAT_DELAY

        );

    }

    else{

        setTimeout(

            ()=>{

                showReturningGreeting();

            },

            1200

        );

    }

}

// =====================================
// INITIALIZE
// =====================================

scheduleGreeting();

// =====================================
// NEXT
// =====================================
//
// PART 4
//
// • Center Welcome Popup
// • Waving Sales Executive
// • Fade + Blur Animation
// • Morph to Bottom Right
// =====================================
// PART 4
// Welcome Popup
// Sales Executive
// Morph Animation
// =====================================

// =====================================
// SHOW WELCOME POPUP
// =====================================

function showWelcomePopup(){

    createWelcomePopup();

    animateWave();

    startWelcomeBlink();

    setTimeout(

        ()=>{

            morphToExecutive();

        },

        CONFIG.MORPH_DELAY

    );

}

// =====================================
// CREATE POPUP
// =====================================

function createWelcomePopup(){

    welcomePopup=

    document.createElement("div");

    welcomePopup.id=

    "layboka-welcome-popup";

    welcomePopup.innerHTML=

    `

<div class="lb-sales-popup">

    <div class="lb-popup-avatar">

        <img

        id="lbWelcomeAvatar"

        src="${EXECUTIVE.welcomeAvatar}"

        alt="${EXECUTIVE.name}"

        />

    </div>

    <div class="lb-popup-message">

        <div class="lb-popup-title">

            ${EXECUTIVE.name}

        </div>

        <div class="lb-popup-text">

            ${buildGreeting()}

        </div>

    </div>

</div>

`;

    document.body.appendChild(

        welcomePopup

    );

    requestAnimationFrame(

        ()=>{

            welcomePopup.classList.add(

                "lb-popup-show"

            );

        }

    );

}

// =====================================
// WAVE
// =====================================

function animateWave(){

    const avatar=

    document.getElementById(

        "lbWelcomeAvatar"

    );

    if(!avatar)
        return;

    avatar.classList.add(

        "lb-wave"

    );

}

// =====================================
// BLINK
// =====================================

function startWelcomeBlink(){

    const avatar=

    document.getElementById(

        "lbWelcomeAvatar"

    );

    if(!avatar)
        return;

    avatar.classList.add(

        "lb-blink"

    );

}

// =====================================
// MORPH
// =====================================

function morphToExecutive(){

    if(!welcomePopup)
        return;

    welcomePopup.classList.add(

        "lb-popup-morph"

    );

    setTimeout(

        ()=>{

            welcomePopup.remove();

            welcomePopup=null;

            createExecutiveAvatar();

        },

        1200

    );

}

// =====================================
// RETURNING VISITOR
// =====================================

function showReturningGreeting(){

    createExecutiveAvatar(

        buildReturningGreeting()

    );

}

// =====================================
// NEXT
// =====================================
//
// PART 5
//
// • Bottom Right Sales Executive
// • Headset Avatar
// • Floating Button
// • Greeting Bubble
