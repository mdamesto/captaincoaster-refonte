// Classement mondial : sidebar de filtres + liste paginée rechargée « en ajax ».

import { icon } from "../icons.js";
import { t } from "../i18n.js";
import { esc, compact, thousands, paginate, longDate } from "../util.js";
import { data, globalStats } from "../store.js";
import { rankingItem, pagination } from "../components/widgets.js";
import { filterSidebar, readFilters, writeFilters, applyFilters } from "../components/filters.js";
import { localeHref } from "../components/layout.js";
import { replaceQuery } from "../router.js";

const PER_PAGE = 20;

export async function render(ctx) {
  const filters = readFilters(ctx.query);
  let page = filters.page || 1;
  const stats = globalStats();
  const lastUpdated = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const nextUpdate = Math.max(
    1,
    Math.round((new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1) - Date.now()) / 86400000)
  );

  const headerPanel = `
<div class="panel panel-flat">
  <div class="panel-heading has-visible-elements">
    <h6 class="panel-title">${esc(t("ranking.lastUpdated", { date: longDate(lastUpdated, ctx.locale) }))}</h6>
    <div class="heading-elements visible-elements" style="display:flex;gap:1rem;flex-wrap:wrap">
      <span class="heading-text text-muted" style="white-space:nowrap">
        ${icon("clock", "w-6 h-6 text-warning position-left")} ${esc(t("ranking.nextUpdate", { count: nextUpdate }))}
      </span>
      <span class="heading-text text-muted" style="white-space:nowrap">
        ${icon("plus", "w-6 h-6 text-warning position-left")}
        <a class="text-muted" href="${localeHref("/ranking/learn-more")}" data-link>${esc(t("ranking.learnMore"))}</a>
      </span>
    </div>
  </div>
  <div class="panel-body text-center">
    <div class="row">
    <div class="col-xs-3"><div class="content-group">
      <h6 class="text-semibold no-margin">${icon("chatRank", "w-6 h-6 position-left text-slate")}<br/>${thousands(stats.ranked)}&nbsp;
        <span class="badge bg-blue-400">+${stats.newRanked}</span></h6>
      <span class="visible-xs text-muted text-size-small">${esc(t("ranking.coastersShort"))}</span>
      <span class="hidden-xs text-muted text-size-small">${esc(t("ranking.rankedCoasters"))}</span>
    </div></div>
    <div class="col-xs-3"><div class="content-group">
      <h6 class="text-semibold no-margin">${icon("starRank", "w-6 h-6 position-left text-slate")}<br/>${compact(stats.rankingRatings)}&nbsp;
        <span class="badge bg-blue-400">+${compact(stats.newRatings)}</span></h6>
      <span class="text-muted text-size-small">${esc(t("ranking.ratings"))}</span>
    </div></div>
    <div class="col-xs-3"><div class="content-group">
      <h6 class="text-semibold no-margin">${icon("usersRank", "w-6 h-6 position-left text-slate")}<br/>${stats.voters}&nbsp;
        <span class="badge bg-blue-400">+${stats.newVoters}</span></h6>
      <span class="text-muted text-size-small">${esc(t("ranking.voters"))}</span>
    </div></div>
    <div class="col-xs-3"><div class="content-group">
      <h6 class="text-semibold no-margin">${icon("exchangeRank", "w-6 h-6 position-left text-slate")}<br/>${compact(stats.pairs)}&nbsp;
        <span class="badge bg-blue-400">+${compact(stats.newPairs)}</span></h6>
      <span class="visible-xs text-muted text-size-small">${esc(t("ranking.pairsShort"))}</span>
      <span class="hidden-xs text-muted text-size-small">${esc(t("ranking.pairs"))}</span>
    </div></div>
    </div>
  </div>
</div>`;

  return {
    nav: "ranking",
    title: esc(t("ranking.title")),
    secondarySidebar: filterSidebar("ranking", filters),
    content: `${headerPanel}<div id="ranking-result"></div>`,
    mount(root) {
      const target = root.querySelector("#ranking-result");
      const form = root.querySelector("#form-filter");

      const draw = () => {
        const ranked = data.coasters
          .filter((c) => c.rank)
          .sort((a, b) => a.rank - b.rank);
        const list = applyFilters(ranked, filters);
        const res = paginate(list, page, PER_PAGE);
        page = res.page;
        target.innerHTML = res.items.length
          ? `<ul class="media-list content-group">${res.items.map(rankingItem).join("")}</ul>${pagination(res.page, res.pages)}`
          : `<div class="panel panel-body text-center text-muted">${esc(t("search.noResults"))}</div>`;
        replaceQuery(writeFilters(filters, page));
      };

      form.addEventListener("change", (e) => {
        const el = e.target;
        const m = /^filters\[(\w+)\]$/.exec(el.name || "");
        if (!m) return;
        filters[m[1]] = el.type === "checkbox" ? el.checked : el.value;
        page = 1;
        draw();
      });
      form.addEventListener("input", (e) => {
        if (e.target.name === "filters[name]") {
          clearTimeout(form._timer);
          form._timer = setTimeout(() => {
            filters.name = e.target.value;
            page = 1;
            draw();
          }, 300);
        }
      });
      root.querySelector("[data-clear-filters]")?.addEventListener("click", () => {
        Object.keys(filters).forEach((k) => delete filters[k]);
        page = 1;
        form.reset();
        form.querySelectorAll(".toggle-switch-form-group").forEach((g) => g.classList.remove("checked"));
        draw();
      });
      target.addEventListener("click", (e) => {
        const a = e.target.closest("[data-page]");
        if (!a) return;
        e.preventDefault();
        page = Number(a.dataset.page);
        draw();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });

      draw();
    },
  };
}
