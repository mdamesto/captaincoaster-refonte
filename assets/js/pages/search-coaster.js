// Recherche de coasters : mêmes filtres que le classement + score, distance, kiddies.

import { t } from "../i18n.js";
import { esc, thousands, paginate } from "../util.js";
import { data } from "../store.js";
import { searchItem, pagination, notify } from "../components/widgets.js";
import { filterSidebar, readFilters, writeFilters, applyFilters } from "../components/filters.js";
import { replaceQuery } from "../router.js";

const PER_PAGE = 20;

export async function render(ctx) {
  const filters = readFilters(ctx.query);
  let page = filters.page || 1;
  let position = null;

  return {
    nav: "search",
    title: esc(t("searchCoaster.title")),
    secondarySidebar: filterSidebar("search", filters),
    content: `<div id="search-result"></div>`,
    mount(root) {
      const target = root.querySelector("#search-result");
      const form = root.querySelector("#form-filter");

      const draw = () => {
        const list = applyFilters(data.coasters, filters, { userPosition: position });
        const res = paginate(list, page, PER_PAGE);
        page = res.page;
        target.innerHTML = `
<div class="panel panel-white">
  <div class="panel-heading">
    <h6 class="panel-title text-semibold">${esc(t("searchCoaster.found", { count: thousands(res.total) }))}</h6>
  </div>
  ${res.items.length ? `<ul class="media-list">${res.items.map(searchItem).join("")}</ul>` : `<div class="panel-body text-center text-muted">${esc(t("search.noResults"))}</div>`}
</div>
${pagination(res.page, res.pages)}`;
        replaceQuery(writeFilters(filters, page));
      };

      const askPosition = () => {
        if (!navigator.geolocation) {
          notify("Geolocation unavailable", "danger");
          filters.sortByDistance = false;
          draw();
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            position = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            draw();
          },
          () => {
            filters.sortByDistance = false;
            form.querySelector("[name='filters[sortByDistance]']").checked = false;
            form.querySelector("[name='filters[sortByDistance]']").closest(".toggle-switch-form-group").classList.remove("checked");
            notify("Geolocation refused", "danger");
            draw();
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
        );
      };

      form.addEventListener("change", (e) => {
        const m = /^filters\[(\w+)\]$/.exec(e.target.name || "");
        if (!m) return;
        const key = m[1];
        filters[key] = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        page = 1;
        if (key === "sortByDistance" && filters.sortByDistance) return askPosition();
        if (key === "sortByDistance") position = null;
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
        position = null;
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

      if (filters.sortByDistance) askPosition();
      else draw();
    },
  };
}
