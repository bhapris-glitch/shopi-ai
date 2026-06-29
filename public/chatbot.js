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
// =====================================
// PART 5
// Bottom Right Sales Executive
// Floating Executive
// =====================================

// =====================================
// CREATE EXECUTIVE
// =====================================

function createExecutiveAvatar(message=""){

    if(

        executiveAvatar

    ){

        return;

    }

    executiveAvatar=

    document.createElement("div");

    executiveAvatar.id=

    "layboka-sales-executive";

    executiveAvatar.innerHTML=

    `

<div class="lb-executive-wrapper">

    <!-- Greeting Bubble -->

    <div

    id="lbGreetingBubble"

    class="lb-greeting-bubble">

        ${message}

    </div>

    <!-- Online Status -->

    <div class="lb-online-status">

        <span></span>

    </div>

    <!-- Executive -->

    <div

    id="lbExecutiveFace"

    class="lb-executive-face">

        <img

        id="lbChatAvatar"

        src="${EXECUTIVE.chatAvatar}"

        alt="${EXECUTIVE.name}"

        />

    </div>

</div>

`;

    document.body.appendChild(

        executiveAvatar

    );

    // Floating animation

    requestAnimationFrame(

        ()=>{

            executiveAvatar

            .classList

            .add(

                "lb-executive-show"

            );

        }

    );

    // Hide greeting bubble

    if(

        message

    ){

        setTimeout(

            ()=>{

                hideGreetingBubble();

            },

            5000

        );

    }

    // Events

    bindExecutiveEvents();

}

// =====================================
// GREETING
// =====================================

function hideGreetingBubble(){

    const bubble=

    document.getElementById(

        "lbGreetingBubble"

    );

    if(

        bubble

    ){

        bubble.classList.add(

            "lb-hide"

        );

    }

}

// =====================================
// EVENTS
// =====================================

function bindExecutiveEvents(){

    const avatar=

    document.getElementById(

        "lbExecutiveFace"

    );

    if(

        !avatar

    ) return;

    avatar.addEventListener(

        "click",

        ()=>{

            openChatWindow();

        }

    );

    avatar.addEventListener(

        "mouseenter",

        ()=>{

            avatar.classList.add(

                "lb-hover"

            );

        }

    );

    avatar.addEventListener(

        "mouseleave",

        ()=>{

            avatar.classList.remove(

                "lb-hover"

            );

        }

    );

}

// =====================================
// ONLINE
// =====================================

function setExecutiveOnline(

status=true

){

    const online=

    document.querySelector(

        ".lb-online-status"

    );

    if(

        !online

    ) return;

    if(status){

        online.classList.add(

            "online"

        );

    }else{

        online.classList.remove(

            "online"

        );

    }

}

// =====================================
// NEXT
// =====================================
//
// PART 6
//
// • Natural Blinking
// • Random Blink Timing
// • Eye Animation
// • Idle Behaviour
// =====================================
// PART 6
// Natural Blinking Engine
// Idle Behaviour
// =====================================

// =====================================
// BLINK ENGINE
// =====================================

let blinkTimer = null;

// =====================================
// START BLINKING
// =====================================

function startBlinkEngine(){

    stopBlinkEngine();

    scheduleNextBlink();

}

// =====================================
// STOP BLINKING
// =====================================

function stopBlinkEngine(){

    if(blinkTimer){

        clearTimeout(

            blinkTimer

        );

        blinkTimer = null;

    }

}

// =====================================
// NEXT BLINK
// =====================================

function scheduleNextBlink(){

    const delay =

        randomNumber(

            CONFIG.BLINK_MIN,

            CONFIG.BLINK_MAX

        );

    blinkTimer =

    setTimeout(

        ()=>{

            blink();

            scheduleNextBlink();

        },

        delay

    );

}

// =====================================
// BLINK
// =====================================

function blink(){

    const avatar =

    document.getElementById(

        "lbChatAvatar"

    );

    if(!avatar)
        return;

    avatar.classList.add(

        "lb-eye-close"

    );

    setTimeout(

        ()=>{

            avatar.classList.remove(

                "lb-eye-close"

            );

        },

        180

    );

}

// =====================================
// DOUBLE BLINK
// =====================================

function doubleBlink(){

    blink();

    setTimeout(

        ()=>{

            blink();

        },

        300

    );

}

// =====================================
// RANDOM BLINK
// =====================================

function randomBlink(){

    const chance =

        Math.random();

    if(chance > 0.82){

        doubleBlink();

    }else{

        blink();

    }

}

// =====================================
// RANDOM NUMBER
// =====================================

function randomNumber(

min,

max

){

    return Math.floor(

        Math.random()

        *

        (

            max-min

        )

    )+min;

}

// =====================================
// START WHEN EXECUTIVE LOADS
// =====================================

setTimeout(

    ()=>{

        startBlinkEngine();

    },

    1000

);

// =====================================
// NEXT
// =====================================
//
// PART 7
//
// • Head Movement
// • Cursor Tracking
// • Idle Looking Around
// • Human Behaviour
// =====================================
// PART 7
// Head Movement
// Cursor Tracking
// Human Behaviour
// =====================================

// =====================================
// HEAD MOVEMENT
// =====================================

let headMoveTimer = null;

// =====================================
// START HEAD MOVEMENT
// =====================================

function startHeadMovement(){

    stopHeadMovement();

    scheduleHeadMovement();

}

// =====================================
// STOP HEAD MOVEMENT
// =====================================

function stopHeadMovement(){

    if(headMoveTimer){

        clearTimeout(

            headMoveTimer

        );

        headMoveTimer = null;

    }

}

// =====================================
// SCHEDULE
// =====================================

function scheduleHeadMovement(){

    const delay =

        randomNumber(

            CONFIG.HEAD_MOVE_MIN,

            CONFIG.HEAD_MOVE_MAX

        );

    headMoveTimer =

    setTimeout(

        ()=>{

            performHeadMovement();

            scheduleHeadMovement();

        },

        delay

    );

}

// =====================================
// HEAD ANIMATION
// =====================================

function performHeadMovement(){

    const avatar =

    document.getElementById(

        "lbExecutiveFace"

    );

    if(!avatar)
        return;

    const directions=[

        "lb-look-left",

        "lb-look-right",

        "lb-look-up",

        "lb-look-center"

    ];

    const direction=

    directions[

        Math.floor(

            Math.random()

            *

            directions.length

        )

    ];

    avatar.classList.remove(

        "lb-look-left",

        "lb-look-right",

        "lb-look-up",

        "lb-look-center"

    );

    avatar.classList.add(

        direction

    );

    setTimeout(

        ()=>{

            avatar.classList.remove(

                direction

            );

        },

        1500

    );

}

// =====================================
// CURSOR TRACKING
// =====================================

document.addEventListener(

    "mousemove",

    (event)=>{

        const avatar=

        document.getElementById(

            "lbExecutiveFace"

        );

        if(!avatar)
            return;

        if(

            "ontouchstart"

            in window

        ) return;

        const rect=

        avatar.getBoundingClientRect();

        const cx=

        rect.left+

        rect.width/2;

        const cy=

        rect.top+

        rect.height/2;

        const dx=

        event.clientX-cx;

        const dy=

        event.clientY-cy;

        const distance=

        Math.sqrt(

            dx*dx+

            dy*dy

        );

        if(

            distance>

            CONFIG.CURSOR_TRACK_RADIUS

        ){

            avatar.style.transform=

            "";

            return;

        }

        const x=

        Math.max(

            -5,

            Math.min(

                5,

                dx/30

            )

        );

        const y=

        Math.max(

            -3,

            Math.min(

                3,

                dy/40

            )

        );

        avatar.style.transform=

        `translate(${x}px,${y}px)`;

    }

);

// =====================================
// START IDLE
// =====================================

setTimeout(

    ()=>{

        startHeadMovement();

    },

    1500

);

// =====================================
// NEXT
// =====================================
//
// PART 8
//
// • Talking Animation
// • Typing Animation
// • Speaking Behaviour
// • Online Presence
// =====================================
// PART 8
// Talking Animation
// Typing Animation
// Speaking Behaviour
// Online Presence
// =====================================

// =====================================
// TALKING STATE
// =====================================

let talkingTimer=null;
let typingTimer=null;

// =====================================
// START TALKING
// =====================================

function startTalking(){

    const avatar=

    document.getElementById(

        "lbExecutiveFace"

    );

    if(!avatar)
        return;

    avatar.classList.add(

        "lb-speaking"

    );

    avatar.classList.remove(

        "lb-idle"

    );

}

// =====================================
// STOP TALKING
// =====================================

function stopTalking(){

    const avatar=

    document.getElementById(

        "lbExecutiveFace"

    );

    if(!avatar)
        return;

    avatar.classList.remove(

        "lb-speaking"

    );

    avatar.classList.add(

        "lb-idle"

    );

}

// =====================================
// START TYPING
// =====================================

function startTyping(){

    CHAT.typing=true;

    const bubble=

    document.getElementById(

        "lbGreetingBubble"

    );

    if(bubble){

        bubble.classList.remove(

            "lb-hide"

        );

        bubble.innerHTML=

        `

<div class="lb-typing">

<span></span>

<span></span>

<span></span>

</div>

`;

    }

    startTalking();

}

// =====================================
// STOP TYPING
// =====================================

function stopTyping(

message

){

    CHAT.typing=false;

    const bubble=

    document.getElementById(

        "lbGreetingBubble"

    );

    if(bubble){

        bubble.innerHTML=

        message;

    }

    stopTalking();

    setTimeout(

        ()=>{

            hideGreetingBubble();

        },

        5000

    );

}

// =====================================
// EXECUTIVE SPEAK
// =====================================

function executiveSpeak(

message,

typingDelay=1200

){

    clearTimeout(

        typingTimer

    );

    startTyping();

    typingTimer=

    setTimeout(

        ()=>{

            stopTyping(

                message

            );

        },

        typingDelay

    );

}

// =====================================
// ONLINE STATUS
// =====================================

function setOnlineStatus(

online=true

){

    EXECUTIVE.online=

    online;

    const status=

    document.querySelector(

        ".lb-online-status"

    );

    if(!status)
        return;

    if(online){

        status.classList.add(

            "online"

        );

        status.classList.remove(

            "offline"

        );

    }

    else{

        status.classList.add(

            "offline"

        );

        status.classList.remove(

            "online"

        );

    }

}

// =====================================
// THINKING
// =====================================

function executiveThinking(){

    startTalking();

    setTimeout(

        ()=>{

            stopTalking();

        },

        900

    );

}

// =====================================
// START ONLINE
// =====================================

setOnlineStatus(

true

);

// =====================================
// NEXT
// =====================================
//
// PART 9
//
// • Chat Window
// • Open / Close
// • Minimize
// • Sales Executive Panel
// =====================================
// PART 9
// Chat Window
// Sales Executive Panel
// =====================================

// =====================================
// OPEN CHAT
// =====================================

function openChatWindow(){

    if(chatWindow){

        chatWindow.classList.add(

            "lb-chat-show"

        );

        CHAT.opened=true;

        return;

    }

    createChatWindow();

}

// =====================================
// CLOSE CHAT
// =====================================

function closeChatWindow(){

    if(!chatWindow)
        return;

    chatWindow.classList.remove(

        "lb-chat-show"

    );

    CHAT.opened=false;

}

// =====================================
// MINIMIZE CHAT
// =====================================

function minimizeChat(){

    if(!chatWindow)
        return;

    chatWindow.classList.add(

        "lb-chat-minimized"

    );

    CHAT.minimized=true;

}

// =====================================
// RESTORE CHAT
// =====================================

function restoreChat(){

    if(!chatWindow)
        return;

    chatWindow.classList.remove(

        "lb-chat-minimized"

    );

    CHAT.minimized=false;

}

// =====================================
// CREATE CHAT WINDOW
// =====================================

function createChatWindow(){

    chatWindow=

    document.createElement(

        "div"

    );

    chatWindow.id=

    "layboka-chat-window";

    chatWindow.innerHTML=

`

<div class="lb-chat-header">

    <div class="lb-chat-profile">

        <img

        src="${EXECUTIVE.chatAvatar}"

        class="lb-chat-avatar"

        />

        <div>

            <div class="lb-chat-name">

                ${EXECUTIVE.name}

            </div>

            <div class="lb-chat-status">

                Online

            </div>

        </div>

    </div>

    <div class="lb-chat-actions">

        <button

        id="lbMinimize">

            —

        </button>

        <button

        id="lbClose">

            ✕

        </button>

    </div>

</div>

<div

id="lbMessages"

class="lb-chat-messages">

</div>

<div class="lb-chat-input">

    <input

    id="lbMessageInput"

    type="text"

    placeholder="Type your message..."

    />

    <button

    id="lbSendButton">

        Send

    </button>

</div>

`;

    document.body.appendChild(

        chatWindow

    );

    bindChatEvents();

    requestAnimationFrame(

        ()=>{

            chatWindow.classList.add(

                "lb-chat-show"

            );

        }

    );

    CHAT.opened=true;

    executiveSpeak(

        `Hi ${getVisitorName()}! How can I help you today?`

    );

}

// =====================================
// EVENTS
// =====================================

function bindChatEvents(){

    document

    .getElementById(

        "lbClose"

    )

    .onclick=

    closeChatWindow;

    document

    .getElementById(

        "lbMinimize"

    )

    .onclick=

    minimizeChat;

    document

    .getElementById(

        "lbSendButton"

    )

    .onclick=

    sendMessage;

    document

    .getElementById(

        "lbMessageInput"

    )

    .addEventListener(

        "keydown",

        (e)=>{

            if(

                e.key==="Enter"

            ){

                sendMessage();

            }

        }

    );

}

// =====================================
// NEXT
// =====================================
//
// PART 10
//
// • Conversation Engine
// • Send Message
// • AI Response
// • Product Recommendation Trigg
// =====================================
// PART 10
// Conversation Engine
// AI Response
// Product Recommendation
// =====================================

// =====================================
// SEND MESSAGE
// =====================================

async function sendMessage(){

    const input=

    document.getElementById(

        "lbMessageInput"

    );

    if(!input)
        return;

    const message=

    input.value.trim();

    if(!message)
        return;

    input.value="";

    addUserMessage(

        message

    );

    executiveThinking();

    startTyping();

    try{

        const response=

        await fetch(

            `${CONFIG.API_BASE}/api/chat/message`,

            {

                method:"POST",

                headers:{

                    "Content-Type":

                    "application/json"

                },

                body:JSON.stringify({

                    visitorId:

                    VISITOR.id,

                    hostname:

                    location.hostname,

                    executive:

                    EXECUTIVE.name,

                    personality:

                    EXECUTIVE.personality,

                    subscription:

                    SUBSCRIPTION.plan,

                    message

                })

            }

        );

        const data=

        await response.json();

        stopTalking();

        if(

            !data ||

            !data.success

        ){

            stopTyping(

            "Sorry, I couldn't understand that. Please try again."

            );

            return;

        }

        stopTyping(

            data.reply

        );

        addExecutiveMessage(

            data.reply

        );

        // -----------------------------
        // PRODUCT RECOMMENDATIONS
        // -----------------------------

        if(

            data.products &&

            data.products.length

        ){

            renderProducts(

                data.products

            );

        }

        // -----------------------------
        // COUPONS
        // -----------------------------

        if(

            data.coupon

        ){

            showCoupon(

                data.coupon

            );

        }

        // -----------------------------
        // UPSELL
        // -----------------------------

        if(

            data.upsell

        ){

            showUpsell(

                data.upsell

            );

        }

    }

    catch(error){

        console.error(error);

        stopTalking();

        stopTyping(

        "Connection lost. Please try again."

        );

    }

}

// =====================================
// USER MESSAGE
// =====================================

function addUserMessage(

text

){

    const container=

    document.getElementById(

        "lbMessages"

    );

    if(!container)
        return;

    container.insertAdjacentHTML(

        "beforeend",

`

<div class="lb-user-message">

${text}

</div>

`

    );

    scrollMessages();

}

// =====================================
// EXECUTIVE MESSAGE
// =====================================

function addExecutiveMessage(

text

){

    const container=

    document.getElementById(

        "lbMessages"

    );

    if(!container)
        return;

    container.insertAdjacentHTML(

        "beforeend",

`

<div class="lb-executive-message">

${text}

</div>

`

    );

    scrollMessages();

}

// =====================================
// AUTO SCROLL
// =====================================

function scrollMessages(){

    const container=

    document.getElementById(

        "lbMessages"

    );

    if(container){

        container.scrollTop=

        container.scrollHeight;

    }

}

// =====================================
// NEXT
// =====================================
//
// PART 11
//
// • Product Carousel
// • Cross Sell
// • Upsell
// • Frequently Bought Together
// =====================================
// PART 11
// Product Carousel
// Cross Sell
// Upsell
// Frequently Bought Together
// =====================================

// =====================================
// RENDER PRODUCTS
// =====================================

function renderProducts(products){

    if(

        !products ||

        !products.length

    ) return;

    const container=

    document.getElementById(

        "lbMessages"

    );

    if(!container)
        return;

    let html=

`

<div class="lb-product-carousel">

`;

    products.forEach(

        product=>{

            html+=`

<div class="lb-product-card">

    <img

    src="${product.image}"

    class="lb-product-image"

    />

    <div class="lb-product-title">

        ${product.title}

    </div>

    <div class="lb-product-price">

        ${product.price}

    </div>

    <div class="lb-product-actions">

        <button

        onclick="viewProduct('${product.handle}')">

        View

        </button>

        <button

        onclick="addProductToCart('${product.variantId}')">

        Add to Cart

        </button>

    </div>

</div>

`;

        }

    );

    html+=`

</div>

`;

    container.insertAdjacentHTML(

        "beforeend",

        html

    );

    scrollMessages();

}

// =====================================
// VIEW PRODUCT
// =====================================

function viewProduct(handle){

    window.open(

        "/products/"+handle,

        "_self"

    );

}

// =====================================
// ADD TO CART
// =====================================

async function addProductToCart(

variantId,

qty=1

){

    try{

        await fetch(

            "/cart/add.js",

            {

                method:"POST",

                headers:{

                    "Content-Type":

                    "application/json"

                },

                body:JSON.stringify({

                    id:variantId,

                    quantity:qty

                })

            }

        );

        executiveSpeak(

        "Great choice! I've added it to your cart."

        );

    }

    catch(error){

        console.error(error);

        executiveSpeak(

        "Sorry, I couldn't add it to your cart."

        );

    }

}

// =====================================
// CROSS SELL
// =====================================

function showCrossSell(products){

    if(

        !products ||

        !products.length

    ) return;

    addExecutiveMessage(

        "Customers also loved these products."

    );

    renderProducts(

        products

    );

}

// =====================================
// UPSELL
// =====================================

function showUpsell(product){

    if(!product)
        return;

    addExecutiveMessage(

`For just ${product.extraPrice} more, I recommend upgrading to ${product.title}.`

    );

    renderProducts(

        [product]

    );

}

// =====================================
// FREQUENTLY BOUGHT TOGETHER
// =====================================

function showFrequentlyBoughtTogether(

products

){

    if(

        !products ||

        !products.length

    ) return;

    addExecutiveMessage(

        "Frequently bought together"

    );

    renderProducts(

        products

    );

}

// =====================================
// NEXT
// =====================================
//
// PART 12
//
// • Coupon Engine
// • Discount Banner
// • Flash Sale
// • Limited Stock
// • Checkout CTA
// =====================================
// PART 12
// Coupon Engine
// Discount Banner
// Flash Sale
// Limited Stock
// Checkout CTA
// =====================================

// =====================================
// ACTIVE COUPON
// =====================================

let ACTIVE_COUPON=null;

// =====================================
// SHOW COUPON
// =====================================

function showCoupon(coupon){

    if(!coupon)
        return;

    ACTIVE_COUPON=coupon;

    addExecutiveMessage(

`🎁 Great news! You can use coupon <b>${coupon.code}</b> and save ${coupon.discount}.`

    );

    const container=

    document.getElementById(

        "lbMessages"

    );

    container.insertAdjacentHTML(

        "beforeend",

`

<div class="lb-coupon-card">

    <div class="lb-coupon-title">

        ${coupon.code}

    </div>

    <div class="lb-coupon-save">

        Save ${coupon.discount}

    </div>

    <button

    onclick="copyCoupon()">

        Copy Coupon

    </button>

</div>

`

    );

    scrollMessages();

}

// =====================================
// COPY COUPON
// =====================================

function copyCoupon(){

    if(!ACTIVE_COUPON)
        return;

    navigator.clipboard.writeText(

        ACTIVE_COUPON.code

    );

    executiveSpeak(

    "Coupon copied! Apply it during checkout."

    );

}

// =====================================
// FLASH SALE
// =====================================

function showFlashSale(sale){

    if(!sale)
        return;

    addExecutiveMessage(

`⚡ Flash Sale! ${sale.title}`

    );

    const container=

    document.getElementById(

        "lbMessages"

    );

    container.insertAdjacentHTML(

        "beforeend",

`

<div class="lb-flash-sale">

    <div>

        ${sale.description}

    </div>

    <div>

        Ends in

        <span

        id="lbFlashCountdown">

        --:--:--

        </span>

    </div>

</div>

`

    );

    startFlashCountdown(

        sale.endsAt

    );

}

// =====================================
// LIMITED STOCK
// =====================================

function showLimitedStock(product){

    if(!product)
        return;

    addExecutiveMessage(

`🔥 Hurry! Only ${product.stock} left in stock.`

    );

}

// =====================================
// CHECKOUT CTA
// =====================================

function showCheckoutCTA(){

    const container=

    document.getElementById(

        "lbMessages"

    );

    container.insertAdjacentHTML(

        "beforeend",

`

<div class="lb-checkout-box">

    <button

    onclick="goCheckout()">

        Secure Checkout

    </button>

</div>

`

    );

    scrollMessages();

}

// =====================================
// CHECKOUT
// =====================================

function goCheckout(){

    window.location.href=

    "/checkout";

}

// =====================================
// FLASH COUNTDOWN
// =====================================

function startFlashCountdown(

endTime

){

    const timer=

    document.getElementById(

        "lbFlashCountdown"

    );

    if(!timer)
        return;

    const interval=

    setInterval(

        ()=>{

            const diff=

            new Date(endTime)-

            new Date();

            if(diff<=0){

                clearInterval(

                    interval

                );

                timer.innerHTML=

                "Expired";

                return;

            }

            const h=

            Math.floor(

                diff/3600000

            );

            const m=

            Math.floor(

                (diff%3600000)

                /60000

            );

            const s=

            Math.floor(

                (diff%60000)

                /1000

            );

            timer.innerHTML=

`${h}:${m}:${s}`;

        },

        1000

    );

}

// =====================================
// NEXT
// =====================================
//
// PART 13
//
// • Returning Visitor Memory
// • Visitor Recognition
// • Personalized Greeting
// • Recent Products
// • Sales Follow-up
// =====================================
// PART 13
// Returning Visitor Engine
// Visitor Recognition
// Personalized Greeting
// Sales Follow-up
// =====================================

// =====================================
// VISITOR PROFILE
// =====================================

const VISITOR_PROFILE={

    firstName:"",

    email:"",

    phone:"",

    lastVisit:null,

    totalVisits:0,

    recentProducts:[],

    lastCart:[],

    lastPurchase:null,

    favouriteCategory:"",

    customerType:"guest"

};

// =====================================
// LOAD VISITOR PROFILE
// =====================================

async function loadVisitorProfile(){

    try{

        const response=

        await fetch(

            `${CONFIG.API_BASE}/api/chat/visitor/profile`,

            {

                method:"POST",

                headers:{

                    "Content-Type":"application/json"

                },

                body:JSON.stringify({

                    visitorId:VISITOR.id,

                    hostname:location.hostname

                })

            }

        );

        if(!response.ok)
            return;

        const data=

        await response.json();

        if(!data.success)
            return;

        Object.assign(

            VISITOR_PROFILE,

            data.profile

        );

        if(

            data.profile.firstName

        ){

            VISITOR.firstName=

            data.profile.firstName;

        }

    }

    catch(error){

        console.error(error);

    }

}

// =====================================
// RETURNING GREETING
// =====================================

function greetReturningVisitor(){

    let greeting=

`👋 Hi ${getVisitorName()}! Welcome back.`;

    if(

        VISITOR_PROFILE.totalVisits>

        1

    ){

        greeting+=

` This is your ${VISITOR_PROFILE.totalVisits} visit.`;

    }

    executiveSpeak(

        greeting,

        1000

    );

}

// =====================================
// RECENT PRODUCTS
// =====================================

function recommendRecentProducts(){

    if(

        !VISITOR_PROFILE.recentProducts ||

        !VISITOR_PROFILE.recentProducts.length

    ) return;

    addExecutiveMessage(

"Here are the products you viewed previously."

    );

    renderProducts(

        VISITOR_PROFILE.recentProducts

    );

}

// =====================================
// RECOVER CART
// =====================================

function recoverPreviousCart(){

    if(

        !VISITOR_PROFILE.lastCart ||

        !VISITOR_PROFILE.lastCart.length

    ) return;

    addExecutiveMessage(

"I've found items left in your cart."

    );

    renderProducts(

        VISITOR_PROFILE.lastCart

    );

    showCheckoutCTA();

}

// =====================================
// FOLLOW-UP
// =====================================

function salesFollowUp(){

    if(

        VISITOR_PROFILE.lastPurchase

    ){

        addExecutiveMessage(

`How are you enjoying your previous purchase? I have some products you may also like.`

        );

    }

}

// =====================================
// SAVE PRODUCT VIEW
// =====================================

async function saveViewedProduct(

productId

){

    try{

        await fetch(

`${CONFIG.API_BASE}/api/chat/visitor/view`,

            {

                method:"POST",

                headers:{

                    "Content-Type":"application/json"

                },

                body:JSON.stringify({

                    visitorId:VISITOR.id,

                    productId

                })

            }

        );

    }

    catch(error){

        console.error(error);

    }

}

// =====================================
// SAVE CHAT
// =====================================

async function saveConversation(

message,

role

){

    try{

        await fetch(

`${CONFIG.API_BASE}/api/chat/visitor/history`,

            {

                method:"POST",

                headers:{

                    "Content-Type":"application/json"

                },

                body:JSON.stringify({

                    visitorId:VISITOR.id,

                    role,

                    message

                })

            }

        );

    }

    catch(error){

        console.error(error);

    }

}

// =====================================
// INITIALIZE
// =====================================

loadVisitorProfile();

// =====================================
// NEXT
// =====================================
//
// PART 14
//
// • 48-Hour Trial Banner
// • Premium Countdown
// • Renew Now
// • Subscription Lock
// • Premium Upgrade Popup
// =====================================
// PART 14
// Premium Trial Banner
// Countdown
// Renew Now
// Subscription Lock
// =====================================

// =====================================
// TRIAL
// =====================================

let trialInterval=null;

// =====================================
// CREATE TOP BANNER
// =====================================

function createTrialBanner(){

    if(

        document.getElementById(

            "lbTrialBanner"

        )

    ) return;

    const banner=

    document.createElement(

        "div"

    );

    banner.id=

    "lbTrialBanner";

    banner.innerHTML=

`

<div class="lb-trial-left">

⭐ Your Premium Trial expires in

<span id="lbTrialCountdown">

48:00:00

</span>

</div>

<div class="lb-trial-right">

<button

id="lbRenewButton">

Recharge Now

</button>

</div>

`;

    document.body.prepend(

        banner

    );

    document

    .getElementById(

        "lbRenewButton"

    )

    .onclick=

    openSubscriptionPage;

}

// =====================================
// START COUNTDOWN
// =====================================

function startTrialCountdown(

expiresAt

){

    clearInterval(

        trialInterval

    );

    createTrialBanner();

    trialInterval=

    setInterval(

        ()=>{

            const diff=

            new Date(

                expiresAt

            )

            -

            new Date();

            const countdown=

            document.getElementById(

                "lbTrialCountdown"

            );

            if(

                !countdown

            ) return;

            if(diff<=0){

                clearInterval(

                    trialInterval

                );

                countdown.innerHTML=

                "Expired";

                lockPremium();

                return;

            }

            const hours=

            Math.floor(

                diff/3600000

            );

            const minutes=

            Math.floor(

                (

                    diff%

                    3600000

                )/60000

            );

            const seconds=

            Math.floor(

                (

                    diff%

                    60000

                )/1000

            );

            countdown.innerHTML=

`${String(hours).padStart(2,"0")}:${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;

        },

        1000

    );

}

// =====================================
// LOCK PREMIUM
// =====================================

function lockPremium(){

    SUBSCRIPTION.active=false;

    addExecutiveMessage(

`🔒 Premium Trial has expired.

Please renew your subscription to continue using your Sales Executive.`

    );

    disablePremiumFeatures();

    showUpgradePopup();

}

// =====================================
// PREMIUM FEATURES
// =====================================

function disablePremiumFeatures(){

    SALES.crossSell=false;

    SALES.upsell=false;

    SALES.bundleOffer=false;

    SALES.analytics=false;

}

// =====================================
// UPGRADE POPUP
// =====================================

function showUpgradePopup(){

    const popup=

    document.createElement(

        "div"

    );

    popup.id=

    "lbUpgradePopup";

    popup.innerHTML=

`

<div class="lb-upgrade-box">

<h2>

Premium Trial Expired

</h2>

<p>

Renew now to reactivate your Sales Executive.

</p>

<button

onclick="openSubscriptionPage()">

Renew Now

</button>

</div>

`;

    document.body.appendChild(

        popup

    );

}

// =====================================
// BILLING
// =====================================

function openSubscriptionPage(){

    window.location.href=

"/pricing.html";

}

// =====================================
// INITIALIZE
// =====================================

if(

    SUBSCRIPTION.countdown &&

    SUBSCRIPTION.expiresAt

){

    startTrialCountdown(

        SUBSCRIPTION.expiresAt

    );

}

// =====================================
// NEXT
// =====================================
//
// PART 15
//
// • Sales Personality Engine
// • Friendly
// • Professional
// • Luxury
// • Casual
// • Regional Behaviour
// =====================================
// PART 15
// Sales Personality Engine
// Regional Behaviour
// Production Ready
// =====================================

// =====================================
// PERSONALITIES
// =====================================

const PERSONALITIES={

    friendly:{

        greeting:
        "Hi {name}! 👋 I'm {executive}. I'm excited to help you today.",

        recommendation:
        "I think you'll really love this product.",

        checkout:
        "Whenever you're ready, I'll help you checkout safely."

    },

    professional:{

        greeting:
        "Welcome {name}. I'm {executive}. How may I assist you today?",

        recommendation:
        "Based on your interest, I recommend this option.",

        checkout:
        "I can guide you through a secure checkout."

    },

    luxury:{

        greeting:
        "Welcome {name}. I'm {executive}, your personal shopping consultant.",

        recommendation:
        "This premium collection would suit your preferences perfectly.",

        checkout:
        "Allow me to assist you with your premium purchase."

    },

    energetic:{

        greeting:
        "Hey {name}! 🔥 Great to see you here!",

        recommendation:
        "This is one of today's hottest products!",

        checkout:
        "Let's grab it before it's gone!"

    },

    caring:{

        greeting:
        "Hello {name}. ❤️ I'm here to help you find exactly what you need.",

        recommendation:
        "I carefully selected this based on your interests.",

        checkout:
        "I'll stay with you until everything is complete."

    },

    casual:{

        greeting:
        "Hi {name}! 😊 Nice to meet you!",

        recommendation:
        "This one's really popular right now.",

        checkout:
        "Let's finish your order."

    }

};

// =====================================
// REGIONAL GREETINGS
// =====================================

const REGIONS={

    US:{
        currency:"USD",
        greeting:"Hi",
        language:"en-US"
    },

    UK:{
        currency:"GBP",
        greeting:"Hello",
        language:"en-GB"
    },

    CAD:{
        currency:"CAD",
        greeting:"Hi",
        language:"en-CA"
    },

    UAE:{
        currency:"AED",
        greeting:"Marhaba",
        language:"en-AE"
    },

    INDIA:{
        currency:"INR",
        greeting:"Namaste",
        language:"en-IN"
    }

};

// =====================================
// BUILD PERSONAL MESSAGE
// =====================================

function personalityMessage(type,key){

    const personality=

    PERSONALITIES[type] ||

    PERSONALITIES.friendly;

    let message=

    personality[key] ||

    "";

    message=

    message.replace(

        "{name}",

        getVisitorName()

    );

    message=

    message.replace(

        "{executive}",

        EXECUTIVE.name

    );

    return message;

}

// =====================================
// GREETING
// =====================================

function executiveGreeting(){

    return personalityMessage(

        EXECUTIVE.personality,

        "greeting"

    );

}

// =====================================
// PRODUCT RECOMMENDATION
// =====================================

function recommendationMessage(){

    return personalityMessage(

        EXECUTIVE.personality,

        "recommendation"

    );

}

// =====================================
// CHECKOUT MESSAGE
// =====================================

function checkoutMessage(){

    return personalityMessage(

        EXECUTIVE.personality,

        "checkout"

    );

}

// =====================================
// COUNTRY
// =====================================

function regionSettings(){

    return(

        REGIONS[

            EXECUTIVE.country

        ]

        ||

        REGIONS.US

    );

}

// =====================================
// EXECUTIVE SPEAK
// =====================================

function speakPersonality(key){

    executiveSpeak(

        personalityMessage(

            EXECUTIVE.personality,

            key

        )

    );

}

// =====================================
// NEXT
// =====================================
//
// PART 16
//
// • Sales Qualification Engine
// • Understand Visitor Intent
// • Product Discovery
// • Smart Questions
// • Buyer Journey
// =====================================
// PART 16.1
// Sales Qualification Engine
// Visitor Intent Discovery
// Production Ready
// =====================================

// =====================================
// SALES JOURNEY
// =====================================

const SALES_JOURNEY={

    UNKNOWN:"unknown",

    BROWSING:"browsing",

    SEARCHING:"searching",

    COMPARING:"comparing",

    BUYING:"buying",

    CHECKOUT:"checkout",

    POST_PURCHASE:"post_purchase"

};

// =====================================
// VISITOR INTENT
// =====================================

const VISITOR_INTENT={

    journey:

    SALES_JOURNEY.UNKNOWN,

    category:"",

    product:"",

    brand:"",

    color:"",

    size:"",

    gender:"",

    budget:null,

    quantity:1,

    urgency:false,

    gift:false,

    confidence:0

};

// =====================================
// SALES MEMORY
// =====================================

const SALES_MEMORY={

    askedBudget:false,

    askedCategory:false,

    askedBrand:false,

    askedSize:false,

    askedColor:false,

    recommendedProducts:false,

    showedUpsell:false,

    showedCrossSell:false,

    checkoutStarted:false

};

// =====================================
// KEYWORDS
// =====================================

const BUY_KEYWORDS=[

    "buy",

    "purchase",

    "order",

    "checkout",

    "cart",

    "pay",

    "need",

    "want"

];

const COMPARE_KEYWORDS=[

    "compare",

    "difference",

    "better",

    "vs",

    "which",

    "best"

];

const GIFT_KEYWORDS=[

    "gift",

    "birthday",

    "anniversary",

    "present"

];

// =====================================
// DETECT JOURNEY
// =====================================

function detectSalesJourney(

message

){

    const text=

    message.toLowerCase();

    if(

        BUY_KEYWORDS.some(

            word=>text.includes(word)

        )

    ){

        VISITOR_INTENT.journey=

        SALES_JOURNEY.BUYING;

        return;

    }

    if(

        COMPARE_KEYWORDS.some(

            word=>text.includes(word)

        )

    ){

        VISITOR_INTENT.journey=

        SALES_JOURNEY.COMPARING;

        return;

    }

    VISITOR_INTENT.journey=

    SALES_JOURNEY.BROWSING;

}

// =====================================
// DETECT GIFT
// =====================================

function detectGiftIntent(

message

){

    const text=

    message.toLowerCase();

    VISITOR_INTENT.gift=

    GIFT_KEYWORDS.some(

        word=>text.includes(word)

    );

}

// =====================================
// UPDATE CONFIDENCE
// =====================================

function increaseConfidence(

points=10

){

    VISITOR_INTENT.confidence=

    Math.min(

        100,

        VISITOR_INTENT.confidence+

        points

    );

}

// =====================================
// INITIAL ANALYSIS
// =====================================

function analyzeVisitorIntent(

message

){

    detectSalesJourney(

        message

    );

    detectGiftIntent(

        message

    );

    increaseConfidence(

        10

    );

}

// =====================================
// NEXT
// =====================================
//
// PART 16.2
//
// • Budget Detection
// • Category Detection
// • Brand Detection
// • Product Detection
// • Buyer Qualification

    
