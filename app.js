(function () {
  const ROUTES = {
    "/": { key: "landing", title: "Job Notification Tracker", navRoute: null },
    "/dashboard": { key: "dashboard", title: "Dashboard", navRoute: "/dashboard" },
    "/saved": { key: "saved", title: "Saved", navRoute: "/saved" },
    "/digest": { key: "digest", title: "Digest", navRoute: "/digest" },
    "/settings": { key: "settings", title: "Settings", navRoute: "/settings" },
    "/proof": { key: "proof", title: "Proof", navRoute: "/proof" },
  };

  const STORAGE_KEY = "job_notification_tracker_saved";
  const JOBS = Array.isArray(window.JOB_DATA) ? window.JOB_DATA : [];

  function getRouteConfig(pathname) {
    return ROUTES[pathname] || null;
  }

  function renderRoute(pathname) {
    const outlet = document.getElementById("route-outlet");
    if (!outlet) return;

    const config = getRouteConfig(pathname);

    if (!config) {
      document.title = "Job Notification App – Page Not Found";
      outlet.innerHTML = `
        <section class="context-header">
          <h1 class="context-header__title">Page Not Found</h1>
          <p class="context-header__subtitle text-block">
            The page you are looking for does not exist.
          </p>
        </section>
      `;
      updateActiveLink(null);
      return;
    }

    document.title = `Job Notification App – ${config.title}`;

    switch (config.key) {
      case "landing":
        outlet.innerHTML = `
          <section class="context-header">
            <h1 class="context-header__title">Stop Missing The Right Jobs.</h1>
            <p class="context-header__subtitle text-block">
              Precision-matched job discovery delivered daily at 9AM.
            </p>
          </section>
          <section>
            <button
              type="button"
              class="button button--primary"
              data-route="/settings"
            >
              Start Tracking
            </button>
          </section>
        `;
        break;
      case "settings":
        outlet.innerHTML = `
          <section class="context-header">
            <h1 class="context-header__title">Settings</h1>
            <p class="context-header__subtitle text-block">
              Configure your job notification preferences. These fields are placeholders only.
            </p>
          </section>
          <section class="workspace">
            <div class="workspace__primary">
              <article class="card">
                <header class="card__header">
                  <h2 class="card__title">Preferences</h2>
                  <p class="card__subtitle text-block">
                    These preferences will be used in later steps. Nothing is saved yet.
                  </p>
                </header>
                <div class="card__body">
                  <div class="field-group">
                    <div class="field">
                      <label class="field-label" for="role-keywords">
                        Role keywords
                      </label>
                      <input
                        id="role-keywords"
                        class="field-input"
                        type="text"
                        placeholder="e.g. Product Manager, Data Analyst"
                      />
                    </div>
                    <div class="field">
                      <label class="field-label" for="preferred-locations">
                        Preferred locations
                      </label>
                      <input
                        id="preferred-locations"
                        class="field-input"
                        type="text"
                        placeholder="e.g. Berlin, Remote Europe"
                      />
                    </div>
                    <div class="field">
                      <label class="field-label" for="work-mode">
                        Mode
                      </label>
                      <select id="work-mode" class="field-input">
                        <option>Remote</option>
                        <option>Hybrid</option>
                        <option>Onsite</option>
                      </select>
                    </div>
                    <div class="field">
                      <label class="field-label" for="experience-level">
                        Experience level
                      </label>
                      <select id="experience-level" class="field-input">
                        <option>Entry</option>
                        <option>Mid</option>
                        <option>Senior</option>
                        <option>Lead</option>
                      </select>
                    </div>
                  </div>
                </div>
              </article>
            </div>
            <aside class="workspace__secondary">
              <article class="card">
                <header class="card__header card__header--compact">
                  <h2 class="card__title">What this page does</h2>
                </header>
                <div class="card__body card__body--stack">
                  <p class="text-block">
                    This page only collects preferences visually. In the next step,
                    these fields will be connected to real matching and notification logic.
                  </p>
                </div>
              </article>
            </aside>
          </section>
        `;
        break;
      case "dashboard":
        outlet.innerHTML = `
          <section class="context-header">
            <h1 class="context-header__title">Dashboard</h1>
            <p class="context-header__subtitle text-block">
              Review realistic job opportunities from a curated Indian tech dataset.
            </p>
          </section>
          <section class="workspace">
            <div class="workspace__primary">
              <article class="card">
                <header class="card__header card__header--compact">
                  <h2 class="card__title">Filters</h2>
                </header>
                <div class="card__body">
                  <form class="filter-bar" id="job-filters">
                    <div class="filter-bar__row">
                      <div class="filter-bar__field">
                        <label class="field-label" for="filter-keyword">Search</label>
                        <input
                          id="filter-keyword"
                          class="field-input"
                          type="text"
                          placeholder="Search by title or company"
                        />
                      </div>
                      <div class="filter-bar__field">
                        <label class="field-label" for="filter-location">Location</label>
                        <select id="filter-location" class="field-input">
                          <option value="">All locations</option>
                          <option value="Bengaluru">Bengaluru</option>
                          <option value="Hyderabad">Hyderabad</option>
                          <option value="Pune">Pune</option>
                          <option value="Chennai">Chennai</option>
                          <option value="Gurgaon">Gurgaon</option>
                          <option value="Noida">Noida</option>
                          <option value="Mumbai">Mumbai</option>
                          <option value="Remote - India">Remote - India</option>
                        </select>
                      </div>
                      <div class="filter-bar__field">
                        <label class="field-label" for="filter-mode">Mode</label>
                        <select id="filter-mode" class="field-input">
                          <option value="">Any</option>
                          <option value="Remote">Remote</option>
                          <option value="Hybrid">Hybrid</option>
                          <option value="Onsite">Onsite</option>
                        </select>
                      </div>
                    </div>
                    <div class="filter-bar__row">
                      <div class="filter-bar__field">
                        <label class="field-label" for="filter-experience">Experience</label>
                        <select id="filter-experience" class="field-input">
                          <option value="">Any</option>
                          <option value="Fresher">Fresher</option>
                          <option value="0-1">0-1</option>
                          <option value="1-3">1-3</option>
                          <option value="3-5">3-5</option>
                        </select>
                      </div>
                      <div class="filter-bar__field">
                        <label class="field-label" for="filter-source">Source</label>
                        <select id="filter-source" class="field-input">
                          <option value="">Any</option>
                          <option value="LinkedIn">LinkedIn</option>
                          <option value="Naukri">Naukri</option>
                          <option value="Indeed">Indeed</option>
                        </select>
                      </div>
                      <div class="filter-bar__field">
                        <label class="field-label" for="filter-sort">Sort</label>
                        <select id="filter-sort" class="field-input">
                          <option value="latest">Latest</option>
                          <option value="oldest">Oldest</option>
                        </select>
                      </div>
                    </div>
                  </form>
                </div>
              </article>
              <section id="job-list" class="job-list"></section>
            </div>
            <aside class="workspace__secondary">
              <article class="card">
                <header class="card__header card__header--compact">
                  <h2 class="card__title">How this dashboard works</h2>
                </header>
                <div class="card__body card__body--stack">
                  <p class="text-block">
                    This dashboard uses a local, realistic dataset of Indian tech jobs. In a later step, it can be connected to live sources and your real preferences.
                  </p>
                </div>
              </article>
            </aside>
          </section>
        `;
        initDashboardPage();
        break;
      case "saved":
        outlet.innerHTML = `
          <section class="context-header">
            <h1 class="context-header__title">Saved</h1>
            <p class="context-header__subtitle text-block">
              A focused view of roles you want to keep an eye on.
            </p>
          </section>
          <section class="workspace">
            <div class="workspace__primary">
              <section id="saved-list" class="job-list"></section>
            </div>
            <aside class="workspace__secondary">
              <article class="card">
                <header class="card__header card__header--compact">
                  <h2 class="card__title">About saved jobs</h2>
                </header>
                <div class="card__body card__body--stack">
                  <p class="text-block">
                    Jobs you choose to save on the dashboard will appear here and remain available after you reload the page.
                  </p>
                </div>
              </article>
            </aside>
          </section>
        `;
        initSavedPage();
        break;
      case "digest":
        outlet.innerHTML = `
          <section class="context-header">
            <h1 class="context-header__title">Daily Digest</h1>
            <p class="context-header__subtitle text-block">
              A daily summary of new and important roles will appear here once the digest feature is connected.
            </p>
          </section>
        `;
        break;
      case "proof":
        outlet.innerHTML = `
          <section class="context-header">
            <h1 class="context-header__title">Proof</h1>
            <p class="context-header__subtitle text-block">
              This page will collect artifacts and evidence of how the Job Notification Tracker behaves in real scenarios.
            </p>
          </section>
        `;
        break;
      default:
        break;
    }

    updateActiveLink(config);
  }

  function updateActiveLink(config) {
    const links = document.querySelectorAll(".top-nav__link");
    links.forEach((link) => {
      link.classList.remove("top-nav__link--active");
    });

    if (!config || !config.navRoute) {
      return;
    }

    links.forEach((link) => {
      const route = link.getAttribute("data-route");
      if (route === config.navRoute) {
        link.classList.add("top-nav__link--active");
      }
    });
  }

  function getSavedJobIds() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function setSavedJobIds(ids) {
    const unique = Array.from(new Set(ids));
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
    } catch (e) {
      // Local storage may be unavailable; fail silently.
    }
  }

  function formatPostedDaysAgo(days) {
    if (days <= 0) return "Today";
    if (days === 1) return "1 day ago";
    return `${days} days ago`;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function buildJobCard(job, isSaved) {
    const postedLabel = formatPostedDaysAgo(job.postedDaysAgo);
    const saveLabel = isSaved ? "Saved" : "Save";
    const saveDisabled = isSaved ? "disabled" : "";

    return `
      <article class="card job-card" data-job-id="${escapeHtml(job.id)}">
        <header class="job-card__header">
          <div>
            <h2 class="job-card__title">${escapeHtml(job.title)}</h2>
            <div class="job-card__meta-row">
              <span class="job-card__company">${escapeHtml(job.company)}</span>
              <span>${escapeHtml(job.location)} · ${escapeHtml(job.mode)}</span>
            </div>
          </div>
          <span class="badge badge--source">${escapeHtml(job.source)}</span>
        </header>
        <div class="job-card__meta">
          <div class="job-card__meta-row">
            <span>Experience: ${escapeHtml(job.experience)}</span>
            <span>Salary: ${escapeHtml(job.salaryRange)}</span>
          </div>
        </div>
        <footer class="job-card__footer">
          <div class="job-card__actions">
            <button
              type="button"
              class="button button--secondary"
              data-action="view"
              data-job-id="${escapeHtml(job.id)}"
            >
              View
            </button>
            <button
              type="button"
              class="button button--secondary"
              data-action="save"
              data-job-id="${escapeHtml(job.id)}"
              ${saveDisabled}
            >
              ${saveLabel}
            </button>
            <button
              type="button"
              class="button button--primary"
              data-action="apply"
              data-job-id="${escapeHtml(job.id)}"
            >
              Apply
            </button>
          </div>
          <span class="job-card__posted">${escapeHtml(postedLabel)}</span>
        </footer>
      </article>
    `;
  }

  function openJobModal(job) {
    const root = document.getElementById("modal-root");
    if (!root) return;

    const skills = Array.isArray(job.skills) ? job.skills : [];
    const descriptionParagraphs = String(job.description || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => `<p>${escapeHtml(line)}</p>`)
      .join("");

    const skillsMarkup =
      skills.length > 0
        ? `<div class="pill-list">${skills
            .map(
              (skill) =>
                `<span class="pill-list__item">${escapeHtml(skill)}</span>`
            )
            .join("")}</div>`
        : "";

    root.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true">
        <div class="modal__overlay" data-modal-close="backdrop"></div>
        <div class="modal__dialog">
          <header class="modal__header">
            <div>
              <h2 class="modal__title">${escapeHtml(job.title)}</h2>
              <p class="modal__subtitle">
                ${escapeHtml(job.company)} · ${escapeHtml(
      job.location
    )} · ${escapeHtml(job.mode)}
              </p>
            </div>
            <button
              type="button"
              class="modal__close"
              data-modal-close="button"
            >
              Close
            </button>
          </header>
          <div class="modal__body">
            ${descriptionParagraphs}
            ${skillsMarkup}
          </div>
        </div>
      </div>
    `;
  }

  function closeJobModal() {
    const root = document.getElementById("modal-root");
    if (!root) return;
    root.innerHTML = "";
  }

  function initDashboardPage() {
    const listEl = document.getElementById("job-list");
    const keywordInput = document.getElementById("filter-keyword");
    const locationSelect = document.getElementById("filter-location");
    const modeSelect = document.getElementById("filter-mode");
    const experienceSelect = document.getElementById("filter-experience");
    const sourceSelect = document.getElementById("filter-source");
    const sortSelect = document.getElementById("filter-sort");

    if (!listEl) return;

    function applyFiltersAndRender() {
      const keyword = (keywordInput?.value || "").trim().toLowerCase();
      const location = locationSelect?.value || "";
      const mode = modeSelect?.value || "";
      const experience = experienceSelect?.value || "";
      const source = sourceSelect?.value || "";
      const sort = sortSelect?.value || "latest";

      let jobs = JOBS.slice();

      if (keyword) {
        jobs = jobs.filter((job) => {
          const title = String(job.title || "").toLowerCase();
          const company = String(job.company || "").toLowerCase();
          return title.includes(keyword) || company.includes(keyword);
        });
      }

      if (location) {
        jobs = jobs.filter((job) => job.location === location);
      }

      if (mode) {
        jobs = jobs.filter((job) => job.mode === mode);
      }

      if (experience) {
        jobs = jobs.filter((job) => job.experience === experience);
      }

      if (source) {
        jobs = jobs.filter((job) => job.source === source);
      }

      jobs.sort((a, b) => {
        const diff = a.postedDaysAgo - b.postedDaysAgo;
        return sort === "latest" ? diff : -diff;
      });

      const savedIds = getSavedJobIds();

      if (jobs.length === 0) {
        listEl.innerHTML = `
          <div class="job-empty-state">
            <h2 class="job-empty-state__title">No jobs match your search.</h2>
            <p class="job-empty-state__body text-block">
              Try adjusting the keyword or filters to see more roles.
            </p>
          </div>
        `;
        return;
      }

      listEl.innerHTML = jobs
        .map((job) => buildJobCard(job, savedIds.includes(job.id)))
        .join("");
    }

    if (keywordInput) {
      keywordInput.addEventListener("input", applyFiltersAndRender);
    }
    if (locationSelect) {
      locationSelect.addEventListener("change", applyFiltersAndRender);
    }
    if (modeSelect) {
      modeSelect.addEventListener("change", applyFiltersAndRender);
    }
    if (experienceSelect) {
      experienceSelect.addEventListener("change", applyFiltersAndRender);
    }
    if (sourceSelect) {
      sourceSelect.addEventListener("change", applyFiltersAndRender);
    }
    if (sortSelect) {
      sortSelect.addEventListener("change", applyFiltersAndRender);
    }

    listEl.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const actionElement = target.closest("[data-action]");
      if (!actionElement) return;

      const action = actionElement.getAttribute("data-action");
      const jobId = actionElement.getAttribute("data-job-id");
      if (!action || !jobId) return;

      const job = JOBS.find((j) => j.id === jobId);
      if (!job) return;

      if (action === "view") {
        openJobModal(job);
      } else if (action === "save") {
        const savedIds = getSavedJobIds();
        if (!savedIds.includes(jobId)) {
          savedIds.push(jobId);
          setSavedJobIds(savedIds);
          applyFiltersAndRender();
        }
      } else if (action === "apply") {
        if (job.applyUrl) {
          window.open(job.applyUrl, "_blank", "noreferrer");
        }
      }
    });

    applyFiltersAndRender();
  }

  function initSavedPage() {
    const listEl = document.getElementById("saved-list");
    if (!listEl) return;

    function renderSaved() {
      const savedIds = getSavedJobIds();
      const jobs = JOBS.filter((job) => savedIds.includes(job.id));

      if (jobs.length === 0) {
        listEl.innerHTML = `
          <div class="job-empty-state">
            <h2 class="job-empty-state__title">No saved jobs yet.</h2>
            <p class="job-empty-state__body text-block">
              Use the Save action on the dashboard to keep promising roles here.
            </p>
          </div>
        `;
        return;
      }

      listEl.innerHTML = jobs
        .map((job) => {
          const postedLabel = formatPostedDaysAgo(job.postedDaysAgo);
          return `
            <article class="card job-card" data-job-id="${escapeHtml(job.id)}">
              <header class="job-card__header">
                <div>
                  <h2 class="job-card__title">${escapeHtml(job.title)}</h2>
                  <div class="job-card__meta-row">
                    <span class="job-card__company">${escapeHtml(
                      job.company
                    )}</span>
                    <span>${escapeHtml(job.location)} · ${escapeHtml(
            job.mode
          )}</span>
                  </div>
                </div>
                <span class="badge badge--source">${escapeHtml(
                  job.source
                )}</span>
              </header>
              <div class="job-card__meta">
                <div class="job-card__meta-row">
                  <span>Experience: ${escapeHtml(job.experience)}</span>
                  <span>Salary: ${escapeHtml(job.salaryRange)}</span>
                </div>
              </div>
              <footer class="job-card__footer">
                <div class="job-card__actions">
                  <button
                    type="button"
                    class="button button--secondary"
                    data-action="view"
                    data-job-id="${escapeHtml(job.id)}"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    class="button button--primary"
                    data-action="apply"
                    data-job-id="${escapeHtml(job.id)}"
                  >
                    Apply
                  </button>
                </div>
                <span class="job-card__posted">${escapeHtml(
                  postedLabel
                )}</span>
              </footer>
            </article>
          `;
        })
        .join("");
    }

    listEl.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const actionElement = target.closest("[data-action]");
      if (!actionElement) return;

      const action = actionElement.getAttribute("data-action");
      const jobId = actionElement.getAttribute("data-job-id");
      if (!action || !jobId) return;

      const job = JOBS.find((j) => j.id === jobId);
      if (!job) return;

      if (action === "view") {
        openJobModal(job);
      } else if (action === "apply") {
        if (job.applyUrl) {
          window.open(job.applyUrl, "_blank", "noreferrer");
        }
      }
    });

    renderSaved();
  }

  function closeMobileMenu() {
    const nav = document.querySelector(".top-nav");
    const toggle = document.querySelector(".top-nav__toggle");
    if (!nav || !toggle) return;
    if (nav.classList.contains("top-nav--open")) {
      nav.classList.remove("top-nav--open");
      toggle.setAttribute("aria-expanded", "false");
    }
  }

  function handleRouteClick(event) {
    const link = event.target.closest("[data-route]");
    if (!link) return;

    const href = link.getAttribute("data-route") || link.getAttribute("href");
    if (!href) return;

    event.preventDefault();

    const currentPath = window.location.pathname;
    const targetPath = href;

    if (currentPath === targetPath) {
      return;
    }

    window.history.pushState({}, "", targetPath);
    closeMobileMenu();
    renderRoute(window.location.pathname);
  }

  function handleToggleClick() {
    const nav = document.querySelector(".top-nav");
    const toggle = document.querySelector(".top-nav__toggle");
    if (!nav || !toggle) return;

    const isOpen = nav.classList.toggle("top-nav--open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  }

  function handlePopState() {
    renderRoute(window.location.pathname);
  }

  function initialize() {
    const toggle = document.querySelector(".top-nav__toggle");

    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const routeElement = target.closest("[data-route]");
      if (!routeElement) return;

      handleRouteClick(event);
    });

    if (toggle) {
      toggle.addEventListener("click", handleToggleClick);
    }

    window.addEventListener("popstate", handlePopState);

    renderRoute(window.location.pathname);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }
})();

