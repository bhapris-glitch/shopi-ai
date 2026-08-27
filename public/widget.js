/* Layboka AI — API-gated widget loader (additive) */
(function () {
  var APP = window.LaybokaBase || "https://shopi-ai.onrender.com";
  var store = (window.LaybokaStore || location.hostname).trim();
  var apiKey = window.LaybokaApiKey || "";

  var el = document.getElementById("layboka-widget-loader");
  if (!el) return;

  function injectBot() {
    if (document.getElementById("layboka-chatbot-js")) return;
    var src = APP + "/chatbot.js?shop=" + encodeURIComponent(store);
    var s = document.createElement("script");
    s.id = "layboka-chatbot-js";
    s.src = src;
    s.async = true;
    document.body.appendChild(s);
  }

  function start() {
    if (!store || el.dataset.loaded) return;
    el.dataset.loaded = "1";
    var url =
      APP + "/api/widget/bootstrap?shop=" + encodeURIComponent(store) +
      (apiKey ? "&key=" + encodeURIComponent(apiKey) : "");

    fetch(url)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data || !data.success) {
          console.warn("Layboka: widget not authorized for this shop.");
          return;
        }
        sessionStorage.setItem("layboka_widget_token", data.token);
        injectBot();
      })
      .catch(function () { /* silent */ });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
