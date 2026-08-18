// Shared data layer for the three redesign directions.
//
// The mockups are static pages, but they run on the real dataset harvested from
// the live site (2 906 coasters, 1 857 parks, 1 756 reviews, 180 riders) so that
// density, filtering and ranking behave like production.
//
// Loads from /data/*.json — the exact same files the reference clone uses.
// No request ever leaves localhost.

const cache = new Map();

async function load(name) {
  if (!cache.has(name)) {
    cache.set(
      name,
      fetch(new URL(`../../data/${name}.json`, import.meta.url)).then((r) => {
        if (!r.ok) throw new Error(`${name}.json: ${r.status}`);
        return r.json();
      })
    );
  }
  return cache.get(name);
}

/** Hero coaster of every mockup: #2 worldwide, complete stats, 25 reviews, 8 photos. */
export const HERO_COASTER_ID = 2268; // Steel Vengeance, Cedar Point
/** Hero rider: 1 852 coasters, 622 parks, 38 countries, 90/100 of the world top. */
export const HERO_USER_ID = 6315; // Denis B

let db = null;

export async function getData() {
  if (db) return db;

  const [coasters, parks, users, reviews, tops, summaries, images, userRatings] = await Promise.all([
    load("coasters"),
    load("parks"),
    load("users"),
    load("reviews"),
    load("tops"),
    load("summaries"),
    load("images"),
    load("userRatings"),
  ]);

  const parkById = new Map(parks.map((p) => [p.id, p]));
  const coasterById = new Map(coasters.map((c) => [c.id, c]));
  const userById = new Map(users.map((u) => [u.id, u]));
  const topById = new Map(tops.map((t) => [t.id, t]));

  const reviewsByCoaster = new Map();
  for (const r of reviews) {
    if (!reviewsByCoaster.has(r.coasterId)) reviewsByCoaster.set(r.coasterId, []);
    reviewsByCoaster.get(r.coasterId).push(r);
  }

  const coastersByPark = new Map();
  for (const c of coasters) {
    if (!coastersByPark.has(c.parkId)) coastersByPark.set(c.parkId, []);
    coastersByPark.get(c.parkId).push(c);
  }

  // World ranking: scored coasters, best first. Rank is 1-based and stable.
  const ranking = coasters
    .filter((c) => typeof c.score === "number")
    .sort((a, b) => b.score - a.score)
    .map((c, i) => ({ ...c, rank: i + 1, park: parkById.get(c.parkId) || null }));

  const rankById = new Map(ranking.map((c) => [c.id, c.rank]));

  db = {
    coasters,
    parks,
    users,
    reviews,
    tops,
    summaries,
    images,
    userRatings,
    parkById,
    coasterById,
    userById,
    topById,
    reviewsByCoaster,
    coastersByPark,
    ranking,
    rankById,
  };
  return db;
}

/* ------------------------------------------------------------------ views */

/** Top N of the world ranking, park and country resolved. */
export function topRanking(d, n = 50) {
  return d.ranking.slice(0, n);
}

/** Everything the coaster page needs, in one object. */
export function coasterView(d, id = HERO_COASTER_ID) {
  const c = d.coasterById.get(id);
  if (!c) return null;
  const park = d.parkById.get(c.parkId) || null;
  const reviews = (d.reviewsByCoaster.get(id) || []).slice();
  const dist = [0, 0, 0, 0, 0]; // 1..5 stars, half-stars rounded up
  for (const r of reviews) dist[Math.max(0, Math.ceil(r.rating) - 1)]++;
  const siblings = (d.coastersByPark.get(c.parkId) || [])
    .filter((x) => x.id !== id)
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .map((x) => ({ ...x, park, rank: d.rankById.get(x.id) || null }));

  return {
    ...c,
    rank: d.rankById.get(id) || null,
    park,
    summary: d.summaries[String(id)] || null,
    photos: d.images[String(id)] || [],
    reviews: reviews.sort((a, b) => b.upvotes - a.upvotes),
    distribution: dist,
    ratingAverage: reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null,
    siblings,
  };
}

/** Everything the rider profile needs. */
export function riderView(d, id = HERO_USER_ID) {
  const u = d.userById.get(id);
  if (!u) return null;
  const ratings = (d.userRatings[String(id)] || []).map((r) => ({
    ...r,
    coaster: d.coasterById.get(r.coasterId) || null,
    rank: d.rankById.get(r.coasterId) || null,
  }));
  const top = u.topId ? d.topById.get(u.topId) : null;
  const topItems = top
    ? top.items
        .map((cid) => d.coasterById.get(cid))
        .filter(Boolean)
        .map((c) => ({ ...c, park: d.parkById.get(c.parkId) || null, rank: d.rankById.get(c.id) || null }))
    : [];
  const reviews = d.reviews.filter((r) => r.userSlug === u.slug);

  return { ...u, ratings, top, topItems, reviews };
}

/** Parks with coordinates, heaviest first — the map layer. */
export function mapParks(d) {
  return d.parks
    .filter((p) => typeof p.lat === "number" && typeof p.lng === "number")
    .map((p) => {
      const list = (d.coastersByPark.get(p.id) || [])
        .filter((c) => typeof c.score === "number")
        .sort((a, b) => b.score - a.score);
      return {
        ...p,
        best: list[0] || null,
        bestRank: list[0] ? d.rankById.get(list[0].id) : null,
        scored: list.length,
      };
    })
    .sort((a, b) => (b.coasterCount || 0) - (a.coasterCount || 0));
}

/** Latest activity feed for the home page: recent ratings, resolved. */
export function activityFeed(d, n = 12) {
  const out = [];
  for (const [uid, list] of Object.entries(d.userRatings)) {
    const u = d.userById.get(Number(uid));
    if (!u) continue;
    for (const r of list.slice(0, 2)) {
      const c = d.coasterById.get(r.coasterId);
      if (!c) continue;
      out.push({
        user: u,
        coaster: c,
        park: d.parkById.get(c.parkId) || null,
        value: r.value,
        riddenAt: r.riddenAt,
        date: parseUsDate(r.riddenAt),
      });
    }
  }
  return out.sort((a, b) => (b.date || 0) - (a.date || 0)).slice(0, n);
}

/** Reviews with actual prose, longest and most upvoted first. */
export function featuredReviews(d, n = 6) {
  return d.reviews
    .filter((r) => r.text && r.text.length > 120)
    .sort((a, b) => b.upvotes - a.upvotes)
    .slice(0, n)
    .map((r) => {
      const c = d.coasterById.get(r.coasterId);
      return { ...r, coaster: c || null, park: c ? d.parkById.get(c.parkId) || null : null };
    });
}

/** Headline counters, as displayed by the live site. */
export const COUNTERS = { coasters: 7361, ranked: 2016, riders: 21734, reviews: 96169 };

/* ------------------------------------------------------------- formatting */

function parseUsDate(s) {
  if (!s) return null;
  const m = String(s).match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/);
  if (!m) return null;
  return new Date(2000 + Number(m[3]), Number(m[1]) - 1, Number(m[2]));
}

/** S\u00E9parateur de milliers : espace fine ins\u00E9cable, la convention fran\u00E7aise. */
export function num(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return "";
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "\u202F");
}


export function score(v, digits = 1) {
  return v === null || v === undefined ? "—" : v.toFixed(digits);
}

export function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function slugify(s) {
  return (
    String(s ?? "")
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "item"
  );
}

/* ----------------------------------------------------------------- photos */

// Filled in by photos.js once the royalty-free set is in place.
export const PHOTO_BASE = new URL("./img/photos", import.meta.url).href;

/** Deterministic photo pick so a given coaster always shows the same image. */
export function pickPhoto(seed, pool) {
  let h = 0;
  const s = String(seed ?? "0");
  for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0;
  return pool[h % pool.length];
}

const AVATAR_COLORS = ["#26a69a", "#5c6bc0", "#ec407a", "#ffa726", "#29b6f6", "#66bb6a", "#ff7043", "#8d6e63"];

/** Locally generated avatar — no real profile picture is ever fetched. */
export function avatar(name, size = 96, colors = AVATAR_COLORS) {
  const label = String(name || "?").trim();
  const initials =
    label
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0] || "")
      .join("")
      .toUpperCase() || "?";
  let h = 0;
  for (let i = 0; i < label.length; i++) h = (h * 31 + label.charCodeAt(i)) >>> 0;
  const bg = colors[h % colors.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 96 96"><rect width="96" height="96" fill="${bg}"/><text x="48" y="48" dy="0.36em" fill="#fff" font-family="system-ui,sans-serif" font-size="36" font-weight="600" text-anchor="middle">${initials}</text></svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}
