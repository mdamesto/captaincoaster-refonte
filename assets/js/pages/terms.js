// Politique de confidentialité et conditions d'utilisation.

import { t, getLocale, TERMS } from "../i18n.js";
import { esc } from "../util.js";

export async function render() {
  const sections = TERMS[getLocale()] || TERMS.en;
  return {
    nav: "",
    title: esc(t("terms.title")),
    content: `
<div class="panel"><div class="panel-body">
  ${sections
    .map(
      ([h, p]) => `<div class="content-group-lg text-justify">
        <h3 class="text-semibold mb-5">${esc(h)}</h3><p>${esc(p)}</p>
      </div>`
    )
    .join("")}
</div></div>`,
  };
}
