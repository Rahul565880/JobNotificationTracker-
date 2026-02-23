(function () {
  const ROUTES = {
    "/": { key: "dashboard", title: "Dashboard" },
    "/dashboard": { key: "dashboard", title: "Dashboard" },
    "/saved": { key: "saved", title: "Saved" },
    "/digest": { key: "digest", title: "Digest" },
    "/settings": { key: "settings", title: "Settings" },
    "/proof": { key: "proof", title: "Proof" },
  };

  function getRouteConfig(pathname) {
    return ROUTES[pathname] || null;
  }

  function normalizePathForNav(pathname) {
    if (pathname === "/") {
      return "/dashboard";
    }
    return pathname;
  }

  function renderRoute(pathname) {
    const outlet = document.getElementById("route-outlet");
    if (!outlet) return;

    const config = getRouteConfig(pathname);
    let heading;
    let subtitle;

    if (config) {
      heading = config.title;
      subtitle = "This section will be built in the next step.";
      document.title = `Job Notification App – ${config.title}`;
    } else {
      heading = "Page Not Found";
      subtitle = "The page you are looking for does not exist.";
      document.title = "Job Notification App – Page Not Found";
    }

    outlet.innerHTML = `
      <h1 class="context-header__title">${heading}</h1>
      <p class="context-header__subtitle text-block">${subtitle}</p>
    `;

    updateActiveLink(normalizePathForNav(pathname), !!config);
  }

  function updateActiveLink(normalizedPath, isKnownRoute) {
    const links = document.querySelectorAll(".top-nav__link");
    links.forEach((link) => {
      link.classList.remove("top-nav__link--active");
    });

    if (!isKnownRoute) {
      return;
    }

    links.forEach((link) => {
      const route = link.getAttribute("data-route");
      if (route === normalizedPath) {
        link.classList.add("top-nav__link--active");
      }
    });
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

  function handleNavClick(event) {
    const link = event.target.closest(".top-nav__link");
    if (!link) return;

    const href = link.getAttribute("data-route") || link.getAttribute("href");
    if (!href) return;

    event.preventDefault();

    const currentPath = window.location.pathname;
    const targetPath = href;

    const normalizedCurrent = normalizePathForNav(currentPath);
    const normalizedTarget = normalizePathForNav(targetPath);

    if (normalizedCurrent === normalizedTarget) {
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
    const nav = document.querySelector(".top-nav");
    const toggle = document.querySelector(".top-nav__toggle");

    if (nav) {
      nav.addEventListener("click", handleNavClick);
    }

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

