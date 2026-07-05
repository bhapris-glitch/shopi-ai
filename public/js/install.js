// ======================================
// public/js/install.js
// Layboka AI
// Phase 1 - Part 11
// Installation Validation Engine
// ======================================

"use strict";

// ======================================
// INSTALL MODULE
// ======================================

const Install={

initialized:false,

init(){

if(this.initialized) return;

this.cache();

this.bindEvents();

this.initialized=true;

}

};

// ======================================
// CACHE
// ======================================

Install.cache=function(){

this.form=

document.getElementById(
"installationForm"
);

this.shop=

document.getElementById(
"shop"
);

this.email=

document.getElementById(
"email"
);

this.plan=

document.getElementById(
"plan"
);

this.country=

document.getElementById(
"country"
);

this.agree=

document.getElementById(
"agree"
);

this.loading=

document.getElementById(
"installLoading"
);

this.button=

document.getElementById(
"installNow"
);

};

// ======================================
// EVENTS
// ======================================

Install.bindEvents=function(){

if(!this.form) return;

this.form.addEventListener(

"submit",

e=>{

e.preventDefault();

this.startInstallation();

}

);

this.shop.addEventListener(

"blur",

()=>{

this.cleanStore();

}

);

};

// ======================================
// CLEAN STORE
// ======================================

Install.cleanStore=function(){

let shop=

this.shop.value

.trim()

.toLowerCase();

shop=

shop

.replace("https://","")

.replace("http://","")

.replace("/","");

if(

shop &&

!shop.endsWith(

".myshopify.com"

)

){

shop +=

".myshopify.com";

}

this.shop.value=

shop;

};

// ======================================
// VALIDATION
// ======================================

Install.validate=function(){

// Store

const regex=

/^[a-zA-Z0-9-]+\.myshopify\.com$/;

if(

!regex.test(

this.shop.value

)

){

alert(

"Enter a valid Shopify store."

);

this.shop.focus();

return false;

}

// Email

const emailRegex=

/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if(

!emailRegex.test(

this.email.value

)

){

alert(

"Enter a valid email."

);

this.email.focus();

return false;

}

// Terms

if(

!this.agree.checked

){

alert(

"Accept Terms & Privacy Policy."

);

return false;

}

return true;

};

// ======================================
// START
// ======================================

Install.startInstallation=

function(){

this.cleanStore();

if(

!this.validate()

)

return;

this.loading.style.display=

"flex";

this.button.disabled=true;

this.button.innerHTML=

"Preparing...";

setTimeout(()=>{

this.redirect();

},1500);

};

// ======================================
// REDIRECT
// ======================================

Install.redirect=function(){

const params=

new URLSearchParams({

shop:

this.shop.value,

email:

this.email.value,

plan:

this.plan.value,

country:

this.country.value

});

// Backend OAuth endpoint

window.location.href=

"/auth/shopify?"

+

params.toString();

};

// ======================================
// START
// ======================================

window.addEventListener(

"DOMContentLoaded",

()=>{

Install.init();

});

// ======================================
// PHASE 1
// PART 12
// Installation Flow Manager
// ======================================

// ======================================
// STATUS UI
// ======================================

Install.setStatus=function(type,message){

    let statusBox=

    document.getElementById(

        "installStatus"

    );

    if(!statusBox){

        statusBox=

        document.createElement("div");

        statusBox.id=

        "installStatus";

        statusBox.className=

        "install-status";

        this.form.appendChild(

            statusBox

        );

    }

    statusBox.className=

    "install-status "+type;

    statusBox.innerHTML=

    message;

};

// ======================================
// LOADING
// ======================================

Install.showLoading=function(){

    this.loading.style.display=

    "flex";

    this.button.disabled=true;

    this.button.innerHTML=

    "Connecting...";

};

// ======================================
// STOP LOADING
// ======================================

Install.hideLoading=function(){

    this.loading.style.display=

    "none";

    this.button.disabled=false;

    this.button.innerHTML=

    "Install On Shopify";

};

// ======================================
// CHECK EXISTING STORE
// ======================================

Install.checkExistingStore=

async function(){

    try{

        const response=

        await fetch(

        "/api/store/check?shop="+

        encodeURIComponent(

        this.shop.value

        )

        );

        if(!response.ok)

        return false;

        const data=

        await response.json();

        return data.exists===true;

    }

    catch(err){

        console.error(err);

        return false;

    }

};

// ======================================
// INSTALL START
// ======================================

Install.startInstallation=

async function(){

    this.cleanStore();

    if(

        !this.validate()

    ) return;

    this.showLoading();

    this.setStatus(

        "info",

        "Checking your Shopify store..."

    );

    const exists=

    await this.checkExistingStore();

    if(exists){

        this.hideLoading();

        this.setStatus(

            "warning",

            "This Shopify store is already connected."

        );

        return;

    }

    this.setStatus(

        "success",

        "Redirecting to Shopify..."

    );

    setTimeout(()=>{

        this.redirect();

    },1000);

};

// ======================================
// NETWORK ERROR
// ======================================

window.addEventListener(

    "offline",

    ()=>{

        Install.hideLoading();

        Install.setStatus(

            "error",

            "No internet connection."

        );

    }

);
