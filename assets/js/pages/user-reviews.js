// Avis d'un rider (et « Mes avis » pour le compte local).

import { icon } from "../icons.js";
import { t } from "../i18n.js";
import { esc, paginate } from "../util.js";
import { data, loadReviews, isLoggedIn, displayName, myReviewsAsList, currentUser } from "../store.js";
import { reviewMedia, pagination } from "../components/widgets.js";
import { localeHref } from "../components/layout.js";
import { navigate } from "../router.js";

const PER_PAGE = 15;

export async function render(ctx) {
  const isMe = ctx.route === "profileReviews";
  if (isMe && !isLoggedIn()) {
    navigate(localeHref("/login"), { replace: true });
    return { nav: "", title: "", content: "" };
  }
  await loadReviews();

  let user, list;
  if (isMe) {
    user = { name: displayName(), id: currentUser().id };
    list = myReviewsAsList().sort((a, b) => new Date(b.date) - new Date(a.date));
  } else {
    user = data.byUserId.get(Number(ctx.params.userId));
    if (!user) return (await import("./not-found.js")).render(ctx);
    list = (data.reviewsByUser.get(user.slug) || []).sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  let page = 1;

  return {
    nav: isMe ? "" : "users",
    title: isMe ? esc(t("profile.myReviews")) : esc(t("users.reviewsTitle", { name: user.name })),
    content: `
<div class="panel panel-flat">
  <div class="panel-heading">
    <h6 class="panel-title text-semibold">${icon("chatBubbleLeft", "w-6 h-6 position-left")} ${esc(t("reviews.heading"))}</h6>
  </div>
  <div class="panel-body"><div data-list></div></div>
</div>`,
    mount(root) {
      const host = root.querySelector("[data-list]");
      const draw = () => {
        const res = paginate(list, page, PER_PAGE);
        page = res.page;
        host.innerHTML = res.items.length
          ? `<ul class="media-list media-list-bordered">${res.items
              .map((r) => `<li>${reviewMedia(r, { showCoaster: true })}</li>`)
              .join("")}</ul>${pagination(res.page, res.pages)}`
          : `<p class="text-muted text-center no-margin">${esc(t("users.noReviews"))}</p>`;
      };
      host.addEventListener("click", (e) => {
        const a = e.target.closest("[data-page]");
        if (!a) return;
        e.preventDefault();
        page = Number(a.dataset.page);
        draw();
      });
      draw();
    },
  };
}
