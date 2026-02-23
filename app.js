(function () {
  const ROUTES = {
    "/": { key: "landing", title: "Job Notification Tracker", navRoute: null },
    "/dashboard": {
      key: "dashboard",
      title: "Dashboard",
      navRoute: "/dashboard",
    },
    "/saved": { key: "saved", title: "Saved", navRoute: "/saved" },
    "/digest": { key: "digest", title: "Digest", navRoute: "/digest" },
    "/settings": { key: "settings", title: "Settings", navRoute: "/settings" },
    "/proof": { key: "proof", title: "Proof", navRoute: "/proof" },
  };

  const STORAGE_KEY = "job_notification_tracker_saved";
  const PREF_KEY = "jobTrackerPreferences";
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
              Configure your job notification preferences. These fields drive the match score shown on the dashboard.
            </p>
          </section>
          <section class="workspace">
            <div class="workspace__primary">
              <article class="card">
                <header class="card__header">
                  <h2 class="card__title">Preferences</h2>
                  <p class="card__subtitle text-block">
                    These preferences are stored locally in your browser and used to compute a deterministic match score for each role.
                  </p>
                </header>
                <div class="card__body">
                  <form id="settings-form" class="field-group">
                    <div class="field">
                      <label class="field-label" for="settings-role-keywords">
                        Role keywords
                      </label>
                      <input
                        id="settings-role-keywords"
                        class="field-input"
                        type="text"
                        placeholder="e.g. SDE Intern, React Developer"
                      />
                    </div>
                    <div class="field">
                      <label class="field-label" for="settings-preferred-locations">
                        Preferred locations
                      </label>
                      <select
                        id="settings-preferred-locations"
                        class="field-input"
                        multiple
                      >
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
                    <div class="field">
                      <span class="field-label">Mode</span>
                      <div class="field-group">
                        <label>
                          <input
                            type="checkbox"
                            id="settings-mode-remote"
                            value="Remote"
                          />
                          Remote
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            id="settings-mode-hybrid"
                            value="Hybrid"
                          />
                          Hybrid
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            id="settings-mode-onsite"
                            value="Onsite"
                          />
                          Onsite
                        </label>
                      </div>
                    </div>
                    <div class="field">
                      <label class="field-label" for="settings-experience">
                        Experience level
                      </label>
                      <select id="settings-experience" class="field-input">
                        <option value="">Any</option>
                        <option value="Fresher">Fresher</option>
                        <option value="0-1">0-1</option>
                        <option value="1-3">1-3</option>
                        <option value="3-5">3-5</option>
                      </select>
                    </div>
                    <div class="field">
                      <label class="field-label" for="settings-skills">
                        Skills
                      </label>
                      <input
                        id="settings-skills"
                        class="field-input"
                        type="text"
                        placeholder="e.g. React, Node.js, SQL"
                      />
                    </div>
                    <div class="field">
                      <label class="field-label" for="settings-min-match-score">
                        Minimum match score
                      </label>
                      <input
                        id="settings-min-match-score"
                        class="field-input"
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                      />
                      <p class="field-hint">
                        Current threshold:
                        <span id="settings-min-match-score-value">40</span>
                      </p>
                    </div>
                    <div class="card__footer">
                      <div class="card__footer-left">
                        <button
                          type="submit"
                          class="button button--primary"
                        >
                          Save preferences
                        </button>
                      </div>
                    </div>
                  </form>
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
                    Preferences defined here are used to compute a deterministic match score for each job on the dashboard. They never leave your browser.
                  </p>
                </div>
              </article>
            </aside>
          </section>
        `;
        initSettingsPage();
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
              <div id="preferences-banner"></div>
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
                          <option value="score">Match score</option>
                          <option value="salary">Salary</option>
                        </select>
                      </div>
                    </div>
                    <div class="filter-bar__row">
                      <div class="filter-bar__field">
                        <label class="field-label" for="filter-only-matches">
                          Show only jobs above my threshold
                        </label>
                        <input
                          id="filter-only-matches"
                          type="checkbox"
                        />
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

  function getRawPreferences() {
    try {
      const raw = window.localStorage.getItem(PREF_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function hasPreferences() {
    return getRawPreferences() != null;
  }

  function getPreferencesOrDefault() {
    const raw = getRawPreferences();
    if (!raw || typeof raw !== "object") {
      return {
        roleKeywords: "",
        preferredLocations: [],
        preferredMode: [],
        experienceLevel: "",
        skills: "",
        minMatchScore: 40,
      };
    }

    return {
      roleKeywords: String(raw.roleKeywords || ""),
      preferredLocations: Array.isArray(raw.preferredLocations)
        ? raw.preferredLocations
        : [],
      preferredMode: Array.isArray(raw.preferredMode) ? raw.preferredMode : [],
      experienceLevel: String(raw.experienceLevel || ""),
      skills: String(raw.skills || ""),
      minMatchScore: Math.min(
        100,
        Math.max(0, Number.isFinite(raw.minMatchScore) ? raw.minMatchScore : 40)
      ),
    };
  }

  function setPreferences(preferences) {
    const safe = {
      roleKeywords: String(preferences.roleKeywords || ""),
      preferredLocations: Array.isArray(preferences.preferredLocations)
        ? preferences.preferredLocations
        : [],
      preferredMode: Array.isArray(preferences.preferredMode)
        ? preferences.preferredMode
        : [],
      experienceLevel: String(preferences.experienceLevel || ""),
      skills: String(preferences.skills || ""),
      minMatchScore: Math.min(
        100,
        Math.max(
          0,
          Number.isFinite(preferences.minMatchScore)
            ? preferences.minMatchScore
            : 40
        )
      ),
    };

    try {
      window.localStorage.setItem(PREF_KEY, JSON.stringify(safe));
    } catch (e) {
      // Ignore storage failures.
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

  function computeMatchScore(job, preferences) {
    let score = 0;

    const roleKeywords = String(preferences.roleKeywords || "")
      .split(",")
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);

    const userSkills = String(preferences.skills || "")
      .split(",")
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);

    const preferredLocations = Array.isArray(preferences.preferredLocations)
      ? preferences.preferredLocations
      : [];
    const preferredModes = Array.isArray(preferences.preferredMode)
      ? preferences.preferredMode
      : [];

    const experienceLevel = String(preferences.experienceLevel || "");

    const title = String(job.title || "").toLowerCase();
    const description = String(job.description || "").toLowerCase();

    if (roleKeywords.length > 0) {
      const inTitle = roleKeywords.some((kw) => title.includes(kw));
      if (inTitle) {
        score += 25;
      }

      const inDescription = roleKeywords.some((kw) =>
        description.includes(kw)
      );
      if (inDescription) {
        score += 15;
      }
    }

    if (preferredLocations.length > 0) {
      if (preferredLocations.includes(job.location)) {
        score += 15;
      }
    }

    if (preferredModes.length > 0) {
      if (preferredModes.includes(job.mode)) {
        score += 10;
      }
    }

    if (experienceLevel) {
      if (job.experience === experienceLevel) {
        score += 10;
      }
    }

    if (userSkills.length > 0) {
      const jobSkills = Array.isArray(job.skills)
        ? job.skills.map((s) => String(s).toLowerCase())
        : [];
      const hasOverlap = userSkills.some((skill) =>
        jobSkills.includes(skill)
      );
      if (hasOverlap) {
        score += 15;
      }
    }

    if (typeof job.postedDaysAgo === "number" && job.postedDaysAgo <= 2) {
      score += 5;
    }

    if (String(job.source || "") === "LinkedIn") {
      score += 5;
    }

    return Math.min(100, score);
  }

  function getScoreBadgeClass(score) {
    if (score >= 80) return "badge--score-high";
    if (score >= 60) return "badge--score-medium";
    if (score >= 40) return "badge--score-low";
    return "badge--score-minimal";
  }

  function getSalaryNumeric(salaryRange) {
    const raw = String(salaryRange || "");
    const match = raw.match(/(\d+(\.\d+)?)(k)?/i);
    if (!match) return 0;

    let value = parseFloat(match[1]);
    if (!Number.isFinite(value)) return 0;

    const hasK = !!match[3];
    if (hasK) {
      value *= 1000;
    } else if (/lpa/i.test(raw)) {
      value *= 100000;
    }

    return value;
  }

  function buildJobCard(job, isSaved, score) {
    const postedLabel = formatPostedDaysAgo(job.postedDaysAgo);
    const saveLabel = isSaved ? "Saved" : "Save";
    const saveDisabled = isSaved ? "disabled" : "";
    const safeScore = Number.isFinite(score) ? score : 0;
    const badgeClass = getScoreBadgeClass(safeScore);

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
          <div class="job-card__meta-row">
            <span class="badge badge--source">${escapeHtml(job.source)}</span>
            <span class="badge ${badgeClass}">Match ${escapeHtml(
              safeScore
            )}</span>
          </div>
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

  function initSettingsPage() {
    const form = document.getElementById("settings-form");
    if (!form) return;

    const roleKeywordsInput = document.getElementById(
      "settings-role-keywords"
    );
    const preferredLocationsSelect = document.getElementById(
      "settings-preferred-locations"
    );
    const modeRemote = document.getElementById("settings-mode-remote");
    const modeHybrid = document.getElementById("settings-mode-hybrid");
    const modeOnsite = document.getElementById("settings-mode-onsite");
    const experienceSelect = document.getElementById("settings-experience");
    const skillsInput = document.getElementById("settings-skills");
    const minMatchSlider = document.getElementById(
      "settings-min-match-score"
    );
    const minMatchValue = document.getElementById(
      "settings-min-match-score-value"
    );

    const preferences = getPreferencesOrDefault();

    if (roleKeywordsInput) {
      roleKeywordsInput.value = preferences.roleKeywords;
    }

    if (preferredLocationsSelect) {
      const options = Array.from(preferredLocationsSelect.options);
      options.forEach((option) => {
        option.selected = preferences.preferredLocations.includes(option.value);
      });
    }

    if (modeRemote && modeHybrid && modeOnsite) {
      modeRemote.checked = preferences.preferredMode.includes("Remote");
      modeHybrid.checked = preferences.preferredMode.includes("Hybrid");
      modeOnsite.checked = preferences.preferredMode.includes("Onsite");
    }

    if (experienceSelect) {
      experienceSelect.value = preferences.experienceLevel || "";
    }

    if (skillsInput) {
      skillsInput.value = preferences.skills;
    }

    function updateMinMatchValue(value) {
      if (minMatchValue) {
        minMatchValue.textContent = String(value);
      }
    }

    if (minMatchSlider) {
      const initial = Number.isFinite(preferences.minMatchScore)
        ? preferences.minMatchScore
        : 40;
      minMatchSlider.value = String(initial);
      updateMinMatchValue(initial);
      minMatchSlider.addEventListener("input", () => {
        updateMinMatchValue(minMatchSlider.value);
      });
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const nextPreferences = {
        roleKeywords: roleKeywordsInput?.value || "",
        preferredLocations: preferredLocationsSelect
          ? Array.from(preferredLocationsSelect.selectedOptions).map(
              (opt) => opt.value
            )
          : [],
        preferredMode: [
          modeRemote?.checked ? "Remote" : null,
          modeHybrid?.checked ? "Hybrid" : null,
          modeOnsite?.checked ? "Onsite" : null,
        ].filter(Boolean),
        experienceLevel: experienceSelect?.value || "",
        skills: skillsInput?.value || "",
        minMatchScore: minMatchSlider
          ? Number(minMatchSlider.value)
          : preferences.minMatchScore,
      };

      setPreferences(nextPreferences);
    });
  }

  function initDashboardPage() {
    const listEl = document.getElementById("job-list");
    const keywordInput = document.getElementById("filter-keyword");
    const locationSelect = document.getElementById("filter-location");
    const modeSelect = document.getElementById("filter-mode");
    const experienceSelect = document.getElementById("filter-experience");
    const sourceSelect = document.getElementById("filter-source");
    const sortSelect = document.getElementById("filter-sort");
    const onlyMatchesCheckbox = document.getElementById("filter-only-matches");
    const bannerEl = document.getElementById("preferences-banner");

    if (!listEl) return;

    function applyFiltersAndRender() {
      const preferences = getPreferencesOrDefault();
      const keyword = (keywordInput?.value || "").trim().toLowerCase();
      const location = locationSelect?.value || "";
      const mode = modeSelect?.value || "";
      const experience = experienceSelect?.value || "";
      const source = sourceSelect?.value || "";
      const sort = sortSelect?.value || "latest";
      const onlyMatches = !!onlyMatchesCheckbox?.checked;

      let scoredJobs = JOBS.map((job) => ({
        job,
        score: computeMatchScore(job, preferences),
      }));

      if (keyword) {
        scoredJobs = scoredJobs.filter(({ job }) => {
          const title = String(job.title || "").toLowerCase();
          const company = String(job.company || "").toLowerCase();
          return title.includes(keyword) || company.includes(keyword);
        });
      }

      if (location) {
        scoredJobs = scoredJobs.filter(({ job }) => job.location === location);
      }

      if (mode) {
        scoredJobs = scoredJobs.filter(({ job }) => job.mode === mode);
      }

      if (experience) {
        scoredJobs = scoredJobs.filter(
          ({ job }) => job.experience === experience
        );
      }

      if (source) {
        scoredJobs = scoredJobs.filter(({ job }) => job.source === source);
      }

      if (onlyMatches) {
        scoredJobs = scoredJobs.filter(
          ({ score }) => score >= preferences.minMatchScore
        );
      }

      scoredJobs.sort((a, b) => {
        if (sort === "score") {
          return b.score - a.score;
        }

        if (sort === "salary") {
          const aSalary = getSalaryNumeric(a.job.salaryRange);
          const bSalary = getSalaryNumeric(b.job.salaryRange);
          return bSalary - aSalary;
        }

        const diff = a.job.postedDaysAgo - b.job.postedDaysAgo;
        return sort === "latest" ? diff : -diff;
      });

      const savedIds = getSavedJobIds();

      if (scoredJobs.length === 0) {
        listEl.innerHTML = `
          <div class="job-empty-state">
            <h2 class="job-empty-state__title">No roles match your criteria.</h2>
            <p class="job-empty-state__body text-block">
              Adjust filters or lower your threshold to explore more options.
            </p>
          </div>
        `;
        return;
      }

      listEl.innerHTML = scoredJobs
        .map(({ job, score }) =>
          buildJobCard(job, savedIds.includes(job.id), score)
        )
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
    if (onlyMatchesCheckbox) {
      onlyMatchesCheckbox.addEventListener("change", applyFiltersAndRender);
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

    if (bannerEl) {
      if (!hasPreferences()) {
        bannerEl.innerHTML = `
          <div class="alert alert--empty">
            <h3 class="alert__title">Set your preferences to activate intelligent matching.</h3>
            <p class="alert__body">
              Use the Settings page to define your role, location, mode, experience, and skills so the dashboard can prioritize relevant roles.
            </p>
          </div>
        `;
      } else {
        bannerEl.innerHTML = "";
      }
    }

    applyFiltersAndRender();
  }

  function initSavedPage() {
    const listEl = document.getElementById("saved-list");
    if (!listEl) return;

    function renderSaved() {
      const preferences = getPreferencesOrDefault();
      const savedIds = getSavedJobIds();
      const jobs = JOBS.filter((job) => savedIds.includes(job.id)).map(
        (job) => ({
          job,
          score: computeMatchScore(job, preferences),
        })
      );

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
        .map(({ job, score }) => {
          const postedLabel = formatPostedDaysAgo(job.postedDaysAgo);
          const badgeClass = getScoreBadgeClass(score);
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
                <div class="job-card__meta-row">
                  <span class="badge badge--source">${escapeHtml(
                    job.source
                  )}</span>
                  <span class="badge ${badgeClass}">Match ${escapeHtml(
                    score
                  )}</span>
                </div>
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

