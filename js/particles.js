(function () {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const isTouchDevice =
    window.matchMedia("(hover: none)").matches ||
    window.matchMedia("(pointer: coarse)").matches;
  let particleContainer;

  window.particleSystem = {
    toggleAnimation(enabled) {
      if (!particleContainer) return;

      if (enabled && !reducedMotion.matches && !document.hidden) {
        particleContainer.play();
      } else {
        particleContainer.pause();
      }
    },
  };

  function loadParticles() {
    if (typeof tsParticles === "undefined") {
      console.warn("tsParticles was not loaded; background particles are disabled.");
      return;
    }

    const container = document.getElementById("particles-js");
    if (!container) return;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    tsParticles
      .load("particles-js", {
        fpsLimit: isMobile ? 30 : 50,
        pauseOnBlur: true,
        pauseOnOutsideViewport: true,
        particles: {
          number: {
            value: isMobile ? 18 : 42,
            density: {
              enable: true,
              width: 900,
              height: 900,
            },
          },
          color: {
            value: ["#00d4ff", "#7c3aed"],
          },
          shape: {
            type: "circle",
          },
          opacity: {
            value: 0.35,
            random: true,
          },
          size: {
            value: isMobile ? 2 : 3,
            random: true,
          },
          links: {
            enable: true,
            distance: isMobile ? 110 : 150,
            color: "#00d4ff",
            opacity: 0.16,
            width: 1,
          },
          move: {
            enable: !reducedMotion.matches,
            speed: isMobile ? 0.45 : 0.7,
            direction: "none",
            random: true,
            straight: false,
            outModes: {
              default: "out",
            },
            bounce: false,
          },
        },
        interactivity: {
          detect_on: "canvas",
          events: {
            onHover: {
              enable: !isTouchDevice && !reducedMotion.matches,
              mode: "grab",
            },
            onClick: {
              enable: !isTouchDevice && !reducedMotion.matches,
              mode: "push",
            },
            resize: true,
          },
          modes: {
            grab: {
              distance: 130,
              links: {
                opacity: 0.35,
              },
            },
            push: {
              quantity: 2,
            },
          },
        },
        retina_detect: true,
      })
      .then((loadedContainer) => {
        particleContainer = loadedContainer;
        window.particleSystem.toggleAnimation(true);
      })
      .catch((error) => {
        console.error("Failed to load background particles:", error);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadParticles, { once: true });
  } else {
    loadParticles();
  }
})();
