// Routeur history API — les URLs reproduisent exactement celles du site original.

import { LOCALES, DEFAULT_LOCALE } from "./i18n.js";

/**
 * Prefixe de deploiement, injecte par la page (vide en local).
 * Il est retire du chemin avant le routage et remis avant tout pushState :
 * le reste de l'application continue de raisonner en URLs d'origine.
 */
export const BASE = String(window.__BASE__ || "").replace(/\/$/, "");

const stripBase = (p) => (BASE && (p === BASE || p.startsWith(BASE + "/")) ? p.slice(BASE.length) || "/" : p);
const withBase = (p) => (BASE && p.startsWith("/") && !p.startsWith(BASE + "/") && p !== BASE ? BASE + p : p);

const ROUTES = [
  { name: "home", pattern: /^\/$/ },
  { name: "ranking", pattern: /^\/ranking\/?$/ },
  { name: "rankingLearnMore", pattern: /^\/ranking\/learn-more$/ },
  { name: "searchCoaster", pattern: /^\/search-coaster\/?$/ },
  { name: "searchResults", pattern: /^\/search\/?$/ },
  { name: "map", pattern: /^\/map\/?$/ },
  { name: "userMap", pattern: /^\/map\/users\/(\d+)$/, keys: ["userId"] },
  { name: "tops", pattern: /^\/tops\/?$/ },
  { name: "topNew", pattern: /^\/tops\/new$/ },
  { name: "topEdit", pattern: /^\/tops\/([\w-]+)\/edit$/, keys: ["id"] },
  { name: "top", pattern: /^\/tops\/([\w-]+)$/, keys: ["id"] },
  { name: "reviews", pattern: /^\/reviews\/?$/ },
  { name: "reviewForm", pattern: /^\/reviews\/coasters\/(\d+)\/form$/, keys: ["coasterId"] },
  { name: "users", pattern: /^\/users\/?$/ },
  { name: "userRatings", pattern: /^\/users\/(\d+)\/ratings$/, keys: ["userId"] },
  { name: "userReviews", pattern: /^\/users\/(\d+)\/reviews$/, keys: ["userId"] },
  { name: "userTops", pattern: /^\/users\/(\d+)\/tops$/, keys: ["userId"] },
  { name: "user", pattern: /^\/users\/([^/]+)$/, keys: ["slug"] },
  { name: "coasterUpload", pattern: /^\/coasters\/([^/]+)\/images\/upload$/, keys: ["slug"] },
  { name: "coaster", pattern: /^\/coasters\/(\d+)\/([^/]*)$/, keys: ["id", "slug"] },
  { name: "park", pattern: /^\/parks\/(\d+)\/([^/]*)$/, keys: ["id", "slug"] },
  { name: "login", pattern: /^\/login$/ },
  { name: "logout", pattern: /^\/logout$/ },
  { name: "register", pattern: /^\/register$/ },
  { name: "contact", pattern: /^\/contact$/ },
  { name: "terms", pattern: /^\/terms-conditions$/ },
  { name: "profile", pattern: /^\/profile$/ },
  { name: "profileSettings", pattern: /^\/profile\/settings$/ },
  { name: "profileRatings", pattern: /^\/profile\/ratings$/ },
  { name: "profileReviews", pattern: /^\/profile\/reviews$/ },
  { name: "profileTops", pattern: /^\/profile\/tops$/ },
  { name: "profileMap", pattern: /^\/profile\/map$/ },
];

export function parseLocation(pathname, search) {
  let path = stripBase(pathname).replace(/\/+$/, "") || "/";
  let locale = DEFAULT_LOCALE;

  const m = /^\/([a-z]{2})(\/.*)?$/.exec(path);
  if (m && LOCALES.includes(m[1])) {
    locale = m[1];
    path = m[2] || "/";
  } else if (path !== "/") {
    return { locale: null, route: null, path, query: new URLSearchParams(search) };
  } else {
    return { locale: null, route: null, path: "/", query: new URLSearchParams(search) };
  }

  // Rétablit le slash final pour les routes qui l'utilisent.
  const normalized = path === "" ? "/" : path;
  for (const route of ROUTES) {
    const match = route.pattern.exec(normalized) || route.pattern.exec(normalized + "/");
    if (match) {
      const params = {};
      (route.keys || []).forEach((k, i) => (params[k] = decodeURIComponent(match[i + 1])));
      return { locale, route: route.name, params, path: normalized, query: new URLSearchParams(search) };
    }
  }
  return { locale, route: "notFound", params: {}, path: normalized, query: new URLSearchParams(search) };
}

let onNavigate = () => {};

export function initRouter(handler) {
  onNavigate = handler;
  window.addEventListener("popstate", () => onNavigate(location.pathname, location.search));
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-link]");
    if (!a) return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("http") || href.startsWith("#") || a.target === "_blank") return;
    e.preventDefault();
    navigate(href);
  });
  onNavigate(location.pathname, location.search);
}

export function navigate(href, { replace = false } = {}) {
  const url = new URL(withBase(href), location.origin);
  if (replace) history.replaceState({}, "", url);
  else history.pushState({}, "", url);
  onNavigate(url.pathname, url.search);
}

export { withBase };

/** Met à jour la query string sans recharger la page (filtres, pagination). */
export function replaceQuery(queryString) {
  const url = location.pathname + (queryString ? `?${queryString}` : "");
  history.replaceState({}, "", url);
}
