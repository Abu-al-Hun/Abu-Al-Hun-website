class AnimationSystem {
  constructor() {
    this.isGSAPLoaded = typeof gsap !== "undefined";
    this.isScrollTriggerLoaded = typeof ScrollTrigger !== "undefined";
    this.prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    this.isTouchDevice =
      window.matchMedia("(hover: none)").matches ||
      window.matchMedia("(pointer: coarse)").matches;
    this.animations = [];
    this.observers = [];

    this.init();
  }

  init() {
    if (!this.prefersReducedMotion) {
      if (this.isGSAPLoaded && this.isScrollTriggerLoaded) {
        gsap.registerPlugin(ScrollTrigger);
        this.setupGSAPAnimations();
      } else {
        this.setupFallbackAnimations();
      }
    }

    this.setupHoverEffects();
    this.setupScrollEffects();
    this.setupCounterAnimations();
    this.setupParallaxEffects();
  }

  setMotionPreference(reduced) {
    this.prefersReducedMotion = reduced;
    if (!reduced || !this.isGSAPLoaded) return;

    gsap.killTweensOf("*");
    if (this.isScrollTriggerLoaded) {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill(true));
    }

    gsap.set(
      ".hero-title, .hero-subtitle, .hero-description, .hero-buttons, .profile-container, .section-title, .about-text p, .tech-item, .stat-card, .project-card, .contact-cta",
      { clearProps: "all" },
    );
  }

  setupGSAPAnimations() {
    this.animateHeroElements();
    this.animateSectionElements();
    this.animateProjectCards();
    this.animateSkills();
  }

  animateHeroElements() {
    const tl = gsap.timeline();

    tl.from(".hero-title", {
      duration: 1.2,
      y: 100,
      opacity: 0,
      ease: "power3.out",
    })
      .from(
        ".hero-subtitle",
        {
          duration: 0.8,
          y: 50,
          opacity: 0,
          ease: "power2.out",
        },
        "-=0.5"
      )
      .from(
        ".hero-description",
        {
          duration: 0.8,
          y: 30,
          opacity: 0,
          ease: "power2.out",
        },
        "-=0.4"
      )
      .from(
        ".hero-buttons .cta-button",
        {
          duration: 0.6,
          y: 30,
          opacity: 0,
          stagger: 0.2,
          ease: "back.out(1.7)",
        },
        "-=0.3"
      )
      .from(
        ".profile-container",
        {
          duration: 1,
          scale: 0.8,
          opacity: 0,
          ease: "elastic.out(1, 0.5)",
        },
        "-=0.8"
      );
  }

  animateSkills() {
    const techItems = document.querySelectorAll(".tech-item");
    if (techItems.length === 0) return;

    gsap.set(techItems, { opacity: 1, y: 0, visibility: "visible" });

    gsap.from(techItems, {
      scrollTrigger: {
        trigger: ".tech-grid",
        start: "top 90%",
        toggleActions: "play none none none",
        once: true,
      },
      duration: 0.6,
      y: 30,
      opacity: 0,
      stagger: 0.1,
      ease: "back.out(1.7)",
      clearProps: "all",
    });
  }

  animateSectionElements() {
    gsap.utils.toArray(".section-title").forEach((title) => {
      gsap.from(title, {
        scrollTrigger: {
          trigger: title,
          start: "top 80%",
          toggleActions: "play none none none",
          once: true,
        },
        duration: 0.65,
        y: 24,
        opacity: 0,
        ease: "power2.out",
      });
    });

    gsap.utils.toArray(".about-text p").forEach((p, index) => {
      gsap.from(p, {
        scrollTrigger: {
          trigger: p,
          start: "top 85%",
          toggleActions: "play none none none",
          once: true,
        },
        duration: 0.6,
        y: 20,
        opacity: 0,
        delay: index * 0.1,
        ease: "power2.out",
      });
    });

    gsap.from(".contact-cta", {
      scrollTrigger: {
        trigger: ".contact-cta",
        start: "top 80%",
        toggleActions: "play none none none",
        once: true,
      },
      duration: 0.65,
      y: 24,
      opacity: 0,
      ease: "power2.out",
    });
  }

  animateProjectCards() {
    ScrollTrigger.refresh();
  }

  setupFallbackAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -8% 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const animatedElements = [
      ".section-title",
      ".about-text p",
      ".stat-card",
      ".contact-cta",
      ".project-card",
    ];

    animatedElements.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => {
        observer.observe(el);
      });
    });

    this.observers.push(observer);
    this.addFallbackCSS();
  }

  addFallbackCSS() {
    const css = `
      .section-title,
      .about-text p,
      .stat-card,
      .contact-cta,
      .project-card {
        opacity: 0;
        transform: translateY(24px);
        transition: opacity 0.65s ease, transform 0.65s ease;
      }

      .animate-in {
        animation: none;
        opacity: 1 !important;
        transform: translateY(0) !important;
      }
    `;

    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  }

  setupHoverEffects() {
    if (this.prefersReducedMotion || this.isTouchDevice) return;

    this.setupButtonHovers();
    this.setupCardHovers();
    this.setupNavEffects();
    this.setupProfileEffects();
  }

  setupButtonHovers() {
    const buttons = document.querySelectorAll(".cta-button");

    buttons.forEach((button) => {
      button.addEventListener("mouseenter", () => {
        if (this.isGSAPLoaded) {
          gsap.to(button, {
            duration: 0.3,
            scale: 1.05,
            boxShadow: "0 10px 30px rgba(0, 212, 255, 0.4)",
            ease: "back.out(1.7)",
          });
        }
      });

      button.addEventListener("mouseleave", () => {
        if (this.isGSAPLoaded) {
          gsap.to(button, {
            duration: 0.3,
            scale: 1,
            boxShadow: "0 0 20px rgba(0, 212, 255, 0.3)",
            ease: "power2.out",
          });
        }
      });
    });
  }

  setupCardHovers() {
    document.querySelectorAll(".stat-card").forEach((card) => {
      card.addEventListener("mouseenter", () => {
        if (this.isGSAPLoaded) {
          gsap.to(card, {
            duration: 0.3,
            y: -10,
            scale: 1.02,
            ease: "power2.out",
          });
        }
      });

      card.addEventListener("mouseleave", () => {
        if (this.isGSAPLoaded) {
          gsap.to(card, {
            duration: 0.3,
            y: 0,
            scale: 1,
            ease: "power2.out",
          });
        }
      });
    });

    document.querySelectorAll(".tech-item").forEach((item) => {
      item.addEventListener("mouseenter", () => {
        if (this.isGSAPLoaded) {
          gsap.to(item, {
            duration: 0.2,
            scale: 1.05,
            ease: "back.out(2)",
          });
        }
      });

      item.addEventListener("mouseleave", () => {
        if (this.isGSAPLoaded) {
          gsap.to(item, {
            duration: 0.2,
            scale: 1,
            ease: "power2.out",
          });
        }
      });
    });
  }

  setupNavEffects() {
    const nav = document.querySelector(".navbar");
    if (!nav) return;
    let lastScrollY = window.scrollY;
    let ticking = false;

    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const mobileMenuOpen = document.body.classList.contains("nav-open");

        if (currentScrollY > 100) {
          nav.classList.add("scrolled");

          if (
            !mobileMenuOpen &&
            window.innerWidth > 900 &&
            currentScrollY > lastScrollY &&
            currentScrollY > 300
          ) {
            nav.style.transform = "translateY(-100%)";
          } else {
            nav.style.transform = "translateY(0)";
          }
        } else {
          nav.classList.remove("scrolled");
          nav.style.transform = "translateY(0)";
        }

        lastScrollY = currentScrollY;
        ticking = false;
      });
    }, { passive: true });
  }

  setupProfileEffects() {
    const profileContainer = document.querySelector(".profile-container");

    if (profileContainer) {
      profileContainer.addEventListener("mouseenter", () => {
        if (this.isGSAPLoaded) {
          gsap.to(".profile-glow", {
            duration: 0.3,
            scale: 1.1,
            opacity: 0.8,
            ease: "power2.out",
          });
        }
      });

      profileContainer.addEventListener("mouseleave", () => {
        if (this.isGSAPLoaded) {
          gsap.to(".profile-glow", {
            duration: 0.3,
            scale: 1,
            opacity: 0.6,
            ease: "power2.out",
          });
        }
      });
    }
  }

  setupScrollEffects() {
    this.setupSmoothScrolling();
    this.setupScrollIndicator();
  }

setupSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      if (link.closest("#nav-menu") && window.innerWidth <= 900) return;

      e.preventDefault();
      const targetId = link.getAttribute("href");
      const target = document.querySelector(targetId);

      if (target) {
        const headerOffset = 70;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    });
  });
}

  setupScrollIndicator() {
    const scrollIndicator = document.querySelector(".scroll-indicator");

    if (scrollIndicator) {
      let ticking = false;
      const updateIndicator = () => {
        const scrollPercent = window.scrollY / window.innerHeight;
        scrollIndicator.style.opacity = Math.max(0, 1 - scrollPercent * 2);
        scrollIndicator.style.visibility =
          scrollPercent > 0.5 ? "hidden" : "visible";
        ticking = false;
      };

      window.addEventListener(
        "scroll",
        () => {
          if (ticking) return;
          ticking = true;
          requestAnimationFrame(updateIndicator);
        },
        { passive: true },
      );
    }
  }

  setupCounterAnimations() {
    const counters = document.querySelectorAll(".stat-number[data-count]");

    const countUp = (element, target, duration = 2000) => {
      const start = 0;
      const increment = target / (duration / 16);
      let current = start;

      const updateCounter = () => {
        current += increment;
        element.textContent = Math.floor(current);

        if (current < target) {
          requestAnimationFrame(updateCounter);
        } else {
          element.textContent = target;
        }
      };

      updateCounter();
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const target = parseInt(element.dataset.count);

          if (this.isGSAPLoaded) {
            gsap.to(element, {
              duration: 2,
              textContent: target,
              roundProps: "textContent",
              ease: "power2.out",
            });
          } else {
            countUp(element, target);
          }

          observer.unobserve(element);
        }
      });
    });

    counters.forEach((counter) => observer.observe(counter));
  }

  setupParallaxEffects() {
    if (
      !this.isGSAPLoaded ||
      this.prefersReducedMotion ||
      this.isTouchDevice ||
      window.innerWidth <= 768
    ) {
      return;
    }

    gsap.to(".hero-image", {
      yPercent: -12,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  }

  animateLoadedProjectCards() {
    const cards = document.querySelectorAll(".project-card");

    if (cards.length === 0 || this.prefersReducedMotion) return;

    if (this.isGSAPLoaded) {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars && trigger.vars.trigger === ".projects-grid") {
          trigger.kill();
        }
      });

      gsap.set(cards, { opacity: 0, y: 30 });

      gsap.to(cards, {
        duration: 0.6,
        y: 0,
        opacity: 1,
        stagger: 0.08,
        ease: "power2.out",
        delay: 0.1,
      });
    } else {
      cards.forEach((card, index) => {
        card.style.opacity = "0";
        card.style.transform = "translateY(30px)";
        setTimeout(() => {
          card.style.transition =
            "opacity 0.6s ease, transform 0.6s ease";
          card.style.opacity = "1";
          card.style.transform = "translateY(0)";
        }, index * 100);
      });
    }
  }

  destroy() {
    if (this.isScrollTriggerLoaded) {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    }

    this.observers.forEach((observer) => observer.disconnect());
    this.animations.forEach((animation) => {
      if (animation.kill) animation.kill();
    });
  }
}

const animationSystem = new AnimationSystem();

window.animationSystem = animationSystem;

const navScrollCSS = `
.navbar {
  transition: all 0.3s ease;
}

.navbar.scrolled {
  background: rgba(10, 10, 15, 0.95);
  backdrop-filter: blur(20px);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}
`;

const navStyle = document.createElement("style");
navStyle.textContent = navScrollCSS;
document.head.appendChild(navStyle);