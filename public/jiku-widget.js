/**
 * Jikū — widget de réservation (JIKU-92).
 *
 * Chargeur autonome, sans dépendance. Balisage d'accroche :
 *
 *   <script src="https://<hôte>/jiku-widget.js" defer></script>
 *   <div data-jiku-widget data-token="VOTRE_JETON"></div>
 *
 * Le jeton est celui du lien de réservation partagé du service (GET
 * /services/{id}/booking-link dans l'espace organisateur). Le script crée une
 * iframe pointant vers la page embarrable /widget/{token} du même hôte et suit sa
 * hauteur. La page d'accueil de votre site doit autoriser l'encart : aucune
 * configuration CORS n'est requise, l'iframe est un simple chargement de page.
 */
(function () {
  "use strict";

  if (window.__jikuWidgetLoaded) {
    return;
  }
  window.__jikuWidgetLoaded = true;

  var scriptUrl =
    document.currentScript && document.currentScript.src ? document.currentScript.src : "";
  var origin = "";
  try {
    origin = scriptUrl ? new URL(scriptUrl).origin : window.location.origin;
  } catch (e) {
    origin = window.location.origin;
  }

  function mount(el) {
    if (el.getAttribute("data-jiku-mounted")) {
      return;
    }
    el.setAttribute("data-jiku-mounted", "true");

    var token = (el.getAttribute("data-token") || "").trim();
    if (!token) {
      console.warn("[Jiku widget] data-token is required.");
      return;
    }
    var base = (el.getAttribute("data-base") || origin).replace(/\/$/, "");
    var minHeight = parseInt(el.getAttribute("data-minheight") || "520", 10);
    var lang = (el.getAttribute("data-lang") || "").trim();

    var frame = document.createElement("iframe");
    frame.setAttribute("data-jiku-widget-frame", "true");
    frame.setAttribute("title", "Prendre rendez-vous");
    frame.setAttribute("loading", "lazy");
    frame.style.width = "100%";
    frame.style.border = "0";
    frame.style.display = "block";
    frame.style.height = minHeight + "px";
    frame.style.overflow = "hidden";
    frame.src = base + "/widget/" + encodeURIComponent(token) + (lang ? "?lang=" + encodeURIComponent(lang) : "");
    el.appendChild(frame);

    window.addEventListener("message", function (event) {
      if (event.origin !== origin) {
        return;
      }
      if (event.source !== frame.contentWindow) {
        return;
      }
      var data = event.data;
      if (data && data.type === "jiku-widget:height" && typeof data.height === "number") {
        frame.style.height = Math.max(minHeight, data.height) + "px";
      }
    });
  }

  function init() {
    var nodes = document.querySelectorAll("[data-jiku-widget]");
    for (var i = 0; i < nodes.length; i++) {
      mount(nodes[i]);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
