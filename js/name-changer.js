(function () {
  "use strict";

  function init() {
    updateYear();
    setupNameChanger();
  }

  function updateYear() {
    const yearEl = document.getElementById("current-year");
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }

  function setupNameChanger() {
    const names = ["아부 알훈", "Hany Samir", "Abu Al-Hun"];
    let currentIndex = 0;

    const targets = [
      document.getElementById("name-changer"),
      document.getElementById("footer-name-changer"),
    ].filter(Boolean);

    if (targets.length === 0) return;

    function changeName() {
      currentIndex = (currentIndex + 1) % names.length;
      const newName = names[currentIndex];

      targets.forEach(function (el) {
        el.style.transition = "opacity 0.4s ease, transform 0.4s ease";
        el.style.opacity = "0";
        el.style.transform = "translateY(-8px)";

        setTimeout(function () {
          el.textContent = newName;
          if (el.hasAttribute("data-text")) {
            el.setAttribute("data-text", newName);
          }
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
        }, 400);
      });
    }

    setInterval(changeName, 30000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();