const fetch = require("node-fetch");

async function sendWhatsApp(phone, message){
  try{
    await fetch("https://api.callmebot.com/whatsapp.php",{
      method:"POST",
      body: JSON.stringify({
        phone,
        text: message
      }),
      headers:{
        "Content-Type":"application/json"
      }
    });
  }catch(e){
    console.log("WhatsApp error", e);
  }
}

module.exports = sendWhatsApp;
