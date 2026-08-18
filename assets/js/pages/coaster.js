// Fiche coaster : score, distribution, notation, caractéristiques, résumé IA, photos, avis.

import { icon } from "../icons.js";
import { t } from "../i18n.js";
import { esc, scoreText, thousands, paginate, photoUrl, timeAgo } from "../util.js";
import {
  data, loadReviews, loadSummaries, loadImages, coasterUrl, parkUrl, countryName,
  isLoggedIn, myRating, myReview, setRiddenAt, deleteRating, hasLiked, toggleLike,
  summaryVote, voteSummary, formatHeight, formatLength, formatSpeed, myReviewsAsList,
} from "../store.js";
import { reviewMedia, ratingWidget, pagination, openGallery, notify } from "../components/widgets.js";
import { localeHref } from "../components/layout.js";
import { navigate } from "../router.js";

const REVIEWS_PER_PAGE = 10;

const DISTRIBUTION_KEYS = ["0.5", "1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5"];
const SEGMENT_CLASS = {
  "0.5": "rating-0-5", 1: "rating-1", "1.5": "rating-1-5", 2: "rating-2", "2.5": "rating-2-5",
  3: "rating-3", "3.5": "rating-3-5", 4: "rating-4", "4.5": "rating-4-5", 5: "rating-5",
};

export async function render(ctx) {
  const locale = ctx.locale;
  const coaster = data.byCoasterId.get(Number(ctx.params.id));
  if (!coaster) return (await import("./not-found.js")).render(ctx);

  await Promise.all([loadReviews(), loadSummaries(), loadImages()]);

  const park = coaster.parkId ? data.byParkId.get(coaster.parkId) : null;
  const summary = data.summaries[coaster.id];
  const photos = data.images[coaster.id] || [];
  const parkCoasters = park ? data.coastersByPark.get(park.id) || [] : [];
  const mine = myRating(coaster.id);

  /* ---------------------------------------------------------- colonne gauche */

  const distribution = coaster.ratingDistribution;
  const totalRatings = distribution ? Object.values(distribution).reduce((a, b) => a + b, 0) : 0;
  const distributionHtml = distribution
    ? `
<div class="rating-distribution-compact">
  <div class="text-muted text-size-small text-uppercase score-label mb-10">${esc(t("coaster.ratingDistribution"))}</div>
  <div class="rating-bar-container">
    <div class="rating-bar">
      ${DISTRIBUTION_KEYS.map((k) => {
        const n = distribution[k] || 0;
        const pct = totalRatings ? (n / totalRatings) * 100 : 0;
        if (!pct) return "";
        return `<div class="rating-segment ${SEGMENT_CLASS[k]}" style="width:${pct.toFixed(2)}%" title="${k}★: ${pct.toFixed(2)}% (${n} ratings)">${pct > 12 ? `<span class="rating-segment-label">${k}★</span>` : ""}</div>`;
      }).join("")}
    </div>
  </div>
</div>`
    : "";

  const scorePanel = `
<div class="panel panel-body">
  <div class="row">
    <div class="col-xs-6">
      <div class="text-muted text-size-small text-uppercase score-label">${esc(t("coaster.score"))}</div>
      <div class="score-compact"><div>
        ${coaster.score != null ? `<span class="score-number">${scoreText(coaster.score).replace("%", "")}</span><span class="score-percent">%</span>` : `<span class="score-number text-muted">—</span>`}
      </div></div>
    </div>
    <div class="col-xs-6">
      <a href="${localeHref(`/ranking/?page=${coaster.rank ? Math.ceil(coaster.rank / 20) : 1}`)}" class="text-default rank-link" data-link>
        <div class="text-muted text-size-small text-uppercase score-label">${esc(t("coaster.rank"))}</div>
        <div class="rank-number">${coaster.rank ? `#${coaster.rank}` : "—"}</div>
      </a>
    </div>
  </div>
  ${distributionHtml}
</div>`;

  const ratePanel = isLoggedIn()
    ? `
<div class="panel panel-body border-top-primary text-center" data-rate-panel>
  <h6 class="no-margin text-semibold" data-rate-title>${esc(mine ? t("coaster.myRating") : t("coaster.rate"))}</h6>
  ${ratingWidget(coaster.id, mine?.value || 0)}
  <div class="rating-actions mt-10">
    <a class="action-icon review-icon" href="${localeHref(`/reviews/coasters/${coaster.id}/form`)}" data-link title="${esc(myReview(coaster.id) ? t("reviews.editMine") : t("coaster.writeReview"))}">
      ${icon("cog", "w-6 h-6")}${myReview(coaster.id) ? '<span class="review-indicator"></span>' : ""}
    </a>
    <div class="inline-date-picker" data-date-picker>
      <a class="action-icon" href="#" data-date-toggle title="${esc(t("coaster.whenRide"))}" style="${mine ? "" : "display:none"}">
        ${icon("clockSmall", "w-6 h-6")}${mine?.riddenAt ? '<span class="date-indicator"></span>' : ""}
      </a>
      <div class="date-picker-popup-inline" data-date-popup>
        <div class="date-picker-content-small">
          <label class="date-picker-label">${esc(t("coaster.whenRide"))}</label>
          <input type="date" class="small-date-input" data-date-input value="${esc(mine?.riddenAt || "")}" max="${new Date().toISOString().slice(0, 10)}">
          <div class="small-date-actions">
            <button type="button" class="tiny-btn today-btn" data-date-today>${esc(t("coaster.today"))}</button>
            <button type="button" class="tiny-btn clear-btn" data-date-clear>${esc(t("coaster.clear"))}</button>
          </div>
        </div>
      </div>
    </div>
    <a class="action-icon delete-icon" href="#" data-delete-rating title="${esc(t("coaster.deleteRating"))}" style="${mine ? "" : "display:none"}">
      ${icon("close", "w-6 h-6")}
    </a>
  </div>
</div>`
    : `
<div class="panel panel-body border-top-primary text-center">
  <h6 class="no-margin text-semibold">${esc(t("coaster.rate"))}</h6>
  <p class="text-muted content-group-sm">${esc(t("coaster.mustLogIn"))}</p>
  <a href="${localeHref("/login")}" data-link>${esc(t("coaster.logIn"))}</a>
</div>`;

  const statBtn = (value, iconName, cls) =>
    value
      ? `<button type="button" class="btn btn-default btn-block btn-float btn-float-lg">
           <div class="text-center">${icon(iconName, cls)}<div class="text-bold mt-5">${value}</div></div>
         </button>`
      : "";

  const statsGrid = `
<div class="content-group">
  <div class="row row-seamless btn-block-group">
    <div class="col-xs-6">
      ${statBtn(formatHeight(coaster), "height", "w-12 h-12 text-warning-600")}
      ${statBtn(formatSpeed(coaster), "speed", "w-12 h-12 text-success-400")}
    </div>
    <div class="col-xs-6">
      ${statBtn(formatLength(coaster), "length", "w-12 h-12 text-blue")}
      ${statBtn(coaster.inversions !== undefined ? String(coaster.inversions) : null, "inversions", "w-12 h-12 text-danger-400")}
    </div>
  </div>
</div>`;

  const feature = (label, value) =>
    value ? `<div class="list-group-item"><label class="control-label no-margin text-semibold">${esc(label)} :</label><div class="pull-right">${value}</div></div>` : "";

  const featuresPanel = `
<div class="panel panel-white">
  <div class="panel-heading"><h6>${esc(t("coaster.features", { name: coaster.name }))}</h6></div>
  <div class="list-group no-border">
    ${feature(t("coaster.status"), `<span class="label label-${/operat/i.test(coaster.status) ? "success bg-success" : "danger bg-danger"}">${esc(coaster.status)}</span>`)}
    ${feature(t("coaster.park"), park ? `<a href="${parkUrl(locale, park)}" data-link>${esc(park.name)}</a>` : "")}
    ${feature(t("coaster.country"), coaster.countryId ? `<a href="${localeHref(`/ranking/?filters%5Bcountry%5D=${coaster.countryId}`)}" data-link>${esc(countryName(locale, coaster))}</a>` : esc(coaster.country || ""))}
    ${feature(t("coaster.manufacturer"), coaster.manufacturerId ? `<a href="${localeHref(`/ranking/?filters%5Bmanufacturer%5D=${coaster.manufacturerId}`)}" data-link>${esc(coaster.manufacturer)}</a>` : esc(coaster.manufacturer || ""))}
    ${feature(t("coaster.type"), esc(coaster.materialType || ""))}
    ${feature(t("coaster.train"), esc(coaster.seatingType || ""))}
    ${feature(t("coaster.model"), esc(coaster.model || ""))}
    ${feature(t("coaster.launch"), esc(coaster.launch || ""))}
    ${feature(t("coaster.restraint"), esc(coaster.restraint || ""))}
    ${feature(t("coaster.openingDate"), coaster.year ? `<a href="${localeHref(`/ranking/?filters%5BopeningDate%5D=${coaster.year}`)}" data-link>${coaster.openingDate || coaster.year}</a>` : "")}
  </div>
</div>`;

  const alsoIn = park
    ? `
<div class="panel panel-white">
  <div class="panel-heading"><h6>${esc(t("coaster.alsoIn", { name: park.name }))} &nbsp;<span class="badge badge-primary">${parkCoasters.length}</span></h6></div>
  <div class="list-group no-border">
    ${parkCoasters
      .map(
        (c) => `<div class="list-group-item">
          <span class="status-mark border-${/operat/i.test(c.status) ? "success" : "danger"} position-left"></span>
          <a href="${coasterUrl(locale, c)}" data-link>${esc(c.name)}</a>
        </div>`
      )
      .join("")}
  </div>
</div>`
    : "";

  /* ---------------------------------------------------------- colonne droite */

  const vote = summaryVote(coaster.id);
  const summaryPanel = summary
    ? `
<div class="panel panel-flat mb-15" data-summary>
  <div class="panel-heading">
    <h6 class="panel-title"><span class="text-semibold">${icon("starFilled", "w-6 h-6 position-left")} ${esc(t("coaster.captainReview"))}</span></h6>
  </div>
  <div class="panel-body">
    <p class="text-muted mb-15">${esc(summary.text)}</p>
    <div class="row">
      <div class="col-md-6">
        <h6 style="color:#065f46">${icon("check", "w-5 h-5")} ${esc(t("coaster.highlights"))}</h6>
        ${summary.highlights.map((h) => `<span class="label label-success label-rounded">${esc(h)}</span>`).join("")}
      </div>
      <div class="col-md-6">
        <h6 style="color:#9f1239">${icon("warning", "w-5 h-5")} ${esc(t("coaster.concerns"))}</h6>
        ${summary.concerns.map((c) => `<span class="label label-danger label-rounded">${esc(c)}</span>`).join("")}
      </div>
    </div>
    <div class="summary-feedback-section">
      <div class="row">
        <div class="col-md-6">
          <small class="text-muted">${icon("infoSmall", "w-6 h-6")} ${esc(t("coaster.aiSummary", { count: summary.reviewCount ?? "" }))}</small>
        </div>
        <div class="col-md-6 text-right">
          <div class="summary-feedback-buttons">
            <small class="text-muted" style="margin-right:8px">${esc(t("coaster.howWasIt"))}</small>
            <button type="button" class="btn btn-outline-success summary-feedback-button ${vote === "up" ? "active" : ""}" data-summary-vote="up" title="${esc(t("coaster.helpful"))}">${icon("thumbUp", "w-6 h-6")}</button>
            <button type="button" class="btn btn-outline-danger summary-feedback-button ${vote === "down" ? "active" : ""}" data-summary-vote="down" title="${esc(t("coaster.notHelpful"))}">${icon("thumbDown", "w-6 h-6")}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`
    : "";

  const photoCount = coaster.photoCount || photos.length;
  const photosPanel = `
<div class="panel panel-flat mb-15" data-photos>
  <div class="panel-heading">
    <h6 class="panel-title"><span class="text-semibold">${icon("photo", "w-6 h-6 position-left")} ${esc(t("coaster.photos"))} ${photoCount ? `<span class="badge badge-primary">${photoCount}</span>` : ""}</span></h6>
    <div class="pull-right text-muted">
      <a href="${localeHref(`/coasters/${coaster.slug}/images/upload`)}" data-link>${esc(t("coaster.upload"))}</a>
    </div>
  </div>
  <div class="panel-body">
    ${
      photos.length
        ? `<div class="coaster-photo-grid">
             ${photos
               .map(
                 (img, i) => `
        <div class="col-sm-3">
          <a class="m-10" href="#" data-photo-index="${i}">
            <div class="thumb"><img src="${photoUrl(`${coaster.id}-${img.id}`)}" alt="${esc(coaster.name)}"></div>
          </a>
          <div class="text-size-small text-muted">
            <button type="button" class="btn-link image-like-btn ${hasLiked(img.id) ? "liked" : ""}" data-like="${img.id}">${icon("heartOutline", "w-6 h-6")}</button>
            <span data-like-count="${img.id}">${img.likes + (hasLiked(img.id) ? 1 : 0)}</span>
            &nbsp;${esc(img.credit || "")}
          </div>
        </div>`
               )
               .join("")}
           </div>`
        : `<p class="text-muted text-center no-margin">${esc(t("coaster.noPhotos"))}</p>`
    }
  </div>
</div>`;

  const reviewsPanel = `<div id="coaster-reviews"></div>`;

  const content = `
<div class="row">
  <div class="col-sm-3">
    ${scorePanel}
    ${ratePanel}
    ${statsGrid}
    ${featuresPanel}
    ${alsoIn}
  </div>
  <div class="col-sm-9">
    ${coaster.youtube ? `<a class="youtube-thumbnail" href="https://www.youtube.com/watch?v=${esc(coaster.youtube)}" target="_blank" rel="noopener"><img src="${photoUrl(coaster.id)}" alt="${esc(coaster.name)}"></a>` : ""}
    ${summaryPanel}
    ${photosPanel}
    ${reviewsPanel}
  </div>
</div>`;

  return {
    nav: "",
    title: `${esc(coaster.name)} • ${esc(park?.name || "")}`,
    documentTitle: `${coaster.name} • ${park?.name || ""} • Captain Coaster`,
    content,
    mount(root, ctx2) {
      mountReviews(root, coaster, ctx2);
      mountRating(root, coaster);
      mountPhotos(root, coaster, photos);
      mountSummary(root, coaster);
    },
  };
}

/* ------------------------------------------------------------------ blocs */

function mountReviews(root, coaster, ctx) {
  const host = root.querySelector("#coaster-reviews");
  let page = 1;
  let sort = "";

  const all = () => {
    const list = [...(data.reviewsByCoaster.get(coaster.id) || [])];
    const mineList = myReviewsAsList().filter((r) => r.coasterId === coaster.id);
    const merged = [...mineList, ...list];
    switch (sort) {
      case "updatedAt|asc": return merged.sort((a, b) => new Date(a.date) - new Date(b.date));
      case "updatedAt|desc": return merged.sort((a, b) => new Date(b.date) - new Date(a.date));
      case "value|desc": return merged.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case "value|asc": return merged.sort((a, b) => (a.rating || 0) - (b.rating || 0));
      default: return merged.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
    }
  };

  const draw = () => {
    const list = all();
    const res = paginate(list, page, REVIEWS_PER_PAGE);
    page = res.page;
    host.innerHTML = `
<div class="panel panel-flat mb-15">
  <div class="panel-heading">
    <h6 class="panel-title section-header">
      <div class="section-header__container">
        <div class="section-header__title">
          <span class="text-semibold">${icon("chatReviews", "w-6 h-6 position-left")} ${esc(t("reviews.heading"))}</span><span class="badge badge-primary">${thousands(coaster.reviewCount || res.total)}</span>
        </div>
        <form class="section-header__form form-horizontal">
          <div class="form-group-xs no-margin-bottom">
            <select name="filters[sort]" class="form-control" data-review-sort>
              <option value="" ${sort === "" ? "selected" : ""}>${esc(t("reviews.sortDefault"))}</option>
              <option value="updatedAt|asc" ${sort === "updatedAt|asc" ? "selected" : ""}>${esc(t("reviews.sortOldest"))}</option>
              <option value="updatedAt|desc" ${sort === "updatedAt|desc" ? "selected" : ""}>${esc(t("reviews.sortNewest"))}</option>
              <option value="value|desc" ${sort === "value|desc" ? "selected" : ""}>${esc(t("reviews.sortBest"))}</option>
              <option value="value|asc" ${sort === "value|asc" ? "selected" : ""}>${esc(t("reviews.sortWorst"))}</option>
            </select>
          </div>
        </form>
      </div>
      <div>
        <a href="/${ctx.locale}/reviews/coasters/${coaster.id}/form" class="btn btn-primary btn-rounded btn-xs" data-link>
          ${icon("plusCircle", "w-6 h-6 position-left")} ${esc(myReview(coaster.id) ? t("reviews.editMine") : t("reviews.addMine"))}
        </a>
      </div>
    </h6>
  </div>
  <div class="panel-body">
    ${
      res.items.length
        ? `<ul class="media-list media-list-bordered">${res.items.map((r) => `<li>${reviewMedia(r)}</li>`).join("")}</ul>${pagination(res.page, res.pages)}`
        : `<p class="text-muted text-center no-margin">${esc(t("reviews.empty"))}</p>`
    }
  </div>
</div>`;
    host.querySelector("[data-review-sort]")?.addEventListener("change", (e) => {
      sort = e.target.value;
      page = 1;
      draw();
    });
    host.addEventListener("click", (e) => {
      const a = e.target.closest("[data-page]");
      if (a) {
        e.preventDefault();
        page = Number(a.dataset.page);
        draw();
        host.scrollIntoView({ behavior: "smooth" });
      }
    });
  };
  draw();
}

function mountRating(root, coaster) {
  const panel = root.querySelector("[data-rate-panel]");
  if (!panel) return;
  const title = panel.querySelector("[data-rate-title]");
  const dateToggle = panel.querySelector("[data-date-toggle]");
  const deleteBtn = panel.querySelector("[data-delete-rating]");
  const popup = panel.querySelector("[data-date-popup]");
  const input = panel.querySelector("[data-date-input]");

  const refresh = () => {
    const mine = myRating(coaster.id);
    title.textContent = mine ? t("coaster.myRating") : t("coaster.rate");
    dateToggle.style.display = mine ? "" : "none";
    deleteBtn.style.display = mine ? "" : "none";
  };

  document.addEventListener("cc:rating", (e) => {
    if (e.detail.coasterId === coaster.id) refresh();
  });

  dateToggle.addEventListener("click", (e) => {
    e.preventDefault();
    popup.classList.toggle("show");
    if (popup.classList.contains("show")) input.focus();
  });
  input.addEventListener("change", () => {
    setRiddenAt(coaster.id, input.value);
    popup.classList.remove("show");
    notify(t("coaster.ratingSaved"), "success");
  });
  panel.querySelector("[data-date-today]").addEventListener("click", () => {
    input.value = new Date().toISOString().slice(0, 10);
    setRiddenAt(coaster.id, input.value);
    popup.classList.remove("show");
  });
  panel.querySelector("[data-date-clear]").addEventListener("click", () => {
    input.value = "";
    setRiddenAt(coaster.id, null);
    popup.classList.remove("show");
  });
  deleteBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (!confirm(t("coaster.deleteRatingConfirm"))) return;
    deleteRating(coaster.id);
    const widget = panel.querySelector(".rating-stars");
    widget.dataset.value = "0";
    widget.querySelectorAll(".rating-star").forEach((s) => {
      s.classList.remove("star-full", "star-half");
      s.classList.add("star-empty");
    });
    refresh();
    notify(t("coaster.ratingDeleted"), "success");
  });
  refresh();
}

function mountPhotos(root, coaster, photos) {
  const host = root.querySelector("[data-photos]");
  if (!host) return;
  host.addEventListener("click", (e) => {
    const like = e.target.closest("[data-like]");
    if (like) {
      e.preventDefault();
      const id = Number(like.dataset.like);
      const added = toggleLike(id);
      like.classList.toggle("liked", added);
      const counter = host.querySelector(`[data-like-count="${id}"]`);
      const img = photos.find((p) => p.id === id);
      counter.textContent = String((img?.likes || 0) + (added ? 1 : 0));
      return;
    }
    const photo = e.target.closest("[data-photo-index]");
    if (photo) {
      e.preventDefault();
      openGallery(
        photos.map((p) => ({
          src: photoUrl(`${coaster.id}-${p.id}`),
          alt: coaster.name,
          caption: p.credit,
        })),
        Number(photo.dataset.photoIndex)
      );
    }
  });
}

function mountSummary(root, coaster) {
  const host = root.querySelector("[data-summary]");
  if (!host) return;
  host.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-summary-vote]");
    if (!btn) return;
    voteSummary(coaster.id, btn.dataset.summaryVote);
    host.querySelectorAll("[data-summary-vote]").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    notify(t("coaster.feedbackThanks"), "success");
  });
}
