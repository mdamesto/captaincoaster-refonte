// Envoi d'une photo de coaster.

import { t } from "../i18n.js";
import { esc } from "../util.js";
import { data, isLoggedIn, displayName } from "../store.js";
import { notify } from "../components/widgets.js";
import { localeHref } from "../components/layout.js";
import { navigate } from "../router.js";

export async function render(ctx) {
  const coaster = data.byCoasterSlug.get(ctx.params.slug);
  if (!coaster) return (await import("./not-found.js")).render(ctx);
  if (!isLoggedIn()) {
    navigate(localeHref("/login"), { replace: true });
    return { nav: "", title: "", content: "" };
  }

  return {
    nav: "",
    title: esc(t("upload.title", { name: coaster.name })),
    content: `
<div class="panel panel-body">
  <form data-upload-form>
    <div class="form-group">
      <label class="control-label text-semibold">${esc(t("upload.select"))}</label>
      <input type="file" name="picture" accept="image/jpeg" class="form-control">
      <span class="help-block">${esc(t("upload.hint"))}</span>
    </div>
    <div class="form-group">
      <label class="control-label text-semibold">${esc(t("upload.credit"))}</label>
      <input type="text" name="credit" class="form-control" value="${esc(displayName())}">
    </div>
    <div class="form-group">
      <label><input type="checkbox" name="watermark" checked> ${esc(t("upload.watermark"))}</label>
      <span class="help-block">${esc(t("upload.watermarkHint"))}</span>
    </div>
    <div class="form-group">
      <label><input type="checkbox" name="copyright"> ${esc(t("upload.copyright"))}</label>
    </div>
    <button type="submit" class="btn btn-primary">${esc(t("upload.submit"))}</button>
  </form>
</div>`,
    mount(root) {
      root.querySelector("[data-upload-form]").addEventListener("submit", (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        if (fd.get("copyright") !== "on") return notify(t("upload.needCopyright"), "danger");
        notify(t("upload.done"), "success");
        navigate(`/${ctx.locale}/coasters/${coaster.id}/${coaster.slug}`);
      });
    },
  };
}
