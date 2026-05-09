// ===============================
// CLIENT ID
// ===============================

const clientId =
new URLSearchParams(window.location.search)
.get("client");

// ===============================
// FETCH CLIENT DATA
// ===============================

async function loadDashboard(){

  try{

    const res =
    await fetch("/client/" + clientId);

    const data =
    await res.json();

    // =========================
    // BASIC INFO
    // =========================

    const store =
    document.getElementById("storeName");

    const plan =
    document.getElementById("planName");

    const status =
    document.getElementById("statusText");

    const chats =
    document.getElementById("chatCount");

    const revenue =
    document.getElementById("revenueCount");

    const orders =
    document.getElementById("orderCount");

    if(store){
      store.innerHTML = data.store || "-";
    }

    if(plan){
      plan.innerHTML =
      data.plan || "trial";
    }

    if(status){
      status.innerHTML =
      data.status || "trial";
    }

    if(chats){
      chats.innerHTML =
      data.messages || 0;
    }

    if(revenue){
      revenue.innerHTML =
      "₹" + (data.revenue || 0);
    }

    if(orders){
      orders.innerHTML =
      data.orders || 0;
    }

    // =========================
    // PLAN BADGE
    // =========================

    const badge =
    document.getElementById("planBadge");

    if(badge){

      if(data.plan === "premium"){

        badge.innerHTML =
        "PREMIUM";

        badge.style.background =
        "#1f4227";

        badge.style.color =
        "#55ff99";

      } else {

        badge.innerHTML =
        "TRIAL";

        badge.style.background =
        "#4a3512";

        badge.style.color =
        "#ffb347";

      }

    }

    // =========================
    // DAYS LEFT
    // =========================

    const days =
    document.getElementById("daysLeft");

    if(days){

      const now =
      Date.now();

      const trial =
      new Date(data.trialEnds).getTime();

      const diff =
      Math.max(
        0,
        Math.ceil(
          (trial - now) /
          (1000 * 60 * 60 * 24)
        )
      );

      days.innerHTML =
      diff + " Days";

    }

    // =========================
    // UPGRADE BUTTON
    // =========================

    const upgrade =
    document.getElementById("upgradeBtn");

    if(upgrade){

      if(data.paid){

        upgrade.innerHTML =
        "Premium Active";

        upgrade.disabled = true;

      } else {

        upgrade.onclick = ()=>{

          window.location.href =
          "/pricing.html?client=" +
          clientId;

        };

      }

    }

  }catch(err){

    console.log(err);

  }

}

loadDashboard();

// ===============================
// LOGOUT
// ===============================

function logout(){

  localStorage.clear();

  window.location.href =
  "/index.html";

}

// ===============================
// AUTO REFRESH
// ===============================

setInterval(()=>{
  loadDashboard();
},30000);

// ===============================
// MINI CHART
// ===============================

const canvas =
document.getElementById("salesChart");

if(canvas){

  const ctx =
  canvas.getContext("2d");

  const values =
  [20,40,35,70,90,120,150];

  let x = 20;

  ctx.beginPath();

  ctx.strokeStyle = "#ff7a00";

  ctx.lineWidth = 4;

  values.forEach((v,i)=>{

    const y =
    180 - v;

    if(i === 0){

      ctx.moveTo(x,y);

    } else {

      ctx.lineTo(x,y);

    }

    x += 70;

  });

  ctx.stroke();

}
