// Briques réutilisées par les pages : étoiles, avis, pagination, listes, toasts…

import { icon } from "../icons.js";
import { t, getLocale } from "../i18n.js";
import {
  esc, thousands, scoreText, scoreColor, pageWindow, timeAgo, avatarUrl, photoUrl,
} from "../util.js";
import {
  data, coasterUrl, parkUrl, userUrl, countryName, hasUpvoted, isLoggedIn,
  formatHeight, formatLength, formatSpeed,
} from "../store.js";

/* ------------------------------------------------------------------ étoiles */

/** Étoiles en lecture seule (avis, listes). */
export function starsReadonly(value) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  let out = "";
  for (let i = 0; i < full; i++) out += icon("starSolid", "w-6 h-6");
  if (half) out += icon("starHalf", "w-6 h-6");
  return `<span class="star-rating"><span class="text-warning star-rating-stars">${out}</span></span>`;
}

/** Widget interactif (demi-étoiles) — data-rating="coasterId". */
export function ratingWidget(coasterId, value = 0, { readonly = false, id = "" } = {}) {
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    const cls = value >= i ? "star-full" : value >= i - 0.5 ? "star-half" : "star-empty";
    const gid = `star-gradient-${id || coasterId}-${i}`;
    stars += `<span class="rating-star ${cls}" data-value="${i}">
      <svg class="star-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <defs><linearGradient id="${gid}"><stop offset="50%" class="star-fill-left"/><stop offset="50%" class="star-fill-right"/></linearGradient></defs>
        <path class="star-outline" stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"/>
        <path class="star-fill" fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clip-rule="evenodd" fill="url(#${gid})"/>
      </svg>
    </span>`;
  }
  return `<div class="rating-stars ${readonly ? "readonly" : ""}" data-rating="${coasterId}" data-value="${value}">${stars}</div>`;
}

/* ------------------------------------------------------------------ avis */

const SHORT_LEN = 600;

export function reviewMedia(review, { showCoaster = false } = {}) {
  const locale = getLocale();
  const name = review.userName || review.userSlug || "Rider";
  const text = review.text || "";
  const long = text.length > SHORT_LEN;
  const upvoted = hasUpvoted(review.id);
  const coasterLine =
    showCoaster && review.coaster
      ? `<div class="media-heading"><h6 class="text-semibold">
           <a href="${coasterUrl(locale, review.coaster)}" data-link>${esc(review.coaster.name)}</a>
           ${review.coaster.parkId && data.byParkId.get(review.coaster.parkId) ? ` - <a href="${parkUrl(locale, data.byParkId.get(review.coaster.parkId))}" data-link>${esc(data.byParkId.get(review.coaster.parkId).name)}</a>` : ""}
         </h6></div>`
      : "";

  return `
${coasterLine}
<div class="media" data-review="${review.id}">
  <div class="media-left">
    <a href="/${locale}/users/${esc(review.userSlug || "")}" data-link>
      <img src="${avatarUrl(name)}" class="img-circle img-sm" alt="${esc(name)}">
    </a>
  </div>
  <div class="media-body">
    <div class="media-heading">
      <a href="/${locale}/users/${esc(review.userSlug || "")}" class="text-semibold" data-link>${esc(name)}</a>
      <span class="media-annotation dotted">${review.rating ? starsReadonly(review.rating) : ""}</span>
      <span class="media-annotation dotted">${esc(timeAgo(review.date, t))}</span>
    </div>
    ${
      (review.pros?.length || review.cons?.length)
        ? `<p class="mb-10">
             ${(review.pros || []).map((p) => `<span class="label label-success label-rounded">${esc(p)}</span>`).join("")}
             ${(review.cons || []).map((c) => `<span class="label label-danger label-rounded">${esc(c)}</span>`).join("")}
           </p>`
        : ""
    }
    ${
      long
        ? `<div class="review-content" data-review-content>
             <p class="review-short">${esc(text.slice(0, SHORT_LEN))}...
               <a href="#" class="expand-review" data-review-toggle>${icon("chevronDown", "w-6 h-6")}</a>
             </p>
             <p class="review-full" style="display:none">${esc(text)}
               <a href="#" class="collapse-review" data-review-toggle>${icon("chevronUp", "w-6 h-6")}</a>
             </p>
           </div>`
        : `<p>${esc(text)}</p>`
    }
    <ul class="list-inline list-inline-separate text-size-small review-actions-inline">
      <li>
        <span data-upvote-count>${(review.upvotes || 0) + (upvoted ? 1 : 0)}</span>
        <a href="#" data-upvote="${review.id}" title="${esc(t("home.seeAll"))}">${icon(upvoted ? "chevronUpSuccess" : "chevronUp", "w-6 h-6")}</a>
      </li>
      <li>
        <a href="#" data-report="${review.id}" title="${esc(t("reviews.report"))}">${icon("warning", "w-5 h-5")}</a>
      </li>
    </ul>
  </div>
</div>`;
}

/* ------------------------------------------------------------------ listes */

/** Ligne de coaster du classement (rang, score, duels). */
export function rankingItem(c) {
  const locale = getLocale();
  const park = c.parkId ? data.byParkId.get(c.parkId) : null;
  return `
<li class="media panel panel-body stack-media-on-mobile">
  <div class="media-left">
    <a href="${coasterUrl(locale, c)}" data-link>
      <img src="${photoUrl(c.id)}" class="img-rounded" style="width:96px" alt="${esc(c.name)}">
    </a>
  </div>
  <div class="media-body">
    <h2 class="media-heading mb-10">
      <a style="color:#333" href="${coasterUrl(locale, c)}" data-link>${c.rank ? `${c.rank}&nbsp;-&nbsp;` : ""}${esc(c.name)}</a>
      ${c.hasVideo ? `<span class="badge badge-flat border-primary-600 text-primary-600" title="${esc(t("coaster.video"))}">${icon("play", "w-6 h-6")}</span>` : ""}
    </h2>
    <ul class="list-inline list-inline-separate text-muted mb-5">
      ${park ? `<li><a class="text-muted" href="${parkUrl(locale, park)}" data-link>${esc(park.name)}</a></li>` : ""}
      <li>${esc(countryName(locale, c))}</li>
    </ul>
    <ul class="list-inline list-inline-separate text-muted mb-5">
      <li>${esc(c.manufacturer || "-")}</li>
    </ul>
  </div>
  <div class="media-right text-center">
    ${
      c.score !== undefined && c.score !== null
        ? `<h3 style="color:${scoreColor(c.score)}" class="no-margin text-semibold text-nowrap">${scoreText(c.score)}</h3>
           <span class="text-muted mb-10 mt-10 text-nowrap">${esc(t("ranking.duels", { count: thousands(c.duels || 0) }))}</span>`
        : ""
    }
  </div>
</li>`;
}

/** Ligne de coaster de la recherche (constructeur / matériau / année). */
export function searchItem(c) {
  const locale = getLocale();
  const park = c.parkId ? data.byParkId.get(c.parkId) : null;
  return `
<li class="media panel-body stack-media-on-mobile">
  <div class="media-left">
    <a href="${coasterUrl(locale, c)}" data-link>
      <img src="${photoUrl(c.id)}" class="img-rounded" style="width:96px" alt="${esc(c.name)}">
    </a>
  </div>
  <div class="media-body">
    <h6 class="media-heading text-semibold">
      <a href="${coasterUrl(locale, c)}" data-link>${esc(c.name)}</a>
    </h6>
    <ul class="list-inline list-inline-separate text-muted mb-5">
      ${park ? `<li><a class="text-muted" href="${parkUrl(locale, park)}" data-link>${esc(park.name)}</a></li>` : ""}
      <li>${esc(countryName(locale, c))}</li>
    </ul>
    <ul class="list-inline list-inline-separate text-muted mb-5">
      ${c.manufacturer ? `<li>${esc(c.manufacturer)}</li>` : ""}
      ${c.materialType ? `<li>${esc(c.materialType)}</li>` : ""}
      ${c.year ? `<li>${c.year}</li>` : ""}
    </ul>
  </div>
</li>`;
}

/** Ligne de coaster d'une fiche parc (specs + note directe). */
export function parkCoasterItem(c, myValue) {
  const locale = getLocale();
  const stats = [
    [formatHeight(c), "heightSmall", "w-6 h-6 text-warning-600"],
    [formatSpeed(c), "speedSmall", "w-6 h-6 text-success-400"],
    [formatLength(c), "lengthSmall", "w-6 h-6 text-blue"],
    [c.inversions !== undefined ? `&nbsp;${c.inversions}` : null, "inversionsSmall", "w-6 h-6 text-danger-400"],
  ]
    .filter(([v]) => v)
    .map(([v, ic, cls]) => `<li>${icon(ic, cls)} ${v}</li>`)
    .join("");

  return `
<li class="media panel panel-body stack-media-on-mobile border-bottom-xlg ${/operat/i.test(c.status || "") ? "border-bottom-success" : "border-bottom-danger"}">
  <div class="media-left">
    <a href="${coasterUrl(locale, c)}" data-link>
      <img src="${photoUrl(c.id)}" class="img-rounded" style="width:200px" alt="${esc(c.name)}">
    </a>
  </div>
  <div class="media-body" style="vertical-align:middle">
    <h2 class="media-heading mb-2 center" style="margin-bottom:-4px">
      <a style="color:#333" href="${coasterUrl(locale, c)}" data-link>${esc(c.name)}</a>
    </h2>
    ${
      c.score !== undefined && c.score !== null
        ? `<h4 class="media-heading score-responsive mb-20 center" style="color:${scoreColor(c.score)}">${esc(t("park.scoreOf", { score: scoreText(c.score) }))}</h4>`
        : `<h4 class="media-heading mb-20 center text-muted">&nbsp;</h4>`
    }
    <ul class="list-inline list-inline-separate text-muted mb-10 pt-15">
      ${c.manufacturerId ? `<li><a class="text-muted" href="/${locale}/ranking/?filters%5Bmanufacturer%5D=${c.manufacturerId}" data-link>${esc(c.manufacturer)}</a></li>` : c.manufacturer ? `<li>${esc(c.manufacturer)}</li>` : ""}
      ${c.seatingType ? `<li>${esc(c.seatingType)}</li>` : ""}
      ${c.year ? `<li><a class="text-muted" href="/${locale}/ranking/?filters%5BopeningDate%5D=${c.year}" data-link>${c.year}</a></li>` : ""}
    </ul>
    <ul class="list-inline list-inline-separate text-muted mb-5">${stats}</ul>
  </div>
  <div class="media-right text-center note-responsive" style="vertical-align:middle">
    ${isLoggedIn() ? ratingWidget(c.id, myValue || 0, { id: `park-${c.id}` }) : ""}
  </div>
</li>`;
}

/* ------------------------------------------------------------------ pagination */

export function pagination(page, pages, { param = "page" } = {}) {
  if (pages <= 1) return "";
  const items = pageWindow(page, pages)
    .map((v) =>
      v === "…"
        ? `<li class="page-item disabled"><span class="page-link">&hellip;</span></li>`
        : v === page
        ? `<li class="page-item active"><span class="page-link">${v}</span></li>`
        : `<li class="page-item"><a class="page-link" href="#" data-page="${v}">${v}</a></li>`
    )
    .join("");
  return `
<div class="text-center content-group pt-20">
  <ul class="pagination" data-pagination="${param}">
    <li class="page-item ${page <= 1 ? "disabled" : ""}">${page <= 1 ? `<span class="page-link">&laquo;</span>` : `<a class="page-link" href="#" data-page="${page - 1}">&laquo;</a>`}</li>
    ${items}
    <li class="page-item ${page >= pages ? "disabled" : ""}">${page >= pages ? `<span class="page-link">&raquo;</span>` : `<a class="page-link" href="#" data-page="${page + 1}">&raquo;</a>`}</li>
  </ul>
</div>`;
}

/* ------------------------------------------------------------------ toasts */

export function notify(message, kind = "info") {
  const box = document.getElementById("notifications");
  if (!box) return;
  const el = document.createElement("div");
  el.className = `notification-toast ${kind}`;
  el.textContent = message;
  box.appendChild(el);
  setTimeout(() => {
    el.style.opacity = "0";
    setTimeout(() => el.remove(), 300);
  }, 3200);
}

/* ------------------------------------------------------------------ modale */

export function openModal({ title, body, confirmLabel, onConfirm }) {
  const host = document.getElementById("overlays");
  host.innerHTML = `
<div class="modal-backdrop" data-modal>
  <div class="modal-dialog">
    <div class="modal-header">
      <h6 class="no-margin text-semibold">${esc(title)}</h6>
      <button type="button" class="close" data-modal-close>&times;</button>
    </div>
    <div class="modal-body">${body}</div>
    <div class="modal-footer">
      <button type="button" class="btn btn-default" data-modal-close>${esc(t("coaster.clear"))}</button>
      ${confirmLabel ? `<button type="button" class="btn btn-primary ml-10" data-modal-confirm>${esc(confirmLabel)}</button>` : ""}
    </div>
  </div>
</div>`;
  const close = () => (host.innerHTML = "");
  host.querySelectorAll("[data-modal-close]").forEach((b) => b.addEventListener("click", close));
  host.querySelector("[data-modal]").addEventListener("click", (e) => {
    if (e.target.matches("[data-modal]")) close();
  });
  const confirmBtn = host.querySelector("[data-modal-confirm]");
  if (confirmBtn) confirmBtn.addEventListener("click", () => { onConfirm?.(); close(); });
}

/* ------------------------------------------------------------------ lightbox */

let galleryItems = [];
let galleryIndex = 0;

export function openGallery(items, index = 0) {
  galleryItems = items;
  galleryIndex = index;
  renderGallery();
}

function renderGallery() {
  const host = document.getElementById("overlays");
  const item = galleryItems[galleryIndex];
  if (!item) return;
  host.innerHTML = `
<div class="gallery-backdrop" data-gallery>
  <button class="gallery-close" data-gallery-close aria-label="close">&times;</button>
  ${galleryItems.length > 1 ? `<button class="gallery-prev" data-gallery-prev aria-label="previous">&lsaquo;</button>` : ""}
  <img src="${item.src}" alt="${esc(item.alt || "")}">
  ${galleryItems.length > 1 ? `<button class="gallery-next" data-gallery-next aria-label="next">&rsaquo;</button>` : ""}
  <div class="gallery-caption">${esc(item.caption || "")} — ${galleryIndex + 1}/${galleryItems.length}</div>
</div>`;
  const close = () => { host.innerHTML = ""; document.removeEventListener("keydown", onKey); };
  host.querySelector("[data-gallery-close]").addEventListener("click", close);
  host.querySelector("[data-gallery]").addEventListener("click", (e) => {
    if (e.target.matches("[data-gallery]")) close();
  });
  host.querySelector("[data-gallery-prev]")?.addEventListener("click", () => {
    galleryIndex = (galleryIndex - 1 + galleryItems.length) % galleryItems.length;
    renderGallery();
  });
  host.querySelector("[data-gallery-next]")?.addEventListener("click", () => {
    galleryIndex = (galleryIndex + 1) % galleryItems.length;
    renderGallery();
  });
  function onKey(e) {
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") host.querySelector("[data-gallery-prev]")?.click();
    if (e.key === "ArrowRight") host.querySelector("[data-gallery-next]")?.click();
  }
  document.addEventListener("keydown", onKey);
}

/* ------------------------------------------------------------------ divers */

export function panelEmpty(message) {
  return `<div class="panel panel-body text-center text-muted">${esc(message)}</div>`;
}

export function statTile(value, label, iconName, colorClass) {
  return `
<div class="col-sm-6 col-md-3">
  <div class="panel panel-body">
    <div class="media no-margin">
      <div class="media-body">
        <h3 class="no-margin text-semibold ${colorClass}">${value}</h3>
        <div class="text-uppercase text-size-mini text-muted">${label}</div>
      </div>
      <div class="media-right media-middle">${icon(iconName, "w-12 h-12 opacity-75")}</div>
    </div>
  </div>
</div>`;
}
