(function () {
  "use strict";

  function initApi() {
    setupApiUrl();
    setupCopyButtons();
    setupProjectApiList();
  }

  function setupApiUrl() {
    const apiUrlEl = document.getElementById("api-url");
    if (!apiUrlEl) return;

    const apiUrl = window.location.origin + "/api/v2/projects/{projectId}";
    apiUrlEl.textContent = apiUrl;
  }

  function setupProjectApiList() {
    document.addEventListener("projects:loaded", renderProjectApiList);
    document.addEventListener("language:changed", renderProjectApiList);
  }

  function renderProjectApiList() {
    const list = document.getElementById("project-api-list");
    const projects = window.projectsAPI && window.projectsAPI.currentProjects;
    if (!list || !projects || projects.length === 0) return;

    const translate = (key) => window.siteI18n ? window.siteI18n.t(key) : key;
    list.innerHTML = projects.map((project) => {
      const endpoint = `${window.location.origin}/api/v2/projects/${project.id}`;
      return `
        <article class="project-api-item">
          <div class="project-api-details">
            <h4>${project.name}</h4>
            <span><strong>${translate("projectId")}:</strong> ${project.id}</span>
            <code>${endpoint}</code>
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

    list.querySelectorAll(".project-api-copy").forEach((button) => {
      button.addEventListener("click", () => {
        copyToClipboard(button.dataset.apiUrl)
          .then(() => showCopiedState(button, '<i class="fas fa-copy"></i>'))
          .catch(() => alert(translate("copyFailed")));
      });
    });
  }

  function setupCopyButtons() {
    const copyBtn = document.getElementById("api-copy-btn");
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        const apiUrl = document.getElementById("api-url").textContent.trim();
        const originalHTML =
          '<i class="fas fa-copy"></i><span class="copy-text">Copy</span>';

        copyToClipboard(apiUrl)
          .then(function () {
            showCopiedState(copyBtn, originalHTML);
          })
          .catch(function () {
            alert("Failed to copy. Please copy manually.");
          });
      });
    }

    document.querySelectorAll(".api-copy-code").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const targetId = btn.getAttribute("data-target");
        const codeEl = document.getElementById(targetId);
        if (!codeEl) return;

        const code = codeEl.textContent;
        const originalHTML = '<i class="fas fa-copy"></i>';

        copyToClipboard(code)
          .then(function () {
            btn.classList.add("copied");
            btn.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(function () {
              btn.classList.remove("copied");
              btn.innerHTML = originalHTML;
            }, 2000);
          })
          .catch(function () {
            alert("Failed to copy. Please copy manually.");
          });
      });
    });
  }

  function showCopiedState(button, originalHTML) {
    button.classList.add("copied");
    button.innerHTML =
      '<i class="fas fa-check"></i><span class="copy-text">Copied</span>';

    setTimeout(function () {
      button.classList.remove("copied");
      button.innerHTML = originalHTML;
    }, 2000);
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
      } catch (err) {
        reject(err);
      } finally {
        document.body.removeChild(textarea);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApi);
  } else {
    initApi();
  }
})();