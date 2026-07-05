// ======================================
// public/js/navbar.js
// Layboka AI
// Premium Navbar
// Phase 1 - Part 6
// ======================================

"use strict";

// ======================================
// NAVBAR MODULE
// ======================================

const Navbar={

initialized:false,

init(){

if(this.initialized) return;

this.cache();

this.bindEvents();

this.updateNavbar();

this.updateActiveLink();

this.initialized=true;

}

};

// ======================================
// CACHE
// ======================================

Navbar.cache=function(){

this.navbar=
document.querySelector(".navbar");

this.mobileButton=
document.getElementById("mobileMenuButton");

this.desktopNav=
document.querySelector(".desktop-nav");

this.links=
document.querySelectorAll(".desktop-nav a");

};

// ======================================
// EVENTS
// ======================================

Navbar.bindEvents=function(){

window.addEventListener(
"scroll",
()=>{

this.updateNavbar();
this.updateActiveLink();

});

window.addEventListener(
"resize",
()=>{

if(window.innerWidth>992){

document.body.classList.remove(
"mobile-nav-open"
);

this.mobileButton?.classList.remove(
"open"
);

}

});

this.mobileButton?.addEventListener(

"click",

()=>{

document.body.classList.toggle(
"mobile-nav-open"
);

this.mobileButton.classList.toggle(
"open"
);

}

);

// Close when clicking links

this.links.forEach(link=>{

link.addEventListener(

"click",

()=>{

document.body.classList.remove(
"mobile-nav-open"
);

this.mobileButton?.classList.remove(
"open"
);

}

);

});

// ESC key

document.addEventListener(

"keydown",

e=>{

if(e.key==="Escape"){

document.body.classList.remove(
"mobile-nav-open"
);

this.mobileButton?.classList.remove(
"open"
);

}

});

document.addEventListener(

"click",

e=>{

if(

!this.desktopNav?.contains(e.target) &&

!this.mobileButton?.contains(e.target)

){

document.body.classList.remove(
"mobile-nav-open"
);

this.mobileButton?.classList.remove(
"open"
);

}

});

};

// ======================================
// STICKY
// ======================================

Navbar.updateNavbar=function(){

if(!this.navbar) return;

if(window.scrollY>40){

this.navbar.classList.add(
"navbar-scrolled"
);

}

else{

this.navbar.classList.remove(
"navbar-scrolled"
);

}

};

// ======================================
// ACTIVE LINK
// ======================================

Navbar.updateActiveLink=function(){

const sections=
document.querySelectorAll("section[id]");

let current="";

sections.forEach(section=>{

const top=
section.offsetTop-140;

const height=
section.offsetHeight;

if(

window.scrollY>=top &&

window.scrollY<top+height

){

current=section.id;

}

});

this.links.forEach(link=>{

link.classList.remove("active");

const href=
link.getAttribute("href");

if(href==="#"+current){

link.classList.add("active");

}

});

};

// ======================================
// SMOOTH SCROLL
// ======================================

document.addEventListener(

"click",

e=>{

const link=
e.target.closest("a[href^='#']");

if(!link) return;

const target=
document.querySelector(

link.getAttribute("href")

);

if(!target) return;

e.preventDefault();

window.scrollTo({

top:
target.offsetTop-90,

behavior:"smooth"

});

});

// ======================================
// START
// ======================================

window.addEventListener(

"DOMContentLoaded",

()=>{

Navbar.init();

});

