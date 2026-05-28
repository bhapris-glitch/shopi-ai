const token =
localStorage.getItem("token");

async function loadReferral(){

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

    document.getElementById(
      "referralCode"
    ).innerHTML =
    data.referralCode;

  }catch(err){
    console.log(err);
  }

}

function copyReferral(){

  const code =
    document.getElementById(
      "referralCode"
    ).innerText;

  navigator.clipboard.writeText(code);

  alert("Referral code copied");

}

function toggleRules(){

  const box =
    document.getElementById(
      "rulesBox"
    );

  box.classList.toggle("show");

}

loadReferral();
