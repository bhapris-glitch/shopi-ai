function toggleMenu(){
  const nav = document.getElementById("nav");

  if(nav.style.display === "flex"){
    nav.style.display = "none";
  } else {
    nav.style.display = "flex";
  }
}

// 🌍 DETECT USER COUNTRY
fetch("https://ipapi.co/json/")
  .then(res => res.json())
  .then(data => {

    const country = data.country;

    if(country === "IN"){
      document.getElementById("basicPrice").innerText = "₹299/month";
      document.getElementById("premiumPrice").innerText = "₹799/month";
    } else {
      document.getElementById("basicPrice").innerText = "$8/month";
      document.getElementById("premiumPrice").innerText = "$15/month";
    }

  })
  .catch(()=>{
    // fallback
    document.getElementById("basicPrice").innerText = "$8/month";
    document.getElementById("premiumPrice").innerText = "$15/month";
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
