// ======================================
// public/js/hero.js
// Layboka AI
// Hero Engine
// Phase 1 - Part 5
// ======================================

"use strict";

// ======================================
// HERO MODULE
// ======================================

const Hero={

initialized:false,

init(){

if(this.initialized) return;

this.cache();

this.reveal();

this.counters();

this.liveDashboard();

this.heroParallax();

this.scrollIndicator();

this.installCTA();

this.initialized=true;

}

};

// ======================================
// CACHE
// ======================================

Hero.cache=function(){

this.hero=

document.querySelector(".hero");

this.preview=

document.querySelector(".hero-preview");

this.installButton=

document.querySelector(".btn-primary");

this.counters=

document.querySelectorAll(".counter");

};

// ======================================
// REVEAL
// ======================================

Hero.reveal=function(){

const items=

document.querySelectorAll(

".hero-badge,.hero-title,.hero-description,.hero-buttons,.hero-companies,.hero-trust,.hero-preview"

);

items.forEach(

(item,index)=>{

item.style.opacity="0";

item.style.transform=

"translateY(40px)";

setTimeout(()=>{

item.style.transition=

"all .8s ease";

item.style.opacity="1";

item.style.transform=

"translateY(0px)";

},

index*120);

}

);

};

// ======================================
// COUNTERS
// ======================================

Hero.counters=function(){

this.counters.forEach(counter=>{

const target=

Number(counter.dataset.target);

let current=0;

const step=

Math.ceil(target/120);

const timer=

setInterval(()=>{

current+=step;

if(current>=target){

current=target;

clearInterval(timer);

}

counter.innerHTML=

target>999

?

current.toLocaleString()

:

current;

},15);

});

};

// ======================================
// LIVE DASHBOARD
// ======================================

Hero.liveDashboard=function(){

const values=

document.querySelectorAll(

".preview-metric strong"

);

if(values.length<4)

return;

setInterval(()=>{

values[0].innerHTML=

(

2400+

Math.floor(

Math.random()*150

)

).toLocaleString();

values[1].innerHTML=

(

1900+

Math.floor(

Math.random()*100

)

).toLocaleString();

values[2].innerHTML=

300+

Math.floor(

Math.random()*30

);

values[3].innerHTML=

"$"+(

18000+

Math.floor(

Math.random()*1000

)

).toLocaleString();

},3500);

};

// ======================================
// PARALLAX
// ======================================

Hero.heroParallax=function(){

if(!this.hero)

return;

this.hero.addEventListener(

"mousemove",

e=>{

const rect=

this.hero.getBoundingClientRect();

const x=

(

e.clientX-

rect.left

)/

rect.width;

const y=

(

e.clientY-

rect.top

)/

rect.height;

this.preview.style.transform=

`rotateY(${(x-.5)*8}deg)
rotateX(${-(y-.5)*8}deg)`;

}

);

this.hero.addEventListener(

"mouseleave",

()=>{

this.preview.style.transform=

"rotateY(0deg) rotateX(0deg)";

}

);

};

// ======================================
// SCROLL
// ======================================

Hero.scrollIndicator=function(){

const indicator=

document.querySelector(

".scroll-indicator"

);

if(!indicator)

return;

indicator.onclick=()=>{

window.scrollTo({

top:

window.innerHeight,

behavior:"smooth"

});

};

};

// ======================================
// INSTALL CTA
// ======================================

Hero.installCTA=function(){

if(!this.installButton)

return;

this.installButton.addEventListener(

"click",

e=>{

e.preventDefault();

if(

typeof

openInstallationWizard===

"function"

){

openInstallationWizard();

}

else{

console.warn(

"Installation module not loaded."

);

}

}

);

};

// ======================================
// START
// ======================================

window.addEventListener(

"DOMContentLoaded",

()=>{

Hero.init();

});
