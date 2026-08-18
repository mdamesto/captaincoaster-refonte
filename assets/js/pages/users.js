// Liste des riders.

import { t } from "../i18n.js";
import { esc, thousands, paginate, avatarUrl, shortDate } from "../util.js";
import { data, isDismissed, dismiss } from "../store.js";
import { pagination } from "../components/widgets.js";
import { replaceQuery } from "../router.js";

const PER_PAGE = 21;

export async function render(ctx) {
  const locale = ctx.locale;
  let page = Number(ctx.query.get("page")) || 1;
  const users = data.users.filter((u) => u.name);

  const alert = isDismissed("users-intro")
    ? ""
    : `
<div class="alert alert-info alert-styled-left alert-arrow-left alert-component" data-dismiss-id="users-intro">
  <button type="button" class="close"><span>&times;</span><span class="sr-only">Close</span></button>
  <h6 class="alert-heading text-semibold">${esc(t("users.alertHeading"))}</h6>
  <p>${esc(t("users.alertBody"))}</p>
</div>`;

  return {
    nav: "users",
    title: esc(t("users.title")),
    content: `${alert}<div id="users-result"></div>`,
    mount(root) {
      const host = root.querySelector("#users-result");
      const draw = () => {
        const res = paginate(users, page, PER_PAGE);
        page = res.page;
        host.innerHTML = `
<div class="row">
  ${res.items
    .map(
      (u) => `
  <div class="col-lg-4 col-sm-6">
    <div class="panel-body panel">
      <div class="media">
        <div class="media-left"><img src="${avatarUrl(u.name)}" class="img-circle img-lg" alt="${esc(u.name)}"></div>
        <div class="media-body">
          <h6 class="media-heading"><a href="/${locale}/users/${esc(u.slug)}" data-link>${esc(u.name)}</a></h6>
          <p class="text-muted">${u.memberSince ? esc(t("users.memberSince", { date: u.memberSince })) : "&nbsp;"}</p>
          <h5 class="text-semibold no-margin">
            <a href="/${locale}/users/${u.id}/ratings" data-link>${esc(t("users.ratings", { count: thousands(u.ratingsCount || 0) }))}</a>
          </h5>
        </div>
      </div>
    </div>
  </div>`
    )
    .join("")}
</div>${pagination(res.page, res.pages)}`;
        replaceQuery(page > 1 ? `page=${page}` : "");
      };
      host.addEventListener("click", (e) => {
        const a = e.target.closest("[data-page]");
        if (!a) return;
        e.preventDefault();
        page = Number(a.dataset.page);
        draw();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      root.querySelector("[data-dismiss-id] .close")?.addEventListener("click", () => dismiss("users-intro"));
      draw();
    },
  };
}
