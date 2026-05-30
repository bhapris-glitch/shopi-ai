// ======================================
// public/js/dashboard.js
// Layboka AI Dashboard
// Production Version
// ======================================

// ======================================
// CONFIG
// ======================================

const clientId =
new URLSearchParams(window.location.search)
.get("client");

const token =
localStorage.getItem("token");

// ======================================
// INIT
// ======================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadDashboard();
    setupLivePreview();

    setInterval(
      loadDashboard,
      30000
    );

  }
);

// ======================================
// LOAD DASHBOARD
// ======================================

async function loadDashboard(){

  try{

    const res =
      await fetch(
        "/client/" + clientId
      );

    const data =
      await res.json();

    updateDashboard(data);

    await loadReferralData();

  }catch(err){

    console.log(
      "Dashboard Error:",
      err
    );

  }

}

// ======================================
// UPDATE DASHBOARD
// ======================================

function updateDashboard(data){

  setText(
    "chatCount",
    data.messages || 0
  );

  setText(
    "revenueCount",
    "$" + (data.revenue || 0)
  );

  setText(
    "recoveryCount",
    data.recoveredCarts || 0
  );

  setText(
    "planName",
    capitalize(
      data.plan || "free"
    )
  );

  // Agent

  if(data.agentName){

    const preview =
      document.getElementById(
        "previewAgentName"
      );

    if(preview){

      preview.textContent =
        data.agentName;

    }

  }

  if(data.agentAvatar){

    const avatar =
      document.getElementById(
        "previewAvatar"
      );

    if(avatar){

      avatar.src =
        data.agentAvatar;

    }

  }

  renderPlanFeatures(
    data.plan
  );

}

// ======================================
// PLAN FEATURES
// ======================================

function renderPlanFeatures(plan){

  const potentialRevenue =
    document.getElementById(
      "potentialRevenue"
    );

  if(potentialRevenue){

    if(plan === "free"){

      potentialRevenue.innerHTML =
      "$347";

    }else{

      potentialRevenue.innerHTML =
      "Unlocked";

    }

  }

}

// ======================================
// REFERRAL
// ======================================

async function loadReferralData(){

  try{

    const res =
      await fetch(
        "/referral/me",
        {
          headers:{
            Authorization:
            "Bearer " + token
          }
        }
      );

    const data =
      await res.json();

    if(!data.success) return;

    const link =
      document.getElementById(
        "referralLink"
      );

    if(link){

      link.innerHTML =
      data.referralLink;

    }

  }catch(err){

    console.log(err);

  }

}

// ======================================
// COPY REFERRAL
// ======================================

function copyReferralLink(){

  const text =
    document.getElementById(
      "referralLink"
    ).innerText;

  navigator.clipboard
  .writeText(text);

  alert(
    "Referral link copied"
  );

}

// ======================================
// SAVE AGENT SETTINGS
// ======================================

async function saveAgentSettings(){

  try{

    const agentName =
      document.getElementById(
        "agentName"
      ).value;

    const storeDisplayName =
      document.getElementById(
        "storeDisplayName"
      ).value;

    const avatarFile =
      document.getElementById(
        "agentAvatar"
      ).files[0];

    let agentAvatar = "";

    if(avatarFile){

      agentAvatar =
      await toBase64(
        avatarFile
      );

    }

    const res =
      await fetch(
        "/update-agent-settings",
        {

          method:"POST",

          headers:{
            "Content-Type":
            "application/json",

            Authorization:
            "Bearer " + token
          },

          body:JSON.stringify({

            agentName,
            storeDisplayName,
            agentAvatar

          })

        }
      );

    const data =
      await res.json();

    if(data.success){

      alert(
        "✅ AI Branding Saved"
      );

      loadDashboard();

    }

  }catch(err){

    console.log(err);

  }

}

// ======================================
// LIVE PREVIEW
// ======================================

function setupLivePreview(){

  const nameInput =
    document.getElementById(
      "agentName"
    );

  const avatarInput =
    document.getElementById(
      "agentAvatar"
    );

  const previewName =
    document.getElementById(
      "previewAgentName"
    );

  const previewAvatar =
    document.getElementById(
      "previewAvatar"
    );

  if(nameInput){

    nameInput.addEventListener(
      "input",
      () => {

        previewName.innerHTML =
        nameInput.value ||
        "Emma";

      }
    );

  }

  if(avatarInput){

    avatarInput.addEventListener(
      "change",
      () => {

        const file =
          avatarInput.files[0];

        if(file){

          previewAvatar.src =
          URL.createObjectURL(
            file
          );

        }

      }
    );

  }

}

// ======================================
// HELPERS
// ======================================

function setText(id,value){

  const el =
    document.getElementById(id);

  if(el){

    el.innerHTML = value;

  }

}

function capitalize(text){

  return text
    ? text.charAt(0)
      .toUpperCase() +
      text.slice(1)
    : "";

}

function toBase64(file){

  return new Promise(
    (resolve,reject)=>{

      const reader =
        new FileReader();

      reader.readAsDataURL(
        file
      );

      reader.onload =
        () =>
          resolve(
            reader.result
          );

      reader.onerror =
        reject;

    }
  );

}

// ======================================
// RULES POPUP
// ======================================

function toggleRules(){

  const box =
    document.getElementById(
      "rulesBox"
    );

  if(box){

    box.classList.toggle(
      "show"
    );

  }

}

// ======================================
// LOGOUT
// ======================================

function logout(){

  localStorage.clear();

  window.location.href =
    "/index.html";

}
