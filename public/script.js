function toggleMenu(){
  const nav = document.getElementById("nav");

  if(nav.style.display === "flex"){
    nav.style.display = "none";
  } else {
    nav.style.display = "flex";
  }
}

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
