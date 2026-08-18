// Sidebar de filtres (classement / recherche / carte) + moteur de filtrage.

import { t, getLocale } from "../i18n.js";
import { esc, distanceKm } from "../util.js";
import { data, taxoOptions, taxoPlaceholder, riddenCoasterIds, isLoggedIn } from "../store.js";

/** Champs disponibles par page, dans l'ordre exact du site. */
export const FILTER_SETS = {
  ranking: {
    toggles: ["status", "new", "notridden"],
    selects: ["continent", "country", "manufacturer", "model", "materialType", "seatingType", "openingDate"],
    name: true,
  },
  search: {
    toggles: ["status", "sortByDistance", "kiddie", "notridden"],
    selects: ["score", "continent", "country", "manufacturer", "model", "materialType", "seatingType", "openingDate"],
    name: true,
  },
  map: {
    toggles: ["status", "kiddie", "notridden"],
    selects: ["score", "manufacturer", "model", "materialType", "seatingType", "openingDate"],
    name: true,
  },
};

const TOGGLE_LABELS = {
  status: "filters.operating",
  new: "filters.new",
  notridden: "filters.notRidden",
  sortByDistance: "filters.sortByDistance",
  kiddie: "filters.hideKiddies",
};

function toggle(key, checked, disabled) {
  return `
<div class="form-group toggle-switch-form-group ${checked ? "checked" : ""} ${disabled ? "disabled" : ""}" data-toggle-switch>
  <div class="checkbox">
    <label class="display-block">
      ${esc(t(TOGGLE_LABELS[key]))}
      <input name="filters[${key}]" type="checkbox" ${checked ? "checked" : ""} ${disabled ? "disabled" : ""}>
    </label>
  </div>
</div>`;
}

function select(kind, value) {
  const locale = getLocale();
  const opts = taxoOptions(locale, kind);
  const placeholder = taxoPlaceholder(locale, kind);
  return `
<div class="form-group">
  <select class="form-control" name="filters[${kind}]">
    <option value="">${esc(placeholder)}</option>
    ${opts.map((o) => `<option value="${esc(o.id)}" ${String(value) === String(o.id) ? "selected" : ""}>${esc(o.name)}</option>`).join("")}
  </select>
</div>`;
}

export function filterSidebar(kind, filters) {
  const set = FILTER_SETS[kind];
  const logged = isLoggedIn();
  return `
<div class="sidebar sidebar-secondary sidebar-default" data-filters="${kind}">
  <div class="sidebar-content">
    <form id="form-filter" action="#">
      <div class="sidebar-category">
        <div class="category-title"><span>${esc(t("filters.title"))}</span></div>
        <div class="category-content">
          ${set.toggles.map((k) => toggle(k, !!filters[k], k === "notridden" && !logged)).join("")}
          ${set.name ? `<div class="form-group"><input type="text" class="form-control" name="filters[name]" value="${esc(filters.name || "")}" placeholder="${esc(t("filters.name"))}"></div>` : ""}
          ${set.selects.map((s) => select(s, filters[s])).join("")}
          <div class="form-group">
            <button type="button" class="btn btn-default btn-block" data-clear-filters>${esc(t("filters.clear"))}</button>
          </div>
        </div>
      </div>
    </form>
  </div>
</div>`;
}

/** Lit les filtres depuis la query string (format Symfony `filters[key]`). */
export function readFilters(query) {
  const out = {};
  for (const [key, value] of query.entries()) {
    const m = /^filters\[(\w+)\]$/.exec(key);
    if (m) out[m[1]] = value;
    else if (key === "page") out.page = Number(value) || 1;
  }
  ["status", "new", "notridden", "kiddie", "sortByDistance"].forEach((k) => {
    if (out[k] !== undefined) out[k] = out[k] === "on" || out[k] === "1" || out[k] === "true";
  });
  return out;
}

/** Sérialise les filtres actifs vers la query string. */
export function writeFilters(filters, page) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (k === "page" || v === "" || v === undefined || v === null || v === false) return;
    params.set(`filters[${k}]`, v === true ? "on" : v);
  });
  if (page && page > 1) params.set("page", String(page));
  return params.toString();
}

const CONTINENT_BY_COUNTRY = {
  // Europe (1)
  1: [5, 6, 7, 8, 10, 11, 12, 14, 15, 16, 17, 18, 19, 38, 40, 44, 48, 65, 66, 67, 69, 73, 74, 75, 79, 80, 81, 82, 83, 85, 86, 87, 88, 89, 90, 91, 94, 96, 97, 98],
  // Amérique (2)
  2: [26, 28, 33, 34, 35, 37, 45, 46, 55, 71, 76, 107, 109, 114, 133, 135],
  // Asie (3)
  3: [27, 29, 30, 39, 41, 42, 47, 49, 50, 54, 56, 57, 58, 59, 60, 62, 64, 68, 70, 77, 78, 92, 93, 95, 99, 100, 101, 102, 103, 104, 105, 132, 134, 136, 138],
  // Afrique (4)
  4: [52, 63, 72, 84, 106, 108, 110, 111, 112, 113, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 137],
  // Océanie (5)
  5: [32, 61],
};
const COUNTRY_TO_CONTINENT = new Map();
Object.entries(CONTINENT_BY_COUNTRY).forEach(([cont, list]) =>
  list.forEach((c) => COUNTRY_TO_CONTINENT.set(c, Number(cont)))
);
export function continentOf(countryId) {
  return COUNTRY_TO_CONTINENT.get(Number(countryId)) || null;
}

/** Applique les filtres à la liste de coasters. */
export function applyFilters(coasters, filters, { userPosition = null } = {}) {
  const ridden = riddenCoasterIds();
  let list = coasters.filter((c) => {
    if (filters.status && !/operat/i.test(c.status || "")) return false;
    if (filters.kiddie && c.kiddie) return false;
    if (filters.notridden && ridden.has(c.id)) return false;
    if (filters.new && !(c.year && c.year >= new Date().getFullYear())) return false;
    if (filters.name && !(c.name || "").toLowerCase().includes(filters.name.toLowerCase())) return false;
    if (filters.country && String(c.countryId) !== String(filters.country)) return false;
    if (filters.continent && String(continentOf(c.countryId)) !== String(filters.continent)) return false;
    if (filters.manufacturer && String(c.manufacturerId) !== String(filters.manufacturer)) return false;
    if (filters.model && String(c.modelId) !== String(filters.model)) return false;
    if (filters.materialType && String(c.materialTypeId ?? materialId(c)) !== String(filters.materialType)) return false;
    if (filters.seatingType && String(c.seatingTypeId ?? seatingId(c)) !== String(filters.seatingType)) return false;
    if (filters.openingDate && String(c.year) !== String(filters.openingDate)) return false;
    if (filters.score && !(c.score >= Number(filters.score))) return false;
    return true;
  });

  if (filters.sortByDistance && userPosition) {
    list = list
      .map((c) => {
        const park = c.parkId ? data.byParkId.get(c.parkId) : null;
        const d = park?.lat ? distanceKm(userPosition, { lat: park.lat, lng: park.lng }) : Infinity;
        return { c, d };
      })
      .sort((a, b) => a.d - b.d)
      .map((x) => x.c);
  }
  return list;
}

const MATERIAL_IDS = { Steel: 1, Wood: 2, Hybrid: 3 };
const SEATING_IDS = {
  "Sit Down": 1, Inverted: 2, "Stand Up": 3, Flying: 4, Floorless: 5, Suspended: 6, Wing: 7,
  Spinning: 8, Motorbike: 9, Bobsled: 10, "4th Dimension": 11, Pipeline: 12, Alpine: 13, "Water Coaster": 14,
};
function materialId(c) {
  return MATERIAL_IDS[c.materialType] ?? "";
}
function seatingId(c) {
  return SEATING_IDS[c.seatingType] ?? "";
}
