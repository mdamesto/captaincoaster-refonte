// Flux global des avis.

import { icon } from "../icons.js";
import { t } from "../i18n.js";
import { esc, paginate } from "../util.js";
import { data, loadReviews, myReviewsAsList } from "../store.js";
import { reviewMedia, pagination } from "../components/widgets.js";
import { replaceQuery } from "../router.js";

const PER_PAGE = 15;

export async function render(ctx) {
  await loadReviews();
  let page = Number(ctx.query.get("page")) || 1;
  const all = [...myReviewsAsList(), ...data.reviews].sort((a, b) => new Date(b.date) - new Date(a.date));

  return {
    nav: "reviews",
    title: esc(t("reviews.title")),
    content: `
<div class="row">
  <div class="panel panel-flat">
    <div class="panel-heading">
      <h6 class="panel-title text-semibold">${icon("chatBubbleLeft", "w-6 h-6 position-left")} ${esc(t("reviews.heading"))}</h6>
    </div>
    <div class="panel-body"><div id="reviews-result"></div></div>
  </div>
</div>`,
    mount(root) {
      const host = root.querySelector("#reviews-result");
      const draw = () => {
        const res = paginate(all, page, PER_PAGE);
        page = res.page;
        host.innerHTML = `<ul class="media-list media-list-bordered">${res.items
          .map((r) => `<li>${reviewMedia(r, { showCoaster: true })}</li>`)
          .join("")}</ul>${pagination(res.page, res.pages)}`;
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
