// Page de résultats de la recherche globale (coasters, parcs, riders).

import { t } from "../i18n.js";
import { esc, thousands } from "../util.js";
import { searchAll, resultHref, resultEmoji, resultSubtitle } from "../components/search.js";

export async function render(ctx) {
  const query = ctx.query.get("query") || "";
  const results = searchAll(query, 50);

  return {
    nav: "",
    title: esc(t("search.pageTitle", { query })),
    documentTitle: `${t("search.pageTitle", { query })} • Captain Coaster`,
    content: `
<div class="panel panel-white">
  <div class="panel-heading">
    <h6 class="panel-title text-semibold">${esc(t("search.resultsFor", { count: thousands(results.length), query }))}</h6>
  </div>
  <div class="search-results-container">
    ${
      results.length
        ? results
            .map(
              (r) => `
      <a class="search-result-item search-result-item-page" href="${resultHref(r)}" data-link>
        <div class="search-result-emoji">${resultEmoji(r.type)}</div>
        <div class="search-result-content">
          <div class="search-result-name">${esc(r.item.name)}</div>
          <div class="search-result-subtitle">${esc(resultSubtitle(r))}</div>
        </div>
      </a>`
            )
            .join("")
        : `<div class="search-no-results"><div class="search-no-results-icon">🔍</div><div class="search-no-results-text">${esc(t("search.noResults"))}</div></div>`
    }
  </div>
</div>`,
    mount(root) {
      const input = root.querySelector("input[name=query]");
      if (input) {
        input.value = query;
        input.closest("[data-search]")?.classList.add("has-value");
      }
    },
  };
}
