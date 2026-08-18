// Chrome de l'application : navbar, sidebar principale, en-tête de page, footer.

import { icon } from "../icons.js";
import { t, getLocale, LOCALES, LOCALE_NAMES } from "../i18n.js";
import { esc, avatarUrl } from "../util.js";
import { isLoggedIn, currentUser, displayName, getState } from "../store.js";

export const NAV_ITEMS = [
  { key: "home", href: "/", icon: "home", label: "nav.home" },
  { key: "ranking", href: "/ranking/", icon: "trophy", label: "nav.ranking" },
  { key: "search", href: "/search-coaster/", icon: "search", label: "nav.search" },
  { key: "map", href: "/map/", icon: "mapPin", label: "nav.map" },
  { key: "tops", href: "/tops/", icon: "clipboard", label: "nav.tops" },
  { key: "reviews", href: "/reviews", icon: "chat", label: "nav.reviews" },
  { key: "users", href: "/users", icon: "users", label: "nav.users" },
  { key: "blog", href: "https://blog.captaincoaster.com", icon: "book", label: "nav.blog", external: true },
  { key: "contact", href: "/contact", icon: "envelope", label: "nav.contact" },
];

export function localeHref(path) {
  return `/${getLocale()}${path === "/" ? "/" : path}`;
}

export function navbar(currentPath) {
  const locale = getLocale();
  const logged = isLoggedIn();
  const user = currentUser();
  const others = LOCALES.filter((l) => l !== locale);
  const switched = (l) => currentPath.replace(/^\/[a-z]{2}(?=\/|$)/, `/${l}`) || `/${l}/`;

  return `
<div class="navbar navbar-inverse navbar-fixed-top">
  <div class="navbar-header">
    <a class="navbar-brand" href="${localeHref("/")}" data-link>
      <img src="assets/img/logo.svg" alt="Captain Coaster">
    </a>
    <ul class="nav navbar-nav visible-xs-block">
      <li><a data-action="toggle-navbar">${icon("menu", "w-8 h-8")}</a></li>
      <li><a data-action="toggle-sidebar-mobile">${icon("menu", "w-8 h-8")}</a></li>
    </ul>
  </div>
  <div class="navbar-collapse">
    <ul class="nav navbar-nav">
      <li><a class="sidebar-control hidden-xs" data-action="toggle-sidebar">${icon("menu", "w-8 h-8")}</a></li>
    </ul>
    <ul class="nav navbar-nav navbar-right">
      <li class="dropdown language-switch" data-dropdown>
        <a class="dropdown-toggle">${LOCALE_NAMES[locale]}<span class="caret"></span></a>
        <ul class="dropdown-menu">
          ${others.map((l) => `<li><a href="${switched(l)}" data-link>${LOCALE_NAMES[l]}</a></li>`).join("")}
        </ul>
      </li>
      ${
        logged
          ? `
      <li class="dropdown" data-dropdown>
        <a class="dropdown-toggle" aria-label="${esc(t("nav.activity"))}">${icon("clock", "w-6 h-6")}</a>
        <ul class="dropdown-menu" style="min-width:300px">
          <li><a style="cursor:default" class="text-semibold">${esc(t("nav.activity"))}</a></li>
          <li class="divider"></li>
          <li><a style="cursor:default" class="text-muted">${esc(t("nav.activityEmpty"))}</a></li>
        </ul>
      </li>
      <li class="dropdown dropdown-user" data-dropdown>
        <a class="dropdown-toggle">
          <img src="${avatarUrl(displayName())}" class="navbar-avatar" alt="${esc(displayName())}">
          <span>${esc(user.firstName || displayName())}</span><span class="caret"></span>
        </a>
        <ul class="dropdown-menu">
          <li><a href="${localeHref("/profile")}" data-link>${icon("userSmall", "w-6 h-6 position-left")} ${esc(t("nav.myProfile"))}</a></li>
          <li><a href="${localeHref("/profile/settings")}" data-link>${icon("cog", "w-6 h-6 position-left")} ${esc(t("nav.settings"))}</a></li>
          <li><a href="${localeHref("/profile/ratings")}" data-link>${icon("starOutline", "w-6 h-6 position-left")} ${esc(t("nav.myRatings"))}</a></li>
          <li><a href="${localeHref("/profile/tops")}" data-link>${icon("clipboard", "w-6 h-6 position-left")} ${esc(t("nav.myTops"))}</a></li>
          <li><a href="${localeHref("/profile/map")}" data-link>${icon("mapPin", "w-6 h-6 position-left")} ${esc(t("nav.myMap"))}</a></li>
          <li class="divider"></li>
          <li><a href="${localeHref("/logout")}" data-link>${icon("key", "w-6 h-6 position-left")} ${esc(t("nav.logout"))}</a></li>
        </ul>
      </li>`
          : `<li><a href="${localeHref("/login")}" data-link>${esc(t("nav.login"))}</a></li>`
      }
    </ul>
  </div>
</div>`;
}

export function sidebar(activeKey) {
  const logged = isLoggedIn();
  const items = NAV_ITEMS.map((item) => {
    const href = item.external ? item.href : localeHref(item.href);
    const attrs = item.external ? ' target="_blank" rel="noopener"' : " data-link";
    const label = esc(t(item.label));
    const extra = item.external ? ` <span style="font-size:12px">${icon("externalLink", "w-6 h-6")}</span>` : "";
    return `<li class="${activeKey === item.key ? "active" : ""}"><a href="${href}"${attrs}>${icon(item.icon, "w-6 h-6")} <span>${label}${extra}</span></a></li>`;
  }).join("");

  const auth = logged
    ? `<li><a href="${localeHref("/logout")}" data-link>${icon("key", "w-6 h-6")} <span>${esc(t("nav.logout"))}</span></a></li>`
    : `<li class="${activeKey === "login" ? "active" : ""}"><a href="${localeHref("/login")}" data-link>${icon("key", "w-6 h-6")} <span>${esc(t("nav.login"))}</span></a></li>`;

  return `
<div class="sidebar sidebar-main sidebar-fixed">
  <div class="sidebar-content">
    <div class="sidebar-category sidebar-category-visible">
      <div class="category-content no-padding">
        <ul class="navigation navigation-main navigation-accordion">
          ${items}
          ${auth}
        </ul>
      </div>
    </div>
  </div>
</div>`;
}

export function searchForm() {
  return `
<form class="heading-form" data-search-form action="${localeHref("/search/")}" method="get">
  <div class="form-group">
    <div class="search-container" data-search>
      <div class="has-feedback search-input-container">
        <input id="search-coaster" name="query" type="search"
               class="form-control border-blue-600 border-lg"
               placeholder="${esc(t("search.placeholder"))}"
               autocomplete="off" role="combobox" aria-expanded="false"
               aria-autocomplete="list" aria-haspopup="listbox">
        <div class="form-control-feedback">
          ${icon("searchSmall", "w-6 h-6 text-size-small text-muted search-icon")}
          <button type="button" class="search-clear-button" data-search-clear aria-label="${esc(t("search.clear"))}">
            ${icon("close", "w-6 h-6 text-size-small text-muted")}
          </button>
        </div>
      </div>
      <div class="search-dropdown" data-search-dropdown role="listbox" aria-label="${esc(t("search.suggestions"))}">
        <div data-search-results></div>
      </div>
    </div>
  </div>
</form>`;
}

export function pageHeader(title, opts = {}) {
  return `
<div class="page-header page-header-default">
  <div class="page-header-content">
    <div class="page-title row ${opts.hideTitleOnXs ? "hidden-xs" : ""}">
      <h1 class="col-sm-8 col-lg-9">${title}</h1>
    </div>
    <div class="heading-elements visible-elements">
      ${searchForm()}
    </div>
  </div>
</div>`;
}

export function footer() {
  return `
<div class="footer text-muted">
  ${esc(t("footer.text"))}
  ${esc(t("footer.crafted"))} ${icon("heart", "w-6 h-6")} ${esc(t("footer.by"))}
  <a href="${localeHref("/terms-conditions")}" data-link>${esc(t("footer.terms"))}</a>
</div>`;
}

/**
 * Compose la page complète.
 * page = { layout, nav, title, header, secondarySidebar, content, bodyClass }
 */
export function renderShell(page, currentPath) {
  if (page.layout === "auth") {
    return `
<div class="page-container">
  <div class="page-content">
    <div class="content-wrapper">
      <div class="content">${page.content}</div>
    </div>
  </div>
</div>`;
  }

  const header = page.header === false ? "" : pageHeader(page.title ?? "", page.headerOpts || {});
  const secondary = page.secondarySidebar || "";
  const content = page.bare
    ? page.content
    : `<div class="content">${page.content}${footer()}</div>`;

  return `
${navbar(currentPath)}
<div class="page-container">
  <div class="page-content">
    ${sidebar(page.nav)}
    ${secondary}
    <div class="content-wrapper">
      ${header}
      ${content}
    </div>
  </div>
</div>`;
}

/** Etat "sidebar réduite" : réduit sur toutes les pages sauf l'accueil, comme l'original. */
export function applyBodyClasses(page) {
  const body = document.body;
  const settings = getState().settings;
  const collapsed = settings.sidebarCollapsed === null ? page.nav !== "home" : settings.sidebarCollapsed;
  body.className = [
    page.layout === "auth" ? "login-container login-cover" : "navbar-top",
    collapsed && page.layout !== "auth" ? "sidebar-xs" : "",
    page.bodyClass || "",
  ]
    .filter(Boolean)
    .join(" ");
  if (page.layout === "auth") {
    body.style.background = "url(/assets/img/placeholders/login-bg.webp) no-repeat center / cover";
  } else {
    body.style.background = "";
  }
}
