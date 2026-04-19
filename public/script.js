function toggleMenu(){
  const nav = document.getElementById("nav");

  if(nav.style.display === "flex"){
    nav.style.display = "none";
  } else {
    nav.style.display = "flex";
  }
}

// 🌍 DETECT USER COUNTRY
document.addEventListener("DOMContentLoaded", () => {

  const basic = document.getElementById("basicPrice");
  const premium = document.getElementById("premiumPrice");

  if(!basic || !premium){
    console.log("Pricing elements not found");
    return;
  }

  // 🔥 DEFAULT (fast loading UX)
  basic.innerText = "₹299/month";
  premium.innerText = "₹799/month";

  // 🌍 FETCH LOCATION
  fetch("https://ipapi.co/json/")
    .then(res => res.json())
    .then(data => {

      console.log("User country:", data.country);

      if(data.country === "IN"){
        basic.innerText = "₹299/month";
        premium.innerText = "₹799/month";
      } else {
        basic.innerText = "$8/month";
        premium.innerText = "$15/month";
      }

    })
    .catch(err => {
      console.log("Geo error:", err);

      // 🌍 FALLBACK → USD
      basic.innerText = "$8/month";
      premium.innerText = "$15/month";
    });

});


// TESTIMONIAL AUTO SLIDER
let index = 0;

function showTestimonials(){
  const items = document.querySelectorAll(".testimonial");

  items.forEach(el => el.classList.remove("active"));

  index++;
  if(index >= items.length) index = 0;

  items[index].classList.add("active");
}

setInterval(showTestimonials, 3000);
