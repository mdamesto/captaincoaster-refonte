// Point d'entrée : bootstrap des données, routage, comportements globaux.

import { parseLocation, initRouter, navigate, BASE, withBase } from "./router.js";
import { setLocale, getLocale, t, DEFAULT_LOCALE, LOCALES } from "./i18n.js";
import {
  loadCore, loadState, getState, updateSettings, isLoggedIn, setRating, myRating, logout,
  toggleUpvote, reportReview,
} from "./store.js";
import { renderShell, applyBodyClasses } from "./components/layout.js";
import { notify } from "./components/widgets.js";
import { initGlobalSearch } from "./components/search.js";

const root = document.getElementById("root");

const PAGES = {
  home: () => import("./pages/home.js"),
  ranking: () => import("./pages/ranking.js"),
  rankingLearnMore: () => import("./pages/learn-more.js"),
  searchCoaster: () => import("./pages/search-coaster.js"),
  searchResults: () => import("./pages/search-results.js"),
  map: () => import("./pages/map.js"),
  userMap: () => import("./pages/map.js"),
  profileMap: () => import("./pages/map.js"),
  tops: () => import("./pages/tops.js"),
  top: () => import("./pages/top.js"),
  topNew: () => import("./pages/top-edit.js"),
  topEdit: () => import("./pages/top-edit.js"),
  reviews: () => import("./pages/reviews.js"),
  reviewForm: () => import("./pages/review-form.js"),
  users: () => import("./pages/users.js"),
  user: () => import("./pages/user.js"),
  userRatings: () => import("./pages/user-ratings.js"),
  userReviews: () => import("./pages/user-reviews.js"),
  userTops: () => import("./pages/user-tops.js"),
  profileTops: () => import("./pages/user-tops.js"),
  profileRatings: () => import("./pages/user-ratings.js"),
  profileReviews: () => import("./pages/user-reviews.js"),
  profile: () => import("./pages/user.js"),
  profileSettings: () => import("./pages/settings.js"),
  coaster: () => import("./pages/coaster.js"),
  coasterUpload: () => import("./pages/coaster-upload.js"),
  park: () => import("./pages/park.js"),
  login: () => import("./pages/login.js"),
  register: () => import("./pages/login.js"),
  contact: () => import("./pages/contact.js"),
  terms: () => import("./pages/terms.js"),
  notFound: () => import("./pages/not-found.js"),
};

let currentCtx = null;

async function render(pathname, search) {
  const loc = parseLocation(pathname, search);

  // Pas de locale dans l'URL -> redirection vers la locale préférée.
  if (!loc.locale) {
    const preferred =
      getState().settings.locale ||
      LOCALES.find((l) => navigator.language?.toLowerCase().startsWith(l)) ||
      DEFAULT_LOCALE;
    navigate(`/${preferred}/`, { replace: true });
    return;
  }

  setLocale(loc.locale);
  updateSettings({ locale: loc.locale });

  if (loc.route === "logout") {
    logout();
    notify(t("nav.logout"), "success");
    navigate(`/${loc.locale}/`, { replace: true });
    return;
  }

  const ctx = { ...loc, t, locale: loc.locale };
  currentCtx = ctx;

  const loader = PAGES[loc.route] || PAGES.notFound;
  let page;
  try {
    const mod = await loader();
    page = await mod.render(ctx);
  } catch (err) {
    console.error(err);
    const mod = await PAGES.notFound();
    page = await mod.render(ctx);
  }
  if (currentCtx !== ctx) return; // navigation plus récente

  document.title = page.documentTitle || `${page.title || ""} • Captain Coaster`;
  applyBodyClasses(page);
  root.innerHTML = renderShell(page, loc.path === "/" ? `/${loc.locale}/` : `/${loc.locale}${loc.path}`);
  applyBasePrefix(root);
  window.scrollTo(0, 0);
  page.mount?.(root, ctx);
  initGlobalSearch(root, ctx);
}

/**
 * Les gabarits ecrivent les liens en URLs d'origine (`/en/...`). Sous un prefixe
 * de deploiement, on les recrit apres rendu pour que l'ouverture dans un nouvel
 * onglet et le copier-coller d'URL fonctionnent aussi.
 */
function applyBasePrefix(scope) {
  if (!BASE) return;
  scope.querySelectorAll('a[href^="/"]:not([href^="//"])').forEach((a) => {
    a.setAttribute("href", withBase(a.getAttribute("href")));
  });
}

/* ------------------------------------------------------------ comportements globaux */

function initGlobalBehaviours() {
  // Menus déroulants navbar
  document.addEventListener("click", (e) => {
    const toggle = e.target.closest("[data-dropdown] > .dropdown-toggle");
    document.querySelectorAll("[data-dropdown].open").forEach((d) => {
      if (!toggle || d !== toggle.parentElement) d.classList.remove("open");
    });
    if (toggle) {
      e.preventDefault();
      toggle.parentElement.classList.toggle("open");
    }
  });

  // Repli de la sidebar principale
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-action='toggle-sidebar']")) {
      e.preventDefault();
      const collapsed = !document.body.classList.contains("sidebar-xs");
      document.body.classList.toggle("sidebar-xs", collapsed);
      updateSettings({ sidebarCollapsed: collapsed });
    }
    if (e.target.closest("[data-action='toggle-sidebar-mobile']")) {
      e.preventDefault();
      document.body.classList.toggle("sidebar-mobile-main");
    }
    if (e.target.closest("[data-action='toggle-navbar']")) {
      e.preventDefault();
      document.body.classList.toggle("navbar-open");
    }
  });

  // Fermeture des alertes
  document.addEventListener("click", (e) => {
    const close = e.target.closest(".alert .close");
    if (close) {
      e.preventDefault();
      close.closest(".alert").remove();
    }
  });

  // Interrupteurs (filtres)
  document.addEventListener("change", (e) => {
    const input = e.target.closest(".toggle-switch-form-group input[type=checkbox]");
    if (input) input.closest(".toggle-switch-form-group").classList.toggle("checked", input.checked);
  });

  // Étoiles : survol + clic (demi-étoiles)
  document.addEventListener("mousemove", (e) => {
    const widget = e.target.closest(".rating-stars:not(.readonly)");
    if (!widget) return;
    paintStars(widget, valueFromEvent(widget, e));
  });
  document.addEventListener("mouseleave", (e) => {
    const widget = e.target.closest?.(".rating-stars");
    if (widget) paintStars(widget, Number(widget.dataset.value) || 0);
  }, true);
  document.addEventListener("click", (e) => {
    const widget = e.target.closest(".rating-stars:not(.readonly)");
    if (!widget) return;
    e.preventDefault();
    const value = valueFromEvent(widget, e);
    if (!isLoggedIn()) {
      navigate(`/${getLocale()}/login`);
      return;
    }
    const coasterId = Number(widget.dataset.rating);
    if (widget.dataset.formField) {
      widget.dataset.value = String(value);
      paintStars(widget, value);
      const field = document.getElementById(widget.dataset.formField);
      if (field) field.value = String(value);
      return;
    }
    setRating(coasterId, value);
    widget.dataset.value = String(value);
    paintStars(widget, value);
    widget.classList.add("rating-confirmed");
    setTimeout(() => widget.classList.remove("rating-confirmed"), 600);
    notify(t("coaster.ratingSaved"), "success");
    document.dispatchEvent(new CustomEvent("cc:rating", { detail: { coasterId, value } }));
  });

  // Avis : déplier / replier, vote utile, signalement
  document.addEventListener("click", (e) => {
    const toggle = e.target.closest("[data-review-toggle]");
    if (toggle) {
      e.preventDefault();
      const box = toggle.closest("[data-review-content]");
      const short = box.querySelector(".review-short");
      const full = box.querySelector(".review-full");
      const expanded = full.style.display !== "none";
      full.style.display = expanded ? "none" : "block";
      short.style.display = expanded ? "block" : "none";
      return;
    }
    const upvote = e.target.closest("[data-upvote]");
    if (upvote) {
      e.preventDefault();
      const id = Number(upvote.dataset.upvote);
      const added = toggleUpvote(id);
      const counter = upvote.parentElement.querySelector("[data-upvote-count]");
      counter.textContent = String(Number(counter.textContent) + (added ? 1 : -1));
      upvote.classList.toggle("text-success", added);
      return;
    }
    const report = e.target.closest("[data-report]");
    if (report) {
      e.preventDefault();
      reportReview(Number(report.dataset.report));
      notify(t("reviews.reported"), "success");
    }
  });

  // Fermeture des dropdowns de recherche au clic extérieur
  document.addEventListener("click", (e) => {
    if (!e.target.closest("[data-search]")) {
      document.querySelectorAll("[data-search].search-open").forEach((el) => el.classList.remove("search-open"));
    }
  });
}

function valueFromEvent(widget, e) {
  const rect = widget.getBoundingClientRect();
  const ratio = ((e.clientX - rect.left) / rect.width) * 5;
  return Math.max(0.5, Math.min(5, Math.round(ratio * 2) / 2));
}

export function paintStars(widget, value) {
  widget.querySelectorAll(".rating-star").forEach((star, i) => {
    const n = i + 1;
    star.classList.remove("star-full", "star-half", "star-empty");
    star.classList.add(value >= n ? "star-full" : value >= n - 0.5 ? "star-half" : "star-empty");
  });
}

/* ------------------------------------------------------------ démarrage */

async function boot() {
  loadState();
  initGlobalBehaviours();
  root.innerHTML = `<div style="padding:80px;text-align:center;color:#999">Loading…</div>`;
  await loadCore();
  initRouter(render);
}

boot().catch((err) => {
  console.error(err);
  root.innerHTML = `<div style="padding:80px;text-align:center;color:#c62828">Impossible de charger les données : ${err.message}</div>`;
});

export { myRating };
