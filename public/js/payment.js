// ======================================
// payment.js
// Layboka AI
// Payment Page - shopi-ai/public/js/payment.js
// Production Ready
// PART 1
// ======================================

"use strict";

// ======================================
// CONFIG
// ======================================

const PAYMENT = {

    billing: "monthly",

    selectedPlan: "growth",

    prices: {

        monthly: {

            starter: 25,

            growth: 59,

            premium: 149

        },

        yearly: {

            starter: 240,

            growth: 566,

            premium: 1430

        }

    }

};

// ======================================
// DOM
// ======================================

const billingToggle =

document.getElementById(

    "billingToggle"

);

const summaryPlan =

document.getElementById(

    "summaryPlan"

);

const summaryBilling =

document.getElementById(

    "summaryBilling"

);

const summaryPrice =

document.getElementById(

    "summaryPrice"

);

const summaryTotal =

document.getElementById(

    "summaryTotal"

);

const mobileButton =

document.getElementById(

    "mobileMenuButton"

);

const mobileMenu =

document.getElementById(

    "mobileMenu"

);

// ======================================
// MOBILE MENU
// ======================================

if(

mobileButton &&

mobileMenu

){

mobileButton.addEventListener(

"click",

()=>{

mobileMenu.classList.toggle(

"active"

);

mobileButton.classList.toggle(

"active"

);

}

);

}

// ======================================
// PLAN BUTTONS
// ======================================

const planButtons =

document.querySelectorAll(

".plan-card"

);

planButtons.forEach(

(card)=>{

card.addEventListener(

"click",

()=>{

const plan=

card.dataset.plan;

if(

!plan ||

plan==="enterprise"

)

return;

PAYMENT.selectedPlan=

plan;

highlightPlan();

updateSummary();

}

);

}

);

// ======================================
// PLAN UI
// ======================================

function highlightPlan(){

planButtons.forEach(

(card)=>{

card.classList.remove(

"selected"

);

if(

card.dataset.plan===

PAYMENT.selectedPlan

){

card.classList.add(

"selected"

);

}

}

);

}

// ======================================
// BILLING TOGGLE
// ======================================

if(

billingToggle

){

billingToggle.addEventListener(

"change",

()=>{

PAYMENT.billing=

billingToggle.checked

?

"yearly"

:

"monthly";

updateSummary();

}

);

}

// ======================================
// UPDATE SUMMARY
// ======================================

function updateSummary(){

const plan=

PAYMENT.selectedPlan;

const billing=

PAYMENT.billing;

const price=

PAYMENT.prices

[billing]

[plan];

if(summaryPlan){

summaryPlan.textContent=

capitalize(plan);

}

if(summaryBilling){

summaryBilling.textContent=

capitalize(

billing

);

}

if(summaryPrice){

summaryPrice.textContent=

"$"+

price.toFixed(2);

}

if(summaryTotal){

summaryTotal.textContent=

"$"+

price.toFixed(2);

}

}

// ======================================
// CAPITALIZE
// ======================================

function capitalize(

text

){

return

text.charAt(0)

.toUpperCase()

+

text.slice(1);

}

// ======================================
// INIT
// ======================================

highlightPlan();

updateSummary();

// ======================================
// NEXT
// ======================================
//
// PART 2
//
// • Billing Form Validation
// • Referral Code Logic
// • Continue Button
// • Customer Data

// ======================================
// PART 2
// Billing Validation
// Referral Code
// Continue Checkout
// ======================================

// ======================================
// DOM
// ======================================

const billingForm =
document.getElementById(
    "billingForm"
);

const continueStripe =
document.getElementById(
    "continueStripe"
);

const referralInput =
document.getElementById(
    "referralCode"
);

const applyReferral =
document.getElementById(
    "applyReferral"
);

const referralStatus =
document.getElementById(
    "referralStatus"
);

// ======================================
// CUSTOMER
// ======================================

const CUSTOMER = {

    fullName: "",

    business: "",

    email: "",

    phone: "",

    country: "",

    state: "",

    city: "",

    zip: "",

    tax: "",

    referralCode: ""

};

// ======================================
// EMAIL
// ======================================

function validateEmail(email){

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    .test(email);

}

// ======================================
// FORM
// ======================================

function validateBillingForm(){

    CUSTOMER.fullName =
    document.getElementById(
        "customerName"
    ).value.trim();

    CUSTOMER.business =
    document.getElementById(
        "businessName"
    ).value.trim();

    CUSTOMER.email =
    document.getElementById(
        "customerEmail"
    ).value.trim();

    CUSTOMER.phone =
    document.getElementById(
        "customerPhone"
    ).value.trim();

    CUSTOMER.country =
    document.getElementById(
        "customerCountry"
    ).value;

    CUSTOMER.state =
    document.getElementById(
        "customerState"
    ).value.trim();

    CUSTOMER.city =
    document.getElementById(
        "customerCity"
    ).value.trim();

    CUSTOMER.zip =
    document.getElementById(
        "customerZip"
    ).value.trim();

    CUSTOMER.tax =
    document.getElementById(
        "taxNumber"
    ).value.trim();

    if(CUSTOMER.fullName===""){

        alert(
            "Please enter your full name."
        );

        return false;

    }

    if(
        !validateEmail(
            CUSTOMER.email
        )
    ){

        alert(
            "Please enter a valid email."
        );

        return false;

    }

    if(CUSTOMER.country===""){

        alert(
            "Please select country."
        );

        return false;

    }

    return true;

}

// ======================================
// REFERRAL
// ======================================

function applyReferralCode(){

    CUSTOMER.referralCode =
    referralInput.value

    .trim()

    .toUpperCase();

    if(
        CUSTOMER.referralCode===""

    ){

        referralStatus.innerHTML =

        "<span class='error'>Please enter a referral code.</span>";

        return;

    }

    referralStatus.innerHTML =

    "<span class='loading'>Checking referral...</span>";

    // Backend validation in Part 3

    setTimeout(()=>{

        referralStatus.innerHTML=

        "<span class='success'>Referral linked successfully.<br>Rewards unlock only after both referrer and referee complete 15 active subscription days.</span>";

    },800);

}

if(applyReferral){

    applyReferral.addEventListener(

        "click",

        applyReferralCode

    );

}

// ======================================
// CONTINUE
// ======================================

if(continueStripe){

continueStripe.addEventListener(

"click",

()=>{

if(

!validateBillingForm()

)

return;

continueStripe.disabled=true;

continueStripe.innerHTML=

"Processing...";

setTimeout(()=>{

continueStripe.innerHTML=

"Redirecting To Stripe...";

},800);

}

);

}

// ======================================
// NEXT
// ======================================

// Load Stripe JS in Payment.html:
// <script src="https://js.stripe.com/v3/"></script>
// Set your publishable key:
// window.STRIPE_PUBLIC_KEY = "pk_live_xxxxxxxxx";

// ======================================
// PART 3
// Stripe Checkout
// FAQ
// Payment API
// Production Ready
// ======================================

// ======================================
// CONFIG
// ======================================

const API_BASE =

"https://shopi-ai.onrender.com";

// ======================================
// STRIPE
// ======================================

let stripe = null;

let elements = null;

let cardElement = null;

// ======================================
// INIT STRIPE
// ======================================

async function initializeStripe(){

    if(

        typeof Stripe==="undefined"

    ){

        console.warn(

            "Stripe SDK not loaded."

        );

        return;

    }

    stripe = Stripe(

        window.STRIPE_PUBLIC_KEY

    );

    elements = stripe.elements({

        appearance:{

            theme:"stripe"

        }

    });

    cardElement =

    elements.create(

        "card",

        {

            hidePostalCode:false

        }

    );

    cardElement.mount(

        "#card-element"

    );

    cardElement.on(

        "change",

        function(event){

            const error =

            document.getElementById(

                "card-errors"

            );

            if(event.error){

                error.textContent=

                event.error.message;

            }else{

                error.textContent="";

            }

        }

    );

}

// ======================================
// STRIPE CHECKOUT
// ======================================

async function startStripeCheckout(){

    try{

        const response =

        await fetch(

            API_BASE+

            "/api/payment/create-checkout",

            {

                method:"POST",

                headers:{

                    "Content-Type":

                    "application/json"

                },

                body:JSON.stringify({

                    customer:CUSTOMER,

                    plan:

                    PAYMENT.selectedPlan,

                    billing:

                    PAYMENT.billing,

                    referralCode:

                    CUSTOMER.referralCode

                })

            }

        );

        const result =

        await response.json();

        if(

            !result.success

        ){

            throw new Error(

                result.message

            );

        }

        const confirm =

        await stripe.confirmCardPayment(

            result.clientSecret,

            {

                payment_method:{

                    card:cardElement,

                    billing_details:{

                        name:

                        CUSTOMER.fullName,

                        email:

                        CUSTOMER.email

                    }

                }

            }

        );

        if(confirm.error){

            showPaymentError(

                confirm.error.message

            );

            return;

        }

        if(

            confirm.paymentIntent

            &&

            confirm.paymentIntent.status===

            "succeeded"

        ){

            paymentSuccess(

                confirm.paymentIntent.id

            );

        }

    }

    catch(error){

        showPaymentError(

            error.message

        );

    }

}

// ======================================
// PAYMENT BUTTON
// ======================================

const stripeForm=

document.getElementById(

    "stripe-payment-form"

);

if(

stripeForm

){

stripeForm.addEventListener(

"submit",

function(e){

e.preventDefault();

if(

!validateBillingForm()

)

return;

startStripeCheckout();

}

);

}

// ======================================
// PAYMENT SUCCESS
// ======================================

function paymentSuccess(

paymentId

){

window.location.href=

"/success.html"

+

"?payment="

+

paymentId;

}

// ======================================
// PAYMENT ERROR
// ======================================

function showPaymentError(

message

){

const error=

document.getElementById(

"card-errors"

);

if(error){

error.innerHTML=

message;

}

}

// ======================================
// FAQ
// ======================================

const faqQuestions=

document.querySelectorAll(

".faq-question"

);

faqQuestions.forEach(

(button)=>{

button.addEventListener(

"click",

()=>{

const item=

button.parentElement;

const opened=

item.classList.contains(

"active"

);

document

.querySelectorAll(

".faq-item"

)

.forEach(

(i)=>{

i.classList.remove(

"active"

);

}

);

if(!opened){

item.classList.add(

"active"

);

}

}

);

}

);

// ======================================
// PAGE LOAD
// ======================================

document.addEventListener(

"DOMContentLoaded",

()=>{

initializeStripe();

}

// ======================================
// END
// ======================================
