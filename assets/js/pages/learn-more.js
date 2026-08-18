// « Comment fonctionne le classement ? »

import { getLocale, LEARN_MORE } from "../i18n.js";
import { esc } from "../util.js";

export async function render() {
  const page = LEARN_MORE[getLocale()] || LEARN_MORE.en;
  return {
    nav: "ranking",
    title: esc(page.title),
    content: `
<div class="panel"><div class="panel-body">
  ${page.sections
    .map(
      (s) => `<div class="content-group-lg text-justify">
        <h3 class="text-semibold mb-5">${esc(s.h)}</h3>
        ${s.p.map((p) => `<p>${p}</p>`).join("")}
      </div>`
    )
    .join("")}
</div></div>`,
  };
}
