// ===============================
// MOBILE MENU
// ===============================

function toggleMenu(){

  const nav = document.getElementById("nav");

  nav.classList.toggle("show");

}

// ===============================
// CLOSE MENU ON CLICK
// ===============================

document.querySelectorAll("#nav a").forEach(link=>{

  link.addEventListener("click",()=>{

    const nav = document.getElementById("nav");

    nav.classList.remove("show");

  });

});

// ===============================
// GEO PRICING
// ===============================

document.addEventListener("DOMContentLoaded", () => {

  const basic = document.getElementById("basicPrice");
  const premium = document.getElementById("premiumPrice");

  // DEFAULT FAST LOAD
  if(basic) basic.innerText = "₹299/month";
  if(premium) premium.innerText = "₹799/month";

  // COUNTRY DETECT
  fetch("https://ipapi.co/json/")

    .then(res => res.json())

    .then(data => {

      console.log("Country:", data.country);

      if(!basic || !premium){
        return;
      }

      // INDIA
      if(data.country === "IN"){

        basic.innerText = "₹299/month";
        premium.innerText = "₹799/month";

      }

      // GLOBAL
      else {

        basic.innerText = "$8/month";
        premium.innerText = "$15/month";

      }

    })

    .catch(err => {

      console.log("Geo error:", err);

      // FALLBACK
      if(basic) basic.innerText = "$8/month";
      if(premium) premium.innerText = "$15/month";

    });

});

// ===============================
// TESTIMONIAL AUTO SLIDER
// ===============================

let testimonialIndex = 0;

function showTestimonials(){

  const items =
  document.querySelectorAll(".testimonial");

  if(items.length === 0){
    return;
  }

  items.forEach(el => {
    el.classList.remove("active");
  });

  testimonialIndex++;

  if(testimonialIndex >= items.length){
    testimonialIndex = 0;
  }

  items[testimonialIndex]
  .classList.add("active");

}

setInterval(showTestimonials, 3000);

// ===============================
// SCROLL REVEAL
// ===============================

const revealElements =
document.querySelectorAll(`
.fade-up,
.style-20,
.style-21,
.style-22,
.style-23,
.style-25,
.style-26,
.style-27,
.style-28,
.style-29,
.style-30,
.features div,
.plan,
.card
`);

function revealOnScroll(){

  revealElements.forEach(el=>{

    const top =
    el.getBoundingClientRect().top;

    if(top < window.innerHeight - 80){

      el.style.opacity = "1";

      el.style.transform =
      "translateY(0px)";

    }

  });

}

window.addEventListener("scroll", revealOnScroll);

revealOnScroll();

// ===============================
// GLOW BUTTON EFFECT
// ===============================

document.querySelectorAll(`
.btn,
button,
.pricing-btn
`).forEach(btn=>{

  btn.addEventListener("mousemove",(e)=>{

    const x = e.offsetX;
    const y = e.offsetY;

    btn.style.background = `
    radial-gradient(
      circle at ${x}px ${y}px,
      #ffb347,
      #ff7a00
    )
    `;

  });

  btn.addEventListener("mouseleave",()=>{

    btn.style.background =
    "linear-gradient(90deg,#ff7a00,#ffb347)";

  });

});

// ===============================
// FLOATING HERO IMAGE
// ===============================

const heroImg =
document.querySelector(".hero-right img");

if(heroImg){

  let position = 0;

  setInterval(()=>{

    position += 0.02;

    heroImg.style.transform =
    `translateY(${Math.sin(position) * 10}px)`;

  },30);

}

// ===============================
// AUTO COUNTER
// ===============================

const counters =
document.querySelectorAll("[data-counter]");

function runCounter(counter){

  const target =
  Number(counter.dataset.counter);

  let count = 0;

  const speed = target / 80;

  function update(){

    count += speed;

    if(count < target){

      counter.innerText =
      Math.floor(count);

      requestAnimationFrame(update);

    } else {

      counter.innerText = target;

    }

  }

  update();

}

counters.forEach(counter=>{
  runCounter(counter);
});

// ===============================
// NAV SHADOW ON SCROLL
// ===============================

window.addEventListener("scroll",()=>{

  const header =
  document.querySelector(".header");

  if(!header){
    return;
  }

  if(window.scrollY > 20){

    header.style.boxShadow =
    "0 10px 40px rgba(0,0,0,0.3)";

  } else {

    header.style.boxShadow = "none";

  }

});

// ===============================
// SMOOTH FADE START
// ===============================

window.addEventListener("load",()=>{

  document.body.style.opacity = "1";

});
