// Recherche globale de l'en-tête : autocomplétion coasters + parcs + riders.

import { esc, debounce } from "../util.js";
import { t, getLocale } from "../i18n.js";
import { data, coasterUrl, parkUrl } from "../store.js";
import { navigate } from "../router.js";

const MIN_LENGTH = 2;
const DEBOUNCE = 300;
const MAX_RESULTS = 8;

export function searchAll(query, limit = MAX_RESULTS) {
  const q = query.trim().toLowerCase();
  if (q.length < MIN_LENGTH) return [];
  const score = (name) => {
    const n = (name || "").toLowerCase();
    if (n === q) return 0;
    if (n.startsWith(q)) return 1;
    if (n.includes(q)) return 2;
    return 99;
  };

  const coasters = data.coasters
    .map((c) => ({ item: c, s: score(c.name), type: "coaster" }))
    .filter((r) => r.s < 99);
  const parks = data.parks
    .map((p) => ({ item: p, s: score(p.name), type: "park" }))
    .filter((r) => r.s < 99);
  const users = data.users
    .map((u) => ({ item: u, s: score(u.name), type: "user" }))
    .filter((r) => r.s < 99);

  return [...coasters, ...parks, ...users]
    .sort((a, b) => a.s - b.s || (b.item.score ?? b.item.ratingsCount ?? 0) - (a.item.score ?? a.item.ratingsCount ?? 0))
    .slice(0, limit);
}

export function resultHref(result) {
  const locale = getLocale();
  if (result.type === "coaster") return coasterUrl(locale, result.item);
  if (result.type === "park") return parkUrl(locale, result.item);
  return `/${locale}/users/${result.item.slug}`;
}

export function resultEmoji(type) {
  return type === "coaster" ? "🎢" : type === "park" ? "🎠" : "👤";
}

export function resultSubtitle(result) {
  if (result.type === "coaster") {
    const park = result.item.parkId ? data.byParkId.get(result.item.parkId) : null;
    return park ? park.name : result.item.country || "";
  }
  if (result.type === "park") return result.item.country || "";
  return t("search.ratings", { count: result.item.ratingsCount || 0 });
}

function highlight(text, query) {
  const safe = esc(text);
  const q = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (!q) return safe;
  return safe.replace(new RegExp(`(${q})`, "gi"), "<strong>$1</strong>");
}

export function initGlobalSearch(root) {
  const container = root.querySelector("[data-search]");
  if (!container) return;
  const input = container.querySelector("input[name=query]");
  const dropdown = container.querySelector("[data-search-dropdown]");
  const results = container.querySelector("[data-search-results]");
  const form = container.closest("form");
  let items = [];
  let selected = -1;

  const run = debounce(() => {
    const q = input.value;
    container.classList.toggle("has-value", q.length > 0);
    if (q.trim().length < MIN_LENGTH) {
      container.classList.remove("search-open");
      return;
    }
    items = searchAll(q);
    results.innerHTML = items.length
      ? items
          .map(
            (r, i) => `
        <div class="search-result-item" data-index="${i}" role="option">
          <div class="search-result-emoji">${resultEmoji(r.type)}</div>
          <div class="search-result-content">
            <div class="search-result-name">${highlight(r.item.name, q)}</div>
            <div class="search-result-subtitle">${esc(resultSubtitle(r))}</div>
          </div>
        </div>`
          )
          .join("")
      : `<div class="search-no-results"><div class="search-no-results-icon">🔍</div><div class="search-no-results-text">${esc(t("search.noResults"))}</div></div>`;
    selected = -1;
    container.classList.add("search-open");
    input.setAttribute("aria-expanded", "true");
  }, DEBOUNCE);

  input.addEventListener("input", run);
  input.addEventListener("focus", () => {
    if (input.value.trim().length >= MIN_LENGTH && items.length) container.classList.add("search-open");
  });

  input.addEventListener("keydown", (e) => {
    if (!container.classList.contains("search-open")) return;
    const nodes = results.querySelectorAll(".search-result-item");
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      selected = e.key === "ArrowDown" ? Math.min(selected + 1, nodes.length - 1) : Math.max(selected - 1, 0);
      nodes.forEach((n, i) => n.classList.toggle("selected", i === selected));
    } else if (e.key === "Enter") {
      if (selected >= 0 && items[selected]) {
        e.preventDefault();
        container.classList.remove("search-open");
        navigate(resultHref(items[selected]));
      }
    } else if (e.key === "Escape") {
      container.classList.remove("search-open");
    }
  });

  results.addEventListener("click", (e) => {
    const node = e.target.closest(".search-result-item");
    if (!node) return;
    const r = items[Number(node.dataset.index)];
    if (!r) return;
    container.classList.remove("search-open");
    navigate(resultHref(r));
  });

  container.querySelector("[data-search-clear]")?.addEventListener("click", () => {
    input.value = "";
    container.classList.remove("has-value", "search-open");
    input.focus();
  });

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    container.classList.remove("search-open");
    navigate(`/${getLocale()}/search/?query=${encodeURIComponent(q)}`);
  });
}
