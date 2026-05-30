// ==========================================
// public/js/referral.js
// Layboka AI Referral System
// Production Version
// ==========================================

const token =
  localStorage.getItem("token");

// ==========================================
// LOAD REFERRAL DATA
// ==========================================

async function loadReferral() {

  try {

    const res =
      await fetch(
        "/referral/me",
        {
          headers: {
            Authorization:
              "Bearer " + token
          }
        }
      );

    const data =
      await res.json();

    if (!data.success) {
      return;
    }

    // ==========================
    // CODE
    // ==========================

    const codeBox =
      document.getElementById(
        "referralCode"
      );

    if (codeBox) {

      codeBox.innerText =
        data.referralCode;

    }

    // ==========================
    // LINK
    // ==========================

    const linkBox =
      document.getElementById(
        "referralLink"
      );

    if (linkBox) {

      linkBox.value =
        data.referralLink;

    }

    // ==========================
    // STATS
    // ==========================

    const rewards =
      data.rewards || {};

    setText(
      "totalReferrals",
      rewards.total || 0
    );

    setText(
      "starterReferrals",
      rewards.starterReferrals || 0
    );

    setText(
      "growthReferrals",
      rewards.growthReferrals || 0
    );

    setText(
      "premiumReferrals",
      rewards.premiumReferrals || 0
    );

    // ==========================
    // REWARD
    // ==========================

    const rewardBox =
      document.getElementById(
        "rewardBox"
      );

    if (
      rewardBox &&
      rewards.reward
    ) {

      rewardBox.innerHTML = `

      <div class="reward-card">

        <h3>
          🎉 Reward Unlocked
        </h3>

        <p>
          ${rewards.reward.title}
        </p>

        <small>
          ${rewards.reward.value}
        </small>

        <button
          onclick="claimReward()"
          class="claim-btn"
        >
          Claim Reward
        </button>

      </div>

      `;

    }

    // ==========================
    // PROGRESS BAR
    // ==========================

    updateProgress(
      rewards.total || 0
    );

  } catch (err) {

    console.log(err);

  }

}

// ==========================================
// CLAIM REWARD
// ==========================================

async function claimReward() {

  try {

    const res =
      await fetch(
        "/referral/claim",
        {
          method: "POST",

          headers: {

            Authorization:
              "Bearer " + token

          }
        }
      );

    const data =
      await res.json();

    if (data.success) {

      alert(
        "Reward claimed successfully."
      );

      loadReferral();

    } else {

      alert(
        data.message ||
        "Reward unavailable"
      );

    }

  } catch (err) {

    console.log(err);

  }

}

// ==========================================
// COPY CODE
// ==========================================

function copyReferral() {

  const code =
    document.getElementById(
      "referralCode"
    ).innerText;

  navigator.clipboard
    .writeText(code);

  alert(
    "Referral code copied"
  );

}

// ==========================================
// COPY LINK
// ==========================================

function copyReferralLink() {

  const link =
    document.getElementById(
      "referralLink"
    ).value;

  navigator.clipboard
    .writeText(link);

  alert(
    "Referral link copied"
  );

}

// ==========================================
// SHARE WHATSAPP
// ==========================================

function shareWhatsApp() {

  const link =
    document.getElementById(
      "referralLink"
    ).value;

  window.open(

    `https://wa.me/?text=${encodeURIComponent(
      "Join Layboka AI and get started: " +
      link
    )}`,

    "_blank"

  );

}

// ==========================================
// SHARE EMAIL
// ==========================================

function shareEmail() {

  const link =
    document.getElementById(
      "referralLink"
    ).value;

  window.location.href =

    `mailto:?subject=Join Layboka AI&body=${encodeURIComponent(link)}`;

}

// ==========================================
// LOAD LEADERBOARD
// ==========================================

async function loadLeaderboard() {

  try {

    const res =
      await fetch(
        "/referral/leaderboard"
      );

    const data =
      await res.json();

    const box =
      document.getElementById(
        "leaderboard"
      );

    if (
      !box ||
      !data.success
    ) {
      return;
    }

    box.innerHTML = "";

    data.leaderboard
      .forEach((item,index)=>{

        box.innerHTML += `

        <div class="leader-row">

          <span>
            #${index + 1}
          </span>

          <span>
            ${item.store}
          </span>

          <span>
            ${item.referralCount}
          </span>

        </div>

        `;

      });

  } catch (err) {

    console.log(err);

  }

}

// ==========================================
// PROGRESS BAR
// ==========================================

function updateProgress(total) {

  const bar =
    document.getElementById(
      "progressBar"
    );

  if (!bar) return;

  let percent =
    Math.min(
      (total / 2) * 100,
      100
    );

  bar.style.width =
    percent + "%";

}

// ==========================================
// RULES
// ==========================================

function toggleRules() {

  const box =
    document.getElementById(
      "rulesBox"
    );

  if (!box) return;

  box.classList.toggle(
    "show"
  );

}

// ==========================================
// HELPER
// ==========================================

function setText(id,value){

  const el =
    document.getElementById(id);

  if(el){

    el.innerText = value;

  }

}

// ==========================================
// INIT
// ==========================================

loadReferral();

loadLeaderboard();
