// ======================================
// auth.js
// Premium Shopify Install Flow
// ======================================

document.addEventListener("DOMContentLoaded", () => {

  // =========================
  // CREATE AUTH PAGE
  // =========================
  document.body.innerHTML = `

  <div class="auth-container">

    <div class="auth-card">

      <div class="logo">
        🤖 Layboka AI
      </div>

      <h1>
        Connect Your Shopify Store
      </h1>

      <p class="subtitle">
        Install your AI Sales Agent in under 30 seconds.
      </p>

      <div class="features">

        <div class="feature">
          ⚡ AI Sales Chatbot
        </div>

        <div class="feature">
          🛒 Checkout Booster
        </div>

        <div class="feature">
          📈 Conversion Recovery
        </div>

        <div class="feature">
          💬 24/7 Customer Replies
        </div>

      </div>

      <div class="install-box">

        <input
          type="text"
          id="shopInput"
          placeholder="yourstore.myshopify.com"
        >

        <button id="installBtn">
          🚀 Install Free Trial
        </button>

      </div>

      <div id="status"></div>

      <p class="footer-text">
        Secure Shopify OAuth Connection
      </p>

    </div>

  </div>

  `;

  // =========================
  // CSS
  // =========================
  const style = document.createElement("style");

  style.innerHTML = `

  *{
    margin:0;
    padding:0;
    box-sizing:border-box;
    font-family:Poppins,sans-serif;
  }

  body{
    background:
    linear-gradient(
      135deg,
      #020617,
      #071421,
      #0f172a
    );

    min-height:100vh;

    display:flex;
    justify-content:center;
    align-items:center;

    padding:20px;

    overflow:hidden;
  }

  .auth-container{
    width:100%;
    max-width:520px;
  }

  .auth-card{

    background:
    rgba(255,255,255,0.05);

    border:
    1px solid rgba(255,255,255,0.08);

    backdrop-filter:blur(20px);

    border-radius:30px;

    padding:40px;

    text-align:center;

    box-shadow:
    0 20px 60px rgba(0,0,0,0.4);

    animation:fadeUp .8s ease;
  }

  .logo{
    font-size:34px;
    font-weight:700;
    color:#00ffc3;
    margin-bottom:20px;
  }

  h1{
    color:white;
    font-size:34px;
    line-height:1.2;
    margin-bottom:14px;
  }

  .subtitle{
    color:#94a3b8;
    font-size:15px;
    margin-bottom:30px;
    line-height:1.6;
  }

  .features{
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:14px;
    margin-bottom:30px;
  }

  .feature{

    background:
    rgba(255,255,255,0.04);

    border:
    1px solid rgba(255,255,255,0.05);

    padding:16px;

    border-radius:18px;

    color:white;

    font-size:14px;

    transition:0.3s;
  }

  .feature:hover{
    transform:translateY(-4px);
    border-color:#00ffc3;
  }

  .install-box{
    display:flex;
    flex-direction:column;
    gap:14px;
  }

  #shopInput{

    width:100%;

    padding:16px;

    border:none;

    border-radius:16px;

    background:#111827;

    color:white;

    outline:none;

    font-size:15px;

    border:
    1px solid rgba(255,255,255,0.06);
  }

  #installBtn{

    border:none;

    padding:16px;

    border-radius:16px;

    background:
    linear-gradient(
      135deg,
      #00ffc3,
      #00aaff
    );

    color:black;

    font-size:16px;

    font-weight:700;

    cursor:pointer;

    transition:0.3s;
  }

  #installBtn:hover{
    transform:translateY(-3px);
    box-shadow:
    0 10px 30px rgba(0,255,195,0.3);
  }

  #status{
    margin-top:20px;
    color:#00ffc3;
    font-size:14px;
  }

  .footer-text{
    margin-top:26px;
    color:#64748b;
    font-size:13px;
  }

  @keyframes fadeUp{

    from{
      opacity:0;
      transform:translateY(20px);
    }

    to{
      opacity:1;
      transform:translateY(0);
    }

  }

  @media(max-width:600px){

    .auth-card{
      padding:28px;
    }

    h1{
      font-size:28px;
    }

    .features{
      grid-template-columns:1fr;
    }

  }

  `;

  document.head.appendChild(style);

  // =========================
  // INSTALL BUTTON
  // =========================
  const installBtn =
    document.getElementById("installBtn");

  const shopInput =
    document.getElementById("shopInput");

  const status =
    document.getElementById("status");

  installBtn.onclick = () => {

    const shop =
      shopInput.value.trim();

    if(!shop){

      status.innerHTML =
      "⚠️ Enter your Shopify store URL";

      return;
    }

    // VALIDATION
    if(
      !shop.includes(".myshopify.com")
    ){

      status.innerHTML =
      "⚠️ Invalid Shopify domain";

      return;
    }

    // LOADING
    installBtn.innerHTML =
    "⏳ Connecting...";

    installBtn.disabled = true;

    status.innerHTML =
    "Redirecting to Shopify...";

    // REDIRECT TO AUTH
    setTimeout(()=>{

      window.location.href =
      "/auth?shop=" + shop;

    },1000);

  };

});
