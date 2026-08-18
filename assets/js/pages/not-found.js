// 404.

import { t } from "../i18n.js";
import { esc } from "../util.js";

export async function render() {
  return {
    nav: "",
    title: esc(t("error.pageTitle")),
    content: `
<div class="text-center content-group">
  <h1 class="error-title">${esc(t("error.title"))}</h1>
  <h3>${esc(t("error.body"))}</h3>
</div>`,
  };
}
