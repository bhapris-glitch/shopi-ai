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
// =====================================
// PART 16.2
// Buyer Qualification Engine
// Budget
// Category
// Brand
// Product Detection
// =====================================

// =====================================
// STORE CATALOG
// =====================================

const STORE_CONTEXT={

    categories:[],

    brands:[],

    products:[]

};

// =====================================
// CATEGORY
// =====================================

function detectCategory(message){

    const text=

    message.toLowerCase();

    for(

        const category

        of STORE_CONTEXT.categories

    ){

        if(

            text.includes(

                category.toLowerCase()

            )

        ){

            VISITOR_INTENT.category=

            category;

            SALES_MEMORY.askedCategory=

            true;

            increaseConfidence(15);

            return category;

        }

    }

    return null;

}

// =====================================
// BRAND
// =====================================

function detectBrand(message){

    const text=

    message.toLowerCase();

    for(

        const brand

        of STORE_CONTEXT.brands

    ){

        if(

            text.includes(

                brand.toLowerCase()

            )

        ){

            VISITOR_INTENT.brand=

            brand;

            SALES_MEMORY.askedBrand=

            true;

            increaseConfidence(10);

            return brand;

        }

    }

    return null;

}

// =====================================
// PRODUCT
// =====================================

function detectProduct(message){

    const text=

    message.toLowerCase();

    for(

        const product

        of STORE_CONTEXT.products

    ){

        if(

            text.includes(

                product.title

                .toLowerCase()

            )

        ){

            VISITOR_INTENT.product=

            product.title;

            increaseConfidence(20);

            return product;

        }

    }

    return null;

}

// =====================================
// BUDGET
// =====================================

function detectBudget(message){

    const match=

    message.match(

        /\$?\d+/

    );

    if(

        !match

    ) return null;

    const budget=

    parseInt(

        match[0]

        .replace(

            "$",

            ""

        )

    );

    VISITOR_INTENT.budget=

    budget;

    SALES_MEMORY.askedBudget=

    true;

    increaseConfidence(20);

    return budget;

}

// =====================================
// SIZE
// =====================================

function detectSize(message){

    const text=

    message.toLowerCase();

    const sizes=[

        "xs",

        "s",

        "m",

        "l",

        "xl",

        "xxl"

    ];

    for(

        const size

        of sizes

    ){

        if(

            text.includes(size)

        ){

            VISITOR_INTENT.size=

            size.toUpperCase();

            SALES_MEMORY.askedSize=true;

            return size;

        }

    }

    return null;

}

// =====================================
// COLOR
// =====================================

function detectColor(message){

    const colors=[

        "black",

        "white",

        "blue",

        "red",

        "green",

        "orange",

        "yellow",

        "pink",

        "grey",

        "brown"

    ];

    const text=

    message.toLowerCase();

    for(

        const color

        of colors

    ){

        if(

            text.includes(color)

        ){

            VISITOR_INTENT.color=

            color;

            SALES_MEMORY.askedColor=true;

            return color;

        }

    }

    return null;

}

// =====================================
// QUALIFY BUYER
// =====================================

function qualifyBuyer(message){

    detectBudget(message);

    detectCategory(message);

    detectBrand(message);

    detectProduct(message);

    detectSize(message);

    detectColor(message);

    return{

        confidence:

        VISITOR_INTENT.confidence,

        category:

        VISITOR_INTENT.category,

        brand:

        VISITOR_INTENT.brand,

        budget:

        VISITOR_INTENT.budget,

        product:

        VISITOR_INTENT.product

    };

}

// =====================================
// NEXT
// =====================================
//
// PART 16.3
//
// • Smart Sales Questions
// • Ask Budget
// • Ask Size
// • Ask Color
// • Ask Brand
// • Build Customer Profile
// =====================================
// PART 16.3
// Smart Sales Questions
// Customer Qualification
// Production Ready
// =====================================

// =====================================
// QUALIFICATION QUESTIONS
// =====================================

const SALES_QUESTIONS={

    category:
    "What type of product are you looking for today?",

    budget:
    "Do you have a budget in mind?",

    brand:
    "Do you have any preferred brand?",

    size:
    "Which size would you like?",

    color:
    "Which color do you prefer?",

    quantity:
    "How many would you like?",

    useCase:
    "Is this for yourself or as a gift?"

};

// =====================================
// ASK CATEGORY
// =====================================

function askCategory(){

    if(

        SALES_MEMORY.askedCategory

    ) return;

    SALES_MEMORY.askedCategory=true;

    executiveSpeak(

        SALES_QUESTIONS.category

    );

}

// =====================================
// ASK BUDGET
// =====================================

function askBudget(){

    if(

        SALES_MEMORY.askedBudget

    ) return;

    SALES_MEMORY.askedBudget=true;

    executiveSpeak(

        SALES_QUESTIONS.budget

    );

}

// =====================================
// ASK BRAND
// =====================================

function askBrand(){

    if(

        SALES_MEMORY.askedBrand

    ) return;

    SALES_MEMORY.askedBrand=true;

    executiveSpeak(

        SALES_QUESTIONS.brand

    );

}

// =====================================
// ASK SIZE
// =====================================

function askSize(){

    if(

        SALES_MEMORY.askedSize

    ) return;

    SALES_MEMORY.askedSize=true;

    executiveSpeak(

        SALES_QUESTIONS.size

    );

}

// =====================================
// ASK COLOR
// =====================================

function askColor(){

    if(

        SALES_MEMORY.askedColor

    ) return;

    SALES_MEMORY.askedColor=true;

    executiveSpeak(

        SALES_QUESTIONS.color

    );

}

// =====================================
// ASK QUANTITY
// =====================================

function askQuantity(){

    executiveSpeak(

        SALES_QUESTIONS.quantity

    );

}

// =====================================
// ASK USE CASE
// =====================================

function askUseCase(){

    executiveSpeak(

        SALES_QUESTIONS.useCase

    );

}

// =====================================
// SMART QUALIFICATION
// =====================================

function smartQualification(){

    if(

        !VISITOR_INTENT.category

    ){

        askCategory();

        return;

    }

    if(

        !VISITOR_INTENT.budget

    ){

        askBudget();

        return;

    }

    if(

        !VISITOR_INTENT.brand

    ){

        askBrand();

        return;

    }

    if(

        !VISITOR_INTENT.size

    ){

        askSize();

        return;

    }

    if(

        !VISITOR_INTENT.color

    ){

        askColor();

        return;

    }

}

// =====================================
// CUSTOMER PROFILE
// =====================================

function buildCustomerProfile(){

    return{

        visitorId:

        VISITOR.id,

        category:

        VISITOR_INTENT.category,

        brand:

        VISITOR_INTENT.brand,

        budget:

        VISITOR_INTENT.budget,

        size:

        VISITOR_INTENT.size,

        color:

        VISITOR_INTENT.color,

        quantity:

        VISITOR_INTENT.quantity,

        gift:

        VISITOR_INTENT.gift,

        confidence:

        VISITOR_INTENT.confidence,

        journey:

        VISITOR_INTENT.journey

    };

}

// =====================================
// READY TO RECOMMEND
// =====================================

function readyForRecommendation(){

    return(

        VISITOR_INTENT.category &&

        VISITOR_INTENT.confidence>=50

    );

}

// =====================================
// NEXT
// =====================================
//
// PART 16.4
//
// • AI Product Recommendation Decision
// • Best Match Finder
// • Cross-Sell Decision
// • Upsell Decision
// • Bundle Recommendation Engine
// =====================================
// PART 16.4
// AI Recommendation Decision Engine
// Best Match
// Cross Sell
// Upsell
// Bundle
// =====================================

// =====================================
// RECOMMENDATION STATE
// =====================================

const RECOMMENDATION={

    bestMatch:[],

    crossSell:[],

    upsell:[],

    bundles:[],

    confidence:0

};

// =====================================
// SCORE PRODUCT
// =====================================

function scoreProduct(product){

    let score=0;

    // Category

    if(

        VISITOR_INTENT.category &&

        product.category===

        VISITOR_INTENT.category

    ){

        score+=40;

    }

    // Brand

    if(

        VISITOR_INTENT.brand &&

        product.vendor===

        VISITOR_INTENT.brand

    ){

        score+=20;

    }

    // Budget

    if(

        VISITOR_INTENT.budget

    ){

        const price=

        Number(product.price);

        if(

            price<=

            VISITOR_INTENT.budget

        ){

            score+=20;

        }

    }

    // Color

    if(

        VISITOR_INTENT.color &&

        product.color===

        VISITOR_INTENT.color

    ){

        score+=10;

    }

    // Size

    if(

        VISITOR_INTENT.size &&

        product.size===

        VISITOR_INTENT.size

    ){

        score+=10;

    }

    return score;

}

// =====================================
// BEST MATCH
// =====================================

function findBestProducts(

products

){

    const ranked=

    products.map(

        product=>{

            return{

                product,

                score:

                scoreProduct(

                    product

                )

            };

        }

    );

    ranked.sort(

        (a,b)=>

        b.score-a.score

    );

    RECOMMENDATION.bestMatch=

    ranked

    .slice(0,4)

    .map(

        item=>item.product

    );

    if(

        ranked.length

    ){

        RECOMMENDATION.confidence=

        ranked[0].score;

    }

    return RECOMMENDATION.bestMatch;

}

// =====================================
// CROSS SELL
// =====================================

function findCrossSell(

product

){

    if(

        !product ||

        !product.crossSell

    ) return [];

    RECOMMENDATION.crossSell=

    product.crossSell;

    return product.crossSell;

}

// =====================================
// UPSELL
// =====================================

function findUpsell(

product

){

    if(

        !product ||

        !product.upsell

    ) return null;

    RECOMMENDATION.upsell=

    product.upsell;

    return product.upsell;

}

// =====================================
// BUNDLE
// =====================================

function findBundles(

product

){

    if(

        !product ||

        !product.bundle

    ) return [];

    RECOMMENDATION.bundles=

    product.bundle;

    return product.bundle;

}

// =====================================
// DECISION ENGINE
// =====================================

function recommendationDecision(

catalog

){

    const products=

    findBestProducts(

        catalog

    );

    if(

        !products.length

    ) return;

    renderProducts(

        products

    );

    const first=

    products[0];

    const upsell=

    findUpsell(

        first

    );

    if(

        upsell &&

        SALES.upsell

    ){

        showUpsell(

            upsell

        );

    }

    const cross=

    findCrossSell(

        first

    );

    if(

        cross.length &&

        SALES.crossSell

    ){

        showCrossSell(

            cross

        );

    }

    const bundle=

    findBundles(

        first

    );

    if(

        bundle.length &&

        SALES.bundleOffer

    ){

        showFrequentlyBoughtTogether(

            bundle

        );

    }

}

// =====================================
// NEXT
// =====================================
//
// PART 16.5
//
// • Purchase Readiness Detector
// • Hesitation Detection
// • Exit Intent
// • Cart Recovery Trigger
// • Closing Technique
// =====================================
// PART 16.5
// Purchase Readiness Engine
// Hesitation Detection
// Exit Intent
// Closing Techniques
// =====================================

// =====================================
// PURCHASE READINESS
// =====================================

const PURCHASE_STATE={

    score:0,

    ready:false,

    hesitation:false,

    exitIntent:false,

    objection:null,

    reminderSent:false

};

// =====================================
// BUYING SIGNALS
// =====================================

const BUY_SIGNALS=[

    "buy",
    "checkout",
    "purchase",
    "add to cart",
    "order",
    "pay",
    "payment",
    "shipping",
    "delivery",
    "coupon"

];

const HESITATION_SIGNALS=[

    "expensive",
    "costly",
    "not sure",
    "thinking",
    "later",
    "maybe",
    "price",
    "wait",
    "compare",
    "another"

];

// =====================================
// PURCHASE SCORE
// =====================================

function updatePurchaseScore(message){

    const text=

    message.toLowerCase();

    BUY_SIGNALS.forEach(

        word=>{

            if(

                text.includes(word)

            ){

                PURCHASE_STATE.score+=20;

            }

        }

    );

    HESITATION_SIGNALS.forEach(

        word=>{

            if(

                text.includes(word)

            ){

                PURCHASE_STATE.score-=10;

                PURCHASE_STATE.hesitation=true;

            }

        }

    );

    PURCHASE_STATE.score=

    Math.max(

        0,

        Math.min(

            PURCHASE_STATE.score,

            100

        )

    );

    PURCHASE_STATE.ready=

    PURCHASE_STATE.score>=70;

}

// =====================================
// HANDLE HESITATION
// =====================================

function handleHesitation(){

    if(

        !PURCHASE_STATE.hesitation

    ) return;

    executiveSpeak(

"I completely understand. Let me help you choose the best option based on your needs."

    );

    if(

        ACTIVE_COUPON

    ){

        executiveSpeak(

`You can also save money using coupon ${ACTIVE_COUPON.code}.`

        );

    }

}

// =====================================
// CLOSING TECHNIQUES
// =====================================

function tryClosingSale(){

    if(

        !PURCHASE_STATE.ready

    ) return;

    executiveSpeak(

"It looks like you've found a great choice. Would you like to complete your secure checkout now?"

    );

    showCheckoutCTA();

}

// =====================================
// EXIT INTENT
// =====================================

document.addEventListener(

    "mouseleave",

    (event)=>{

        if(

            event.clientY>0 ||

            PURCHASE_STATE.exitIntent

        ) return;

        PURCHASE_STATE.exitIntent=true;

        handleExitIntent();

    }

);

// =====================================
// EXIT OFFER
// =====================================

function handleExitIntent(){

    if(

        PURCHASE_STATE.reminderSent

    ) return;

    PURCHASE_STATE.reminderSent=true;

    if(

        ACTIVE_COUPON

    ){

        executiveSpeak(

`Before you go... don't forget your coupon ${ACTIVE_COUPON.code}.`

        );

    }

    else{

        executiveSpeak(

"Before you leave, can I help you find the perfect product?"

        );

    }

}

// =====================================
// CART RECOVERY
// =====================================

function triggerCartRecovery(){

    if(

        PURCHASE_STATE.ready

    ){

        executiveSpeak(

"You still have items waiting in your cart."

        );

        showCheckoutCTA();

    }

}

// =====================================
// SALES DECISION
// =====================================

function purchaseDecision(message){

    updatePurchaseScore(message);

    if(

        PURCHASE_STATE.hesitation

    ){

        handleHesitation();

        return;

    }

    if(

        PURCHASE_STATE.ready

    ){

        tryClosingSale();

    }

}

// =====================================
// NEXT
// =====================================
//
// PART 16.6
//
// • Complete Sales AI Brain
// • Conversation State Machine
// • Recommendation Flow
// • Closing Flow
// • Revenue Optimization
// =====================================
// PART 16.6
// Sales AI Brain
// Revenue Optimization Engine
// Production Ready
// =====================================

// =====================================
// SALES AI BRAIN
// =====================================

async function salesAIEngine(message){

    // -----------------------------
    // STEP 1
    // Understand Visitor
    // -----------------------------

    analyzeVisitorIntent(

        message

    );

    qualifyBuyer(

        message

    );

    purchaseDecision(

        message

    );

    // -----------------------------
    // STEP 2
    // Qualification
    // -----------------------------

    if(

        !readyForRecommendation()

    ){

        smartQualification();

        return;

    }

    // -----------------------------
    // STEP 3
    // Build Profile
    // -----------------------------

    const profile=

    buildCustomerProfile();

    // -----------------------------
    // STEP 4
    // Recommendation API
    // -----------------------------

    try{

        const response=

        await fetch(

`${CONFIG.API_BASE}/api/chat/recommend`,

        {

            method:"POST",

            headers:{

                "Content-Type":

                "application/json"

            },

            body:JSON.stringify({

                visitorId:

                VISITOR.id,

                profile,

                hostname:

                location.hostname

            })

        }

        );

        if(

            !response.ok

        ){

            return;

        }

        const result=

        await response.json();

        if(

            !result.success

        ){

            return;

        }

        // -------------------------
        // BEST PRODUCTS
        // -------------------------

        recommendationDecision(

            result.products

        );

        // -------------------------
        // COUPON
        // -------------------------

        if(

            result.coupon

        ){

            showCoupon(

                result.coupon

            );

        }

        // -------------------------
        // FLASH SALE
        // -------------------------

        if(

            result.flashSale

        ){

            showFlashSale(

                result.flashSale

            );

        }

        // -------------------------
        // LIMITED STOCK
        // -------------------------

        if(

            result.limitedStock

        ){

            showLimitedStock(

                result.limitedStock

            );

        }

        // -------------------------
        // FOLLOW UP
        // -------------------------

        if(

            result.followUp

        ){

            addExecutiveMessage(

                result.followUp

            );

        }

    }

    catch(error){

        console.error(

            error

        );

    }

}

// =====================================
// CONVERSATION FLOW
// =====================================

async function processConversation(

message

){

    await saveConversation(

        message,

        "visitor"

    );

    await salesAIEngine(

        message

    );

}

// =====================================
// REVENUE BOOST
// =====================================

function revenueOptimization(){

    if(

        PURCHASE_STATE.ready

    ){

        if(

            SALES.bundleOffer

        ){

            addExecutiveMessage(

"Buying together today saves even more."

            );

        }

        if(

            SALES.crossSell

        ){

            addExecutiveMessage(

"Customers usually add one more item before checkout."

            );

        }

    }

}

// =====================================
// AFTER RESPONSE
// =====================================

function afterRecommendation(){

    revenueOptimization();

    if(

        PURCHASE_STATE.ready

    ){

        showCheckoutCTA();

    }

}

// =====================================
// SALES COMPLETE
// =====================================

function salesCompleted(){

    executiveSpeak(

"🎉 Thank you! Your order has been placed successfully. I'm always here whenever you need help again."

    );

}

// =====================================
// SALES PIPELINE
// =====================================
//
// Visitor
//     ↓
// Qualification
//     ↓
// Profile
//     ↓
// Recommendation
//     ↓
// Cross Sell
//     ↓
// Upsell
//     ↓
// Bundle
//     ↓
// Coupon
//     ↓
// Flash Sale
//     ↓
// Checkout
//     ↓
// Order
//     ↓
// Repeat Customer
//
// =====================================
// END OF SALES AI ENGINE
// =====================================
// =====================================
// PART 17.1
// Abandoned Cart Recovery Engine
// Cart Monitoring
// Production Ready
// =====================================

// =====================================
// CART RECOVERY
// =====================================

const CART_RECOVERY={

    enabled:true,

    active:false,

    cartId:null,

    checkoutUrl:"",

    lastActivity:null,

    reminderSent:false,

    recovered:false,

    recoveryStarted:false,

    items:[],

    subtotal:0,

    currency:"USD"

};

// =====================================
// SETTINGS
// =====================================

const RECOVERY_CONFIG={

    idleMinutes:20,

    popupDelay:120000,

    firstReminder:20,

    secondReminder:60,

    thirdReminder:1440,

    maxReminders:3

};

// =====================================
// CART SNAPSHOT
// =====================================

let CART_STATE={

    itemCount:0,

    subtotal:0,

    items:[]

};

// =====================================
// LOAD CART
// =====================================

async function loadCart(){

    try{

        const response=

        await fetch(

            "/cart.js"

        );

        if(

            !response.ok

        ) return null;

        const cart=

        await response.json();

        updateCartState(

            cart

        );

        return cart;

    }

    catch(error){

        console.error(

            error

        );

        return null;

    }

}

// =====================================
// UPDATE
// =====================================

function updateCartState(

cart

){

    CART_STATE.itemCount=

    cart.item_count;

    CART_STATE.subtotal=

    cart.total_price;

    CART_STATE.items=

    cart.items;

    CART_RECOVERY.items=

    cart.items;

    CART_RECOVERY.subtotal=

    cart.total_price;

    CART_RECOVERY.currency=

    cart.currency;

    CART_RECOVERY.lastActivity=

    Date.now();

}

// =====================================
// CART EXISTS
// =====================================

function hasCartItems(){

    return(

        CART_STATE.itemCount>

        0

    );

}

// =====================================
// MARK ACTIVE
// =====================================

function activateRecovery(){

    if(

        !hasCartItems()

    ) return;

    CART_RECOVERY.active=true;

    CART_RECOVERY.lastActivity=

    Date.now();

}

// =====================================
// RESET
// =====================================

function resetRecovery(){

    CART_RECOVERY.active=false;

    CART_RECOVERY.reminderSent=false;

    CART_RECOVERY.recovered=false;

    CART_RECOVERY.recoveryStarted=false;

}

// =====================================
// NEXT
// =====================================
//
// PART 17.2
//
// • Detect Idle Visitor
// • Detect Cart Abandonment
// • Activity Listener
// • Recovery Timer
// =====================================
// PART 17.2
// Cart Abandonment Detection
// Activity Monitor
// Recovery Timer
// =====================================

// =====================================
// USER ACTIVITY
// =====================================

const USER_ACTIVITY={

    mouse:true,

    keyboard:true,

    scroll:true,

    touch:true,

    lastSeen:Date.now()

};

// =====================================
// UPDATE ACTIVITY
// =====================================

function updateVisitorActivity(){

    USER_ACTIVITY.lastSeen=

    Date.now();

    CART_RECOVERY.lastActivity=

    Date.now();

}

// =====================================
// EVENTS
// =====================================

document.addEventListener(

    "mousemove",

    updateVisitorActivity,

    {

        passive:true

    }

);

document.addEventListener(

    "scroll",

    updateVisitorActivity,

    {

        passive:true

    }

);

document.addEventListener(

    "keydown",

    updateVisitorActivity

);

document.addEventListener(

    "touchstart",

    updateVisitorActivity,

    {

        passive:true

    }

);

document.addEventListener(

    "click",

    updateVisitorActivity

);

// =====================================
// IDLE CHECK
// =====================================

function visitorIdleMinutes(){

    return(

        Date.now()

        -

        USER_ACTIVITY.lastSeen

    )/

    60000;

}

function isVisitorIdle(){

    return(

        visitorIdleMinutes()

        >=

        RECOVERY_CONFIG.idleMinutes

    );

}

// =====================================
// CART ABANDONMENT
// =====================================

function detectCartAbandonment(){

    if(

        !CART_RECOVERY.enabled

    ) return false;

    if(

        !hasCartItems()

    ) return false;

    if(

        CART_RECOVERY.recovered

    ) return false;

    if(

        isVisitorIdle()

    ){

        CART_RECOVERY.recoveryStarted=true;

        return true;

    }

    return false;

}

// =====================================
// MONITOR
// =====================================

function startRecoveryMonitor(){

    setInterval(

        ()=>{

            if(

                detectCartAbandonment()

            ){

                triggerRecoverySequence();

            }

        },

        30000

    );

}

// =====================================
// PAGE VISIBILITY
// =====================================

document.addEventListener(

    "visibilitychange",

    ()=>{

        if(

            document.hidden &&

            hasCartItems()

        ){

            CART_RECOVERY.recoveryStarted=true;

            triggerRecoverySequence();

        }

    }

);

// =====================================
// BEFORE UNLOAD
// =====================================

window.addEventListener(

    "beforeunload",

    ()=>{

        if(

            hasCartItems()

        ){

            CART_RECOVERY.recoveryStarted=true;

            saveRecoveryState();

        }

    }

);

// =====================================
// START
// =====================================

startRecoveryMonitor();

// =====================================
// NEXT
// =====================================
//
// PART 17.3
//
// • Recovery Popup
// • AI Recovery Conversation
// • Save Cart
// • Continue Shopping
// • Restore Checkout
// =====================================
// PART 17.3
// AI Cart Recovery Popup
// Recovery Conversation
// Production Ready
// =====================================

// =====================================
// RECOVERY POPUP
// =====================================

let recoveryPopup=null;

// =====================================
// START RECOVERY
// =====================================

function triggerRecoverySequence(){

    if(

        CART_RECOVERY.reminderSent ||

        !CART_RECOVERY.recoveryStarted

    ) return;

    CART_RECOVERY.reminderSent=true;

    showRecoveryPopup();

}

// =====================================
// SHOW POPUP
// =====================================

function showRecoveryPopup(){

    if(

        recoveryPopup

    ) return;

    recoveryPopup=

    document.createElement(

        "div"

    );

    recoveryPopup.id=

    "lbCartRecoveryPopup";

    recoveryPopup.innerHTML=

`

<div class="lb-recovery-card">

    <div class="lb-recovery-avatar">

        <img

        src="${EXECUTIVE.chatAvatar}"

        />

    </div>

    <div class="lb-recovery-content">

        <h3>

        ${EXECUTIVE.name}

        </h3>

        <p>

        Hi ${getVisitorName()} 👋

        You still have

        <b>

        ${CART_STATE.itemCount}

        item(s)

        </b>

        waiting in your cart.

        </p>

        <div class="lb-recovery-buttons">

            <button

            onclick="restoreShopping()">

            Continue Shopping

            </button>

            <button

            onclick="restoreCheckout()">

            Checkout Now

            </button>

        </div>

    </div>

</div>

`;

    document.body.appendChild(

        recoveryPopup

    );

    requestAnimationFrame(

        ()=>{

            recoveryPopup.classList.add(

                "lb-show"

            );

        }

    );

    executiveSpeak(

"I saved your cart for you."

    );

}

// =====================================
// CONTINUE SHOPPING
// =====================================

function restoreShopping(){

    closeRecoveryPopup();

    executiveSpeak(

"Great! Your cart is still waiting."

    );

    openChatWindow();

}

// =====================================
// CHECKOUT
// =====================================

function restoreCheckout(){

    executiveSpeak(

"Redirecting you to secure checkout."

    );

    setTimeout(

        ()=>{

            window.location.href=

            "/checkout";

        },

        600

    );

}

// =====================================
// CLOSE
// =====================================

function closeRecoveryPopup(){

    if(

        !recoveryPopup

    ) return;

    recoveryPopup.classList.remove(

        "lb-show"

    );

    setTimeout(

        ()=>{

            recoveryPopup.remove();

            recoveryPopup=null;

        },

        300

    );

}

// =====================================
// SAVE CART
// =====================================

function saveRecoveryState(){

    localStorage.setItem(

        "lb_saved_cart",

        JSON.stringify({

            items:

            CART_STATE.items,

            subtotal:

            CART_STATE.subtotal,

            saved:

            Date.now()

        })

    );

}

// =====================================
// RESTORE SAVED CART
// =====================================

function loadSavedRecovery(){

    const cart=

    localStorage.getItem(

        "lb_saved_cart"

    );

    if(

        !cart

    ) return;

    try{

        const data=

        JSON.parse(

            cart

        );

        CART_RECOVERY.items=

        data.items;

        CART_RECOVERY.subtotal=

        data.subtotal;

    }

    catch(e){

        console.error(e);

    }

}

loadSavedRecovery();

// =====================================
// NEXT
// =====================================
//
// PART 17.4
//
// • 3-Step Reminder Sequence
// • Discount Recovery
// • Smart Coupon Recovery
// • Flash Sale Recovery
// • AI Follow-up```javascript id="part17-4-recovery-sequence"
// =====================================
// PART 17.4
// AI Recovery Reminder Engine
// Smart Coupon Recovery
// Flash Sale Recovery
// Production Ready
// =====================================

// =====================================
// REMINDER STATE
// =====================================

const RECOVERY_SEQUENCE={

    currentStep:0,

    completed:false,

    startedAt:null,

    couponSent:false,

    flashSaleSent:false,

    lastReminder:null

};

// =====================================
// START SEQUENCE
// =====================================

function startReminderSequence(){

    if(

        RECOVERY_SEQUENCE.completed

    ) return;

    RECOVERY_SEQUENCE.startedAt=

    Date.now();

    scheduleReminderOne();

}

// =====================================
// STEP 1
// FRIENDLY REMINDER
// =====================================

function scheduleReminderOne(){

    setTimeout(

        ()=>{

            if(

                CART_RECOVERY.recovered

            ) return;

            RECOVERY_SEQUENCE.currentStep=1;

            RECOVERY_SEQUENCE.lastReminder=

            Date.now();

            executiveSpeak(

`Hi ${getVisitorName()} 👋

Your shopping cart is still waiting for you.`

            );

            showCheckoutCTA();

        },

        RECOVERY_CONFIG.firstReminder

        *

        60000

    );

}

// =====================================
// STEP 2
// DISCOUNT
// =====================================

function scheduleReminderTwo(){

    setTimeout(

        ()=>{

            if(

                CART_RECOVERY.recovered

            ) return;

            RECOVERY_SEQUENCE.currentStep=2;

            if(

                !RECOVERY_SEQUENCE.couponSent

            ){

                RECOVERY_SEQUENCE.couponSent=true;

                const coupon={

                    code:

                    "WELCOME10",

                    discount:

                    "10% OFF"

                };

                showCoupon(

                    coupon

                );

                executiveSpeak(

"I've unlocked a special discount just for you."

                );

            }

        },

        RECOVERY_CONFIG.secondReminder

        *

        60000

    );

}

// =====================================
// STEP 3
// FLASH SALE
// =====================================

function scheduleReminderThree(){

    setTimeout(

        ()=>{

            if(

                CART_RECOVERY.recovered

            ) return;

            RECOVERY_SEQUENCE.currentStep=3;

            if(

                !RECOVERY_SEQUENCE.flashSaleSent

            ){

                RECOVERY_SEQUENCE.flashSaleSent=true;

                showFlashSale({

                    title:

                    "Last Chance Offer",

                    description:

                    "Extra savings before your cart expires.",

                    endsAt:

                    new Date(

                        Date.now()+

                        3600000

                    )

                });

                executiveSpeak(

"This offer expires soon."

                );

            }

        },

        RECOVERY_CONFIG.thirdReminder

        *

        60000

    );

}

// =====================================
// RUN ALL
// =====================================

function runRecoverySequence(){

    startReminderSequence();

    scheduleReminderTwo();

    scheduleReminderThree();

}

// =====================================
// RECOVERED
// =====================================

function markCartRecovered(){

    CART_RECOVERY.recovered=true;

    RECOVERY_SEQUENCE.completed=true;

    executiveSpeak(

"🎉 Welcome back! Let's complete your order."

    );

}

// =====================================
// CHECK CART
// =====================================

async function verifyRecovered(){

    const cart=

    await loadCart();

    if(

        cart &&

        cart.item_count===0

    ){

        markCartRecovered();

    }

}

// =====================================
// AUTO VERIFY
// =====================================

setInterval(

    ()=>{

        verifyRecovered();

    },

    45000

);

// =====================================
// NEXT
// =====================================
//
// PART 17.5
//
// • Email Recovery
// • WhatsApp Recovery
// • Messenger Recovery
// • SMS Recovery
// • Multi-Channel AI Follow-up
// =====================================
// PART 17.5
// Multi-Channel Recovery Engine
// Email
// WhatsApp
// Messenger
// SMS
// Production Ready
// =====================================

// =====================================
// RECOVERY CHANNELS
// =====================================

const RECOVERY_CHANNELS={

    email:false,

    whatsapp:false,

    messenger:false,

    sms:false

};

// =====================================
// CONTACT
// =====================================

const CONTACT_INFO={

    email:"",

    phone:"",

    messengerId:"",

    consent:false

};

// =====================================
// SAVE CONTACT
// =====================================

function saveVisitorContact(

data={}

){

    CONTACT_INFO.email=

    data.email||

    CONTACT_INFO.email;

    CONTACT_INFO.phone=

    data.phone||

    CONTACT_INFO.phone;

    CONTACT_INFO.messengerId=

    data.messengerId||

    CONTACT_INFO.messengerId;

    CONTACT_INFO.consent=

    data.consent||

    false;

}

// =====================================
// EMAIL RECOVERY
// =====================================

async function sendRecoveryEmail(){

    if(

        !CONTACT_INFO.email ||

        RECOVERY_CHANNELS.email

    ) return;

    RECOVERY_CHANNELS.email=true;

    try{

        await fetch(

`${CONFIG.API_BASE}/api/recovery/email`,

        {

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                visitorId:

                VISITOR.id,

                email:

                CONTACT_INFO.email,

                cart:

                CART_RECOVERY.items,

                coupon:

                ACTIVE_COUPON

            })

        }

        );

    }

    catch(error){

        console.error(error);

    }

}

// =====================================
// WHATSAPP
// =====================================

async function sendRecoveryWhatsApp(){

    if(

        !CONTACT_INFO.phone ||

        RECOVERY_CHANNELS.whatsapp

    ) return;

    RECOVERY_CHANNELS.whatsapp=true;

    try{

        await fetch(

`${CONFIG.API_BASE}/api/recovery/whatsapp`,

        {

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                visitorId:

                VISITOR.id,

                phone:

                CONTACT_INFO.phone,

                cart:

                CART_RECOVERY.items,

                coupon:

                ACTIVE_COUPON

            })

        }

        );

    }

    catch(error){

        console.error(error);

    }

}

// =====================================
// MESSENGER
// =====================================

async function sendMessengerReminder(){

    if(

        !CONTACT_INFO.messengerId ||

        RECOVERY_CHANNELS.messenger

    ) return;

    RECOVERY_CHANNELS.messenger=true;

    try{

        await fetch(

`${CONFIG.API_BASE}/api/recovery/messenger`,

        {

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                visitorId:

                VISITOR.id,

                messengerId:

                CONTACT_INFO.messengerId,

                cart:

                CART_RECOVERY.items

            })

        }

        );

    }

    catch(error){

        console.error(error);

    }

}

// =====================================
// SMS
// =====================================

async function sendSMSReminder(){

    if(

        !CONTACT_INFO.phone ||

        RECOVERY_CHANNELS.sms

    ) return;

    RECOVERY_CHANNELS.sms=true;

    try{

        await fetch(

`${CONFIG.API_BASE}/api/recovery/sms`,

        {

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                visitorId:

                VISITOR.id,

                phone:

                CONTACT_INFO.phone,

                cart:

                CART_RECOVERY.items

            })

        }

        );

    }

    catch(error){

        console.error(error);

    }

}

// =====================================
// AI DECISION
// =====================================

function multiChannelRecovery(){

    if(

        !CONTACT_INFO.consent

    ) return;

    sendRecoveryEmail();

    sendRecoveryWhatsApp();

    sendMessengerReminder();

    sendSMSReminder();

}

// =====================================
// EXECUTE
// =====================================

function executeRecoveryChannels(){

    if(

        CART_RECOVERY.recovered

    ) return;

    multiChannelRecovery();

}

// =====================================
// NEXT
// =====================================
//
// PART 17.6
//
// • AI Recovery Analytics
// • Recovery Success Score
// • Channel Performance
// • Conversion Tracking
// • Revenue Recovery Dashboard
// =====================================
// PART 17.6
// AI Recovery Analytics Engine
// Revenue Recovery Dashboard
// Production Ready
// =====================================

// =====================================
// ANALYTICS
// =====================================

const RECOVERY_ANALYTICS={

    cartsDetected:0,

    remindersSent:0,

    recoveredCarts:0,

    recoveredRevenue:0,

    lostRevenue:0,

    emailRecovered:0,

    whatsappRecovered:0,

    messengerRecovered:0,

    smsRecovered:0,

    averageRecoveryTime:0,

    totalRecoveryTime:0,

    channelPerformance:{}

};

// =====================================
// DETECT CART
// =====================================

function analyticsCartDetected(){

    RECOVERY_ANALYTICS.cartsDetected++;

}

// =====================================
// REMINDER
// =====================================

function analyticsReminderSent(

channel

){

    RECOVERY_ANALYTICS.remindersSent++;

    if(

        !RECOVERY_ANALYTICS

        .channelPerformance[channel]

    ){

        RECOVERY_ANALYTICS

        .channelPerformance[channel]={

            sent:0,

            recovered:0

        };

    }

    RECOVERY_ANALYTICS

    .channelPerformance[channel]

    .sent++;

}

// =====================================
// RECOVERED
// =====================================

function analyticsRecovered(

channel,

amount

){

    RECOVERY_ANALYTICS.recoveredCarts++;

    RECOVERY_ANALYTICS.recoveredRevenue+=

    amount;

    switch(channel){

        case "email":

            RECOVERY_ANALYTICS.emailRecovered++;

            break;

        case "whatsapp":

            RECOVERY_ANALYTICS.whatsappRecovered++;

            break;

        case "messenger":

            RECOVERY_ANALYTICS.messengerRecovered++;

            break;

        case "sms":

            RECOVERY_ANALYTICS.smsRecovered++;

            break;

    }

    if(

        RECOVERY_ANALYTICS

        .channelPerformance[channel]

    ){

        RECOVERY_ANALYTICS

        .channelPerformance[channel]

        .recovered++;

    }

}

// =====================================
// LOST
// =====================================

function analyticsLost(

amount

){

    RECOVERY_ANALYTICS.lostRevenue+=

    amount;

}

// =====================================
// TIME
// =====================================

function analyticsRecoveryTime(

minutes

){

    RECOVERY_ANALYTICS.totalRecoveryTime+=

    minutes;

    RECOVERY_ANALYTICS.averageRecoveryTime=

    Math.round(

        RECOVERY_ANALYTICS.totalRecoveryTime/

        Math.max(

            1,

            RECOVERY_ANALYTICS.recoveredCarts

        )

    );

}

// =====================================
// SUCCESS RATE
// =====================================

function recoverySuccessRate(){

    if(

        RECOVERY_ANALYTICS

        .cartsDetected===0

    ){

        return 0;

    }

    return Math.round(

        (

            RECOVERY_ANALYTICS

            .recoveredCarts/

            RECOVERY_ANALYTICS

            .cartsDetected

        )*100

    );

}

// =====================================
// REVENUE RATE
// =====================================

function recoveryRevenueRate(){

    const total=

    RECOVERY_ANALYTICS.recoveredRevenue+

    RECOVERY_ANALYTICS.lostRevenue;

    if(total===0)

        return 0;

    return Math.round(

        (

            RECOVERY_ANALYTICS

            .recoveredRevenue/

            total

        )*100

    );

}

// =====================================
// EXPORT
// =====================================

async function uploadRecoveryAnalytics(){

    try{

        await fetch(

`${CONFIG.API_BASE}/api/analytics/recovery`,

        {

            method:"POST",

            headers:{

                "Content-Type":

                "application/json"

            },

            body:JSON.stringify({

                visitorId:

                VISITOR.id,

                analytics:

                RECOVERY_ANALYTICS

            })

        }

        );

    }

    catch(error){

        console.error(error);

    }

}

// =====================================
// AUTO SYNC
// =====================================

setInterval(

    ()=>{

        uploadRecoveryAnalytics();

    },

    300000

);

// =====================================
// NEXT
// =====================================
//
// PART 17.7
//
// • AI Revenue Optimizer
// • Smart Discount Decision
// • Dynamic Coupon Value
// • Best Time to Recover
// • Predict Recovery Probability
// =====================================
// PART 17.7
// AI Revenue Optimizer
// Dynamic Discount Engine
// Recovery Prediction
// Production Ready
// =====================================

// =====================================
// RECOVERY AI
// =====================================

const RECOVERY_AI={

    probability:0,

    recommendedDiscount:0,

    urgencyLevel:"low",

    bestRecoveryChannel:"email",

    bestRecoveryTime:0

};

// =====================================
// PREDICT RECOVERY
// =====================================

function predictRecoveryProbability(){

    let score=0;

    if(

        CART_STATE.itemCount>0

    ) score+=20;

    if(

        VISITOR_PROFILE.totalVisits>1

    ) score+=20;

    if(

        VISITOR_INTENT.confidence>=70

    ) score+=20;

    if(

        PURCHASE_STATE.ready

    ) score+=25;

    if(

        ACTIVE_COUPON

    ) score+=15;

    RECOVERY_AI.probability=

    Math.min(

        100,

        score

    );

    return RECOVERY_AI.probability;

}

// =====================================
// DISCOUNT DECISION
// =====================================

function recommendDiscount(){

    const probability=

    predictRecoveryProbability();

    if(probability>=85){

        RECOVERY_AI.recommendedDiscount=0;

    }

    else if(probability>=70){

        RECOVERY_AI.recommendedDiscount=5;

    }

    else if(probability>=50){

        RECOVERY_AI.recommendedDiscount=10;

    }

    else if(probability>=30){

        RECOVERY_AI.recommendedDiscount=15;

    }

    else{

        RECOVERY_AI.recommendedDiscount=20;

    }

    return RECOVERY_AI.recommendedDiscount;

}

// =====================================
// URGENCY
// =====================================

function detectUrgency(){

    if(

        PURCHASE_STATE.ready

    ){

        RECOVERY_AI.urgencyLevel="high";

    }

    else if(

        VISITOR_INTENT.confidence>=50

    ){

        RECOVERY_AI.urgencyLevel="medium";

    }

    else{

        RECOVERY_AI.urgencyLevel="low";

    }

}

// =====================================
// BEST CHANNEL
// =====================================

function selectRecoveryChannel(){

    if(

        CONTACT_INFO.phone

    ){

        RECOVERY_AI.bestRecoveryChannel=

        "whatsapp";

    }

    else if(

        CONTACT_INFO.email

    ){

        RECOVERY_AI.bestRecoveryChannel=

        "email";

    }

    else if(

        CONTACT_INFO.messengerId

    ){

        RECOVERY_AI.bestRecoveryChannel=

        "messenger";

    }

    else{

        RECOVERY_AI.bestRecoveryChannel=

        "onsite";

    }

    return RECOVERY_AI.bestRecoveryChannel;

}

// =====================================
// BEST TIME
// =====================================

function calculateBestRecoveryTime(){

    if(

        RECOVERY_AI.urgencyLevel==="high"

    ){

        RECOVERY_AI.bestRecoveryTime=15;

    }

    else if(

        RECOVERY_AI.urgencyLevel==="medium"

    ){

        RECOVERY_AI.bestRecoveryTime=45;

    }

    else{

        RECOVERY_AI.bestRecoveryTime=120;

    }

    return RECOVERY_AI.bestRecoveryTime;

}

// =====================================
// GENERATE AI COUPON
// =====================================

function generateDynamicCoupon(){

    const value=

    recommendDiscount();

    if(value===0)

        return null;

    return{

        code:

        `SAVE${value}`,

        discount:

        `${value}% OFF`

    };

}

// =====================================
// OPTIMIZER
// =====================================

function runRecoveryOptimizer(){

    predictRecoveryProbability();

    detectUrgency();

    selectRecoveryChannel();

    calculateBestRecoveryTime();

    return{

        probability:

        RECOVERY_AI.probability,

        urgency:

        RECOVERY_AI.urgencyLevel,

        channel:

        RECOVERY_AI.bestRecoveryChannel,

        minutes:

        RECOVERY_AI.bestRecoveryTime,

        coupon:

        generateDynamicCoupon()

    };

}

// =====================================
// NEXT
// =====================================
//
// PART 17.8
//
// • Complete Recovery AI Automation
// • AI Decision Pipeline
// • Auto Recovery Workflow
// • Dashboard Sync
// • Enterprise Recovery Features
// =====================================
// PART 17.8
// Complete Recovery AI Automation
// Enterprise Recovery Engine
// Production Ready
// =====================================

// =====================================
// AI WORKFLOW
// =====================================

async function executeRecoveryAI(){

    if(

        !CART_RECOVERY.enabled ||

        CART_RECOVERY.recovered

    ){

        return;

    }

    // --------------------------
    // AI Analysis
    // --------------------------

    const optimization=

    runRecoveryOptimizer();

    // --------------------------
    // Dynamic Coupon
    // --------------------------

    if(

        optimization.coupon &&

        !ACTIVE_COUPON

    ){

        showCoupon(

            optimization.coupon

        );

    }

    // --------------------------
    // Channel Decision
    // --------------------------

    switch(

        optimization.channel

    ){

        case "email":

            sendRecoveryEmail();

            analyticsReminderSent(

                "email"

            );

            break;

        case "whatsapp":

            sendRecoveryWhatsApp();

            analyticsReminderSent(

                "whatsapp"

            );

            break;

        case "messenger":

            sendMessengerReminder();

            analyticsReminderSent(

                "messenger"

            );

            break;

        case "sms":

            sendSMSReminder();

            analyticsReminderSent(

                "sms"

            );

            break;

        default:

            showRecoveryPopup();

    }

    // --------------------------
    // Dashboard Sync
    // --------------------------

    syncRecoveryDashboard();

}

// =====================================
// DASHBOARD
// =====================================

async function syncRecoveryDashboard(){

    try{

        await fetch(

`${CONFIG.API_BASE}/api/recovery/dashboard`,

        {

            method:"POST",

            headers:{

                "Content-Type":

                "application/json"

            },

            body:JSON.stringify({

                visitorId:

                VISITOR.id,

                analytics:

                RECOVERY_ANALYTICS,

                optimization:

                RECOVERY_AI

            })

        }

        );

    }

    catch(error){

        console.error(error);

    }

}

// =====================================
// ORDER RECOVERED
// =====================================

function recoveryCompleted(

orderValue

){

    CART_RECOVERY.recovered=true;

    RECOVERY_SEQUENCE.completed=true;

    analyticsRecovered(

        RECOVERY_AI.bestRecoveryChannel,

        orderValue

    );

    executiveSpeak(

"🎉 Fantastic! Your order has been completed successfully. Thank you for shopping with us."

    );

}

// =====================================
// ENTERPRISE FEATURES
// =====================================

function enterpriseRecovery(){

    if(

        SUBSCRIPTION.plan!==

        "premium"

    ){

        return;

    }

    // AI prediction

    executeRecoveryAI();

    // CRM Sync

    uploadRecoveryAnalytics();

    // Revenue optimization

    revenueOptimization();

    // Customer lifetime update

    updateCustomerLifetimeValue();

}

// =====================================
// CUSTOMER VALUE
// =====================================

async function updateCustomerLifetimeValue(){

    try{

        await fetch(

`${CONFIG.API_BASE}/api/customer/lifetime`,

        {

            method:"POST",

            headers:{

                "Content-Type":

                "application/json"

            },

            body:JSON.stringify({

                visitorId:

                VISITOR.id

            })

        }

        );

    }

    catch(error){

        console.error(error);

    }

}

// =====================================
// MASTER AUTOMATION
// =====================================

setInterval(

    ()=>{

        if(

            detectCartAbandonment()

        ){

            analyticsCartDetected();

            executeRecoveryAI();

        }

    },

    60000

);

// =====================================
// MODULE COMPLETE
// =====================================
//
// ✔ Cart Monitoring
// ✔ AI Qualification
// ✔ Cart Abandonment Detection
// ✔ Recovery Popup
// ✔ 3-Step Reminder Sequence
// ✔ Email Recovery
// ✔ WhatsApp Recovery
// ✔ Messenger Recovery
// ✔ SMS Recovery
// ✔ Recovery Analytics
// ✔ Revenue Recovery Tracking
// ✔ AI Recovery Optimizer
// ✔ Dynamic Coupons
// ✔ Enterprise Automation
//
// =====================================
// END OF PART 17
// =====================================```javascript
// =====================================
// PART 18.1
// Customer Loyalty & Repeat Purchase Engine
// Production Ready
// =====================================

// =====================================
// LOYALTY ENGINE
// =====================================

const LOYALTY={

    level:"new",

    points:0,

    lifetimeValue:0,

    totalOrders:0,

    averageOrderValue:0,

    repeatCustomer:false,

    lastPurchase:null,

    birthday:null,

    anniversary:null

};

// =====================================
// TIERS
// =====================================

const LOYALTY_TIERS={

    NEW:0,

    SILVER:500,

    GOLD:1500,

    PLATINUM:5000

};

// =====================================
// LOAD LOYALTY
// =====================================

async function loadLoyaltyProfile(){

    try{

        const response=

        await fetch(

`${CONFIG.API_BASE}/api/customer/loyalty`,

        {

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                visitorId:VISITOR.id

            })

        });

        if(!response.ok)
            return;

        const data=

        await response.json();

        if(!data.success)
            return;

        Object.assign(

            LOYALTY,

            data.profile

        );

        determineLoyaltyTier();

    }

    catch(err){

        console.error(err);

    }

}

// =====================================
// DETERMINE TIER
// =====================================

function determineLoyaltyTier(){

    if(

        LOYALTY.points>=

        LOYALTY_TIERS.PLATINUM

    ){

        LOYALTY.level="platinum";

    }

    else if(

        LOYALTY.points>=

        LOYALTY_TIERS.GOLD

    ){

        LOYALTY.level="gold";

    }

    else if(

        LOYALTY.points>=

        LOYALTY_TIERS.SILVER

    ){

        LOYALTY.level="silver";

    }

    else{

        LOYALTY.level="new";

    }

}

// =====================================
// REPEAT CUSTOMER
// =====================================

function isRepeatCustomer(){

    return(

        LOYALTY.totalOrders>=2

    );

}

// =====================================
// GREETING
// =====================================

function loyaltyGreeting(){

    if(

        !isRepeatCustomer()

    ) return;

    executiveSpeak(

`Welcome back ${getVisitorName()}! Thanks for being one of our valued ${LOYALTY.level} customers.`

    );

}

// =====================================
// NEXT
// =====================================
//
// PART 18.2
//
// • Loyalty Rewards
// • VIP Benefits
// • Birthday Rewards
// • Anniversary Rewards
// • Repeat Purchase AI
// =====================================
// PART 18.2
// Loyalty Rewards Engine
// VIP Benefits
// Birthday Rewards
// Anniversary Rewards
// =====================================

// =====================================
// VIP BENEFITS
// =====================================

const VIP_BENEFITS={

    new:[

        "Welcome Discount"

    ],

    silver:[

        "5% VIP Discount",

        "Priority Support"

    ],

    gold:[

        "10% VIP Discount",

        "Priority Support",

        "Early Product Access"

    ],

    platinum:[

        "15% VIP Discount",

        "Free Shipping",

        "VIP Support",

        "Exclusive Products",

        "Personal Sales Executive"

    ]

};

// =====================================
// SHOW BENEFITS
// =====================================

function showVipBenefits(){

    const benefits=

    VIP_BENEFITS[

        LOYALTY.level

    ]||

    [];

    if(

        !benefits.length

    ) return;

    addExecutiveMessage(

`⭐ Your ${LOYALTY.level.toUpperCase()} Member Benefits:`

    );

    let html=

`<div class="lb-vip-benefits">`;

    benefits.forEach(

        benefit=>{

            html+=`

<div class="lb-benefit">

✔ ${benefit}

</div>

`;

        }

    );

    html+=`

</div>`;

    document

    .getElementById(

        "lbMessages"

    )

    .insertAdjacentHTML(

        "beforeend",

        html

    );

    scrollMessages();

}

// =====================================
// BIRTHDAY REWARD
// =====================================

function checkBirthdayReward(){

    if(

        !LOYALTY.birthday

    ) return;

    const today=

    new Date();

    const birthday=

    new Date(

        LOYALTY.birthday

    );

    if(

        birthday.getDate()===

        today.getDate() &&

        birthday.getMonth()===

        today.getMonth()

    ){

        executiveSpeak(

`🎉 Happy Birthday ${getVisitorName()}! We've added a special birthday gift for you.`

        );

        showCoupon({

            code:"BIRTHDAY20",

            discount:"20% OFF"

        });

    }

}

// =====================================
// ANNIVERSARY REWARD
// =====================================

function checkAnniversaryReward(){

    if(

        !LOYALTY.anniversary

    ) return;

    const today=

    new Date();

    const anniversary=

    new Date(

        LOYALTY.anniversary

    );

    if(

        anniversary.getDate()===

        today.getDate() &&

        anniversary.getMonth()===

        today.getMonth()

    ){

        executiveSpeak(

`🎊 Happy Anniversary! Here's a special reward from all of us.`

        );

        showCoupon({

            code:"THANKYOU15",

            discount:"15% OFF"

        });

    }

}

// =====================================
// REPEAT PURCHASE AI
// =====================================

function recommendRepeatPurchase(){

    if(

        !LOYALTY.repeatCustomer

    ) return;

    addExecutiveMessage(

"Based on your purchase history, I found products you'll probably love."

    );

    if(

        VISITOR_PROFILE.recentProducts &&

        VISITOR_PROFILE.recentProducts.length

    ){

        renderProducts(

            VISITOR_PROFILE.recentProducts

        );

    }

}

// =====================================
// LOYALTY REWARD
// =====================================

function rewardLoyalCustomer(orderValue){

    const earned=

    Math.floor(

        orderValue/10

    );

    LOYALTY.points+=

    earned;

    determineLoyaltyTier();

    executiveSpeak(

`🎁 You've earned ${earned} loyalty points!`

    );

}

// =====================================
// INITIALIZE
// =====================================

function initializeLoyaltyRewards(){

    loyaltyGreeting();

    showVipBenefits();

    checkBirthdayReward();

    checkAnniversaryReward();

    recommendRepeatPurchase();

}

// =====================================
// NEXT
// =====================================
//
// PART 18.3
//
// • Smart Membership Upgrade
// • VIP Upsell Engine
// • Loyalty Analytics
// • Customer Retention AI
// • Lifetime Value Prediction

