(function () {
  "use strict";

  let projects = [];

  function translate(key) {
    return window.siteI18n ? window.siteI18n.t(key) : key;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }

    return new Promise(function (resolve, reject) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();

      try {
        document.execCommand("copy");
        resolve();
      } catch (error) {
        reject(error);
      } finally {
        document.body.removeChild(textarea);
      }
    });
  }

  function renderProjects() {
    const list = document.getElementById("project-api-list");
    if (!list || projects.length === 0) return;

    list.innerHTML = projects.map(function (project) {
      const endpoint = `${window.location.origin}/api/v2/projects/${project.id}`;
      return `
        <article class="project-api-item">
          <div class="project-api-details">
            <h3>${escapeHtml(project.name)}</h3>
            <span><strong>${translate("projectId")}:</strong> ${escapeHtml(project.id)}</span>
            <code>${escapeHtml(endpoint)}</code>
          </div>
          <div class="project-api-actions">
            <a class="project-api-view" href="${endpoint}" target="_blank" rel="noopener">
              <i class="fas fa-external-link-alt"></i>
              ${translate("viewApi")}
            </a>
            <button class="api-copy-code project-api-copy" data-api-url="${endpoint}" aria-label="${translate("copyRequestKey")}">
              <i class="fas fa-copy"></i>
            </button>
          </div>
        </article>
      `;
    }).join("");

    list.querySelectorAll(".project-api-copy").forEach(function (button) {
      button.addEventListener("click", function () {
        copyToClipboard(button.dataset.apiUrl)
          .then(function () {
            button.classList.add("copied");
            button.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(function () {
              button.classList.remove("copied");
              button.innerHTML = '<i class="fas fa-copy"></i>';
            }, 2000);
          })
          .catch(function () {
            alert(translate("copyFailed"));
          });
      });
    });
  }

  async function loadProjects() {
    const list = document.getElementById("project-api-list");

    try {
      const response = await fetch("/api/v2/projects", {
        headers: { Accept: "application/json" }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      projects = Array.isArray(data) ? data : data.projects || [];
      renderProjects();
    } catch (error) {
      console.error("Failed to load API projects:", error);
      if (list) {
        list.innerHTML = `<p class="project-api-empty">${translate("projectsError")}</p>`;
      }
    }
  }

  function init() {
    document.addEventListener("language:changed", renderProjects);
    loadProjects();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
