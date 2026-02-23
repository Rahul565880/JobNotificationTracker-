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
    "/jt/07-test": { key: "test", title: "Test Checklist", navRoute: null },
    "/jt/08-ship": { key: "ship", title: "Ship", navRoute: null },
  };

  const STORAGE_KEY = "job_notification_tracker_saved";
  const PREF_KEY = "jobTrackerPreferences";
  const STATUS_KEY = "jobTrackerStatus";
  const STATUS_UPDATES_KEY = "jobTrackerStatusUpdates";
  const TEST_KEY = "jobTrackerTestStatus";
  const JOBS = Array.isArray(window.JOB_DATA) ? window.JOB_DATA : [];
  const STATUSES = ["Not Applied", "Applied", "Rejected", "Selected"];
  const TEST_ITEMS = [
    {
      id: "pref-persist",
      label: "Preferences persist after refresh",
      how: "Set preferences in Settings, refresh the page, confirm fields remain filled.",
    },
    {
      id: "score-correct",
      label: "Match score calculates correctly",
      how: "Pick one job and confirm each scoring rule adds the expected points based on your preferences.",
    },
    {
      id: "only-matches-toggle",
      label: '"Show only matches" toggle works',
      how: 'On Dashboard, enable "Show only jobs above my threshold" and confirm only jobs >= minMatchScore remain.',
    },
    {
      id: "save-persist",
      label: "Save job persists after refresh",
      how: "Save a job on Dashboard, refresh, then confirm it remains on Saved page.",
    },
    {
      id: "apply-new-tab",
      label: "Apply opens in new tab",
      how: 'Click "Apply" on a job and confirm it opens the apply URL in a new tab.',
    },
    {
      id: "status-persist",
      label: "Status update persists after refresh",
      how: "Change a job status, refresh, and confirm the same status still shows on the card.",
    },
    {
      id: "status-filter",
      label: "Status filter works correctly",
      how: "Set a few different statuses, then filter Dashboard by each status and confirm the list updates correctly.",
    },
    {
      id: "digest-top-10",
      label: "Digest generates top 10 by score",
      how: "Generate digest and confirm jobs are ordered by match score (desc) then postedDaysAgo (asc).",
    },
    {
      id: "digest-persist-day",
      label: "Digest persists for the day",
      how: "Generate digest, refresh, then generate again and confirm it loads the same stored digest for today.",
    },
    {
      id: "no-console-errors",
      label: "No console errors on main pages",
      how: "Open DevTools console and visit Dashboard, Saved, Settings, Digest. Confirm no errors are logged.",
    },
  ];

  function getRouteConfig(pathname) {
    return ROUTES[pathname] || null;
  }

  function getTestStatus() {
    try {
      const raw = window.localStorage.getItem(TEST_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  function setTestStatus(statusMap) {
    try {
      window.localStorage.setItem(TEST_KEY, JSON.stringify(statusMap));
    } catch (e) {
      // Ignore storage issues.
    }
  }

  function getPassedCount() {
    const status = getTestStatus();
    return TEST_ITEMS.reduce(
      (count, item) => count + (status[item.id] ? 1 : 0),
      0
    );
  }

  function areAllTestsPassed() {
    return getPassedCount() === TEST_ITEMS.length;
  }

  function guardShipRoute(pathname) {
    if (pathname !== "/jt/08-ship") return pathname;
    if (areAllTestsPassed()) return pathname;
    window.history.replaceState({}, "", "/jt/07-test");
    showToast("Complete all tests before shipping.");
    return "/jt/07-test";
  }

  function renderRoute(pathname) {
    const outlet = document.getElementById("route-outlet");
    if (!outlet) return;

    const guardedPath = guardShipRoute(pathname);
    const config = getRouteConfig(guardedPath);

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
                        <label class="field-label" for="filter-status">Status</label>
                        <select id="filter-status" class="field-input">
                          <option value="">All</option>
                          <option value="Not Applied">Not Applied</option>
                          <option value="Applied">Applied</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Selected">Selected</option>
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
              A concise summary of the most relevant roles based on your preferences.
            </p>
          </section>
          <section class="digest-shell">
            <article class="digest-card">
              <header class="digest-card__header">
                <div>
                  <h2 class="digest-card__title">
                    Top 10 Jobs For You — 9AM Digest
                  </h2>
                  <p class="digest-card__subtitle" id="digest-date"></p>
                </div>
                <p class="digest-card__note">
                  Demo Mode: Daily 9AM trigger simulated manually.
                </p>
              </header>
              <div class="digest-card__actions">
                <button
                  type="button"
                  class="button button--primary"
                  id="digest-generate"
                >
                  Generate Today's 9AM Digest (Simulated)
                </button>
                <button
                  type="button"
                  class="button button--secondary"
                  id="digest-copy"
                >
                  Copy Digest to Clipboard
                </button>
                <button
                  type="button"
                  class="button button--secondary"
                  id="digest-email"
                >
                  Create Email Draft
                </button>
              </div>
              <div id="digest-content"></div>
            </article>
          </section>
        `;
        initDigestPage();
        break;
      case "test":
        outlet.innerHTML = `
          <section class="context-header">
            <h1 class="context-header__title">Built-In Test Checklist</h1>
            <p class="context-header__subtitle text-block">
              Confirm core behaviors before shipping. Each test is stored locally and persists after refresh.
            </p>
          </section>
          <section class="workspace">
            <div class="workspace__primary">
              <article class="card">
                <header class="card__header">
                  <h2 class="card__title">
                    Tests Passed: <span id="test-passed-count">0</span> / 10
                  </h2>
                  <p class="card__subtitle text-block" id="test-warning"></p>
                </header>
                <div class="card__body">
                  <div class="test-list" id="test-list"></div>
                </div>
                <footer class="card__footer">
                  <div class="card__footer-left">
                    <button
                      type="button"
                      class="button button--secondary"
                      id="test-reset"
                    >
                      Reset Test Status
                    </button>
                  </div>
                </footer>
              </article>
            </div>
            <aside class="workspace__secondary">
              <article class="card">
                <header class="card__header card__header--compact">
                  <h2 class="card__title">Notes</h2>
                </header>
                <div class="card__body card__body--stack">
                  <p class="text-block">
                    This checklist is designed to be deterministic and repeatable. Clear this state if you want a fresh pass.
                  </p>
                </div>
              </article>
            </aside>
          </section>
        `;
        initTestChecklistPage();
        break;
      case "ship":
        outlet.innerHTML = `
          <section class="context-header">
            <h1 class="context-header__title">Ship</h1>
            <p class="context-header__subtitle text-block">
              Complete all tests before shipping.
            </p>
          </section>
          <div class="job-empty-state">
            <h2 class="job-empty-state__title">Complete all tests before shipping.</h2>
            <p class="job-empty-state__body text-block">
              Visit <span class="meta-text">/jt/07-test</span> and check all 10 items to unlock shipping.
            </p>
          </div>
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

  function getStatusMap() {
    try {
      const raw = window.localStorage.getItem(STATUS_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  function setStatusMap(statusMap) {
    try {
      window.localStorage.setItem(STATUS_KEY, JSON.stringify(statusMap));
    } catch (e) {
      // Ignore storage issues.
    }
  }

  function getJobStatus(jobId) {
    const map = getStatusMap();
    const value = map && typeof map === "object" ? map[jobId] : null;
    if (STATUSES.includes(value)) {
      return value;
    }
    return "Not Applied";
  }

  function setJobStatus(jobId, status) {
    if (!STATUSES.includes(status)) return;
    const map = getStatusMap();
    map[jobId] = status;
    setStatusMap(map);
  }

  function getStatusBadgeClass(status) {
    if (status === "Applied") return "badge--status-applied";
    if (status === "Rejected") return "badge--status-rejected";
    if (status === "Selected") return "badge--status-selected";
    return "badge--status-not-applied";
  }

  function getStatusUpdates() {
    try {
      const raw = window.localStorage.getItem(STATUS_UPDATES_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function pushStatusUpdate(entry) {
    const next = [
      entry,
      ...getStatusUpdates().filter((e) => e && e.jobId !== entry.jobId),
    ].slice(0, 30);

    try {
      window.localStorage.setItem(STATUS_UPDATES_KEY, JSON.stringify(next));
    } catch (e) {
      // Ignore storage issues.
    }
  }

  function showToast(message) {
    const root = document.getElementById("toast-root");
    if (!root) return;

    let stack = root.querySelector(".toast-stack");
    if (!stack) {
      stack = document.createElement("div");
      stack.className = "toast-stack";
      root.appendChild(stack);
    }

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    stack.appendChild(toast);

    window.setTimeout(() => {
      toast.classList.add("toast--leaving");
      window.setTimeout(() => {
        toast.remove();
      }, 220);
    }, 2400);
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
    const status = getJobStatus(job.id);
    const statusBadgeClass = getStatusBadgeClass(status);

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
            <span class="badge badge--status ${statusBadgeClass}">${escapeHtml(
              status
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
        <div class="status-group" data-status-group="${escapeHtml(job.id)}">
          ${STATUSES.map((s) => {
            const active = s === status ? "status-group__button--active" : "";
            return `
              <button
                type="button"
                class="status-group__button ${active}"
                data-action="status"
                data-job-id="${escapeHtml(job.id)}"
                data-status="${escapeHtml(s)}"
              >
                ${escapeHtml(s)}
              </button>
            `;
          }).join("")}
        </div>
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

  function getTodayDigestKey() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `jobTrackerDigest_${year}-${month}-${day}`;
  }

  function getStoredDigest(key) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return null;
      return parsed;
    } catch (e) {
      return null;
    }
  }

  function setStoredDigest(key, digestEntries) {
    try {
      window.localStorage.setItem(key, JSON.stringify(digestEntries));
    } catch (e) {
      // Ignore storage issues.
    }
  }

  function buildDigestEntries(preferences) {
    const scoredJobs = JOBS.map((job) => ({
      jobId: job.id,
      score: computeMatchScore(job, preferences),
      postedDaysAgo: job.postedDaysAgo,
    }));

    scoredJobs.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.postedDaysAgo - b.postedDaysAgo;
    });

    const top = scoredJobs.slice(0, 10).filter((entry) => entry.score > 0);
    return top;
  }

  function resolveDigestJobs(digestEntries, preferences) {
    const byId = new Map(JOBS.map((job) => [job.id, job]));
    return digestEntries
      .map((entry) => {
        const job = byId.get(entry.jobId);
        if (!job) return null;
        return {
          job,
          score: entry.score,
        };
      })
      .filter(Boolean)
      .map((item) => ({
        job: item.job,
        score: Number.isFinite(item.score)
          ? item.score
          : computeMatchScore(item.job, preferences),
      }));
  }

  function formatDigestDate() {
    const today = new Date();
    return today.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function buildDigestText(jobsWithScores) {
    const lines = [];
    lines.push("Top 10 Jobs For You — 9AM Digest");
    lines.push(formatDigestDate());
    lines.push("");

    jobsWithScores.forEach(({ job, score }, index) => {
      lines.push(
        `${index + 1}. ${job.title} at ${job.company} (${job.location})`
      );
      lines.push(
        `   Experience: ${job.experience} · Match Score: ${score} · Mode: ${job.mode}`
      );
      if (job.applyUrl) {
        lines.push(`   Apply: ${job.applyUrl}`);
      }
      lines.push("");
    });

    lines.push("This digest was generated based on your preferences.");

    return lines.join("\n");
  }

  function initDigestPage() {
    const generateButton = document.getElementById("digest-generate");
    const copyButton = document.getElementById("digest-copy");
    const emailButton = document.getElementById("digest-email");
    const contentEl = document.getElementById("digest-content");
    const dateEl = document.getElementById("digest-date");

    if (dateEl) {
      dateEl.textContent = formatDigestDate();
    }

    if (!contentEl || !generateButton || !copyButton || !emailButton) {
      return;
    }

    let currentDigestJobs = [];

    function renderRecentStatusUpdates() {
      const updates = getStatusUpdates();
      const byId = new Map(JOBS.map((job) => [job.id, job]));

      const list = updates
        .map((u) => {
          const job = byId.get(u.jobId);
          if (!job) return null;
          return {
            job,
            status: STATUSES.includes(u.status) ? u.status : "Not Applied",
            changedAt: u.changedAt ? new Date(u.changedAt) : null,
          };
        })
        .filter(Boolean)
        .slice(0, 10);

      if (list.length === 0) {
        return `
          <div class="job-empty-state">
            <h2 class="job-empty-state__title">Recent Status Updates</h2>
            <p class="job-empty-state__body text-block">
              Status updates will appear here after you mark a job as Applied, Rejected, or Selected.
            </p>
          </div>
        `;
      }

      return `
        <div class="digest-job-list">
          <h3 class="digest-job__title">Recent Status Updates</h3>
          ${list
            .map(({ job, status, changedAt }) => {
              const badgeClass = getStatusBadgeClass(status);
              const dateLabel = changedAt
                ? changedAt.toLocaleString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "";
              return `
                <div class="digest-job">
                  <div class="digest-job__main">
                    <h3 class="digest-job__title">${escapeHtml(job.title)}</h3>
                    <p class="digest-job__meta">
                      ${escapeHtml(job.company)} · ${escapeHtml(status)} · ${escapeHtml(
                dateLabel
              )}
                    </p>
                  </div>
                  <div class="digest-job__side">
                    <span class="badge badge--status ${badgeClass}">${escapeHtml(
                      status
                    )}</span>
                  </div>
                </div>
              `;
            })
            .join("")}
        </div>
      `;
    }

    function renderDigest(jobsWithScores) {
      currentDigestJobs = jobsWithScores;

      if (jobsWithScores.length === 0) {
        contentEl.innerHTML = `
          <div class="job-empty-state">
            <h2 class="job-empty-state__title">No matching roles today. Check again tomorrow.</h2>
            <p class="job-empty-state__body text-block">
              No jobs reached a positive match score with your current preferences.
            </p>
          </div>
        `;
        return;
      }

      contentEl.innerHTML = `
        <div class="digest-job-list">
          ${jobsWithScores
            .map(({ job, score }) => {
              const badgeClass = getScoreBadgeClass(score);
              return `
                <div class="digest-job">
                  <div class="digest-job__main">
                    <h3 class="digest-job__title">${escapeHtml(job.title)}</h3>
                    <p class="digest-job__meta">
                      ${escapeHtml(job.company)} · ${escapeHtml(
                job.location
              )} · Experience: ${escapeHtml(job.experience)}
                    </p>
                  </div>
                  <div class="digest-job__side">
                    <span class="badge ${badgeClass}">Match ${escapeHtml(
                      score
                    )}</span>
                    <button
                      type="button"
                      class="button button--primary"
                      data-digest-apply="${escapeHtml(job.id)}"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              `;
            })
            .join("")}
        </div>
        <p class="digest-card__footer">
          This digest was generated based on your preferences.
        </p>
      `;
    }

    function ensureDigestForToday() {
      if (!hasPreferences()) {
        contentEl.innerHTML = `
          <div class="job-empty-state">
            <h2 class="job-empty-state__title">Set preferences to generate a personalized digest.</h2>
            <p class="job-empty-state__body text-block">
              Visit the Settings page to define your preferences before generating a 9AM digest.
            </p>
          </div>
        `;
        return;
      }

      const key = getTodayDigestKey();
      const preferences = getPreferencesOrDefault();
      let digestEntries = getStoredDigest(key);

      if (!digestEntries) {
        digestEntries = buildDigestEntries(preferences);
        setStoredDigest(key, digestEntries);
      }

      const jobsWithScores = resolveDigestJobs(digestEntries, preferences);
      renderDigest(jobsWithScores);
    }

    generateButton.addEventListener("click", () => {
      ensureDigestForToday();
    });

    contentEl.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const applyAttr = target.getAttribute("data-digest-apply");
      if (!applyAttr) return;

      const job = JOBS.find((j) => j.id === applyAttr);
      if (job && job.applyUrl) {
        window.open(job.applyUrl, "_blank", "noreferrer");
      }
    });

    copyButton.addEventListener("click", () => {
      if (!currentDigestJobs.length) {
        ensureDigestForToday();
      }

      if (!currentDigestJobs.length) {
        return;
      }

      const text = buildDigestText(currentDigestJobs);

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand("copy");
        } catch (e) {
          // Ignore failures.
        }
        document.body.removeChild(textarea);
      }
    });

    emailButton.addEventListener("click", () => {
      if (!currentDigestJobs.length) {
        ensureDigestForToday();
      }

      if (!currentDigestJobs.length) {
        return;
      }

      const text = buildDigestText(currentDigestJobs);
      const subject = "My 9AM Job Digest";
      const mailto = `mailto:?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(text)}`;
      window.location.href = mailto;
    });

    contentEl.innerHTML = renderRecentStatusUpdates();
  }

  function initTestChecklistPage() {
    const listEl = document.getElementById("test-list");
    const passedEl = document.getElementById("test-passed-count");
    const warningEl = document.getElementById("test-warning");
    const resetButton = document.getElementById("test-reset");
    if (!listEl || !passedEl || !warningEl || !resetButton) return;

    function render() {
      const status = getTestStatus();
      const passed = TEST_ITEMS.reduce(
        (count, item) => count + (status[item.id] ? 1 : 0),
        0
      );

      passedEl.textContent = String(passed);
      warningEl.textContent =
        passed < TEST_ITEMS.length ? "Resolve all issues before shipping." : "";

      listEl.innerHTML = TEST_ITEMS.map((item) => {
        const checked = !!status[item.id];
        return `
          <label class="test-item">
            <input
              class="test-item__checkbox"
              type="checkbox"
              data-test-id="${escapeHtml(item.id)}"
              ${checked ? "checked" : ""}
            />
            <span class="test-item__label">${escapeHtml(item.label)}</span>
            <span
              class="test-item__hint"
              title="${escapeHtml(item.how)}"
            >
              How to test
            </span>
          </label>
        `;
      }).join("");
    }

    listEl.addEventListener("change", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) return;
      if (target.type !== "checkbox") return;

      const id = target.getAttribute("data-test-id");
      if (!id) return;

      const status = getTestStatus();
      status[id] = target.checked;
      setTestStatus(status);
      render();
    });

    resetButton.addEventListener("click", () => {
      try {
        window.localStorage.removeItem(TEST_KEY);
      } catch (e) {
        // Ignore failures.
      }
      render();
    });

    render();
  }

  function initDashboardPage() {
    const listEl = document.getElementById("job-list");
    const keywordInput = document.getElementById("filter-keyword");
    const locationSelect = document.getElementById("filter-location");
    const modeSelect = document.getElementById("filter-mode");
    const experienceSelect = document.getElementById("filter-experience");
    const statusSelect = document.getElementById("filter-status");
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
      const statusFilter = statusSelect?.value || "";
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

      if (statusFilter) {
        scoredJobs = scoredJobs.filter(
          ({ job }) => getJobStatus(job.id) === statusFilter
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
    if (statusSelect) {
      statusSelect.addEventListener("change", applyFiltersAndRender);
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
      } else if (action === "status") {
        const nextStatus = actionElement.getAttribute("data-status");
        if (!nextStatus) return;

        setJobStatus(jobId, nextStatus);

        if (nextStatus !== "Not Applied") {
          pushStatusUpdate({
            jobId,
            status: nextStatus,
            changedAt: new Date().toISOString(),
          });
          showToast(`Status updated: ${nextStatus}`);
        }

        applyFiltersAndRender();
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
          const status = getJobStatus(job.id);
          const statusBadgeClass = getStatusBadgeClass(status);
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
                  <span class="badge badge--status ${statusBadgeClass}">${escapeHtml(
                    status
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
              <div class="status-group" data-status-group="${escapeHtml(job.id)}">
                ${STATUSES.map((s) => {
                  const active = s === status ? "status-group__button--active" : "";
                  return `
                    <button
                      type="button"
                      class="status-group__button ${active}"
                      data-action="status"
                      data-job-id="${escapeHtml(job.id)}"
                      data-status="${escapeHtml(s)}"
                    >
                      ${escapeHtml(s)}
                    </button>
                  `;
                }).join("")}
              </div>
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
      } else if (action === "status") {
        const nextStatus = actionElement.getAttribute("data-status");
        if (!nextStatus) return;

        setJobStatus(jobId, nextStatus);

        if (nextStatus !== "Not Applied") {
          pushStatusUpdate({
            jobId,
            status: nextStatus,
            changedAt: new Date().toISOString(),
          });
          showToast(`Status updated: ${nextStatus}`);
        }

        renderSaved();
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

    if (targetPath === "/jt/08-ship" && !areAllTestsPassed()) {
      showToast("Complete all tests before shipping.");
      window.history.pushState({}, "", "/jt/07-test");
      closeMobileMenu();
      renderRoute(window.location.pathname);
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

