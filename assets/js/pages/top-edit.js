// Éditeur de top : glisser-déposer, recherche d'ajout, sauvegarde automatique.
// (Reproduit le comportement des contrôleurs Stimulus top-list / top-search du site.)

import { icon } from "../icons.js";
import { t } from "../i18n.js";
import { esc, photoUrl, debounce } from "../util.js";
import {
  data, coasterUrl, parkUrl, getMyTop, createTop, updateTop, deleteTop, isLoggedIn, myRating,
} from "../store.js";
import { notify } from "../components/widgets.js";
import { localeHref } from "../components/layout.js";
import { navigate } from "../router.js";
import { searchAll } from "../components/search.js";

const SAVE_DELAY = 800;

export async function render(ctx) {
  if (!isLoggedIn()) {
    navigate(localeHref("/login"), { replace: true });
    return { nav: "tops", title: "", content: "" };
  }

  let top = ctx.route === "topNew" ? createTop(t("tops.name")) : getMyTop(ctx.params.id);
  if (!top) return (await import("./not-found.js")).render(ctx);
  if (ctx.route === "topNew") history.replaceState({}, "", localeHref(`/tops/${top.id}/edit`));

  const content = `
<div class="panel panel-white">
  <div class="panel-heading">
    <div class="row">
      <div class="col-sm-8">
        <input type="text" class="form-control" data-top-title value="${esc(top.title)}" placeholder="${esc(t("tops.name"))}">
      </div>
      <div class="col-sm-4 text-right">
        <a href="${localeHref(`/tops/${top.id}`)}" class="btn btn-default" data-link>${esc(t("tops.seeMore"))}</a>
        <button type="button" class="btn btn-danger ml-5" data-delete-top>${esc(t("tops.delete"))}</button>
      </div>
    </div>
  </div>
  <div class="panel-body">
    <div class="search-container top-search-container" data-top-search>
      <div class="has-feedback search-input-container">
        <input type="search" class="form-control" data-top-search-input placeholder="${esc(t("tops.addCoaster"))}" autocomplete="off">
        <div class="form-control-feedback">${icon("searchSmall", "w-6 h-6 text-muted")}</div>
      </div>
      <div class="search-dropdown" data-top-search-dropdown><div data-top-search-results></div></div>
    </div>
  </div>
  <ul class="media-list" data-top-list></ul>
</div>`;

  return {
    nav: "tops",
    title: esc(t("tops.edit")),
    content,
    mount(root, c) {
      const list = root.querySelector("[data-top-list]");
      const titleInput = root.querySelector("[data-top-title]");
      const searchInput = root.querySelector("[data-top-search-input]");
      const searchBox = root.querySelector("[data-top-search]");
      const searchResults = root.querySelector("[data-top-search-results]");

      const showStatus = (kind) => {
        root.querySelector(".save-status")?.remove();
        const el = document.createElement("div");
        el.className = `save-status save-status-${kind}`;
        el.innerHTML =
          kind === "saved" ? `${icon("check", "w-5 h-5")} ${esc(t("tops.saved"))}`
          : kind === "saving" ? `${icon("spinner", "w-6 h-6 spinner")} ${esc(t("tops.saving"))}`
          : `${icon("warning", "w-5 h-5")} ${esc(t("tops.saveFailed"))}`;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 1800);
      };

      const save = debounce(() => {
        updateTop(top.id, { items: top.items, title: titleInput.value.trim() || t("tops.name") });
        showStatus("saved");
      }, SAVE_DELAY);

      const draw = () => {
        list.innerHTML = top.items.length
          ? top.items
              .map((id, i) => {
                const coaster = data.byCoasterId.get(id);
                if (!coaster) return "";
                const park = coaster.parkId ? data.byParkId.get(coaster.parkId) : null;
                const mine = myRating(coaster.id);
                return `
<li class="media panel-body stack-media-on-mobile" draggable="true" data-item="${coaster.id}" data-position="${i + 1}">
  <div class="media-left">
    <div class="drag-area">
      <span class="position-number">${i + 1}</span>
      <span class="drag-indicator">${icon("menu", "w-6 h-6")}</span>
    </div>
  </div>
  <div class="media-left">
    <img src="${photoUrl(coaster.id)}" class="img-rounded" style="width:72px" alt="${esc(coaster.name)}">
  </div>
  <div class="media-body">
    <h6 class="media-heading text-semibold">
      <a href="${coasterUrl(c.locale, coaster)}" data-link>${esc(coaster.name)}</a>
      ${mine ? `<span class="badge bg-success ml-5">${String(mine.value).replace(".", ",")}</span>` : ""}
    </h6>
    <ul class="list-inline list-inline-separate text-muted mb-5">
      ${park ? `<li><a class="text-muted" href="${parkUrl(c.locale, park)}" data-link>${esc(park.name)}</a></li>` : ""}
      ${coaster.manufacturer ? `<li>${esc(coaster.manufacturer)}</li>` : ""}
    </ul>
  </div>
  <div class="media-right media-middle">
    <button type="button" class="btn btn-default btn-xs" data-move-top title="${esc(t("tops.moveTop"))}">${icon("chevronUp", "w-6 h-6")}</button>
    <button type="button" class="btn btn-default btn-xs" data-move-bottom title="${esc(t("tops.moveBottom"))}">${icon("chevronDown", "w-6 h-6")}</button>
    <button type="button" class="btn btn-default btn-xs" data-move-to title="${esc(t("tops.moveTo"))}">#</button>
    <button type="button" class="btn btn-danger btn-xs" data-remove title="${esc(t("tops.remove"))}">&times;</button>
  </div>
</li>`;
              })
              .join("")
          : `<li class="panel-body text-center text-muted">${esc(t("tops.empty"))}</li>`;
      };

      /* --- glisser-déposer natif --- */
      let dragId = null;
      list.addEventListener("dragstart", (e) => {
        const li = e.target.closest("[data-item]");
        if (!li) return;
        dragId = Number(li.dataset.item);
        li.classList.add("sortable-chosen");
        e.dataTransfer.effectAllowed = "move";
      });
      list.addEventListener("dragover", (e) => {
        e.preventDefault();
        const li = e.target.closest("[data-item]");
        list.querySelectorAll(".sortable-ghost").forEach((n) => n.classList.remove("sortable-ghost"));
        if (li && Number(li.dataset.item) !== dragId) li.classList.add("sortable-ghost");
      });
      list.addEventListener("drop", (e) => {
        e.preventDefault();
        const li = e.target.closest("[data-item]");
        list.querySelectorAll(".sortable-ghost, .sortable-chosen").forEach((n) =>
          n.classList.remove("sortable-ghost", "sortable-chosen")
        );
        if (!li || dragId === null) return;
        const targetId = Number(li.dataset.item);
        if (targetId === dragId) return;
        const from = top.items.indexOf(dragId);
        const to = top.items.indexOf(targetId);
        top.items.splice(from, 1);
        top.items.splice(to, 0, dragId);
        dragId = null;
        draw();
        save();
      });
      list.addEventListener("dragend", () => {
        list.querySelectorAll(".sortable-ghost, .sortable-chosen").forEach((n) =>
          n.classList.remove("sortable-ghost", "sortable-chosen")
        );
      });

      /* --- actions --- */
      list.addEventListener("click", (e) => {
        const li = e.target.closest("[data-item]");
        if (!li) return;
        const id = Number(li.dataset.item);
        const index = top.items.indexOf(id);
        if (e.target.closest("[data-remove]")) {
          top.items.splice(index, 1);
        } else if (e.target.closest("[data-move-top]")) {
          top.items.splice(index, 1);
          top.items.unshift(id);
        } else if (e.target.closest("[data-move-bottom]")) {
          top.items.splice(index, 1);
          top.items.push(id);
        } else if (e.target.closest("[data-move-to]")) {
          const answer = prompt(t("tops.positionPrompt", { max: top.items.length }), String(index + 1));
          const pos = Number(answer);
          if (!answer || Number.isNaN(pos) || pos < 1 || pos > top.items.length) return;
          top.items.splice(index, 1);
          top.items.splice(pos - 1, 0, id);
        } else return;
        draw();
        save();
      });

      titleInput.addEventListener("input", save);

      root.querySelector("[data-delete-top]").addEventListener("click", () => {
        if (!confirm(t("tops.deleteConfirm"))) return;
        deleteTop(top.id);
        navigate(localeHref("/tops/"));
      });

      /* --- recherche d'ajout --- */
      const runSearch = debounce(() => {
        const q = searchInput.value.trim();
        if (q.length < 2) {
          searchBox.classList.remove("search-open");
          return;
        }
        const results = searchAll(q, 10).filter((r) => r.type === "coaster");
        searchResults.innerHTML = results.length
          ? results
              .map((r) => {
                const dup = top.items.includes(r.item.id);
                const park = r.item.parkId ? data.byParkId.get(r.item.parkId) : null;
                const rating = myRating(r.item.id);
                return `
<div class="search-result-item ${dup ? "search-result-duplicate" : ""}" data-add="${r.item.id}">
  <div class="search-result-emoji">🎢</div>
  <div class="search-result-content">
    <div class="search-result-name">${esc(r.item.name)}</div>
    <div class="search-result-subtitle">${esc(park?.name || "")}</div>
  </div>
  <span class="badge ${rating ? "bg-success" : ""}">${rating ? String(rating.value).replace(".", ",") : "N/A"}</span>
</div>`;
              })
              .join("")
          : `<div class="search-no-results"><div class="search-no-results-icon">🔍</div><div class="search-no-results-text">${esc(t("search.noResults"))}</div></div>`;
        searchBox.classList.add("search-open");
      }, 300);

      searchInput.addEventListener("input", runSearch);
      searchResults.addEventListener("click", (e) => {
        const node = e.target.closest("[data-add]");
        if (!node) return;
        const id = Number(node.dataset.add);
        if (top.items.includes(id)) return;
        top.items.push(id);
        searchInput.value = "";
        searchBox.classList.remove("search-open");
        draw();
        save();
      });
      document.addEventListener("click", (e) => {
        if (!e.target.closest("[data-top-search]")) searchBox.classList.remove("search-open");
      });

      draw();
    },
  };
}
