// Chargement des données + état utilisateur local (localStorage).
// Le site original est un Symfony server-rendered : ici tout est côté client,
// le localStorage remplace la base de données pour les actions du visiteur.

import { slugify } from "./util.js";

const DATA_ROOT = "data";

export const data = {
  coasters: [],
  parks: [],
  users: [],
  reviews: [],
  tops: [],
  summaries: {},
  images: {},
  userRatings: {},
  taxonomies: {},
  taxoI18n: {},
  byCoasterId: new Map(),
  byCoasterSlug: new Map(),
  byParkId: new Map(),
  byUserSlug: new Map(),
  byUserId: new Map(),
  reviewsByCoaster: new Map(),
  reviewsByUser: new Map(),
  coastersByPark: new Map(),
  topsByUser: new Map(),
  countryByName: new Map(),
  manufacturerByName: new Map(),
};

const loaded = new Set();

async function loadJson(name) {
  const res = await fetch(`${DATA_ROOT}/${name}.json`);
  if (!res.ok) throw new Error(`Cannot load ${name}.json`);
  return res.json();
}

/** Convertit les libellés relatifs collectés ("3 days ago") en dates réelles. */
const AGO_RE = /^(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago$/i;
const AGO_SECONDS = { second: 1, minute: 60, hour: 3600, day: 86400, week: 604800, month: 2592000, year: 31536000 };
function agoToIso(ago, fallbackIndex = 0) {
  if (!ago) return new Date(Date.now() - fallbackIndex * 3600e3).toISOString();
  const m = AGO_RE.exec(ago.trim());
  if (!m) return new Date(Date.now() - fallbackIndex * 3600e3).toISOString();
  const secs = Number(m[1]) * AGO_SECONDS[m[2].toLowerCase()];
  return new Date(Date.now() - secs * 1000).toISOString();
}

/** Données indispensables au rendu de n'importe quelle page. */
export async function loadCore() {
  if (loaded.has("core")) return;
  const [coasters, parks, users, taxonomies, taxoI18n] = await Promise.all([
    loadJson("coasters"),
    loadJson("parks"),
    loadJson("users"),
    loadJson("taxonomies"),
    loadJson("taxo_i18n"),
  ]);
  data.coasters = coasters;
  data.parks = parks;
  data.users = users;
  data.taxonomies = taxonomies;
  data.taxoI18n = taxoI18n;

  parks.forEach((p) => {
    if (!p.slug) p.slug = slugify(p.name);
    data.byParkId.set(p.id, p);
  });
  coasters.forEach((c) => {
    if (!c.slug) c.slug = slugify(c.name);
    data.byCoasterId.set(c.id, c);
    data.byCoasterSlug.set(c.slug, c);
    if (c.parkId) {
      if (!data.coastersByPark.has(c.parkId)) data.coastersByPark.set(c.parkId, []);
      data.coastersByPark.get(c.parkId).push(c);
    }
  });
  // Un coaster sans hauteur ni score reste affichable : on complète le minimum.
  coasters.forEach((c) => {
    if (!c.status) c.status = "Operating";
    c.kiddie = !!(c.heightFt && c.heightFt < 30) || /kiddie|junior|family coaster/i.test(c.name || "");
  });
  data.coastersByPark.forEach((list) => list.sort((a, b) => (b.score ?? -1) - (a.score ?? -1)));

  users.forEach((u) => {
    data.byUserSlug.set(u.slug, u);
    if (u.id) data.byUserId.set(u.id, u);
  });

  (taxonomies.country || []).forEach((c) => data.countryByName.set(c.name, Number(c.id)));
  (taxonomies.manufacturer || []).forEach((m) => data.manufacturerByName.set(m.name, Number(m.id)));
  coasters.forEach((c) => {
    if (c.country && !c.countryId) c.countryId = data.countryByName.get(c.country);
    if (c.manufacturer && !c.manufacturerId) c.manufacturerId = data.manufacturerByName.get(c.manufacturer);
  });
  parks.forEach((p) => {
    if (!p.country) {
      const first = (data.coastersByPark.get(p.id) || [])[0];
      if (first?.country) p.country = first.country;
    }
    if (p.country && !p.countryId) p.countryId = data.countryByName.get(p.country);
    if (!p.coasterCount) p.coasterCount = (data.coastersByPark.get(p.id) || []).length;
  });

  loaded.add("core");
}

export async function loadReviews() {
  if (loaded.has("reviews")) return;
  const reviews = await loadJson("reviews");
  reviews.forEach((r, i) => {
    r.date = agoToIso(r.ago, i);
    r.coaster = data.byCoasterId.get(r.coasterId) || null;
    if (!data.reviewsByCoaster.has(r.coasterId)) data.reviewsByCoaster.set(r.coasterId, []);
    data.reviewsByCoaster.get(r.coasterId).push(r);
    if (r.userSlug) {
      if (!data.reviewsByUser.has(r.userSlug)) data.reviewsByUser.set(r.userSlug, []);
      data.reviewsByUser.get(r.userSlug).push(r);
    }
  });
  reviews.sort((a, b) => new Date(b.date) - new Date(a.date));
  data.reviews = reviews;
  loaded.add("reviews");
}

export async function loadTops() {
  if (loaded.has("tops")) return;
  const tops = await loadJson("tops");
  tops.forEach((t, i) => {
    t.date = agoToIso(t.ago, i);
    if (!t.title) t.title = "Top Coasters";
    if (t.userSlug) {
      if (!data.topsByUser.has(t.userSlug)) data.topsByUser.set(t.userSlug, []);
      data.topsByUser.get(t.userSlug).push(t);
    }
  });
  tops.sort((a, b) => new Date(b.date) - new Date(a.date));
  data.tops = tops;
  loaded.add("tops");
}

export async function loadSummaries() {
  if (loaded.has("summaries")) return;
  data.summaries = await loadJson("summaries");
  loaded.add("summaries");
}

export async function loadImages() {
  if (loaded.has("images")) return;
  data.images = await loadJson("images");
  loaded.add("images");
}

export async function loadUserRatings() {
  if (loaded.has("userRatings")) return;
  data.userRatings = await loadJson("userRatings");
  loaded.add("userRatings");
}

/* ------------------------------------------------------------------ helpers */

export function coasterUrl(locale, c) {
  return `/${locale}/coasters/${c.id}/${c.slug}`;
}
export function parkUrl(locale, p) {
  return `/${locale}/parks/${p.id}/${p.slug}`;
}
export function userUrl(locale, u) {
  return `/${locale}/users/${u.slug}`;
}

export function taxoLabel(locale, kind, id) {
  const map = data.taxoI18n?.[locale]?.[kind] || data.taxoI18n?.en?.[kind];
  if (map && map[String(id)]) return map[String(id)];
  const list = data.taxonomies[kind] || [];
  const found = list.find((o) => String(o.id) === String(id));
  return found ? found.name : "";
}

export function taxoOptions(locale, kind) {
  const map = data.taxoI18n?.[locale]?.[kind] || data.taxoI18n?.en?.[kind] || {};
  const list = data.taxonomies[kind] || [];
  return list.map((o) => ({ id: o.id, name: map[String(o.id)] || o.name }));
}

export function taxoPlaceholder(locale, kind) {
  const map = data.taxoI18n?.[locale]?.[kind] || data.taxoI18n?.en?.[kind] || {};
  return map[""] || "";
}

export function countryName(locale, c) {
  if (c?.countryId) return taxoLabel(locale, "country", c.countryId) || c.country || "";
  return c?.country || "";
}

/** Stats globales affichées sur l'accueil et le classement. */
export function globalStats() {
  const ranked = data.coasters.filter((c) => c.rank);
  const ratings = data.coasters.reduce((sum, c) => sum + (c.duels ? Math.round(c.duels / 2.5) : 0), 0);
  return {
    coasters: data.coasters.length,
    ranked: ranked.length,
    parks: data.parks.length,
    ratings: 788480 + ratings * 0, // valeur affichée par le site au moment de la capture
    reviews: 96171,
    users: 24893,
    pictures: 22863,
    voters: 23074,
    pairs: 135800000,
    rankingRatings: 767000,
    newRanked: 43,
    newRatings: 39400,
    newVoters: 1099,
    newPairs: 8600000,
    newRatingsToday: 1051,
  };
}

/* ------------------------------------------------------------------ état local */

const STORAGE_KEY = "captaincoaster.clone.state";

const DEFAULT_STATE = {
  user: null,
  settings: {
    locale: null,
    imperial: null,
    sidebarCollapsed: null,
    notifications: "web_email",
    displayNameFormat: "full",
    homePark: "",
    otherLanguages: true,
    autoDate: true,
  },
  ratings: {}, // coasterId -> { value, riddenAt, id, createdAt }
  reviews: {}, // coasterId -> { value, pros, cons, text, riddenAt, date, id }
  tops: [], // { id, title, items:[coasterId], date, main }
  likes: [], // imageId
  upvotes: [], // reviewId
  reported: [], // reviewId
  summaryVotes: {}, // coasterId -> 'up' | 'down'
  dismissed: [], // ids d'alertes fermées
};

function deepMerge(base, override) {
  const out = Array.isArray(base) ? base.slice() : { ...base };
  for (const [k, v] of Object.entries(override || {})) {
    if (v && typeof v === "object" && !Array.isArray(v) && typeof base[k] === "object" && base[k] !== null && !Array.isArray(base[k])) {
      out[k] = deepMerge(base[k], v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

let state = structuredClone(DEFAULT_STATE);

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state = deepMerge(structuredClone(DEFAULT_STATE), JSON.parse(raw));
  } catch {
    state = structuredClone(DEFAULT_STATE);
  }
  return state;
}

export function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota dépassé : on ignore, la session reste utilisable */
  }
  window.dispatchEvent(new CustomEvent("cc:state"));
}

export function getState() {
  return state;
}

export function isLoggedIn() {
  return !!state.user;
}

export function currentUser() {
  return state.user;
}

export function displayName(user = state.user) {
  if (!user) return "";
  const { firstName = "", lastName = "" } = user;
  switch (state.settings.displayNameFormat) {
    case "first":
      return firstName || user.name;
    case "firstLast":
      return `${firstName} ${lastName ? lastName[0] + "." : ""}`.trim();
    default:
      return `${firstName} ${lastName}`.trim() || user.name;
  }
}

export function login({ email, firstName, lastName }) {
  const first = firstName || (email || "rider").split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
  state.user = {
    id: 99999,
    slug: slugify(`${first} ${lastName || ""}`) || "me",
    email: email || "",
    firstName: first,
    lastName: lastName || "",
    name: `${first} ${lastName || ""}`.trim(),
    memberSince: state.user?.memberSince || new Date().toISOString(),
  };
  saveState();
  return state.user;
}

export function logout() {
  state.user = null;
  saveState();
}

export function deleteAccount() {
  state = structuredClone(DEFAULT_STATE);
  saveState();
}

/* --------------------------------------------------------- notes & avis */

export function myRating(coasterId) {
  return state.ratings[coasterId] || null;
}

export function setRating(coasterId, value) {
  const existing = state.ratings[coasterId];
  state.ratings[coasterId] = {
    id: existing?.id || Date.now(),
    value,
    riddenAt: existing?.riddenAt || (state.settings.autoDate ? new Date().toISOString().slice(0, 10) : null),
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveState();
  return state.ratings[coasterId];
}

export function setRiddenAt(coasterId, date) {
  if (!state.ratings[coasterId]) return null;
  state.ratings[coasterId].riddenAt = date || null;
  saveState();
  return state.ratings[coasterId];
}

export function deleteRating(coasterId) {
  delete state.ratings[coasterId];
  delete state.reviews[coasterId];
  saveState();
}

export function myReview(coasterId) {
  return state.reviews[coasterId] || null;
}

export function setReview(coasterId, review) {
  const existing = state.reviews[coasterId];
  state.reviews[coasterId] = {
    id: existing?.id || Date.now(),
    ...review,
    date: new Date().toISOString(),
  };
  if (review.value) setRating(coasterId, review.value);
  else saveState();
  return state.reviews[coasterId];
}

export function deleteReview(coasterId) {
  delete state.reviews[coasterId];
  saveState();
}

/** Les avis locaux convertis au format des avis importés. */
export function myReviewsAsList() {
  return Object.entries(state.reviews).map(([coasterId, r]) => ({
    id: r.id,
    coasterId: Number(coasterId),
    coaster: data.byCoasterId.get(Number(coasterId)) || null,
    userSlug: state.user?.slug || "me",
    userName: displayName(),
    avatar: null,
    rating: r.value,
    date: r.date,
    pros: r.pros || [],
    cons: r.cons || [],
    text: r.text || "",
    upvotes: 0,
    mine: true,
  }));
}

export function riddenCoasterIds() {
  return new Set(Object.keys(state.ratings).map(Number));
}

/* --------------------------------------------------------- tops */

export function myTops() {
  return state.tops;
}

export function createTop(title) {
  const top = {
    id: Date.now(),
    title: title || "Top Coasters",
    items: [],
    date: new Date().toISOString(),
    main: state.tops.length === 0,
  };
  state.tops.unshift(top);
  saveState();
  return top;
}

export function getMyTop(id) {
  return state.tops.find((t) => String(t.id) === String(id)) || null;
}

export function updateTop(id, patch) {
  const top = getMyTop(id);
  if (!top) return null;
  Object.assign(top, patch, { date: new Date().toISOString() });
  saveState();
  return top;
}

export function deleteTop(id) {
  state.tops = state.tops.filter((t) => String(t.id) !== String(id));
  saveState();
}

/* --------------------------------------------------------- interactions */

export function toggleLike(imageId) {
  const i = state.likes.indexOf(imageId);
  if (i >= 0) state.likes.splice(i, 1);
  else state.likes.push(imageId);
  saveState();
  return i < 0;
}
export function hasLiked(imageId) {
  return state.likes.includes(imageId);
}

export function toggleUpvote(reviewId) {
  const i = state.upvotes.indexOf(reviewId);
  if (i >= 0) state.upvotes.splice(i, 1);
  else state.upvotes.push(reviewId);
  saveState();
  return i < 0;
}
export function hasUpvoted(reviewId) {
  return state.upvotes.includes(reviewId);
}

export function reportReview(reviewId) {
  if (!state.reported.includes(reviewId)) state.reported.push(reviewId);
  saveState();
}

export function voteSummary(coasterId, vote) {
  state.summaryVotes[coasterId] = vote;
  saveState();
}
export function summaryVote(coasterId) {
  return state.summaryVotes[coasterId] || null;
}

export function dismiss(id) {
  if (!state.dismissed.includes(id)) state.dismissed.push(id);
  saveState();
}
export function isDismissed(id) {
  return state.dismissed.includes(id);
}

export function updateSettings(patch) {
  Object.assign(state.settings, patch);
  saveState();
}

/* --------------------------------------------------------- unités */

export function useImperial() {
  // Le site sert l'impérial en anglais et le métrique ailleurs tant que
  // l'utilisateur n'a pas choisi dans ses paramètres.
  if (state.settings.imperial === null || state.settings.imperial === undefined) {
    return state.settings.locale === "en" || (!state.settings.locale && document.documentElement.lang === "en");
  }
  return !!state.settings.imperial;
}

export function formatHeight(c) {
  if (!c.heightFt && !c.heightM) return null;
  return useImperial() ? `${c.heightFt} ft` : `${c.heightM ?? Math.round(c.heightFt * 0.3048)} m`;
}
export function formatLength(c) {
  if (!c.lengthFt && !c.lengthM) return null;
  return useImperial() ? `${c.lengthFt} ft` : `${c.lengthM ?? Math.round(c.lengthFt * 0.3048)} m`;
}
export function formatSpeed(c) {
  if (!c.speedMph && !c.speedKmh) return null;
  return useImperial() ? `${c.speedMph} mph` : `${c.speedKmh ?? Math.round(c.speedMph * 1.609344)} km/h`;
}
export function formatDistance(km) {
  return useImperial() ? `${Math.round(km / 1.609344)} mi` : `${Math.round(km)} km`;
}
