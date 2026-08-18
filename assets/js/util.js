// Petits utilitaires partagés (formatage, DOM, dates relatives).

export function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function attr(s) {
  return esc(s);
}

/** Slug façon Symfony (utilisé pour les URLs de coasters / parcs). */
export function slugify(s) {
  return String(s ?? "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "item";
}

/** 1234 -> "1,234" (séparateur de milliers façon site original). */
export function thousands(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return "";
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** 767000 -> "767.0K", 135800000 -> "135.8M" */
export function compact(n) {
  if (n === null || n === undefined) return "";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(n);
}

/** Le score s'affiche avec une virgule décimale sur toutes les locales. */
export function scoreText(score) {
  if (score === null || score === undefined) return "";
  return score.toFixed(1).replace(".", ",") + "%";
}

/** Couleur du score : hsl(0 -> rouge, 120 -> vert) comme sur le site. */
export function scoreColor(score) {
  const hue = (score / 100) * 120;
  return `hsl(${hue}, 50%, 50%)`;
}

export function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

export function debounce(fn, delay) {
  let t = null;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), delay);
  };
}

export function qs(sel, root = document) {
  return root.querySelector(sel);
}
export function qsa(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

/** Délégation d'événement sur le conteneur racine. */
export function delegate(root, event, selector, handler) {
  root.addEventListener(event, (e) => {
    const target = e.target.closest(selector);
    if (target && root.contains(target)) handler(e, target);
  });
}

/** Découpe un tableau en page (20 par défaut, comme le site). */
export function paginate(items, page, perPage) {
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const p = clamp(page, 1, pages);
  return { items: items.slice((p - 1) * perPage, p * perPage), page: p, pages, total };
}

/** Nombres de pages affichés dans la pagination (1 2 3 4 … 101). */
export function pageWindow(page, pages) {
  const out = [];
  const push = (v) => { if (!out.includes(v)) out.push(v); };
  push(1);
  for (let i = page - 1; i <= page + 2; i++) if (i > 1 && i < pages) push(i);
  if (pages > 1) push(pages);
  const sorted = out.sort((a, b) => a - b);
  const withGaps = [];
  sorted.forEach((v, i) => {
    if (i > 0 && v - sorted[i - 1] > 1) withGaps.push("…");
    withGaps.push(v);
  });
  return withGaps;
}

const AGO_UNITS = [
  ["year", 31536000],
  ["month", 2592000],
  ["week", 604800],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
  ["second", 1],
];

/** "il y a X" localisé, à partir d'une date ISO. */
export function timeAgo(date, t) {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(date).getTime()) / 1000));
  for (const [unit, secs] of AGO_UNITS) {
    const value = Math.floor(seconds / secs);
    if (value >= 1) return t(`ago.${unit}`, { count: value });
  }
  return t("ago.second", { count: 1 });
}

/** Formatage de date court, façon Symfony `format('n/j/y')` selon la locale. */
export function shortDate(iso, locale) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  if (locale === "en") return `${d.getMonth() + 1}/${d.getDate()}/${String(d.getFullYear()).slice(2)}`;
  return `${d.getDate()}/${d.getMonth() + 1}/${String(d.getFullYear()).slice(2)}`;
}

export function longDate(iso, locale) {
  if (!iso) return "";
  const d = new Date(iso);
  try {
    return d.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return iso;
  }
}

/** Distance en km entre deux points (Haversine). */
export function distanceKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Avatar généré localement (initiales) — on ne rapatrie pas les photos de profil. */
const AVATAR_COLORS = ["#26a69a", "#5c6bc0", "#ec407a", "#ffa726", "#29b6f6", "#66bb6a", "#ff7043", "#8d6e63"];
export function avatarUrl(name, size = 96) {
  const label = String(name || "?").trim();
  const initials = label
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] || "")
    .join("")
    .toUpperCase() || "?";
  let hash = 0;
  for (let i = 0; i < label.length; i++) hash = (hash * 31 + label.charCodeAt(i)) >>> 0;
  const bg = AVATAR_COLORS[hash % AVATAR_COLORS.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 96 96"><rect width="96" height="96" fill="${bg}"/><text x="48" y="48" dy="0.36em" fill="#fff" font-family="Roboto,Helvetica,Arial,sans-serif" font-size="38" font-weight="500" text-anchor="middle">${initials}</text></svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

/** Photos de remplacement : 12 visuels locaux distribués de façon déterministe. */
const PLACEHOLDER_COUNT = 12;
export function photoUrl(seed) {
  let hash = 0;
  const s = String(seed ?? "0");
  for (let i = 0; i < s.length; i++) hash = (hash * 33 + s.charCodeAt(i)) >>> 0;
  return `assets/img/placeholders/coaster-${(hash % PLACEHOLDER_COUNT) + 1}.jpg`;
}
