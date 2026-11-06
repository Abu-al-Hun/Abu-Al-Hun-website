(function () {
  "use strict";

  const supportedLanguages = ["en", "ar", "fr", "it", "tr"];
  const localeMap = {
    en: "en-US",
    ar: "ar-EG",
    fr: "fr-FR",
    it: "it-IT",
    tr: "tr-TR",
  };
  const localeLoads = new Map();
  let currentLanguage = "en";
  let applyRequest = 0;

  function getStoredLanguage() {
    try {
      return localStorage.getItem("portfolio-language");
    } catch (error) {
      console.warn("Failed to read the saved language preference:", error);
      return null;
    }
  }

  function loadLocale(language) {
    if (window.portfolioLocales && window.portfolioLocales[language]) {
      return Promise.resolve(window.portfolioLocales[language]);
    }

    if (localeLoads.has(language)) {
      return localeLoads.get(language);
    }

    const load = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = new URL(`../js/locales/${language}.js`, document.baseURI).href;
      script.onload = () => {
        const locale = window.portfolioLocales && window.portfolioLocales[language];
        if (locale) {
          resolve(locale);
        } else {
          reject(new Error(`Locale file did not register "${language}"`));
        }
      };
      script.onerror = () => {
        reject(new Error(`Failed to load locale file "${language}"`));
      };
      document.head.appendChild(script);
    });

    localeLoads.set(language, load);
    load.catch(() => localeLoads.delete(language));
    return load;
  }

  function translate(key) {
    const language = window.portfolioLocales && window.portfolioLocales[currentLanguage];
    const english = window.portfolioLocales && window.portfolioLocales.en;
    return (language && language[key]) || (english && english[key]) || key;
  }

  function getTranslation(dictionary, key) {
    const english = window.portfolioLocales && window.portfolioLocales.en;
    return dictionary[key] || (english && english[key]) || key;
  }

  async function applyLanguage(language) {
    const request = ++applyRequest;
    let selectedLanguage = supportedLanguages.includes(language) ? language : "en";
    let dictionary;

    try {
      const english = await loadLocale("en");
      dictionary =
        selectedLanguage === "en" ? english : await loadLocale(selectedLanguage);
    } catch (error) {
      console.error(`Unable to load the "${selectedLanguage}" translations:`, error);
      if (selectedLanguage === "en") throw error;

      selectedLanguage = "en";
      dictionary = await loadLocale(selectedLanguage);
    }

    if (request !== applyRequest) return;

    currentLanguage = selectedLanguage;
    const isArabic = currentLanguage === "ar";

    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
    document.title = dictionary.pageTitle;

    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const value = getTranslation(dictionary, element.dataset.i18n);
      if (value) element.textContent = value;
    });

    document.querySelectorAll("[data-i18n-html]").forEach((element) => {
      const value = getTranslation(dictionary, element.dataset.i18nHtml);
      if (value) element.innerHTML = value;
    });

    const languageSelect = document.getElementById("language-select");
    if (languageSelect) {
      languageSelect.value = currentLanguage;
      languageSelect.setAttribute("aria-label", dictionary.languageLabel);
    }

    try {
      localStorage.setItem("portfolio-language", currentLanguage);
    } catch (error) {
      console.warn("Failed to store language preference:", error);
    }

    document.dispatchEvent(
      new CustomEvent("language:changed", {
        detail: { language: currentLanguage },
      }),
    );
  }

  function init() {
    const languageSelect = document.getElementById("language-select");

    if (languageSelect) {
      languageSelect.addEventListener("change", (event) => {
        applyLanguage(event.target.value).catch((error) => {
          console.error("Failed to apply the selected language:", error);
        });
      });
    }

    const storedLanguage = getStoredLanguage();
    const initialLanguage = supportedLanguages.includes(storedLanguage)
      ? storedLanguage
      : "en";
    applyLanguage(initialLanguage).catch((error) => {
      console.error("Failed to initialize the site language:", error);
    });
  }

  window.siteI18n = {
    getLanguage: () => currentLanguage,
    getLocale: () => localeMap[currentLanguage],
    t: translate,
    applyLanguage,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
