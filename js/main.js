class PortfolioApp {
  constructor() {
    this.currentTheme = this.getStoredTheme() || "dark";
    this.isInitialized = false;
    this.scrollPosition = 0;

    this.elements = {
      themeToggle: document.getElementById("theme-toggle"),
      hamburger: document.getElementById("hamburger"),
      navMenu: document.getElementById("nav-menu"),
      languageSelect: document.getElementById("language-select"),
      body: document.body,
    };

    this.init();
  }

  async init() {
    try {
      this.setTheme(this.currentTheme);
      this.setupEventListeners();
      this.setupMobileNav();
      this.setupPerformanceOptimizations();
      this.setupAccessibility();
      await this.waitForSystems();
      this.setupIntersectionObservers();

      this.isInitialized = true;
      this.dispatchEvent("app:initialized");
    } catch (error) {
      console.error("Failed to initialize portfolio app:", error);
    }
  }

  setupEventListeners() {
    if (this.elements.themeToggle) {
      this.elements.themeToggle.addEventListener("click", () => {
        this.toggleTheme();
      });
    }

    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "T") {
        e.preventDefault();
        this.toggleTheme();
      }
      if (e.key === "Escape") {
        this.closeMobileNav();
      }
    });

    document.addEventListener("projects:loaded", () => {
      if (window.animationSystem) {
        setTimeout(() => {
          window.animationSystem.animateLoadedProjectCards();
        }, 100);
      }
    });

    let resizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.handleResize();
      }, 250);
    });

    document.addEventListener("visibilitychange", () => {
      this.handleVisibilityChange();
    });
  }

  toggleTheme() {
    const newTheme = this.currentTheme === "dark" ? "light" : "dark";
    this.setTheme(newTheme);
  }

  setTheme(theme) {
    this.currentTheme = theme;
    this.elements.body.setAttribute("data-theme", theme);
    this.updateThemeToggleIcon(theme);
    this.storeTheme(theme);
    this.dispatchEvent("theme:changed", { theme });
  }

  updateThemeToggleIcon(theme) {
    if (!this.elements.themeToggle) return;
    const icon = this.elements.themeToggle.querySelector("i");
    if (icon) {
      icon.className = theme === "dark" ? "fas fa-sun" : "fas fa-moon";
    }
  }

  getStoredTheme() {
    try {
      return localStorage.getItem("portfolio-theme");
    } catch {
      return null;
    }
  }

  storeTheme(theme) {
    try {
      localStorage.setItem("portfolio-theme", theme);
    } catch (error) {
      console.warn("Failed to store theme preference:", error);
    }
  }

  setupMobileNav() {
    const hamburger = this.elements.hamburger;
    const navMenu = this.elements.navMenu;

    if (!hamburger || !navMenu) return;

    hamburger.addEventListener("click", () => {
      const isOpen = navMenu.classList.contains("open");
      if (isOpen) {
        this.closeMobileNav();
      } else {
        this.openMobileNav();
      }
    });

    navMenu.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        const isMobile = window.innerWidth <= 900;
        const href = link.getAttribute("href");

        if (isMobile && href && href.startsWith("#")) {
          e.preventDefault();
          this.closeMobileNav(href);
        }
      });
    });

    document.addEventListener("click", (e) => {
      if (
        navMenu.classList.contains("open") &&
        !e.target.closest(".nav-container") &&
        !e.target.closest(".nav-menu")
      ) {
        this.closeMobileNav();
      }
    });
  }

  openMobileNav() {
    if (!this.elements.hamburger || !this.elements.navMenu) return;

    this.scrollPosition = window.scrollY || window.pageYOffset || 0;

    this.elements.navMenu.classList.add("open");
    this.elements.hamburger.classList.add("open");
    this.elements.hamburger.setAttribute("aria-expanded", "true");
    this.elements.body.classList.add("nav-open");
  }

  closeMobileNav(targetSelector) {
    if (!this.elements.hamburger || !this.elements.navMenu) return;
    if (!this.elements.body.classList.contains("nav-open")) return;

    this.elements.navMenu.classList.remove("open");
    this.elements.hamburger.classList.remove("open");
    this.elements.hamburger.setAttribute("aria-expanded", "false");
    this.elements.body.classList.remove("nav-open");

    if (targetSelector && targetSelector.startsWith("#")) {
      const target = document.querySelector(targetSelector);
      if (target) {
        const headerOffset = 70;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        setTimeout(() => {
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }, 300);
      }
    }
  }

  setupPerformanceOptimizations() {
    this.setupImageLazyLoading();
    this.setupScrollThrottling();
    this.preloadCriticalResources();
  }

  setupImageLazyLoading() {
    if ("IntersectionObserver" in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src || img.src;
            img.classList.add("loaded");
            imageObserver.unobserve(img);
          }
        });
      });

      document.querySelectorAll("img[data-src]").forEach((img) => {
        imageObserver.observe(img);
      });
    }
  }

  setupScrollThrottling() {
    let isScrolling = false;

    const throttledScroll = () => {
      if (!isScrolling) {
        requestAnimationFrame(() => {
          this.updateScrollProgress();
          isScrolling = false;
        });
        isScrolling = true;
      }
    };

    window.addEventListener("scroll", throttledScroll, { passive: true });
  }

  preloadCriticalResources() {
    const profileImg = document.getElementById("profile-img");
    if (profileImg) {
      profileImg.style.borderRadius = "50%";
      profileImg.style.objectFit = "cover";
      profileImg.style.display = "block";
      profileImg.style.width = "100%";
      profileImg.style.height = "100%";

      profileImg.onerror = function () {
        console.error("Failed to load the Discord profile image:", this.src);
        const fallbackAvatarUrl = window.discordAvatarFallbackUrl;

        if (fallbackAvatarUrl && this.src !== fallbackAvatarUrl) {
          this.src = fallbackAvatarUrl;
          return;
        }

        this.alt = "Discord profile image unavailable";
      };

      profileImg.onload = function () {
        this.style.display = "block";
        this.style.borderRadius = "50%";
      };
    }
  }

  updateScrollProgress() {
    const scrollTop = window.pageYOffset;
    const documentHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = scrollTop / documentHeight;

    this.dispatchEvent("scroll:progress", { progress: scrollProgress });
  }

  setupAccessibility() {
    this.setupReducedMotion();
  }

  setupReducedMotion() {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const handleReducedMotion = (mediaQuery) => {
      if (
        window.animationSystem &&
        typeof window.animationSystem.setMotionPreference === "function"
      ) {
        window.animationSystem.setMotionPreference(mediaQuery.matches);
      }

      if (mediaQuery.matches) {
        this.elements.body.classList.add("reduce-motion");
        if (window.particleSystem) {
          window.particleSystem.toggleAnimation(false);
        }
      } else {
        this.elements.body.classList.remove("reduce-motion");
        if (window.particleSystem) {
          window.particleSystem.toggleAnimation(true);
        }
      }
    };

    if (prefersReducedMotion.addEventListener) {
      prefersReducedMotion.addEventListener("change", handleReducedMotion);
    } else if (prefersReducedMotion.addListener) {
      prefersReducedMotion.addListener(handleReducedMotion);
    }

    handleReducedMotion(prefersReducedMotion);
  }

  async waitForSystems() {
    const maxWaitTime = 5000;
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      if (this.areSystemsReady()) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  areSystemsReady() {
    return (
      window.animationSystem !== undefined &&
      (window.projectsAPI !== undefined ||
        window.githubAPI !== undefined)
    );
  }

  setupIntersectionObservers() {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            this.dispatchEvent("section:visible", { sectionId });
            this.updateActiveNavigation(sectionId);
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: "-100px 0px",
      }
    );

    document.querySelectorAll("section[id]").forEach((section) => {
      sectionObserver.observe(section);
    });
  }

  updateActiveNavigation(activeSectionId) {
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.remove("active");
      const href = link.getAttribute("href");
      if (href === `#${activeSectionId}`) {
        link.classList.add("active");
      }
    });
  }

  handleResize() {
    if (window.innerWidth > 900) {
      this.closeMobileNav();
    }
    if (window.ScrollTrigger) {
      window.ScrollTrigger.refresh();
    }
    this.dispatchEvent("app:resize");
  }

  handleVisibilityChange() {
    if (document.hidden) {
      if (window.particleSystem && window.particleSystem.toggleAnimation) {
        window.particleSystem.toggleAnimation(false);
      }
    } else {
      if (window.particleSystem && window.particleSystem.toggleAnimation) {
        window.particleSystem.toggleAnimation(true);
      }
    }
  }

  dispatchEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, { detail });
    document.dispatchEvent(event);
  }

  getTheme() {
    return this.currentTheme;
  }

  setDebugMode(enabled) {
    if (enabled) {
      this.elements.body.classList.add("debug-mode");
    } else {
      this.elements.body.classList.remove("debug-mode");
    }
  }

  getSystemInfo() {
    return {
      theme: this.currentTheme,
      initialized: this.isInitialized,
      systems: {
        particles: !!window.particleSystem,
        animations: !!window.animationSystem,
        projects: !!(window.projectsAPI || window.githubAPI),
      },
      performance: {
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        reducedMotion: this.elements.body.classList.contains("reduce-motion"),
      },
    };
  }
}

class MusicController {
  constructor() {
    this.audio = document.getElementById("bg-music");
    this.button = document.getElementById("music-toggle");
    this.volumeSlider = document.getElementById("music-volume");
    this.isPlaying = false;
    this.savedVolume = this.loadVolume();

    if (!this.audio || !this.button) return;

    this.init();
  }

  init() {
    this.audio.volume = this.savedVolume;
    if (this.volumeSlider) {
      this.volumeSlider.value = this.savedVolume * 100;
    }

    this.button.addEventListener("click", () => this.toggle());

    if (this.volumeSlider) {
      this.volumeSlider.addEventListener("input", (e) => {
        const value = e.target.value / 100;
        this.setVolume(value);
      });
    }

    this.play();
  }

  play() {
    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.isPlaying = true;
          this.updateUI();
        })
        .catch(() => {
          const resumeOnInteraction = () => {
            this.audio
              .play()
              .then(() => {
                this.isPlaying = true;
                this.updateUI();
              })
              .catch(() => {});
            document.removeEventListener("click", resumeOnInteraction);
            document.removeEventListener("touchstart", resumeOnInteraction);
            document.removeEventListener("keydown", resumeOnInteraction);
            document.removeEventListener("scroll", resumeOnInteraction);
          };

          document.addEventListener("click", resumeOnInteraction);
          document.addEventListener("touchstart", resumeOnInteraction);
          document.addEventListener("keydown", resumeOnInteraction);
          document.addEventListener("scroll", resumeOnInteraction, { passive: true });
        });
    }
  }

  pause() {
    this.audio.pause();
    this.isPlaying = false;
    this.updateUI();
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  setVolume(value) {
    this.audio.volume = value;
    this.savedVolume = value;
    this.saveVolume(value);
    this.updateVolumeIcon(value);
  }

  updateVolumeIcon(value) {
    if (!this.button) return;
    const icon = this.button.querySelector("i");
    if (!icon) return;

    if (!this.isPlaying || value === 0) {
      icon.className = "fas fa-volume-mute";
    } else if (value < 0.4) {
      icon.className = "fas fa-volume-down";
    } else {
      icon.className = "fas fa-volume-up";
    }
  }

  updateUI() {
    if (!this.button) return;
    const icon = this.button.querySelector("i");
    if (!icon) return;

    if (this.isPlaying) {
      this.updateVolumeIcon(this.audio.volume);
      this.button.classList.add("playing");
      this.button.setAttribute("aria-label", "Pause music");
      this.button.title = "Pause music";
    } else {
      icon.className = "fas fa-volume-mute";
      this.button.classList.remove("playing");
      this.button.setAttribute("aria-label", "Play music");
      this.button.title = "Play music";
    }
  }

  loadVolume() {
    try {
      const stored = localStorage.getItem("portfolio-volume");
      return stored !== null ? parseFloat(stored) : 0.5;
    } catch {
      return 0.5;
    }
  }

  saveVolume(value) {
    try {
      localStorage.setItem("portfolio-volume", value);
    } catch (error) {
      console.warn("Failed to save volume:", error);
    }
  }
}

const portfolioApp = new PortfolioApp();
const musicController = new MusicController();

window.portfolioApp = portfolioApp;
window.musicController = musicController;
