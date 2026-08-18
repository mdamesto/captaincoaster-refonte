// Profil d'un rider (également utilisé pour /profile).

import { icon } from "../icons.js";
import { t } from "../i18n.js";
import { esc, thousands, avatarUrl } from "../util.js";
import {
  data, loadUserRatings, loadTops, isLoggedIn, displayName, currentUser, getState, riddenCoasterIds,
} from "../store.js";
import { localeHref } from "../components/layout.js";
import { navigate } from "../router.js";

/** Badge dessiné localement (l'original sert des PNG). */
function badgeSvg(label, sub) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
    <circle cx="80" cy="80" r="74" fill="#1e3a5f"/>
    <circle cx="80" cy="80" r="64" fill="#f2b544"/>
    <circle cx="80" cy="80" r="56" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="4 4"/>
    <text x="80" y="72" text-anchor="middle" font-family="Roboto,Helvetica,Arial" font-size="26" font-weight="700" fill="#1e3a5f">${label}</text>
    <text x="80" y="98" text-anchor="middle" font-family="Roboto,Helvetica,Arial" font-size="12" fill="#1e3a5f">${sub}</text>
  </svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

function computeMyStats() {
  const ridden = riddenCoasterIds();
  const coasters = [...ridden].map((id) => data.byCoasterId.get(id)).filter(Boolean);
  const parks = new Set(coasters.map((c) => c.parkId).filter(Boolean));
  const countries = new Set(coasters.map((c) => c.country).filter(Boolean));
  const top100 = coasters.filter((c) => c.rank && c.rank <= 100).length;
  const count = (arr) => {
    const m = new Map();
    arr.forEach((v) => v && m.set(v, (m.get(v) || 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1])[0] || ["—", 0];
  };
  const [topCountry, topCountryCount] = count(coasters.map((c) => c.country));
  const [topManufacturer, topManufacturerCount] = count(coasters.map((c) => c.manufacturer));
  const best = [...Object.entries(getState().ratings)]
    .sort((a, b) => b[1].value - a[1].value)
    .slice(0, 10)
    .map(([id]) => data.byCoasterId.get(Number(id))?.manufacturer);
  const [favManufacturer, favCount] = count(best);
  return {
    coasters: coasters.length,
    parks: parks.size,
    countries: countries.size,
    top100: `${top100}/100`,
    topCountry, topCountryCount,
    topManufacturer, topManufacturerCount,
    favManufacturer, favCount,
  };
}

export async function render(ctx) {
  const locale = ctx.locale;
  const isMe = ctx.route === "profile";
  if (isMe && !isLoggedIn()) {
    navigate(localeHref("/login"), { replace: true });
    return { nav: "", title: "", content: "" };
  }

  await Promise.all([loadUserRatings(), loadTops()]);

  const user = isMe
    ? { ...currentUser(), name: displayName(), slug: "me", id: currentUser().id }
    : data.byUserSlug.get(ctx.params.slug);
  if (!user) return (await import("./not-found.js")).render(ctx);

  const stats = isMe
    ? computeMyStats()
    : {
        coasters: user.stats?.coasters ?? user.ratingsCount ?? 0,
        parks: user.stats?.parks ?? "—",
        countries: user.stats?.countries ?? "—",
        top100: user.stats?.["World TOP 100"] ?? "—",
        topCountry: user.stats?.["Top Country"] ?? "—",
        topManufacturer: user.stats?.["Top Manufacturer"] ?? "—",
        favManufacturer: user.stats?.["Favorite Manufacturer"] ?? "—",
        topCountryCount: (user.tooltips?.[1] || "").replace(/\D+/g, ""),
        topManufacturerCount: (user.tooltips?.[2] || "").replace(/\D+/g, ""),
        favCount: (user.tooltips?.[3] || "").replace(/\D+/g, ""),
      };

  const ratingsCount = isMe ? stats.coasters : user.ratingsCount || 0;
  const topsCount = isMe ? getState().tops.length : (data.topsByUser.get(user.slug) || []).length;
  const ratingsHref = isMe ? localeHref("/profile/ratings") : `/${locale}/users/${user.id}/ratings`;
  const reviewsHref = isMe ? localeHref("/profile/reviews") : `/${locale}/users/${user.id}/reviews`;
  const topsHref = isMe ? localeHref("/profile/tops") : `/${locale}/users/${user.id}/tops`;
  const mapHref = isMe ? localeHref("/profile/map") : `/${locale}/map/users/${user.id}`;

  const tile = (value, label, iconName, colorClass, tooltip) => `
<div class="col-sm-6 col-md-3">
  <div class="panel panel-body">
    <div class="media no-margin">
      <div class="media-body">
        <h3 class="no-margin text-semibold ${colorClass}">${esc(String(value))}</h3>
        <div class="text-uppercase text-size-mini text-muted">${esc(label)}
          ${tooltip ? `<span class="tooltip ml-5">${icon("infoCircle", "w-6 h-6 text-muted")}<div class="tooltip-content"><div class="tooltip-arrow"></div>${esc(tooltip)}</div></span>` : ""}
        </div>
      </div>
      <div class="media-right media-middle">${icon(iconName, "w-12 h-12 opacity-75")}</div>
    </div>
  </div>
</div>`;

  const content = `
<div class="row">
  <div class="col-sm-3">
    <div class="row">
      <div class="panel">
        <div class="panel-body text-center">
          <div class="display-inline-block">
            <img src="${avatarUrl(user.name)}" class="img-circle img-lg" style="width:64px;height:64px" alt="${esc(user.name)}">
          </div>
          <h6 class="text-semibold no-margin-bottom">${esc(user.name)}</h6>
        </div>
        <div class="list-group no-border no-padding-top">
          <a href="${ratingsHref}" class="list-group-item" data-link>
            ${icon("starOutline", "w-6 h-6")} ${esc(t("users.showRatings"))}
            <span class="badge bg-teal-400 pull-right">${thousands(ratingsCount)}</span>
          </a>
          <a href="${reviewsHref}" class="list-group-item" data-link>
            ${icon("megaphone", "w-6 h-6")} ${esc(t("users.showReviews"))}
          </a>
          <a href="${topsHref}" class="list-group-item" data-link>
            ${icon("trophy", "w-6 h-6")} ${esc(t("users.showTops"))}
            <span class="badge bg-teal-400 pull-right">${topsCount}</span>
          </a>
          <a href="${mapHref}" class="list-group-item" data-link>
            ${icon("mapPin", "w-6 h-6")} ${esc(t("users.showMap"))}
          </a>
        </div>
      </div>
    </div>
  </div>
  <div class="col-sm-9">
    <div class="row"><div class="col-sm-12">
      <h6 class="content-group text-semibold">${esc(t("users.overview"))}</h6>
      <div class="row">
        ${tile(thousands(stats.coasters), t("users.coasters"), "trophyBig", "text-success-400")}
        ${tile(stats.parks, t("users.parks"), "mapPinBig", "text-blue-400")}
        ${tile(stats.countries, t("users.countries"), "globeBig", "text-indigo-400")}
        ${tile(stats.top100, t("users.worldTop100"), "trophyTeal", "text-teal-400", t("users.worldTop100Tooltip", { value: stats.top100 }))}
      </div>
      <div class="row">
        <div class="col-sm-4"><div class="panel panel-body"><div class="media no-margin">
          <div class="media-body">
            <h3 class="no-margin text-semibold text-warning-400">${esc(String(stats.topCountry))}</h3>
            <div class="text-uppercase text-size-mini text-muted">${esc(t("users.topCountry"))}
              <span class="tooltip ml-5">${icon("infoCircle", "w-6 h-6 text-muted")}<div class="tooltip-content"><div class="tooltip-arrow"></div>${esc(t("users.coastersCount", { count: stats.topCountryCount || 0 }))}</div></span>
            </div>
          </div>
          <div class="media-right media-middle">${icon("flag", "w-12 h-12 opacity-75")}</div>
        </div></div></div>
        <div class="col-sm-4"><div class="panel panel-body"><div class="media no-margin">
          <div class="media-body">
            <h3 class="no-margin text-semibold text-pink-400">${esc(String(stats.topManufacturer))}</h3>
            <div class="text-uppercase text-size-mini text-muted">${esc(t("users.topManufacturer"))}
              <span class="tooltip ml-5">${icon("infoCircle", "w-6 h-6 text-muted")}<div class="tooltip-content"><div class="tooltip-arrow"></div>${esc(t("users.coastersCount", { count: stats.topManufacturerCount || 0 }))}</div></span>
            </div>
          </div>
          <div class="media-right media-middle">${icon("cog", "w-12 h-12 opacity-75")}</div>
        </div></div></div>
        <div class="col-sm-4"><div class="panel panel-body"><div class="media no-margin">
          <div class="media-body">
            <h3 class="no-margin text-semibold text-orange-400">${esc(String(stats.favManufacturer))}</h3>
            <div class="text-uppercase text-size-mini text-muted">${esc(t("users.favoriteManufacturer"))}
              <span class="tooltip ml-5">${icon("infoCircle", "w-6 h-6 text-muted")}<div class="tooltip-content"><div class="tooltip-arrow"></div>${esc(t("users.favoriteTooltip", { count: stats.favCount || 0 }))}</div></span>
            </div>
          </div>
          <div class="media-right media-middle">${icon("heartOutline", "w-12 h-12 opacity-75")}</div>
        </div></div></div>
      </div>
      <div class="panel panel-flat">
        <div class="panel-heading"><h3 class="panel-title">${esc(t("users.badges"))}</h3></div>
        <div class="panel-body"><div class="row">
          ${(user.badges || ["welcome", "1", "100"])
            .slice(0, 4)
            .map((b, i) => {
              const label = i === 0 ? "★" : i === 1 ? "1st" : i === 2 ? "100" : "500";
              const sub = i === 0 ? "Welcome" : "Ratings";
              return `<div class="col-sm-3" style="margin-bottom:40px"><img src="${badgeSvg(label, sub)}" alt="badge" style="max-width:150px"></div>`;
            })
            .join("")}
        </div></div>
      </div>
    </div></div>
  </div>
</div>`;

  return {
    nav: isMe ? "" : "users",
    title: esc(t("users.profileTitle", { name: user.name })),
    content,
  };
}
