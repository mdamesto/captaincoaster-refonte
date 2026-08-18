// Tableau des notes d'un rider (triable), et « Mes notes » pour le compte local.

import { t } from "../i18n.js";
import { esc, shortDate } from "../util.js";
import {
  data, loadUserRatings, isLoggedIn, displayName, getState, coasterUrl, currentUser,
} from "../store.js";
import { ratingWidget } from "../components/widgets.js";
import { localeHref } from "../components/layout.js";
import { navigate } from "../router.js";

const COLUMNS = [
  { key: "coaster", label: "table.coaster" },
  { key: "manufacturer", label: "table.manufacturer", hiddenXs: true },
  { key: "opened", label: "table.opened", hiddenXs: true },
  { key: "rating", label: "table.rating" },
  { key: "riddenAt", label: "table.riddenAt", hiddenXs: true },
];

export async function render(ctx) {
  const locale = ctx.locale;
  const isMe = ctx.route === "profileRatings";
  if (isMe && !isLoggedIn()) {
    navigate(localeHref("/login"), { replace: true });
    return { nav: "", title: "", content: "" };
  }
  await loadUserRatings();

  let user, rows;
  if (isMe) {
    user = { name: displayName(), id: currentUser().id };
    rows = Object.entries(getState().ratings).map(([id, r]) => ({
      coasterId: Number(id),
      value: r.value,
      riddenAt: r.riddenAt,
    }));
  } else {
    user = data.byUserId.get(Number(ctx.params.userId));
    if (!user) return (await import("./not-found.js")).render(ctx);
    rows = data.userRatings[ctx.params.userId] || [];
  }

  let sort = ctx.query.get("sort") || "r.riddenAt";
  let direction = ctx.query.get("direction") || "desc";

  const content = `
<div class="panel panel-white">
  <div class="table-responsive" style="display:block">
    <table class="table">
      <thead><tr>
        ${COLUMNS.map(
          (c) => `<th class="${c.hiddenXs ? "hidden-xs" : ""}"><a class="sortable" href="#" data-sort="${c.key}">${esc(t(c.label))}</a></th>`
        ).join("")}
      </tr></thead>
      <tbody data-rows></tbody>
    </table>
  </div>
</div>`;

  return {
    nav: isMe ? "" : "users",
    title: isMe ? esc(t("profile.myRatings")) : esc(t("users.ratingsTitle", { name: user.name })),
    content,
    mount(root) {
      const body = root.querySelector("[data-rows]");
      let key = "riddenAt";
      let dir = "desc";

      const draw = () => {
        const sorted = [...rows].sort((a, b) => {
          const ca = data.byCoasterId.get(a.coasterId);
          const cb = data.byCoasterId.get(b.coasterId);
          let va, vb;
          switch (key) {
            case "coaster": va = ca?.name || ""; vb = cb?.name || ""; break;
            case "manufacturer": va = ca?.manufacturer || ""; vb = cb?.manufacturer || ""; break;
            case "opened": va = ca?.year || 0; vb = cb?.year || 0; break;
            case "rating": va = a.value; vb = b.value; break;
            default: va = a.riddenAt || ""; vb = b.riddenAt || "";
          }
          const cmp = typeof va === "string" ? va.localeCompare(vb) : va - vb;
          return dir === "asc" ? cmp : -cmp;
        });

        body.innerHTML = sorted.length
          ? sorted
              .map((r) => {
                const c = data.byCoasterId.get(r.coasterId);
                if (!c) return "";
                const park = c.parkId ? data.byParkId.get(c.parkId) : null;
                return `
<tr id="tr-coaster-${c.id}">
  <td>
    <a href="${coasterUrl(locale, c)}" class="text-semibold" data-link>${esc(c.name)}</a>
    <div class="text-muted text-size-small">
      <span class="status-mark bg-${/operat/i.test(c.status) ? "success" : "danger"} position-left"></span>
      ${esc(park?.name || "")}
    </div>
  </td>
  <td class="hidden-xs">${esc(c.manufacturer || "-")}</td>
  <td class="hidden-xs">${c.year || "-"}</td>
  <td>${ratingWidget(c.id, r.value, { readonly: true, id: `row-${c.id}` })}</td>
  <td class="hidden-xs">${r.riddenAt ? esc(shortDate(r.riddenAt, locale)) : "-"}</td>
</tr>`;
              })
              .join("")
          : `<tr><td colspan="5" class="text-center text-muted">${esc(t("users.noRatings"))}</td></tr>`;

        root.querySelectorAll("[data-sort]").forEach((a) => {
          a.className = a.dataset.sort === key ? dir : "sortable";
        });
      };

      root.querySelectorAll("[data-sort]").forEach((a) =>
        a.addEventListener("click", (e) => {
          e.preventDefault();
          const next = a.dataset.sort;
          if (next === key) dir = dir === "asc" ? "desc" : "asc";
          else { key = next; dir = "asc"; }
          draw();
        })
      );
      draw();
    },
  };
}
