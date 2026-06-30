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
// =====================================
// PART 18.3
// Smart Membership Upgrade Engine
// Customer Retention AI
// Lifetime Value Prediction
// Production Ready
// =====================================

// =====================================
// MEMBERSHIP AI
// =====================================

const MEMBERSHIP_AI={

    upgradeProbability:0,

    retentionScore:0,

    lifetimePrediction:0,

    nextTier:null,

    vipOfferShown:false

};

// =====================================
// UPGRADE SCORE
// =====================================

function calculateUpgradeProbability(){

    let score=0;

    score+=

    LOYALTY.totalOrders*8;

    score+=

    Math.floor(

        LOYALTY.lifetimeValue/

        100

    );

    score+=

    LOYALTY.points/

    50;

    if(

        PURCHASE_STATE.ready

    ){

        score+=20;

    }

    MEMBERSHIP_AI.upgradeProbability=

    Math.min(

        100,

        Math.round(score)

    );

    return MEMBERSHIP_AI.upgradeProbability;

}

// =====================================
// NEXT TIER
// =====================================

function determineNextTier(){

    switch(

        LOYALTY.level

    ){

        case "new":

            MEMBERSHIP_AI.nextTier=

            "silver";

            break;

        case "silver":

            MEMBERSHIP_AI.nextTier=

            "gold";

            break;

        case "gold":

            MEMBERSHIP_AI.nextTier=

            "platinum";

            break;

        default:

            MEMBERSHIP_AI.nextTier=

            null;

    }

}

// =====================================
// RETENTION SCORE
// =====================================

function calculateRetentionScore(){

    let score=50;

    if(

        LOYALTY.repeatCustomer

    ){

        score+=25;

    }

    if(

        LOYALTY.totalOrders>

        5

    ){

        score+=15;

    }

    if(

        VISITOR_PROFILE.totalVisits>

        10

    ){

        score+=10;

    }

    MEMBERSHIP_AI.retentionScore=

    Math.min(

        100,

        score

    );

}

// =====================================
// LIFETIME VALUE
// =====================================

function predictLifetimeValue(){

    MEMBERSHIP_AI.lifetimePrediction=

    Math.round(

        LOYALTY.averageOrderValue*

        Math.max(

            5,

            LOYALTY.totalOrders

        )

    );

    return MEMBERSHIP_AI

    .lifetimePrediction;

}

// =====================================
// VIP UPGRADE
// =====================================

function showMembershipUpgrade(){

    if(

        MEMBERSHIP_AI.vipOfferShown ||

        !MEMBERSHIP_AI.nextTier

    ) return;

    if(

        MEMBERSHIP_AI.upgradeProbability

        <70

    ) return;

    MEMBERSHIP_AI.vipOfferShown=true;

    addExecutiveMessage(

`🌟 You're very close to becoming a ${MEMBERSHIP_AI.nextTier.toUpperCase()} Member!`

    );

    document

    .getElementById(

        "lbMessages"

    )

    .insertAdjacentHTML(

        "beforeend",

`

<div class="lb-membership-upgrade">

    <h3>

        Upgrade to

        ${MEMBERSHIP_AI.nextTier.toUpperCase()}

    </h3>

    <p>

        Unlock more rewards,

        exclusive discounts,

        priority support

        and VIP shopping.

    </p>

    <button

    onclick="openMembershipPage()">

        View Benefits

    </button>

</div>

`

    );

    scrollMessages();

}

// =====================================
// MEMBERSHIP PAGE
// =====================================

function openMembershipPage(){

    window.location.href=

    "/pages/rewards";

}

// =====================================
// INITIALIZE
// =====================================

function initializeMembershipAI(){

    calculateUpgradeProbability();

    calculateRetentionScore();

    predictLifetimeValue();

    determineNextTier();

    showMembershipUpgrade();

}

// =====================================
// NEXT
// =====================================
//
// PART 19
//
// • Customer Emotion Detection AI
// • Sentiment Analysis
// • Frustration Detection
// • Happiness Detection
// • Adaptive Sales Behaviour
// =====================================
// PART 19
// Customer Emotion Detection AI
// Adaptive Sales Behaviour
// Production Ready
// =====================================

// =====================================
// EMOTION ENGINE
// =====================================

const EMOTION={

    mood:"neutral",

    confidence:0,

    frustration:0,

    excitement:0,

    happiness:0,

    urgency:0,

    lastDetected:null

};

// =====================================
// EMOTION KEYWORDS
// =====================================

const EMOTION_KEYWORDS={

    happy:[

        "great",

        "awesome",

        "love",

        "excellent",

        "perfect",

        "thank you",

        "amazing"

    ],

    frustrated:[

        "bad",

        "hate",

        "problem",

        "issue",

        "error",

        "slow",

        "broken",

        "not working",

        "angry"

    ],

    buying:[

        "buy",

        "checkout",

        "order",

        "payment",

        "purchase"

    ],

    unsure:[

        "maybe",

        "thinking",

        "not sure",

        "later",

        "compare",

        "confused"

    ]

};

// =====================================
// DETECT EMOTION
// =====================================

function detectEmotion(message){

    const text=

    message.toLowerCase();

    resetEmotion();

    EMOTION_KEYWORDS.happy.forEach(

        word=>{

            if(

                text.includes(word)

            ){

                EMOTION.happiness+=20;

            }

        }

    );

    EMOTION_KEYWORDS.frustrated.forEach(

        word=>{

            if(

                text.includes(word)

            ){

                EMOTION.frustration+=20;

            }

        }

    );

    EMOTION_KEYWORDS.buying.forEach(

        word=>{

            if(

                text.includes(word)

            ){

                EMOTION.urgency+=20;

            }

        }

    );

    EMOTION_KEYWORDS.unsure.forEach(

        word=>{

            if(

                text.includes(word)

            ){

                EMOTION.confidence-=15;

            }

        }

    );

    determineMood();

}

// =====================================
// DETERMINE MOOD
// =====================================

function determineMood(){

    if(

        EMOTION.frustration>=40

    ){

        EMOTION.mood="frustrated";

    }

    else if(

        EMOTION.happiness>=40

    ){

        EMOTION.mood="happy";

    }

    else if(

        EMOTION.urgency>=40

    ){

        EMOTION.mood="buying";

    }

    else{

        EMOTION.mood="neutral";

    }

    EMOTION.lastDetected=

    new Date();

}

// =====================================
// RESET
// =====================================

function resetEmotion(){

    EMOTION.frustration=0;

    EMOTION.happiness=0;

    EMOTION.urgency=0;

    EMOTION.confidence=50;

}

// =====================================
// AI RESPONSE
// =====================================

function adaptToEmotion(){

    switch(

        EMOTION.mood

    ){

        case "happy":

            executiveSpeak(

"I'm really happy you're enjoying this! Let me show you the best offer available."

            );

            break;

        case "frustrated":

            executiveSpeak(

"I'm sorry you're experiencing this. I'll personally help you solve it."

            );

            break;

        case "buying":

            executiveSpeak(

"Excellent! You're only one step away from completing your order."

            );

            showCheckoutCTA();

            break;

        default:

            executiveSpeak(

"I'm here to help you choose the perfect product."

            );

    }

}

// =====================================
// SATISFACTION SCORE
// =====================================

function customerSatisfaction(){

    return(

        EMOTION.happiness-

        EMOTION.frustration+

        50

    );

}

// =====================================
// AI ENTRY
// =====================================

function emotionAI(message){

    detectEmotion(

        message

    );

    adaptToEmotion();

}

// =====================================
// NEXT
// =====================================
//
// PART 20
//
// • Human Handoff AI
// • Live Agent Transfer
// • Ticket Creation
// • Call Booking
// • Enterprise Support Routing
// =====================================
// PART 20
// Human Handoff AI
// Live Agent Transfer
// Enterprise Support Routing
// Production Ready
// =====================================

// =====================================
// HANDOFF
// =====================================

const HANDOFF={

    requested:false,

    connected:false,

    department:"sales",

    priority:"normal",

    ticketId:null,

    reason:"",

    transcript:[]

};

// =====================================
// DEPARTMENTS
// =====================================

const SUPPORT_DEPARTMENTS={

    sales:"Sales Team",

    billing:"Billing Team",

    technical:"Technical Support",

    shipping:"Shipping Team",

    enterprise:"Enterprise Manager"

};

// =====================================
// DETECT HANDOFF
// =====================================

function detectHumanRequest(message){

    const text=

    message.toLowerCase();

    const keywords=[

        "human",

        "agent",

        "manager",

        "support",

        "representative",

        "call me",

        "phone",

        "live person"

    ];

    return keywords.some(

        word=>text.includes(word)

    );

}

// =====================================
// PRIORITY
// =====================================

function determinePriority(){

    if(

        EMOTION.mood==="frustrated"

    ){

        HANDOFF.priority="high";

    }

    else if(

        PURCHASE_STATE.ready

    ){

        HANDOFF.priority="high";

    }

    else{

        HANDOFF.priority="normal";

    }

}

// =====================================
// DEPARTMENT
// =====================================

function determineDepartment(message){

    const text=

    message.toLowerCase();

    if(

        text.includes("payment")||

        text.includes("billing")

    ){

        HANDOFF.department="billing";

    }

    else if(

        text.includes("error")||

        text.includes("bug")

    ){

        HANDOFF.department="technical";

    }

    else if(

        text.includes("enterprise")

    ){

        HANDOFF.department="enterprise";

    }

    else{

        HANDOFF.department="sales";

    }

}

// =====================================
// CREATE TICKET
// =====================================

async function createSupportTicket(){

    try{

        const response=

        await fetch(

`${CONFIG.API_BASE}/api/support/ticket`,

        {

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                visitorId:

                VISITOR.id,

                priority:

                HANDOFF.priority,

                department:

                HANDOFF.department,

                transcript:

                HANDOFF.transcript,

                visitor:

                buildCustomerProfile()

            })

        });

        if(

            !response.ok

        ) return;

        const data=

        await response.json();

        if(

            data.success

        ){

            HANDOFF.ticketId=

            data.ticketId;

        }

    }

    catch(error){

        console.error(error);

    }

}

// =====================================
// BOOK CALL
// =====================================

function scheduleCall(){

    executiveSpeak(

"I'll arrange a call with one of our specialists."

    );

    window.open(

"/pages/book-call",

"_self"

    );

}

// =====================================
// LIVE CHAT
// =====================================

function connectLiveAgent(){

    executiveSpeak(

`Connecting you with our ${SUPPORT_DEPARTMENTS[HANDOFF.department]}...`

    );

    HANDOFF.connected=true;

}

// =====================================
// HANDOFF
// =====================================

async function handoffToHuman(message){

    HANDOFF.requested=true;

    HANDOFF.reason=message;

    determinePriority();

    determineDepartment(message);

    await createSupportTicket();

    connectLiveAgent();

}

// =====================================
// TRANSCRIPT
// =====================================

function saveTranscript(role,message){

    HANDOFF.transcript.push({

        role,

        message,

        time:new Date()

    });

}

// =====================================
// AI CHECK
// =====================================

async function supportAI(message){

    saveTranscript(

        "visitor",

        message

    );

    if(

        detectHumanRequest(

            message

        )

    ){

        await handoffToHuman(

            message

        );

    }

}

// =====================================
// NEXT
// =====================================
//
// PART 21
//
// • Enterprise Sales Dashboard Sync
// • CRM Sync
// • HubSpot
// • Zoho
// • Salesforce
// • Klaviyo
// • Mailchimp
// • Meta Events
// • Google Analytics
// • Full Enterprise Integration
// =====================================
// PART 21
// Enterprise Integration Engine
// CRM + Analytics + Marketing
// Production Ready
// =====================================

// =====================================
// ENTERPRISE
// =====================================

const ENTERPRISE={

    enabled:false,

    crm:null,

    analytics:true,

    marketing:true,

    automation:true

};

// =====================================
// CRM CONFIG
// =====================================

const CRM={

    hubspot:false,

    salesforce:false,

    zoho:false,

    pipedrive:false

};

// =====================================
// MARKETING
// =====================================

const MARKETING={

    klaviyo:false,

    mailchimp:false,

    omnisend:false,

    activeCampaign:false

};

// =====================================
// ANALYTICS
// =====================================

const ANALYTICS={

    googleAnalytics:true,

    metaPixel:true,

    googleAds:true,

    tiktokPixel:false,

    pinterest:false

};

// =====================================
// CUSTOMER PAYLOAD
// =====================================

function buildEnterprisePayload(){

    return{

        visitor:

        VISITOR,

        profile:

        buildCustomerProfile(),

        loyalty:

        LOYALTY,

        recommendation:

        RECOMMENDATION,

        recovery:

        RECOVERY_ANALYTICS,

        purchase:

        PURCHASE_STATE,

        emotion:

        EMOTION

    };

}

// =====================================
// HUBSPOT
// =====================================

async function syncHubSpot(){

    if(

        !CRM.hubspot

    ) return;

    try{

        await fetch(

`${CONFIG.API_BASE}/api/integrations/hubspot`,

        {

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify(

                buildEnterprisePayload()

            )

        });

    }

    catch(err){

        console.error(err);

    }

}

// =====================================
// SALESFORCE
// =====================================

async function syncSalesforce(){

    if(

        !CRM.salesforce

    ) return;

    try{

        await fetch(

`${CONFIG.API_BASE}/api/integrations/salesforce`,

        {

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify(

                buildEnterprisePayload()

            )

        });

    }

    catch(err){

        console.error(err);

    }

}

// =====================================
// ZOHO CRM
// =====================================

async function syncZoho(){

    if(

        !CRM.zoho

    ) return;

    try{

        await fetch(

`${CONFIG.API_BASE}/api/integrations/zoho`,

        {

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify(

                buildEnterprisePayload()

            )

        });

    }

    catch(err){

        console.error(err);

    }

}

// =====================================
// KLAVIYO
// =====================================

async function syncKlaviyo(){

    if(

        !MARKETING.klaviyo

    ) return;

    try{

        await fetch(

`${CONFIG.API_BASE}/api/integrations/klaviyo`,

        {

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify(

                buildEnterprisePayload()

            )

        });

    }

    catch(err){

        console.error(err);

    }

}

// =====================================
// MAILCHIMP
// =====================================

async function syncMailchimp(){

    if(

        !MARKETING.mailchimp

    ) return;

    try{

        await fetch(

`${CONFIG.API_BASE}/api/integrations/mailchimp`,

        {

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify(

                buildEnterprisePayload()

            )

        });

    }

    catch(err){

        console.error(err);

    }

}

// =====================================
// GOOGLE ANALYTICS
// =====================================

function fireGoogleAnalytics(event,data={}){

    if(

        typeof gtag==="undefined"

    ) return;

    gtag(

        "event",

        event,

        data

    );

}

// =====================================
// META PIXEL
// =====================================

function fireMetaPixel(event,data={}){

    if(

        typeof fbq==="undefined"

    ) return;

    fbq(

        "track",

        event,

        data

    );

}

// =====================================
// ENTERPRISE SYNC
// =====================================

async function enterpriseSync(){

    if(

        !ENTERPRISE.enabled

    ) return;

    await syncHubSpot();

    await syncSalesforce();

    await syncZoho();

    await syncKlaviyo();

    await syncMailchimp();

}

// =====================================
// SALES EVENTS
// =====================================

function enterprisePurchase(order){

    fireGoogleAnalytics(

        "purchase",

        order

    );

    fireMetaPixel(

        "Purchase",

        order

    );

    enterpriseSync();

}

function enterpriseLead(){

    fireGoogleAnalytics(

        "generate_lead"

    );

    fireMetaPixel(

        "Lead"

    );

}

function enterpriseCheckout(cart){

    fireGoogleAnalytics(

        "begin_checkout",

        cart

    );

    fireMetaPixel(

        "InitiateCheckout",

        cart

    );

}

function enterpriseAddToCart(product){

    fireGoogleAnalytics(

        "add_to_cart",

        product

    );

    fireMetaPixel(

        "AddToCart",

        product

    );

}

// =====================================
// AUTO SYNC
// =====================================

setInterval(

    ()=>{

        enterpriseSync();

    },

    300000

);

// =====================================
// NEXT
// =====================================
//
// PART 22
//
// Omnichannel Sales AI
//
// • Shopify
// • WhatsApp Commerce
// • Instagram DM
// • Facebook Messenger
// • Email AI
// • SMS AI
// • Unified Customer Timeline
// • Unified Sales Brain
// =====================================
// PART 22
// Omnichannel Sales AI
// Unified Customer Timeline
// Production Ready
// =====================================

// =====================================
// OMNICHANNEL
// =====================================

const OMNICHANNEL={

    shopify:true,

    whatsapp:false,

    instagram:false,

    messenger:false,

    email:false,

    sms:false,

    telegram:false

};

// =====================================
// CUSTOMER TIMELINE
// =====================================

const CUSTOMER_TIMELINE={

    visitorId:null,

    sessions:[],

    channels:[],

    purchases:[],

    conversations:[],

    lastChannel:"shopify"

};

// =====================================
// CHANNEL TYPES
// =====================================

const CHANNEL={

    SHOPIFY:"shopify",

    WHATSAPP:"whatsapp",

    INSTAGRAM:"instagram",

    MESSENGER:"messenger",

    EMAIL:"email",

    SMS:"sms",

    TELEGRAM:"telegram"

};

// =====================================
// TIMELINE EVENT
// =====================================

function addTimelineEvent(

type,

payload={}

){

    CUSTOMER_TIMELINE

    .sessions.push({

        type,

        payload,

        createdAt:

        new Date()

    });

}

// =====================================
// SAVE CHAT
// =====================================

function saveConversationEvent(

role,

message

){

    CUSTOMER_TIMELINE

    .conversations.push({

        role,

        message,

        channel:

        CUSTOMER_TIMELINE.lastChannel,

        createdAt:

        new Date()

    });

}

// =====================================
// SAVE PURCHASE
// =====================================

function savePurchaseEvent(

order

){

    CUSTOMER_TIMELINE

    .purchases.push({

        ...order,

        channel:

        CUSTOMER_TIMELINE.lastChannel,

        createdAt:

        new Date()

    });

}

// =====================================
// CHANGE CHANNEL
// =====================================

function switchChannel(

channel

){

    CUSTOMER_TIMELINE

    .lastChannel=

    channel;

}

// =====================================
// WHATSAPP
// =====================================

async function sendWhatsAppMessage(

message

){

    if(

        !OMNICHANNEL.whatsapp

    ) return;

    try{

        await fetch(

`${CONFIG.API_BASE}/api/channels/whatsapp`,

        {

            method:"POST",

            headers:{

                "Content-Type":

                "application/json"

            },

            body:JSON.stringify({

                visitorId:

                VISITOR.id,

                message

            })

        });

    }

    catch(error){

        console.error(error);

    }

}

// =====================================
// INSTAGRAM
// =====================================

async function sendInstagramMessage(

message

){

    if(

        !OMNICHANNEL.instagram

    ) return;

    try{

        await fetch(

`${CONFIG.API_BASE}/api/channels/instagram`,

        {

            method:"POST",

            headers:{

                "Content-Type":

                "application/json"

            },

            body:JSON.stringify({

                visitorId:

                VISITOR.id,

                message

            })

        });

    }

    catch(error){

        console.error(error);

    }

}

// =====================================
// FACEBOOK
// =====================================

async function sendMessengerMessage(

message

){

    if(

        !OMNICHANNEL.messenger

    ) return;

    try{

        await fetch(

`${CONFIG.API_BASE}/api/channels/messenger`,

        {

            method:"POST",

            headers:{

                "Content-Type":

                "application/json"

            },

            body:JSON.stringify({

                visitorId:

                VISITOR.id,

                message

            })

        });

    }

    catch(error){

        console.error(error);

    }

}

// =====================================
// EMAIL
// =====================================

async function sendEmailAI(

subject,

message

){

    if(

        !OMNICHANNEL.email

    ) return;

    try{

        await fetch(

`${CONFIG.API_BASE}/api/channels/email`,

        {

            method:"POST",

            headers:{

                "Content-Type":

                "application/json"

            },

            body:JSON.stringify({

                visitorId:

                VISITOR.id,

                subject,

                message

            })

        });

    }

    catch(error){

        console.error(error);

    }

}

// =====================================
// SMS
// =====================================

async function sendSMSAI(

message

){

    if(

        !OMNICHANNEL.sms

    ) return;

    try{

        await fetch(

`${CONFIG.API_BASE}/api/channels/sms`,

        {

            method:"POST",

            headers:{

                "Content-Type":

                "application/json"

            },

            body:JSON.stringify({

                visitorId:

                VISITOR.id,

                message

            })

        });

    }

    catch(error){

        console.error(error);

    }

}

// =====================================
// UNIFIED AI
// =====================================

async function omniSalesAI(

message

){

    saveConversationEvent(

        "assistant",

        message

    );

    if(

        PURCHASE_STATE.ready

    ){

        sendWhatsAppMessage(message);

        sendEmailAI(

            "Your Shopping Assistant",

            message

        );

    }

}

// =====================================
// DASHBOARD SYNC
// =====================================

async function syncCustomerTimeline(){

    try{

        await fetch(

`${CONFIG.API_BASE}/api/customer/timeline`,

        {

            method:"POST",

            headers:{

                "Content-Type":

                "application/json"

            },

            body:JSON.stringify(

                CUSTOMER_TIMELINE

            )

        });

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

        syncCustomerTimeline();

    },

    300000

);

// =====================================
// NEXT
// =====================================
//
// PART 23
//
// AI Sales Analytics Dashboard
//
// • Live Visitors
// • Sales Funnel
// • AI Performance
// • Avatar Performance
// • Executive Leaderboard
// • Conversion Heatmap
// • Revenue Dashboard
// =====================================
// PART 23
// AI Sales Analytics Dashboard
// Real-Time Analytics Engine
// Production Ready
// =====================================

// =====================================
// LIVE ANALYTICS
// =====================================

const SALES_ANALYTICS={

    liveVisitors:0,

    activeChats:0,

    activeCarts:0,

    conversions:0,

    revenue:0,

    averageOrderValue:0,

    abandonedCarts:0,

    recoveredCarts:0,

    conversionRate:0,

    recoveryRate:0

};

// =====================================
// SALES FUNNEL
// =====================================

const SALES_FUNNEL={

    visitors:0,

    engaged:0,

    qualified:0,

    productViewed:0,

    addToCart:0,

    checkout:0,

    purchase:0

};

// =====================================
// EXECUTIVE ANALYTICS
// =====================================

const EXECUTIVE_ANALYTICS={

    conversations:0,

    productsRecommended:0,

    upsells:0,

    crossSells:0,

    bundles:0,

    couponsGiven:0,

    purchasesClosed:0,

    revenueGenerated:0,

    averageConversationTime:0

};

// =====================================
// AVATAR PERFORMANCE
// =====================================

const AVATAR_PERFORMANCE={

    female:{

        conversations:0,

        sales:0,

        revenue:0

    },

    male:{

        conversations:0,

        sales:0,

        revenue:0

    },

    custom:{

        conversations:0,

        sales:0,

        revenue:0

    }

};

// =====================================
// UPDATE LIVE
// =====================================

function analyticsVisitor(){

    SALES_ANALYTICS.liveVisitors++;

    SALES_FUNNEL.visitors++;

}

function analyticsChat(){

    SALES_ANALYTICS.activeChats++;

    SALES_FUNNEL.engaged++;

    EXECUTIVE_ANALYTICS.conversations++;

}

function analyticsQualified(){

    SALES_FUNNEL.qualified++;

}

function analyticsProduct(){

    SALES_FUNNEL.productViewed++;

    EXECUTIVE_ANALYTICS.productsRecommended++;

}

function analyticsCart(){

    SALES_ANALYTICS.activeCarts++;

    SALES_FUNNEL.addToCart++;

}

function analyticsCheckout(){

    SALES_FUNNEL.checkout++;

}

function analyticsPurchase(order){

    SALES_FUNNEL.purchase++;

    SALES_ANALYTICS.conversions++;

    SALES_ANALYTICS.revenue+=

    order.total;

    SALES_ANALYTICS.averageOrderValue=

    Math.round(

        SALES_ANALYTICS.revenue/

        SALES_ANALYTICS.conversions

    );

    EXECUTIVE_ANALYTICS

    .purchasesClosed++;

    EXECUTIVE_ANALYTICS

    .revenueGenerated+=

    order.total;

}

// =====================================
// CONVERSION
// =====================================

function calculateConversionRate(){

    if(

        SALES_FUNNEL.visitors===0

    ) return;

    SALES_ANALYTICS.conversionRate=

    Math.round(

        (

            SALES_FUNNEL.purchase/

            SALES_FUNNEL.visitors

        )*100

    );

}

// =====================================
// RECOVERY RATE
// =====================================

function calculateRecoveryRate(){

    if(

        SALES_ANALYTICS.abandonedCarts===0

    ) return;

    SALES_ANALYTICS.recoveryRate=

    Math.round(

        (

            SALES_ANALYTICS.recoveredCarts/

            SALES_ANALYTICS.abandonedCarts

        )*100

    );

}

// =====================================
// AVATAR
// =====================================

function avatarSale(order){

    const avatar=

    EXECUTIVE.avatarType||

    "female";

    AVATAR_PERFORMANCE

    [avatar]

    .sales++;

    AVATAR_PERFORMANCE

    [avatar]

    .revenue+=

    order.total;

}

// =====================================
// LEADERBOARD
// =====================================

function executiveLeaderboard(){

    return{

        executive:

        EXECUTIVE.name,

        sales:

        EXECUTIVE_ANALYTICS

        .purchasesClosed,

        revenue:

        EXECUTIVE_ANALYTICS

        .revenueGenerated,

        conversion:

        SALES_ANALYTICS

        .conversionRate

    };

}

// =====================================
// HEATMAP
// =====================================

function recordHeatmap(

element

){

    fetch(

`${CONFIG.API_BASE}/api/analytics/heatmap`,

    {

        method:"POST",

        headers:{

            "Content-Type":

            "application/json"

        },

        body:JSON.stringify({

            visitorId:

            VISITOR.id,

            element,

            page:

            location.pathname

        })

    });

}

// =====================================
// DASHBOARD
// =====================================

async function syncAnalytics(){

    calculateConversionRate();

    calculateRecoveryRate();

    try{

        await fetch(

`${CONFIG.API_BASE}/api/dashboard/live`,

        {

            method:"POST",

            headers:{

                "Content-Type":

                "application/json"

            },

            body:JSON.stringify({

                live:

                SALES_ANALYTICS,

                funnel:

                SALES_FUNNEL,

                executive:

                EXECUTIVE_ANALYTICS,

                avatar:

                AVATAR_PERFORMANCE

            })

        });

    }

    catch(error){

        console.error(error);

    }

}

// =====================================
// LIVE UPDATE
// =====================================

setInterval(

    ()=>{

        syncAnalytics();

    },

    60000

);

// =====================================
// NEXT
// =====================================
//
// PART 24
//
// AI Store Owner Dashboard
//
// • Daily AI Report
// • Weekly Report
// • Monthly Report
// • Executive Report
// • Revenue Forecast
// • AI Suggestions
// • Business Growth Insights
// =====================================
// PART 24
// AI Store Owner Dashboard
// Business Intelligence Engine
// Production Ready
// =====================================

// =====================================
// BUSINESS REPORT
// =====================================

const BUSINESS_REPORT={

    today:{},

    week:{},

    month:{},

    ai:{},

    forecast:{}

};

// =====================================
// TODAY REPORT
// =====================================

function buildTodayReport(){

    BUSINESS_REPORT.today={

        visitors:

        SALES_FUNNEL.visitors,

        chats:

        EXECUTIVE_ANALYTICS.conversations,

        conversions:

        SALES_ANALYTICS.conversions,

        revenue:

        SALES_ANALYTICS.revenue,

        abandoned:

        SALES_ANALYTICS.abandonedCarts,

        recovered:

        SALES_ANALYTICS.recoveredCarts,

        conversionRate:

        SALES_ANALYTICS.conversionRate

    };

}

// =====================================
// WEEK REPORT
// =====================================

function buildWeeklyReport(data){

    BUSINESS_REPORT.week=data;

}

// =====================================
// MONTH REPORT
// =====================================

function buildMonthlyReport(data){

    BUSINESS_REPORT.month=data;

}

// =====================================
// AI INSIGHTS
// =====================================

function generateAIInsights(){

    const insights=[];

    if(

        SALES_ANALYTICS.conversionRate<3

    ){

        insights.push(

"Conversion rate is low. Increase welcome engagement."

        );

    }

    if(

        SALES_ANALYTICS.abandonedCarts>

        SALES_ANALYTICS.recoveredCarts

    ){

        insights.push(

"Enable stronger abandoned cart campaigns."

        );

    }

    if(

        EXECUTIVE_ANALYTICS.upsells<

        EXECUTIVE_ANALYTICS.purchasesClosed

    ){

        insights.push(

"Upsell opportunities are being missed."

        );

    }

    if(

        LOYALTY.repeatCustomer===false

    ){

        insights.push(

"Launch loyalty rewards to increase repeat purchases."

        );

    }

    BUSINESS_REPORT.ai.insights=

    insights;

}

// =====================================
// FORECAST
// =====================================

function revenueForecast(){

    const daily=

    SALES_ANALYTICS.revenue;

    BUSINESS_REPORT.forecast={

        tomorrow:

        Math.round(

            daily*1.05

        ),

        nextWeek:

        Math.round(

            daily*7

        ),

        nextMonth:

        Math.round(

            daily*30

        )

    };

}

// =====================================
// BEST EXECUTIVE
// =====================================

function bestExecutive(){

    return{

        name:

        EXECUTIVE.name,

        revenue:

        EXECUTIVE_ANALYTICS

        .revenueGenerated,

        conversions:

        EXECUTIVE_ANALYTICS

        .purchasesClosed

    };

}

// =====================================
// STORE HEALTH
// =====================================

function calculateStoreHealth(){

    let score=100;

    if(

        SALES_ANALYTICS

        .conversionRate<2

    ){

        score-=20;

    }

    if(

        SALES_ANALYTICS

        .abandonedCarts>

        SALES_ANALYTICS

        .recoveredCarts

    ){

        score-=20;

    }

    if(

        SALES_ANALYTICS

        .revenue===0

    ){

        score-=30;

    }

    return Math.max(

        score,

        0

    );

}

// =====================================
// REPORT
// =====================================

async function uploadBusinessReport(){

    buildTodayReport();

    generateAIInsights();

    revenueForecast();

    try{

        await fetch(

`${CONFIG.API_BASE}/api/dashboard/business-report`,

        {

            method:"POST",

            headers:{

                "Content-Type":

                "application/json"

            },

            body:JSON.stringify({

                report:

                BUSINESS_REPORT,

                executive:

                bestExecutive(),

                health:

                calculateStoreHealth()

            })

        });

    }

    catch(error){

        console.error(error);

    }

}

// =====================================
// DAILY REPORT
// =====================================

function dailyOwnerReport(){

    executiveSpeak(

"Today's AI sales report has been generated successfully."

    );

    uploadBusinessReport();

}

// =====================================
// AUTO REPORT
// =====================================

setInterval(

    ()=>{

        uploadBusinessReport();

    },

    3600000

);

// =====================================
// NEXT
// =====================================
//
// PART 25
//
// Voice Sales Executive
//
// • Speech Recognition
// • Natural Voice
// • ElevenLabs Support
// • OpenAI Voice
// • Voice Interruptions
// • Voice Conversation
// =====================================
// PART 25
// Voice Sales Executive
// AI Voice Conversation Engine
// Production Ready
// =====================================

// =====================================
// VOICE CONFIG
// =====================================

const VOICE_AI={

    enabled:true,

    listening:false,

    speaking:false,

    language:"en-US",

    voiceGender:"female",

    provider:"browser", // browser | elevenlabs | openai

    autoListen:true,

    interrupt:true,

    wakeWords:[

        "hello",

        "hi",

        "sales",

        "assistant"

    ]

};

// =====================================
// SPEECH RECOGNITION
// =====================================

const SpeechRecognition=

window.SpeechRecognition||

window.webkitSpeechRecognition;

let recognition=null;

if(

    SpeechRecognition

){

    recognition=

    new SpeechRecognition();

    recognition.lang=

    VOICE_AI.language;

    recognition.continuous=false;

    recognition.interimResults=false;

}

// =====================================
// START LISTENING
// =====================================

function startVoiceListening(){

    if(

        !recognition ||

        VOICE_AI.listening

    ) return;

    VOICE_AI.listening=true;

    recognition.start();

}

// =====================================
// STOP LISTENING
// =====================================

function stopVoiceListening(){

    if(

        !recognition

    ) return;

    VOICE_AI.listening=false;

    recognition.stop();

}

// =====================================
// RESULT
// =====================================

if(recognition){

recognition.onresult=

async(event)=>{

    const transcript=

    event.results[0][0]

    .transcript;

    stopVoiceListening();

    addVisitorMessage(

        transcript

    );

    await processConversation(

        transcript

    );

};

recognition.onend=()=>{

    VOICE_AI.listening=false;

};

}

// =====================================
// TEXT TO SPEECH
// =====================================

function speakVoice(text){

    if(

        !VOICE_AI.enabled

    ) return;

    if(

        VOICE_AI.provider!=="browser"

    ){

        speakExternalVoice(text);

        return;

    }

    window.speechSynthesis.cancel();

    const utterance=

    new SpeechSynthesisUtterance(

        text

    );

    utterance.lang=

    VOICE_AI.language;

    utterance.rate=1;

    utterance.pitch=1;

    const voices=

    speechSynthesis.getVoices();

    if(

        voices.length

    ){

        const female=

        voices.find(

        v=>

        v.name

        .toLowerCase()

        .includes("female")

        );

        if(

            female

        ){

            utterance.voice=

            female;

        }

    }

    VOICE_AI.speaking=true;

    utterance.onend=()=>{

        VOICE_AI.speaking=false;

        if(

            VOICE_AI.autoListen

        ){

            startVoiceListening();

        }

    };

    speechSynthesis.speak(

        utterance

    );

}

// =====================================
// ELEVENLABS / OPENAI
// =====================================

async function speakExternalVoice(text){

    try{

        const response=

        await fetch(

`${CONFIG.API_BASE}/api/voice/speak`,

        {

            method:"POST",

            headers:{

                "Content-Type":

                "application/json"

            },

            body:JSON.stringify({

                text,

                provider:

                VOICE_AI.provider,

                avatar:

                EXECUTIVE.avatarType

            })

        });

        const audio=

        await response.blob();

        const player=

        new Audio(

            URL.createObjectURL(audio)

        );

        player.play();

    }

    catch(error){

        console.error(error);

    }

}

// =====================================
// EXECUTIVE SPEAK
// =====================================

const originalExecutiveSpeak=

executiveSpeak;

executiveSpeak=function(message){

    originalExecutiveSpeak(

        message

    );

    speakVoice(

        message

    );

};

// =====================================
// VOICE BUTTON
// =====================================

function createVoiceButton(){

    const btn=

    document.createElement(

        "button"

    );

    btn.id="lbVoiceButton";

    btn.innerHTML="🎤";

    btn.onclick=()=>{

        if(

            VOICE_AI.listening

        ){

            stopVoiceListening();

        }

        else{

            startVoiceListening();

        }

    };

    document.body.appendChild(btn);

}

// =====================================
// INITIALIZE
// =====================================

window.addEventListener(

    "load",

    ()=>{

        createVoiceButton();

    }

);

// =====================================
// NEXT
// =====================================
//
// PART 26
//
// AI Negotiation Engine
//
// • Price Objection Handling
// • Discount Negotiation
// • Value Selling
// • Scarcity Psychology
// • Closing Psycho
// =====================================
// PART 26
// AI Negotiation Engine
// Value Selling Psychology
// Production Ready
// =====================================

// =====================================
// NEGOTIATION STATE
// =====================================

const NEGOTIATION={

    active:false,

    objection:null,

    attempts:0,

    discountOffered:false,

    maxDiscount:20,

    successful:false

};

// =====================================
// PRICE OBJECTIONS
// =====================================

const PRICE_OBJECTIONS=[

    "expensive",

    "too much",

    "costly",

    "price",

    "cheaper",

    "discount",

    "best price",

    "lower price",

    "offer"

];

// =====================================
// DETECT OBJECTION
// =====================================

function detectObjection(message){

    const text=

    message.toLowerCase();

    for(

        const word

        of PRICE_OBJECTIONS

    ){

        if(

            text.includes(word)

        ){

            NEGOTIATION.active=true;

            NEGOTIATION.objection=

            "price";

            return true;

        }

    }

    return false;

}

// =====================================
// VALUE SELLING
// =====================================

function explainValue(){

    executiveSpeak(

"This product isn't only about price. It offers better quality, durability and long-term value."

    );

}

// =====================================
// SOCIAL PROOF
// =====================================

function socialProof(){

    executiveSpeak(

"Thousands of customers have already purchased this product and rated it highly."

    );

}

// =====================================
// SCARCITY
// =====================================

function scarcitySelling(){

    executiveSpeak(

"Stock is limited and this promotion may end soon."

    );

}

// =====================================
// DISCOUNT
// =====================================

function negotiateDiscount(){

    if(

        NEGOTIATION.discountOffered

    ) return;

    NEGOTIATION.discountOffered=true;

    const discount=

    Math.min(

        NEGOTIATION.maxDiscount,

        recommendDiscount()

    );

    if(

        discount>0

    ){

        showCoupon({

            code:

            `SAVE${discount}`,

            discount:

            `${discount}% OFF`

        });

        executiveSpeak(

`I've arranged a special ${discount}% discount exclusively for you.`

        );

    }

}

// =====================================
// FREE SHIPPING
// =====================================

function freeShippingOffer(){

    executiveSpeak(

"I can also include free shipping if you complete your purchase today."

    );

}

// =====================================
// BONUS
// =====================================

function bonusOffer(){

    executiveSpeak(

"I'll also include our exclusive customer support and warranty at no additional cost."

    );

}

// =====================================
// CLOSE
// =====================================

function negotiationClose(){

    executiveSpeak(

"Would you like me to reserve this offer and take you to checkout?"

    );

    showCheckoutCTA();

}

// =====================================
// AI NEGOTIATION
// =====================================

function negotiationEngine(message){

    if(

        !detectObjection(

            message

        )

    ){

        return;

    }

    NEGOTIATION.attempts++;

    explainValue();

    if(

        NEGOTIATION.attempts>=1

    ){

        socialProof();

    }

    if(

        NEGOTIATION.attempts>=2

    ){

        negotiateDiscount();

    }

    if(

        NEGOTIATION.attempts>=3

    ){

        freeShippingOffer();

    }

    if(

        NEGOTIATION.attempts>=4

    ){

        bonusOffer();

    }

    scarcitySelling();

    negotiationClose();

}

// =====================================
// SUCCESS
// =====================================

function negotiationSuccess(){

    NEGOTIATION.successful=true;

    executiveSpeak(

"Excellent choice! I'm happy we found the perfect solution for you."

    );

}

// =====================================
// NEXT
// =====================================
//
// PART 27
//
// AI Product Comparison Engine
//
// • Compare Products
// • Compare Features
// • Compare Prices
// • Compare Reviews
// • AI Recommendation Winner
// =====================================
// PART 27
// AI Product Comparison Engine
// Intelligent Product Comparison
// Production Ready
// =====================================

// =====================================
// COMPARISON ENGINE
// =====================================

const PRODUCT_COMPARE={

    enabled:true,

    selected:[],

    winner:null,

    comparison:null

};

// =====================================
// MAX PRODUCTS
// =====================================

const MAX_COMPARE=4;

// =====================================
// ADD PRODUCT
// =====================================

function addComparisonProduct(product){

    if(!product) return;

    const exists=

    PRODUCT_COMPARE.selected.find(

        p=>p.id===product.id

    );

    if(exists) return;

    if(

        PRODUCT_COMPARE.selected.length>=

        MAX_COMPARE

    ){

        PRODUCT_COMPARE.selected.shift();

    }

    PRODUCT_COMPARE.selected.push(product);

}

// =====================================
// REMOVE PRODUCT
// =====================================

function removeComparisonProduct(id){

    PRODUCT_COMPARE.selected=

    PRODUCT_COMPARE.selected.filter(

        p=>p.id!==id

    );

}

// =====================================
// PRICE SCORE
// =====================================

function priceScore(product){

    const price=

    Number(product.price)||0;

    if(price<=25) return 100;

    if(price<=50) return 90;

    if(price<=100) return 80;

    if(price<=250) return 70;

    return 60;

}

// =====================================
// REVIEW SCORE
// =====================================

function reviewScore(product){

    return(

        Number(product.rating)||0

    )*20;

}

// =====================================
// INVENTORY SCORE
// =====================================

function stockScore(product){

    if(

        product.inventory>

        100

    ) return 100;

    if(

        product.inventory>

        20

    ) return 80;

    if(

        product.inventory>

        5

    ) return 60;

    return 30;

}

// =====================================
// SALES SCORE
// =====================================

function salesScore(product){

    return Math.min(

        100,

        Number(

            product.popularity||0

        )

    );

}

// =====================================
// AI SCORE
// =====================================

function totalComparisonScore(product){

    return(

        reviewScore(product)*0.35+

        salesScore(product)*0.25+

        priceScore(product)*0.20+

        stockScore(product)*0.20

    );

}

// =====================================
// FIND WINNER
// =====================================

function determineComparisonWinner(){

    if(

        PRODUCT_COMPARE.selected.length<2

    ) return null;

    let winner=

    PRODUCT_COMPARE.selected[0];

    let best=

    totalComparisonScore(winner);

    PRODUCT_COMPARE.selected.forEach(

        product=>{

            const score=

            totalComparisonScore(product);

            if(score>best){

                best=score;

                winner=product;

            }

        }

    );

    PRODUCT_COMPARE.winner=

    winner;

    return winner;

}

// =====================================
// BUILD TABLE
// =====================================

function buildComparisonTable(){

    if(

        PRODUCT_COMPARE.selected.length<2

    ) return;

    let html=

`<div class="lb-comparison">

<table>

<thead>

<tr>

<th>Feature</th>`;

    PRODUCT_COMPARE.selected.forEach(

        product=>{

            html+=`

<th>

${product.title}

</th>`;

        }

    );

    html+=`

</tr>

</thead>

<tbody>`;

    // Price

    html+=`

<tr>

<td>Price</td>`;

    PRODUCT_COMPARE.selected.forEach(

        p=>{

            html+=`

<td>

${formatMoney(p.price)}

</td>`;

        }

    );

    html+=`

</tr>`;

    // Rating

    html+=`

<tr>

<td>Rating</td>`;

    PRODUCT_COMPARE.selected.forEach(

        p=>{

            html+=`

<td>

⭐ ${p.rating||0}

</td>`;

        }

    );

    html+=`

</tr>`;

    // Stock

    html+=`

<tr>

<td>Availability</td>`;

    PRODUCT_COMPARE.selected.forEach(

        p=>{

            html+=`

<td>

${p.inventory||0}

</td>`;

        }

    );

    html+=`

</tr>`;

    html+=`

</tbody>

</table>

</div>`;

    PRODUCT_COMPARE.comparison=

    html;

}

// =====================================
// SHOW RESULT
// =====================================

function showComparison(){

    buildComparisonTable();

    const winner=

    determineComparisonWinner();

    if(

        PRODUCT_COMPARE.comparison

    ){

        document

        .getElementById(

            "lbMessages"

        )

        .insertAdjacentHTML(

            "beforeend",

            PRODUCT_COMPARE.comparison

        );

    }

    if(winner){

        executiveSpeak(

`After comparing everything, I recommend "${winner.title}" because it offers the best overall value for your needs.`

        );

    }

    scrollMessages();

}

// =====================================
// CLEAR
// =====================================

function clearComparison(){

    PRODUCT_COMPARE.selected=[];

    PRODUCT_COMPARE.winner=null;

    PRODUCT_COMPARE.comparison=null;

}

// =====================================
// NEXT
// =====================================
//
// PART 28
//
// AI Bundle Builder
//
// • Smart Bundle Generator
// • Frequently Bought Together
// • Complete The Look
// • Accessories AI
// • Bundle Discount Engine
// =====================================
// PART 28
// AI Smart Bundle Builder
// Frequently Bought Together
// Complete The Look
// Production Ready
// =====================================

// =====================================
// BUNDLE ENGINE
// =====================================

const BUNDLE_ENGINE={

    currentProduct:null,

    suggestedBundles:[],

    completeLook:[],

    accessories:[],

    bundleDiscount:0,

    estimatedSaving:0

};

// =====================================
// LOAD PRODUCT
// =====================================

function initializeBundle(product){

    if(!product) return;

    BUNDLE_ENGINE.currentProduct=

    product;

    buildSmartBundle(product);

}

// =====================================
// SMART BUNDLE
// =====================================

function buildSmartBundle(product){

    const bundle=[];

    // Frequently Bought Together

    if(

        product.bundle &&

        product.bundle.length

    ){

        bundle.push(

            ...product.bundle

        );

    }

    // Cross Sell

    if(

        product.crossSell &&

        product.crossSell.length

    ){

        bundle.push(

            ...product.crossSell

        );

    }

    BUNDLE_ENGINE

    .suggestedBundles=

    removeDuplicateProducts(

        bundle

    );

    calculateBundleDiscount();

}

// =====================================
// REMOVE DUPLICATES
// =====================================

function removeDuplicateProducts(products){

    const ids=[];

    return products.filter(

        item=>{

            if(

                ids.includes(item.id)

            ){

                return false;

            }

            ids.push(item.id);

            return true;

        }

    );

}

// =====================================
// ACCESSORIES
// =====================================

function recommendAccessories(){

    const product=

    BUNDLE_ENGINE.currentProduct;

    if(!product) return;

    if(

        product.accessories

    ){

        BUNDLE_ENGINE

        .accessories=

        product.accessories;

    }

}

// =====================================
// COMPLETE LOOK
// =====================================

function buildCompleteLook(){

    const product=

    BUNDLE_ENGINE.currentProduct;

    if(!product) return;

    if(

        product.completeLook

    ){

        BUNDLE_ENGINE

        .completeLook=

        product.completeLook;

    }

}

// =====================================
// DISCOUNT
// =====================================

function calculateBundleDiscount(){

    const count=

    BUNDLE_ENGINE

    .suggestedBundles

    .length;

    if(count>=5){

        BUNDLE_ENGINE

        .bundleDiscount=20;

    }

    else if(count>=3){

        BUNDLE_ENGINE

        .bundleDiscount=15;

    }

    else if(count>=2){

        BUNDLE_ENGINE

        .bundleDiscount=10;

    }

    else{

        BUNDLE_ENGINE

        .bundleDiscount=0;

    }

}

// =====================================
// SAVINGS
// =====================================

function calculateBundleSavings(){

    let total=0;

    BUNDLE_ENGINE

    .suggestedBundles

    .forEach(

        item=>{

            total+=

            Number(item.price);

        }

    );

    BUNDLE_ENGINE

    .estimatedSaving=

    Math.round(

        total*

        (

            BUNDLE_ENGINE

            .bundleDiscount/

            100

        )

    );

}

// =====================================
// RENDER
// =====================================

function renderBundleSection(){

    calculateBundleSavings();

    const products=[

        ...BUNDLE_ENGINE

        .suggestedBundles

    ];

    if(

        !products.length

    ) return;

    let html=

`

<div class="lbBundleBox">

<h3>

🔥 Frequently Bought Together

</h3>

<div class="lbBundleProducts">

`;

    products.forEach(

        product=>{

            html+=`

<div class="lbBundleItem">

<img src="${product.image}">

<div>

<b>

${product.title}

</b>

<br>

${formatMoney(product.price)}

</div>

</div>

`;

        }

    );

    html+=`

</div>

<div class="lbBundleFooter">

<div>

Bundle Discount

<b>

${BUNDLE_ENGINE.bundleDiscount}%

</b>

</div>

<div>

You Save

<b>

${formatMoney(

BUNDLE_ENGINE

.estimatedSaving

)}

</b>

</div>

<button

onclick="buyBundle()">

Buy Bundle

</button>

</div>

</div>

`;

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
// BUY
// =====================================

function buyBundle(){

    executiveSpeak(

"I've prepared your complete bundle with the best available discount."

    );

    window.location.href=

    "/cart";

}

// =====================================
// AI
// =====================================

function bundleAI(product){

    initializeBundle(product);

    recommendAccessories();

    buildCompleteLook();

    renderBundleSection();

}

// =====================================
// NEXT
// =====================================
//
// PART 29
//
// AI Seasonal Campaign Engine
//
// • Christmas
// • Black Friday
// • Cyber Monday
// • Valentine's
// • Mother's Day
// • Father's Day
// • Halloween
// • Ramadan
// • Eid
// • Diwali
// • New Year
// • Auto Campaign Switching
// =====================================
// PART 29
// AI Seasonal Campaign Engine
// Holiday & Event Automation
// Production Ready
// =====================================

// =====================================
// SEASONAL ENGINE
// =====================================

const SEASONAL_ENGINE={

    currentCampaign:null,

    active:false,

    discount:0,

    theme:null,

    greeting:null,

    countdown:false

};

// =====================================
// CAMPAIGNS
// =====================================

const SEASONAL_CAMPAIGNS={

    NEW_YEAR:{
        month:1,
        day:1,
        name:"New Year",
        discount:20,
        theme:"newyear",
        greeting:"🎉 Happy New Year!"
    },

    VALENTINE:{
        month:2,
        day:14,
        name:"Valentine's Day",
        discount:15,
        theme:"valentine",
        greeting:"❤️ Celebrate Love!"
    },

    RAMADAN:{
        month:null,
        day:null,
        dynamic:true,
        name:"Ramadan",
        discount:20,
        theme:"ramadan",
        greeting:"🌙 Ramadan Mubarak"
    },

    EID:{
        month:null,
        day:null,
        dynamic:true,
        name:"Eid",
        discount:25,
        theme:"eid",
        greeting:"🌙 Eid Mubarak"
    },

    MOTHERS_DAY:{
        month:5,
        week:2,
        weekday:0,
        name:"Mother's Day",
        discount:20,
        theme:"mother",
        greeting:"💐 Happy Mother's Day!"
    },

    FATHERS_DAY:{
        month:6,
        week:3,
        weekday:0,
        name:"Father's Day",
        discount:20,
        theme:"father",
        greeting:"👔 Happy Father's Day!"
    },

    HALLOWEEN:{
        month:10,
        day:31,
        name:"Halloween",
        discount:15,
        theme:"halloween",
        greeting:"🎃 Happy Halloween!"
    },

    BLACK_FRIDAY:{
        month:11,
        week:4,
        weekday:5,
        name:"Black Friday",
        discount:50,
        theme:"blackfriday",
        greeting:"🖤 Black Friday Mega Sale!"
    },

    CYBER_MONDAY:{
        month:11,
        week:4,
        weekday:1,
        name:"Cyber Monday",
        discount:40,
        theme:"cyber",
        greeting:"💻 Cyber Monday Deals!"
    },

    CHRISTMAS:{
        month:12,
        day:25,
        name:"Christmas",
        discount:30,
        theme:"christmas",
        greeting:"🎄 Merry Christmas!"
    },

    DIWALI:{
        month:null,
        day:null,
        dynamic:true,
        name:"Diwali",
        discount:25,
        theme:"diwali",
        greeting:"🪔 Happy Diwali!"
    }

};

// =====================================
// FIND CAMPAIGN
// =====================================

function detectSeasonCampaign(){

    const today=

    new Date();

    const month=

    today.getMonth()+1;

    const day=

    today.getDate();

    for(

        const key

        in SEASONAL_CAMPAIGNS

    ){

        const campaign=

        SEASONAL_CAMPAIGNS[key];

        if(

            campaign.dynamic

        ){

            continue;

        }

        if(

            campaign.day===day &&

            campaign.month===month

        ){

            activateCampaign(

                campaign

            );

            return;

        }

    }

}

// =====================================
// ACTIVATE
// =====================================

function activateCampaign(campaign){

    SEASONAL_ENGINE.active=true;

    SEASONAL_ENGINE.currentCampaign=

    campaign.name;

    SEASONAL_ENGINE.discount=

    campaign.discount;

    SEASONAL_ENGINE.theme=

    campaign.theme;

    SEASONAL_ENGINE.greeting=

    campaign.greeting;

}

// =====================================
// SHOW CAMPAIGN
// =====================================

function showSeasonCampaign(){

    if(

        !SEASONAL_ENGINE.active

    ) return;

    executiveSpeak(

        SEASONAL_ENGINE.greeting

    );

    showCoupon({

        code:

        SEASONAL_ENGINE

        .currentCampaign

        .replace(/\s/g,"")

        .toUpperCase(),

        discount:

        `${SEASONAL_ENGINE.discount}% OFF`

    });

}

// =====================================
// COUNTDOWN
// =====================================

function startCampaignCountdown(endDate){

    SEASONAL_ENGINE.countdown=true;

    const timer=

    setInterval(

        ()=>{

            const diff=

            endDate-

            Date.now();

            if(diff<=0){

                clearInterval(

                    timer

                );

                SEASONAL_ENGINE

                .countdown=false;

                return;

            }

        },

        1000

    );

}

// =====================================
// AUTO START
// =====================================

window.addEventListener(

    "load",

    ()=>{

        detectSeasonCampaign();

        showSeasonCampaign();

    }

);

// =====================================
// NEXT
// =====================================
//
// PART 30
//
// AI Personal Shopper Memory
//
// • Customer Preferences
// • Favorite Categories
// • Favorite Brands
// • Favorite Sizes
// • Favorite Colors
// • Long-Term AI Memory
// =====================================
// PART 30
// AI Personal Shopper Memory
// Long-Term Customer Memory
// Production Ready
// =====================================

// =====================================
// SHOPPER MEMORY
// =====================================

const SHOPPER_MEMORY={

    customerId:null,

    favoriteCategories:[],

    favoriteBrands:[],

    favoriteProducts:[],

    favoriteColors:[],

    favoriteSizes:[],

    preferredBudget:null,

    preferredCurrency:"USD",

    preferredLanguage:"en",

    shoppingStyle:"",

    lastViewed:[],

    recentlyPurchased:[],

    wishlist:[],

    dislikes:[],

    seasonalInterests:[],

    updatedAt:null

};

// =====================================
// LOAD MEMORY
// =====================================

async function loadShopperMemory(){

    try{

        const response=

        await fetch(

`${CONFIG.API_BASE}/api/customer/memory`,

        {

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                visitorId:VISITOR.id

            })

        });

        if(!response.ok) return;

        const result=

        await response.json();

        if(!result.success) return;

        Object.assign(

            SHOPPER_MEMORY,

            result.memory

        );

    }

    catch(error){

        console.error(error);

    }

}

// =====================================
// SAVE MEMORY
// =====================================

async function saveShopperMemory(){

    SHOPPER_MEMORY.updatedAt=

    new Date();

    try{

        await fetch(

`${CONFIG.API_BASE}/api/customer/memory/save`,

        {

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                visitorId:VISITOR.id,

                memory:SHOPPER_MEMORY

            })

        });

    }

    catch(error){

        console.error(error);

    }

}

// =====================================
// FAVORITES
// =====================================

function rememberCategory(category){

    if(

        !SHOPPER_MEMORY

        .favoriteCategories

        .includes(category)

    ){

        SHOPPER_MEMORY

        .favoriteCategories

        .push(category);

    }

}

function rememberBrand(brand){

    if(

        !SHOPPER_MEMORY

        .favoriteBrands

        .includes(brand)

    ){

        SHOPPER_MEMORY

        .favoriteBrands

        .push(brand);

    }

}

function rememberColor(color){

    if(

        !SHOPPER_MEMORY

        .favoriteColors

        .includes(color)

    ){

        SHOPPER_MEMORY

        .favoriteColors

        .push(color);

    }

}

function rememberSize(size){

    if(

        !SHOPPER_MEMORY

        .favoriteSizes

        .includes(size)

    ){

        SHOPPER_MEMORY

        .favoriteSizes

        .push(size);

    }

}

// =====================================
// VIEW HISTORY
// =====================================

function rememberViewedProduct(product){

    SHOPPER_MEMORY

    .lastViewed.unshift({

        id:product.id,

        title:product.title,

        viewedAt:new Date()

    });

    SHOPPER_MEMORY.lastViewed=

    SHOPPER_MEMORY

    .lastViewed

    .slice(0,20);

}

// =====================================
// PURCHASE HISTORY
// =====================================

function rememberPurchase(product){

    SHOPPER_MEMORY

    .recentlyPurchased.unshift({

        id:product.id,

        title:product.title,

        purchasedAt:new Date()

    });

    SHOPPER_MEMORY

    .recentlyPurchased=

    SHOPPER_MEMORY

    .recentlyPurchased

    .slice(0,20);

}

// =====================================
// WISHLIST
// =====================================

function addWishlist(product){

    const exists=

    SHOPPER_MEMORY

    .wishlist.find(

        p=>p.id===product.id

    );

    if(exists) return;

    SHOPPER_MEMORY

    .wishlist.push(product);

}

// =====================================
// BUDGET
// =====================================

function updateBudget(price){

    SHOPPER_MEMORY.preferredBudget=

    price;

}

// =====================================
// AI PERSONALIZATION
// =====================================

function personalizeRecommendations(products){

    if(

        !products ||

        !products.length

    ){

        return products;

    }

    return products.sort(

        (a,b)=>{

            let scoreA=0;

            let scoreB=0;

            if(

                SHOPPER_MEMORY

                .favoriteBrands

                .includes(a.vendor)

            ){

                scoreA+=10;

            }

            if(

                SHOPPER_MEMORY

                .favoriteBrands

                .includes(b.vendor)

            ){

                scoreB+=10;

            }

            if(

                SHOPPER_MEMORY

                .favoriteCategories

                .includes(a.type)

            ){

                scoreA+=8;

            }

            if(

                SHOPPER_MEMORY

                .favoriteCategories

                .includes(b.type)

            ){

                scoreB+=8;

            }

            return scoreB-scoreA;

        }

    );

}

// =====================================
// INITIALIZE
// =====================================

window.addEventListener(

    "load",

    ()=>{

        loadShopperMemory();

    }

);

// =====================================
// AUTO SAVE
// =====================================

setInterval(

    ()=>{

        saveShopperMemory();

    },

    300000

);

// =====================================
// NEXT
// =====================================
//
// PART 31
//
// AI Lead Capture Engine
//
// • Smart Email Capture
// • Smart Phone Capture
// • Exit Lead Capture
// • Newsletter AI
// • Lead Qualification
// • CRM Lead Sync
// =====================================
// PART 31
// AI Lead Capture Engine
// Smart Lead Qualification
// Production Ready
// =====================================

// =====================================
// LEAD ENGINE
// =====================================

const LEAD_ENGINE={

    captured:false,

    qualified:false,

    score:0,

    popupShown:false,

    exitTriggered:false,

    email:"",

    phone:"",

    name:"",

    source:"chatbot",

    interests:[]

};

// =====================================
// QUALIFICATION
// =====================================

const LEAD_SCORE={

    email:30,

    phone:30,

    repeatVisitor:20,

    cartItems:30,

    checkoutIntent:40,

    conversation:15

};

// =====================================
// SCORE
// =====================================

function calculateLeadScore(){

    let score=0;

    if(

        LEAD_ENGINE.email

    ){

        score+=LEAD_SCORE.email;

    }

    if(

        LEAD_ENGINE.phone

    ){

        score+=LEAD_SCORE.phone;

    }

    if(

        VISITOR_PROFILE.totalVisits>1

    ){

        score+=LEAD_SCORE.repeatVisitor;

    }

    if(

        CART_STATE.itemCount>0

    ){

        score+=LEAD_SCORE.cartItems;

    }

    if(

        PURCHASE_STATE.ready

    ){

        score+=LEAD_SCORE.checkoutIntent;

    }

    if(

        EXECUTIVE_ANALYTICS.conversations>3

    ){

        score+=LEAD_SCORE.conversation;

    }

    LEAD_ENGINE.score=

    Math.min(

        score,

        100

    );

    LEAD_ENGINE.qualified=

    score>=60;

}

// =====================================
// CAPTURE
// =====================================

function captureLead(

data={}

){

    LEAD_ENGINE.name=

    data.name||

    LEAD_ENGINE.name;

    LEAD_ENGINE.email=

    data.email||

    LEAD_ENGINE.email;

    LEAD_ENGINE.phone=

    data.phone||

    LEAD_ENGINE.phone;

    LEAD_ENGINE.interests=

    data.interests||

    [];

    LEAD_ENGINE.captured=true;

    calculateLeadScore();

    syncLeadCRM();

}

// =====================================
// POPUP
// =====================================

function showLeadPopup(){

    if(

        LEAD_ENGINE.popupShown ||

        LEAD_ENGINE.captured

    ){

        return;

    }

    LEAD_ENGINE.popupShown=true;

    addExecutiveMessage(

"🎁 Get exclusive offers! Enter your email to receive special discounts and product updates."

    );

    document

    .getElementById(

        "lbMessages"

    )

    .insertAdjacentHTML(

        "beforeend",

`

<div class="lbLeadCapture">

<input

id="lbLeadEmail"

type="email"

placeholder="Email address">

<button

onclick="submitLeadCapture()">

Unlock Offer

</button>

</div>

`

    );

    scrollMessages();

}

// =====================================
// SUBMIT
// =====================================

function submitLeadCapture(){

    const email=

    document

    .getElementById(

        "lbLeadEmail"

    )

    .value

    .trim();

    if(

        !email

    ) return;

    captureLead({

        email

    });

    executiveSpeak(

"Thank you! Your exclusive offer has been activated."

    );

    showCoupon({

        code:"WELCOME15",

        discount:"15% OFF"

    });

}

// =====================================
// EXIT
// =====================================

document.addEventListener(

    "mouseout",

    event=>{

        if(

            event.clientY<=0 &&

            !LEAD_ENGINE.exitTriggered

        ){

            LEAD_ENGINE.exitTriggered=true;

            showLeadPopup();

        }

    }

);

// =====================================
// CRM
// =====================================

async function syncLeadCRM(){

    try{

        await fetch(

`${CONFIG.API_BASE}/api/leads/create`,

        {

            method:"POST",

            headers:{

                "Content-Type":

                "application/json"

            },

            body:JSON.stringify({

                visitorId:

                VISITOR.id,

                lead:

                LEAD_ENGINE

            })

        });

    }

    catch(error){

        console.error(error);

    }

}

// =====================================
// NEWSLETTER
// =====================================

async function subscribeNewsletter(){

    if(

        !LEAD_ENGINE.email

    ){

        return;

    }

    try{

        await fetch(

`${CONFIG.API_BASE}/api/newsletter/subscribe`,

        {

            method:"POST",

            headers:{

                "Content-Type":

                "application/json"

            },

            body:JSON.stringify({

                email:

                LEAD_ENGINE.email

            })

        });

    }

    catch(error){

        console.error(error);

    }

}

// =====================================
// AUTO TRIGGER
// =====================================

setTimeout(

    ()=>{

        if(

            !LEAD_ENGINE.captured

        ){

            showLeadPopup();

        }

    },

    180000

);

// =====================================
// NEXT
// =====================================
//
// PART 32
//
// AI Appointment Booking Engine
//
// • Book Sales Call
// • Demo Scheduling
// • Calendar Integration
// • Time Zone Detection
// • Sales Representative Assignment
// • Google Calendar / Outlook Sync
// =====================================
// PART 32
// AI Appointment Booking Engine
// Sales Call & Demo Scheduler
// Production Ready
// =====================================

// =====================================
// APPOINTMENT ENGINE
// =====================================

const APPOINTMENT={

    booked:false,

    meetingType:"sales",

    date:null,

    time:null,

    timezone:null,

    executive:null,

    meetingId:null,

    calendarLink:null

};

// =====================================
// MEETING TYPES
// =====================================

const MEETING_TYPES={

    sales:"Sales Consultation",

    demo:"Product Demo",

    onboarding:"Onboarding Session",

    enterprise:"Enterprise Meeting",

    support:"Priority Support"

};

// =====================================
// TIMEZONE
// =====================================

function detectTimezone(){

    APPOINTMENT.timezone=

    Intl.DateTimeFormat()

    .resolvedOptions()

    .timeZone;

}

// =====================================
// EXECUTIVE
// =====================================

function assignExecutive(){

    if(

        VISITOR.country==="US"

    ){

        APPOINTMENT.executive=

        "Emily Johnson";

    }

    else if(

        VISITOR.country==="UK"

    ){

        APPOINTMENT.executive=

        "Oliver Smith";

    }

    else if(

        VISITOR.country==="CA"

    ){

        APPOINTMENT.executive=

        "Sophia Brown";

    }

    else if(

        VISITOR.country==="AE"

    ){

        APPOINTMENT.executive=

        "Ahmed Hassan";

    }

    else{

        APPOINTMENT.executive=

        EXECUTIVE.name||

        "Sales Executive";

    }

}

// =====================================
// BOOK
// =====================================

async function bookAppointment(

data

){

    detectTimezone();

    assignExecutive();

    Object.assign(

        APPOINTMENT,

        data

    );

    try{

        const response=

        await fetch(

`${CONFIG.API_BASE}/api/appointments/book`,

        {

            method:"POST",

            headers:{

                "Content-Type":

                "application/json"

            },

            body:JSON.stringify({

                visitorId:

                VISITOR.id,

                appointment:

                APPOINTMENT,

                customer:

                buildCustomerProfile()

            })

        });

        const result=

        await response.json();

        if(

            result.success

        ){

            APPOINTMENT.booked=true;

            APPOINTMENT.meetingId=

            result.meetingId;

            APPOINTMENT.calendarLink=

            result.calendarLink;

            executiveSpeak(

`Your meeting has been booked successfully with ${APPOINTMENT.executive}.`

            );

        }

    }

    catch(error){

        console.error(error);

    }

}

// =====================================
// DEMO
// =====================================

function requestDemo(){

    executiveSpeak(

"I'd love to arrange a live demonstration for you."

    );

    openAppointmentPopup(

        "demo"

    );

}

// =====================================
// SALES CALL
// =====================================

function requestSalesCall(){

    executiveSpeak(

"Let's schedule a personal sales consultation."

    );

    openAppointmentPopup(

        "sales"

    );

}

// =====================================
// POPUP
// =====================================

function openAppointmentPopup(type){

    const popup=

`

<div class="lbAppointmentBox">

<h3>

${MEETING_TYPES[type]}

</h3>

<input
id="lbMeetingDate"
type="date">

<input
id="lbMeetingTime"
type="time">

<button
onclick="submitAppointment('${type}')">

Book Appointment

</button>

</div>

`;

    document

    .getElementById(

        "lbMessages"

    )

    .insertAdjacentHTML(

        "beforeend",

        popup

    );

    scrollMessages();

}

// =====================================
// SUBMIT
// =====================================

function submitAppointment(type){

    const date=

    document

    .getElementById(

        "lbMeetingDate"

    ).value;

    const time=

    document

    .getElementById(

        "lbMeetingTime"

    ).value;

    if(

        !date ||

        !time

    ){

        executiveSpeak(

"Please select both date and time."

        );

        return;

    }

    bookAppointment({

        meetingType:type,

        date,

        time

    });

}

// =====================================
// GOOGLE CALENDAR
// =====================================

function openGoogleCalendar(){

    if(

        APPOINTMENT.calendarLink

    ){

        window.open(

            APPOINTMENT.calendarLink,

            "_blank"

        );

    }

}

// =====================================
// OUTLOOK
// =====================================

function openOutlookCalendar(){

    if(

        APPOINTMENT.meetingId

    ){

        window.open(

`${CONFIG.API_BASE}/calendar/outlook/${APPOINTMENT.meetingId}`,

        "_blank"

        );

    }

}

// =====================================
// AUTO INVITE
// =====================================

async function sendMeetingInvite(){

    if(

        !APPOINTMENT.booked

    ) return;

    try{

        await fetch(

`${CONFIG.API_BASE}/api/appointments/invite`,

        {

            method:"POST",

            headers:{

                "Content-Type":

                "application/json"

            },

            body:JSON.stringify({

                visitorId:

                VISITOR.id,

                appointment:

                APPOINTMENT

            })

        });

    }

    catch(error){

        console.error(error);

    }

}

// =====================================
// NEXT
// =====================================
//
// PART 33
//
// AI Sales Training Engine
//
// • Learn From Every Conversation
// • Winning Replies
// • Failed Replies
// • Self Improvement
// • Response Ranking
// • AI Continuous Learning
// =====================================
// PART 33
// AI Sales Training Engine
// Continuous Learning System
// Production Ready
// =====================================

// =====================================
// TRAINING ENGINE
// =====================================

const SALES_TRAINING={

    totalConversations:0,

    successfulSales:0,

    failedSales:0,

    winningReplies:[],

    failedReplies:[],

    objectionLibrary:{},

    customerPatterns:{},

    aiConfidence:95,

    lastTraining:new Date()

};

// =====================================
// SAVE REPLY
// =====================================

function recordAIReply(

visitorMessage,

aiReply,

success

){

    const record={

        visitor:visitorMessage,

        reply:aiReply,

        success,

        createdAt:new Date()

    };

    if(success){

        SALES_TRAINING

        .winningReplies

        .push(record);

        SALES_TRAINING

        .successfulSales++;

    }

    else{

        SALES_TRAINING

        .failedReplies

        .push(record);

        SALES_TRAINING

        .failedSales++;

    }

    SALES_TRAINING

    .totalConversations++;

}

// =====================================
// LEARN OBJECTIONS
// =====================================

function learnObjection(

type,

resolved

){

    if(

        !SALES_TRAINING

        .objectionLibrary[type]

    ){

        SALES_TRAINING

        .objectionLibrary[type]={

            total:0,

            resolved:0

        };

    }

    SALES_TRAINING

    .objectionLibrary[type]

    .total++;

    if(resolved){

        SALES_TRAINING

        .objectionLibrary[type]

        .resolved++;

    }

}

// =====================================
// CUSTOMER PATTERN
// =====================================

function learnCustomerPattern(

country,

category

){

    const key=

`${country}_${category}`;

    if(

        !SALES_TRAINING

        .customerPatterns[key]

    ){

        SALES_TRAINING

        .customerPatterns[key]=0;

    }

    SALES_TRAINING

    .customerPatterns[key]++;

}

// =====================================
// SUCCESS RATE
// =====================================

function salesSuccessRate(){

    if(

        SALES_TRAINING

        .totalConversations===0

    ){

        return 0;

    }

    return Math.round(

        (

            SALES_TRAINING

            .successfulSales/

            SALES_TRAINING

            .totalConversations

        )*100

    );

}

// =====================================
// AI CONFIDENCE
// =====================================

function updateConfidence(){

    SALES_TRAINING

    .aiConfidence=

    Math.min(

        99,

        70+

        salesSuccessRate()/3

    );

}

// =====================================
// BEST RESPONSE
// =====================================

function getBestReply(){

    if(

        SALES_TRAINING

        .winningReplies.length===0

    ){

        return null;

    }

    return SALES_TRAINING

    .winningReplies[

        SALES_TRAINING

        .winningReplies.length-1

    ];

}

// =====================================
// RETRAIN
// =====================================

async function retrainAI(){

    updateConfidence();

    SALES_TRAINING

    .lastTraining=

    new Date();

    try{

        await fetch(

`${CONFIG.API_BASE}/api/ai/retrain`,

        {

            method:"POST",

            headers:{

                "Content-Type":

                "application/json"

            },

            body:JSON.stringify({

                training:

                SALES_TRAINING

            })

        });

    }

    catch(error){

        console.error(error);

    }

}

// =====================================
// DAILY TRAINING
// =====================================

setInterval(

    ()=>{

        retrainAI();

    },

    86400000

);

// =====================================
// DASHBOARD
// =====================================

function trainingDashboard(){

    return{

        confidence:

        SALES_TRAINING.aiConfidence,

        successRate:

        salesSuccessRate(),

        conversations:

        SALES_TRAINING.totalConversations,

        successfulSales:

        SALES_TRAINING.successfulSales,

        failedSales:

        SALES_TRAINING.failedSales,

        bestReply:

        getBestReply(),

        lastTraining:

        SALES_TRAINING.lastTraining

    };

}

// =====================================
// NEXT
// =====================================
//
// PART 34
//
// AI Store Health Monitor
//
// • Real-Time Health Score
// • Sales Alerts
// • AI Recommendations
// • Inventory Alerts
// • Revenue Alerts
// • Customer Satisfaction Monitor
// =====================================
// PART 34
// AI Store Health Monitor
// Real-Time Store Intelligence
// Production Ready
// =====================================

// =====================================
// STORE HEALTH
// =====================================

const STORE_HEALTH={

    score:100,

    status:"Excellent",

    alerts:[],

    recommendations:[],

    inventoryRisk:false,

    revenueRisk:false,

    customerSatisfaction:100,

    aiPerformance:99,

    updatedAt:new Date()

};

// =====================================
// HEALTH SCORE
// =====================================

function calculateStoreHealthScore(){

    let score=100;

    STORE_HEALTH.alerts=[];

    STORE_HEALTH.recommendations=[];

    // Conversion

    if(

        SALES_ANALYTICS.conversionRate<2

    ){

        score-=15;

        STORE_HEALTH.alerts.push(

            "Low conversion rate"

        );

        STORE_HEALTH.recommendations.push(

            "Increase product recommendations and urgency."

        );

    }

    // Abandoned Cart

    if(

        SALES_ANALYTICS.abandonedCarts>

        SALES_ANALYTICS.recoveredCarts

    ){

        score-=15;

        STORE_HEALTH.alerts.push(

            "High abandoned cart rate"

        );

        STORE_HEALTH.recommendations.push(

            "Increase recovery messages and exit offers."

        );

    }

    // Revenue

    if(

        SALES_ANALYTICS.revenue===0

    ){

        score-=25;

        STORE_HEALTH.revenueRisk=true;

        STORE_HEALTH.alerts.push(

            "Revenue not generated"

        );

    }

    // Inventory

    if(

        INVENTORY_ALERTS.lowStock>

        10

    ){

        score-=10;

        STORE_HEALTH.inventoryRisk=true;

        STORE_HEALTH.alerts.push(

            "Multiple products low in stock"

        );

    }

    // AI Confidence

    if(

        SALES_TRAINING.aiConfidence<85

    ){

        score-=10;

        STORE_HEALTH.alerts.push(

            "AI confidence reduced"

        );

    }

    STORE_HEALTH.score=

    Math.max(

        score,

        0

    );

    updateStoreStatus();

}

// =====================================
// STATUS
// =====================================

function updateStoreStatus(){

    if(

        STORE_HEALTH.score>=90

    ){

        STORE_HEALTH.status=

        "Excellent";

    }

    else if(

        STORE_HEALTH.score>=75

    ){

        STORE_HEALTH.status=

        "Good";

    }

    else if(

        STORE_HEALTH.score>=60

    ){

        STORE_HEALTH.status=

        "Needs Attention";

    }

    else{

        STORE_HEALTH.status=

        "Critical";

    }

}

// =====================================
// CUSTOMER SATISFACTION
// =====================================

function updateCustomerSatisfaction(){

    STORE_HEALTH.customerSatisfaction=

    Math.round(

        (

            SALES_ANALYTICS.conversionRate+

            SALES_TRAINING.aiConfidence

        )/2

    );

}

// =====================================
// AI PERFORMANCE
// =====================================

function updateAIPerformance(){

    STORE_HEALTH.aiPerformance=

    SALES_TRAINING.aiConfidence;

}

// =====================================
// SEND ALERT
// =====================================

async function notifyStoreOwner(){

    try{

        await fetch(

`${CONFIG.API_BASE}/api/dashboard/store-health`,

        {

            method:"POST",

            headers:{

                "Content-Type":

                "application/json"

            },

            body:JSON.stringify({

                health:

                STORE_HEALTH

            })

        });

    }

    catch(error){

        console.error(error);

    }

}

// =====================================
// LIVE MONITOR
// =====================================

function monitorStore(){

    calculateStoreHealthScore();

    updateCustomerSatisfaction();

    updateAIPerformance();

    STORE_HEALTH.updatedAt=

    new Date();

    notifyStoreOwner();

}

// =====================================
// AUTO CHECK
// =====================================

setInterval(

    ()=>{

        monitorStore();

    },

    300000

);

// =====================================
// DASHBOARD
// =====================================

function getStoreHealth(){

    return STORE_HEALTH;

}

// =====================================
// NEXT
// =====================================
//
// PART 35
//
// Final Master Controller
//
// • Initialize Every AI Module
// • Load Store Configuration
// • Connect Backend
// • Event Registration
// • Performance Optimization
// • Global Error Recovery
// • Production Bootstrap
// • Chatbot.js Complete
// =====================================
// PART 35
// Master Controller
// Production Bootstrap
// FINAL CHATBOT INITIALIZER
// =====================================

// =====================================
// LAYBOKA AI
// =====================================

const LAYBOKA_AI={

    version:"1.0.0",

    initialized:false,

    startedAt:null,

    modules:[]

};

// =====================================
// REGISTER
// =====================================

function registerModule(name){

    if(

        !LAYBOKA_AI.modules.includes(name)

    ){

        LAYBOKA_AI.modules.push(name);

    }

}

// =====================================
// INITIALIZE
// =====================================

async function initializeSalesExecutive(){

    try{

        // Visitor

        await initializeVisitor();

        registerModule(

            "Visitor"

        );

        // Customer

        await loadShopperMemory();

        registerModule(

            "Memory"

        );

        // Recommendation

        initializeRecommendationEngine();

        registerModule(

            "Recommendation"

        );

        // Loyalty

        initializeLoyalty();

        registerModule(

            "Loyalty"

        );

        // Bundle

        initializeBundleEngine();

        registerModule(

            "Bundle"

        );

        // Avatar

        initializeAvatar();

        registerModule(

            "Avatar"

        );

        // Voice

        if(

            VOICE_AI.enabled

        ){

            createVoiceButton();

            registerModule(

                "Voice"

            );

        }

        // Analytics

        syncAnalytics();

        registerModule(

            "Analytics"

        );

        // Enterprise

        enterpriseSync();

        registerModule(

            "Enterprise"

        );

        // Store Health

        monitorStore();

        registerModule(

            "Health"

        );

        // AI Training

        retrainAI();

        registerModule(

            "Training"

        );

        // Seasonal

        detectSeasonCampaign();

        showSeasonCampaign();

        registerModule(

            "Campaign"

        );

        // Timeline

        syncCustomerTimeline();

        registerModule(

            "Timeline"

        );

        // Business Report

        uploadBusinessReport();

        registerModule(

            "Dashboard"

        );

        // Ready

        LAYBOKA_AI.initialized=true;

        LAYBOKA_AI.startedAt=

        new Date();

        console.log(

            "Layboka Sales Executive Ready"

        );

    }

    catch(error){

        console.error(

            error

        );

        autoRecover();

    }

}

// =====================================
// RECOVERY
// =====================================

function autoRecover(){

    setTimeout(

        ()=>{

            initializeSalesExecutive();

        },

        3000

    );

}

// =====================================
// PERFORMANCE
// =====================================

function optimizePerformance(){

    window.addEventListener(

        "visibilitychange",

        ()=>{

            if(

                document.hidden

            ){

                stopVoiceListening();

            }

        }

    );

}

// =====================================
// GLOBAL EVENTS
// =====================================

function registerGlobalEvents(){

    document.addEventListener(

        "click",

        ()=>{

            analyticsVisitor();

        }

    );

    window.addEventListener(

        "beforeunload",

        ()=>{

            saveShopperMemory();

        }

    );

}

// =====================================
// START
// =====================================

window.addEventListener(

    "load",

    ()=>{

        optimizePerformance();

        registerGlobalEvents();

        initializeSalesExecutive();

    }

);

// =====================================
// FINAL
// =====================================

window.LaybokaAI={

    version:

    LAYBOKA_AI.version,

    initialized:()=>LAYBOKA_AI.initialized,

    modules:()=>LAYBOKA_AI.modules,

    executive:()=>EXECUTIVE,

    analytics:()=>SALES_ANALYTICS,

    memory:()=>SHOPPER_MEMORY,

    health:()=>STORE_HEALTH

};

// =====================================
// END OF chatbot.js
// =====================================

})();

