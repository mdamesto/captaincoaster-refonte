// Accueil : alerte d'intro, compteurs, photo à la une, dernières notes, derniers avis.

import { icon } from "../icons.js";
import { t, getLocale } from "../i18n.js";
import { esc, thousands, timeAgo, photoUrl } from "../util.js";
import { data, loadReviews, coasterUrl, parkUrl, globalStats, isDismissed, dismiss } from "../store.js";
import { reviewMedia } from "../components/widgets.js";
import { localeHref } from "../components/layout.js";

export async function render(ctx) {
  await loadReviews();
  const locale = ctx.locale;
  const stats = globalStats();
  const latest = data.reviews.slice(0, 6);
  const latestReviews = data.reviews.slice(0, 3);
  const featured = data.coasters.find((c) => c.rank === 1) || data.coasters[0];

  const ratingsFeed = latest
    .map((r) => {
      const c = r.coaster;
      return `
<li>
  <a class="text-bold" href="/${locale}/users/${esc(r.userSlug || "")}" data-link>${esc(r.userName || "Rider")}</a>
  ${esc(t("home.ratedStars", { value: String(r.rating ?? "").replace(".", ",") }))}
  ${c ? `<a href="${coasterUrl(locale, c)}" data-link>${esc(c.name)}</a>` : ""}
  <div class="text-muted">${esc(timeAgo(r.date, t))}</div>
</li>`;
    })
    .join("");

  const alert = isDismissed("home-intro")
    ? ""
    : `
<div class="alert alert-info alert-styled-left alert-arrow-left alert-component" data-dismiss-id="home-intro">
  <button type="button" class="close"><span>&times;</span><span class="sr-only">Close</span></button>
  <h6 class="alert-heading text-semibold">${esc(t("home.alertHeading"))}</h6>
  ${t("home.alertBody", { login: localeHref("/login") })}
</div>`;

  const content = `
${alert}
<div class="row">
  <div class="col-sm-12">
    <div class="panel panel-body">
      <div class="row text-center">
        <div class="col-xs-3">
          <p>${icon("starStat", "w-8 h-8 display-inline-block text-success")}</p>
          <h5 class="text-semibold no-margin">${stats.ratings}
            <span class="badge bg-warning-400">+${stats.newRatingsToday}</span>
          </h5>
          <span class="text-muted text-size-small">${esc(t("home.stat.ratings"))}</span>
        </div>
        <div class="col-xs-3">
          <p>${icon("megaphoneStat", "w-8 h-8 display-inline-block text-success")}</p>
          <h5 class="text-semibold no-margin"><a href="${localeHref("/reviews")}" data-link>${stats.reviews}</a></h5>
          <span class="text-muted text-size-small">${esc(t("home.stat.reviews"))}</span>
        </div>
        <div class="col-xs-3">
          <p>${icon("usersStat", "w-8 h-8 display-inline-block text-warning")}</p>
          <h5 class="text-semibold no-margin"><a href="${localeHref("/users")}" data-link>${stats.users}</a></h5>
          <span class="text-muted text-size-small">${esc(t("home.stat.users"))}</span>
        </div>
        <div class="col-xs-3">
          <p>${icon("cameraStat", "w-8 h-8 display-inline-block text-info")}</p>
          <h5 class="text-semibold no-margin">${stats.pictures}</h5>
          <span class="text-muted text-size-small">${esc(t("home.stat.pictures"))}</span>
        </div>
      </div>
    </div>
  </div>
</div>
<div class="row">
  <div class="col-sm-6">
    <div class="thumbnail">
      <a href="${coasterUrl(locale, featured)}" data-link>
        <div class="thumb">
          <img src="${photoUrl(featured.id)}" alt="${esc(featured.name)}">
          <div class="caption-overflow"></div>
        </div>
      </a>
      <div class="caption text-center">
        <h5 class="text-semibold no-margin">
          <a href="${coasterUrl(locale, featured)}" class="btn btn-info" data-link>${esc(featured.name)}</a>
        </h5>
        <p class="text-muted mb-15 mt-5">${esc(t("home.credit", { name: "Captain Coaster" }))}</p>
      </div>
    </div>
    <div class="panel panel-flat border-top-teal">
      <div class="panel-heading"><h6 class="panel-title">${esc(t("home.latestRatings"))}</h6></div>
      <div class="panel-body"><ul class="list-feed">${ratingsFeed}</ul></div>
    </div>
  </div>
  <div class="col-sm-6">
    <div class="panel panel-flat">
      <div class="panel-heading">
        <h6 class="panel-title text-semibold">${icon("chatBubbleLeft", "w-6 h-6 position-left")} ${esc(t("home.latestReviews"))}</h6>
        <div class="heading-elements">
          <a href="${localeHref("/reviews")}" class="heading-text" data-link>${icon("arrowRight", "w-6 h-6 position-right")} ${esc(t("home.seeAll"))}</a>
        </div>
      </div>
      <div class="panel-body">
        <ul class="media-list media-list-bordered stack-media-on-mobile reviews-list">
          ${latestReviews.map((r) => `<li class="review-list-item">${reviewMedia(r, { showCoaster: true })}</li>`).join("")}
        </ul>
      </div>
    </div>
  </div>
</div>`;

  return {
    nav: "home",
    title: esc(t("home.title")),
    documentTitle: `${t("site.tagline")} • Captain Coaster`,
    headerOpts: { hideTitleOnXs: true },
    content,
    mount(root) {
      root.querySelector("[data-dismiss-id] .close")?.addEventListener("click", () => dismiss("home-intro"));
    },
  };
}
