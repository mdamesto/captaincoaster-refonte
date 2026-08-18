// Détail d'un top (liste ordonnée de coasters).

import { icon } from "../icons.js";
import { t } from "../i18n.js";
import { esc, timeAgo, photoUrl } from "../util.js";
import { data, loadTops, coasterUrl, parkUrl, getMyTop, isLoggedIn, displayName, deleteTop } from "../store.js";
import { localeHref } from "../components/layout.js";
import { navigate } from "../router.js";
import { notify } from "../components/widgets.js";

export async function render(ctx) {
  await loadTops();
  const locale = ctx.locale;
  const local = getMyTop(ctx.params.id);
  const top = local || data.tops.find((tp) => String(tp.id) === String(ctx.params.id));
  if (!top) return (await import("./not-found.js")).render(ctx);

  const owner = local ? displayName() : top.userName || "";
  const ownerSlug = local ? "me" : top.userSlug || "";
  const items = (top.items || []).map((id) => data.byCoasterId.get(id)).filter(Boolean);

  const content = `
<div class="panel panel-white panel-flat">
  <div class="panel-heading">
    <div class="row">
      <div class="col-sm-8">
        <ul class="list-inline no-margin">
          <li>${icon("layers", "w-6 h-6 position-left")} ${items.length}</li>
          <li>${icon("userSmall", "w-6 h-6 position-left")}
            ${local ? esc(owner) : `<a href="/${locale}/users/${esc(ownerSlug)}" data-link>${esc(owner)}</a>`}
          </li>
          <li>${icon("clockSmall", "w-6 h-6 position-left")} ${esc(t("tops.lastUpdated", { ago: timeAgo(top.date, t) }))}</li>
        </ul>
      </div>
      ${
        local
          ? `<div class="col-sm-4 text-right">
               <a href="${localeHref(`/tops/${top.id}/edit`)}" class="btn btn-primary btn-xs btn-rounded" data-link>${esc(t("tops.edit"))}</a>
               <button type="button" class="btn btn-default btn-xs btn-rounded ml-5" data-delete-top>${esc(t("tops.delete"))}</button>
             </div>`
          : ""
      }
    </div>
  </div>
  <ul class="media-list">
    ${
      items.length
        ? items
            .map((c, i) => {
              const park = c.parkId ? data.byParkId.get(c.parkId) : null;
              return `
      <li class="media panel-body stack-media-on-mobile">
        <div class="media-left">
          <a href="${coasterUrl(locale, c)}" data-link><img src="${photoUrl(c.id)}" class="img-rounded" style="width:96px" alt="${esc(c.name)}"></a>
        </div>
        <div class="media-body">
          <h2 class="media-heading text-semibold">
            <a style="color:#333" href="${coasterUrl(locale, c)}" data-link>${i + 1}&nbsp;-&nbsp;${esc(c.name)}</a>
          </h2>
          <ul class="list-inline list-inline-separate text-muted mb-10">
            ${c.manufacturer ? `<li>${c.manufacturerId ? `<a class="text-muted" href="${localeHref(`/ranking/?filters%5Bmanufacturer%5D=${c.manufacturerId}`)}" data-link>${esc(c.manufacturer)}</a>` : esc(c.manufacturer)}</li>` : ""}
            ${park ? `<li><a class="text-muted" href="${parkUrl(locale, park)}" data-link>${esc(park.name)}${c.country ? `, ${esc(c.country)}` : ""}</a></li>` : ""}
          </ul>
        </div>
      </li>`;
            })
            .join("")
        : `<li class="panel-body text-center text-muted">${esc(t("tops.empty"))}</li>`
    }
  </ul>
</div>`;

  return {
    nav: "tops",
    title: `${esc(t("tops.userTitle", { name: owner }))}`,
    content,
    mount(root) {
      root.querySelector("[data-delete-top]")?.addEventListener("click", () => {
        if (!confirm(t("tops.deleteConfirm"))) return;
        deleteTop(top.id);
        notify(t("tops.delete"), "success");
        navigate(localeHref("/tops/"));
      });
    },
  };
}
