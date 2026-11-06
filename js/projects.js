class ProjectsAPI {
  constructor() {
    this.apiUrl = "/api/v2";
    this.cacheKey = "portfolio_projects_cache";
    this.cacheExpiry = 5 * 60 * 1000;
    this.maxRetries = 3;
    this.retryDelay = 1000;

    this.loadingElement = document.getElementById("projects-loading");
    this.errorElement = document.getElementById("projects-error");
    this.gridElement = document.getElementById("projects-grid");
    this.retryButton = document.getElementById("retry-btn");
    this.currentProjects = [];

    this.setupEventListeners();
    document.addEventListener("language:changed", () => {
      if (this.currentProjects.length > 0) {
        this.displayProjects(this.currentProjects);
      }
    });
    this.fetchProjects();
  }

  setupEventListeners() {
    if (this.retryButton) {
      this.retryButton.addEventListener("click", () => {
        this.clearCache();
        this.fetchProjects();
      });
    }
  }

  async fetchProjects() {
    try {
      this.showLoading();

      const cachedData = this.getFromCache();
      if (cachedData && cachedData.length > 0) {
        this.displayProjects(cachedData);
        return;
      }

      const projects = await this.fetchFromAPI();

      if (projects && projects.length > 0) {
        this.saveToCache(projects);
        this.displayProjects(projects);
      } else {
        throw new Error("No projects found");
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      this.showError(error);
    }
  }

  async fetchFromAPI(retryCount = 0) {
    try {
      const response = await fetch(`${this.apiUrl}/projects`, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${this.getErrorMessage(response.status)}`);
      }

      const data = await response.json();
      const projects = Array.isArray(data) ? data : data.projects || [];

      return projects
        .map((project) => this.processProject(project))
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    } catch (error) {
      if (retryCount < this.maxRetries) {
        await this.delay(this.retryDelay);
        return this.fetchFromAPI(retryCount + 1);
      }
      throw error;
    }
  }

  processProject(project) {
    const now = new Date();
    const createdDate = new Date(project.created_at || project.updated_at);
    const daysDifference = (now - createdDate) / (1000 * 60 * 60 * 24);

    return {
      ...project,
      isNew: daysDifference <= 30,
      languages: project.languages || [],
    };
  }

  displayProjects(projects) {
    this.currentProjects = projects;
    this.hideLoading();
    this.hideError();
    this.showGrid();

    if (!this.gridElement) return;

    const projectCards = projects
      .map((project) => this.createProjectCard(project))
      .join("");

    this.gridElement.innerHTML = projectCards;

    setTimeout(() => {
      document.dispatchEvent(
        new CustomEvent("projects:loaded", {
          detail: { count: projects.length },
        })
      );
    }, 100);
  }

  createProjectCard(project) {
    const translate = (key) => window.siteI18n ? window.siteI18n.t(key) : key;
    const description = project.description || translate("noDescription");
    const languageTags = (project.languages || [])
      .map((lang) => `<span class="language-tag">${lang}</span>`)
      .join("");

    const newBadge = project.isNew
      ? `<span class="badge new">${translate("newProject")}</span>`
      : "";

    const locale = window.siteI18n ? window.siteI18n.getLocale() : "en-US";
    const updatedDate = new Date(project.updated_at).toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const homepageLink = project.homepage
      ? `
        <a href="${project.homepage}" class="project-link" target="_blank" rel="noopener">
          <i class="fas fa-external-link-alt"></i>
          ${translate("liveDemo")}
        </a>
      `
      : "";

    return `
      <div class="project-card" data-project-id="${project.id}">
        <div class="project-header">
          <div class="project-title-wrapper">
            <h3 class="project-title">${project.name}</h3>
            <div class="project-badges">${newBadge}</div>
          </div>
        </div>

        <p class="project-description">${description}</p>

        <div class="project-languages">${languageTags}</div>

        <div class="project-meta">
          <div class="project-stats">
            <span class="stat">
              <i class="fas fa-star"></i>
              ${project.stars || 0}
            </span>
            <span class="stat">
              <i class="fas fa-code-branch"></i>
              ${project.forks || 0}
            </span>
            <span class="stat">
              <i class="fas fa-eye"></i>
              ${project.watchers || 0}
            </span>
          </div>
          <div class="project-updated">${translate("updated")} ${updatedDate}</div>
        </div>

        <div class="project-links">
          <a href="${project.html_url}" class="project-link" target="_blank" rel="noopener">
            <i class="fab fa-github"></i>
            ${translate("viewCode")}
          </a>
          ${homepageLink}
        </div>
      </div>
    `;
  }

  getFromCache() {
    try {
      const cached = localStorage.getItem(this.cacheKey);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const isExpired = Date.now() - timestamp > this.cacheExpiry;

      if (isExpired) {
        localStorage.removeItem(this.cacheKey);
        return null;
      }

      return data;
    } catch (error) {
      localStorage.removeItem(this.cacheKey);
      return null;
    }
  }

  saveToCache(data) {
    try {
      localStorage.setItem(
        this.cacheKey,
        JSON.stringify({ data, timestamp: Date.now() })
      );
    } catch (error) {
      console.warn("Cache save failed:", error);
    }
  }

  clearCache() {
    localStorage.removeItem(this.cacheKey);
  }

  showLoading() {
    if (this.loadingElement) this.loadingElement.style.display = "flex";
    if (this.errorElement) this.errorElement.style.display = "none";
    if (this.gridElement) this.gridElement.style.display = "none";
  }

  hideLoading() {
    if (this.loadingElement) this.loadingElement.style.display = "none";
  }

  showError(error) {
    this.hideLoading();
    if (this.gridElement) this.gridElement.style.display = "none";

    if (this.errorElement) {
      const errorMessage = document.getElementById("error-message");
      if (errorMessage) {
        errorMessage.textContent = this.getUserFriendlyError(error);
      }
      this.errorElement.style.display = "flex";
    }
  }

  hideError() {
    if (this.errorElement) this.errorElement.style.display = "none";
  }

  showGrid() {
    if (this.gridElement) {
      this.gridElement.style.display = "grid";
      this.gridElement.style.visibility = "visible";
      this.gridElement.style.opacity = "1";
    }
  }

  getErrorMessage(status) {
    const messages = {
      403: "Access denied.",
      404: "Projects not found.",
      500: "Server error.",
    };
    return messages[status] || "Unexpected error.";
  }

  getUserFriendlyError(error) {
    if (error.message.includes("Failed to fetch")) {
      return "Network error. Please check your connection.";
    }
    return error.message || "Unable to load projects. Please try again.";
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.projectsAPI = new ProjectsAPI();
});