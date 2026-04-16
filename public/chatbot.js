(function(){
  const box = document.createElement("div");

  box.innerHTML = `
  <div style="position:fixed;bottom:20px;right:20px;width:300px;background:#111;border-radius:12px;padding:10px;color:white;font-family:Arial;box-shadow:0 0 20px rgba(0,0,0,0.5);">
    
    <div id="chat" style="height:200px;overflow:auto;"></div>

    <div id="typing" style="display:none;font-size:12px;color:gray;">AI is typing...</div>

    <input id="input" placeholder="Ask something..." style="width:100%;padding:8px;margin-top:5px;">
  </div>
  `;
setTimeout(()=>{
  const chat = document.getElementById("chat");
  chat.innerHTML += "<div>👋 Hi! Need help choosing a product?</div>";
}, 2000);
  document.body.appendChild(box);

  const input = document.getElementById("input");
  const chat = document.getElementById("chat");
  const typing = document.getElementById("typing");

  function addMessage(text, type){
    const div = document.createElement("div");
    div.style.margin = "5px 0";
    div.style.textAlign = type === "user" ? "right" : "left";
    div.innerHTML = "<span style='background:"+ (type==="user"?"#00ffcc":"#333") +";padding:6px 10px;border-radius:10px;'>"+text+"</span>";
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
  }

  function fakeAIResponse(msg){
    typing.style.display = "block";

    setTimeout(()=>{
      typing.style.display = "none";

      let reply = "I can help you choose the best product 😊";

      if(msg.toLowerCase().includes("price")){
        reply = "We have great offers available right now!";
      }

      addMessage(reply, "ai");
    }, 1500);
  }

  input.addEventListener("keypress", (e)=>{
    if(e.key==="Enter"){
      addMessage(input.value, "user");
      fakeAIResponse(input.value);
      input.value="";
    }
  });

})();
