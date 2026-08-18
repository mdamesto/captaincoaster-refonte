// Tops d'un rider — et « Mes tops » avec l'état vide + bouton de création.

import { icon } from "../icons.js";
import { t } from "../i18n.js";
import { esc } from "../util.js";
import { data, loadTops, isLoggedIn, displayName, myTops } from "../store.js";
import { topCard } from "./tops.js";
import { localeHref } from "../components/layout.js";
import { navigate } from "../router.js";

export async function render(ctx) {
  const locale = ctx.locale;
  const isMe = ctx.route === "profileTops";
  if (isMe && !isLoggedIn()) {
    navigate(localeHref("/login"), { replace: true });
    return { nav: "", title: "", content: "" };
  }
  await loadTops();

  let name, tops;
  if (isMe) {
    name = displayName();
    tops = myTops().map((tp) => ({ ...tp, userSlug: "me", userName: name }));
  } else {
    const user = data.byUserId.get(Number(ctx.params.userId));
    if (!user) return (await import("./not-found.js")).render(ctx);
    name = user.name;
    tops = data.topsByUser.get(user.slug) || [];
  }

  const empty = `
<div class="panel panel-body">
  <div class="media">
    <div class="media-left">${icon("clipboard", "w-12 h-12 text-muted")}</div>
    <div class="media-body">
      <h6 class="text-semibold no-margin">${esc(t("tops.emptyTitle"))}</h6>
      <p class="text-muted no-margin">${esc(t("tops.emptyBody"))}</p>
    </div>
    ${
      isMe
        ? `<div class="media-right media-middle">
             <a href="${localeHref("/tops/new")}" class="btn bg-teal-400" data-link>${icon("plusCircle", "w-6 h-6 position-left")} ${esc(t("tops.createFirst"))}</a>
           </div>`
        : ""
    }
  </div>
</div>`;

  return {
    nav: isMe ? "" : "tops",
    title: esc(t("tops.myTitle", { name })),
    content: tops.length
      ? `${isMe ? `<div class="text-right content-group"><a href="${localeHref("/tops/new")}" class="btn btn-primary btn-rounded" data-link>${icon("plusCircle", "w-6 h-6 position-left")} ${esc(t("tops.create"))}</a></div>` : ""}
         <div class="row">${tops.map((tp) => topCard(tp, locale, { editable: isMe })).join("")}</div>`
      : empty,
  };
}
