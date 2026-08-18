// Index des tops : grille de cartes paginée.

import { icon } from "../icons.js";
import { t } from "../i18n.js";
import { esc, paginate, timeAgo, avatarUrl } from "../util.js";
import { data, loadTops, coasterUrl, myTops, isLoggedIn, displayName } from "../store.js";
import { pagination } from "../components/widgets.js";
import { localeHref } from "../components/layout.js";
import { replaceQuery } from "../router.js";

const PER_PAGE = 12;

export function topCard(top, locale, { editable = false } = {}) {
  const items = (top.items || []).slice(0, 3);
  return `
<div class="col-lg-4 col-sm-6">
  <div class="thumbnail">
    <div class="caption">
      <div class="content-group-sm media">
        <div class="media-left">
          <img src="${avatarUrl(top.userName || "Rider")}" class="img-circle img-lg" alt="${esc(top.userName || "")}">
        </div>
        <div class="media-body">
          <h6 class="text-semibold no-margin">
            ${top.main ? `${icon("checkSmall", "w-6 h-6 text-size-mini position-left")} ` : ""}
            <a href="${localeHref(`/tops/${top.id}`)}" class="text-default" data-link>${esc(top.title)}</a>
          </h6>
          <small class="text-muted">${esc(t("tops.by"))}
            <a href="/${locale}/users/${esc(top.userSlug || "")}" data-link>${esc(top.userName || "")}</a>
          </small>
        </div>
      </div>
      <ul class="list-feed">
        ${items
          .map((id, i) => {
            const c = data.byCoasterId.get(id);
            return `<li>${i + 1} - ${c ? `<a href="${coasterUrl(locale, c)}" class="text-default" data-link>${esc(c.name)}</a>` : "—"}</li>`;
          })
          .join("")}
      </ul>
      <div class="media">
        <a href="${localeHref(`/tops/${top.id}`)}" data-link>${icon("arrowRightCircle", "w-6 h-6")} ${esc(t("tops.seeMore"))}</a>
        ${editable ? `<a class="ml-10" href="${localeHref(`/tops/${top.id}/edit`)}" data-link>${icon("cog", "w-6 h-6")} ${esc(t("tops.edit"))}</a>` : ""}
      </div>
      <ul class="list-inline media">
        <li>${icon("layers", "w-6 h-6 position-left")} ${top.count ?? (top.items || []).length}</li>
        <li>${icon("clockSmall", "w-6 h-6 position-left")} ${esc(t("tops.lastUpdated", { ago: timeAgo(top.date, t) }))}</li>
      </ul>
    </div>
  </div>
</div>`;
}

export async function render(ctx) {
  await loadTops();
  const locale = ctx.locale;
  let page = Number(ctx.query.get("page")) || 1;

  const mine = isLoggedIn()
    ? myTops().map((tp) => ({ ...tp, userSlug: "me", userName: displayName() }))
    : [];
  const all = [...mine, ...data.tops];

  return {
    nav: "tops",
    title: esc(t("tops.title")),
    content: `
      ${isLoggedIn() ? `<div class="text-right content-group"><a href="${localeHref("/tops/new")}" class="btn btn-primary btn-rounded" data-link>${icon("plusCircle", "w-6 h-6 position-left")} ${esc(t("tops.create"))}</a></div>` : ""}
      <div id="tops-result"></div>`,
    mount(root) {
      const host = root.querySelector("#tops-result");
      const draw = () => {
        const res = paginate(all, page, PER_PAGE);
        page = res.page;
        host.innerHTML = `<div class="row">${res.items.map((tp) => topCard(tp, locale, { editable: tp.userSlug === "me" })).join("")}</div>${pagination(res.page, res.pages)}`;
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
      draw();
    },
  };
}
