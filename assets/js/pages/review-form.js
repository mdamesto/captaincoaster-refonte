// Formulaire d'avis : étoiles, date, points forts / faibles, texte libre.

import { t } from "../i18n.js";
import { esc } from "../util.js";
import { data, isLoggedIn, myReview, myRating, setReview } from "../store.js";
import { ratingWidget, notify } from "../components/widgets.js";
import { localeHref } from "../components/layout.js";
import { navigate } from "../router.js";

// Listes exactes proposées par le formulaire du site.
export const PROS = [
  "Airtimes", "Capacity", "Comfort", "Duration", "Ejectors", "First Drop", "Fun", "Hangtime",
  "Harness", "Intensity", "Inversions", "Lap Bar", "Launch", "Layout", "Location", "Masterpiece",
  "Nice surprise!", "Pace", "Smoothness", "Theming",
];
export const CONS = [
  "Airtimes", "Capacity", "Dead spots", "Disappointing!", "Discomfort", "Harness", "Headbanging",
  "Intensity", "Inversions", "Lap Bar", "Launch", "Layout", "Pointless", "Rattle", "Reliability",
  "Tear it down!", "Theming", "Too short",
];

export async function render(ctx) {
  const coaster = data.byCoasterId.get(Number(ctx.params.coasterId));
  if (!coaster) return (await import("./not-found.js")).render(ctx);
  if (!isLoggedIn()) {
    navigate(localeHref("/login"), { replace: true });
    return { nav: "", title: "", content: "" };
  }

  const existing = myReview(coaster.id);
  const rating = existing?.value || myRating(coaster.id)?.value || 0;

  const options = (list, selected) =>
    list.map((o) => `<option value="${esc(o)}" ${selected?.includes(o) ? "selected" : ""}>${esc(o)}</option>`).join("");

  const content = `
<div class="panel panel-body">
  <h3 class="content-group">${esc(t("reviews.formHeading"))}</h3>
  <form data-review-form>
    <div class="form-group">
      <label class="control-label required">${esc(t("reviews.stars"))}</label>
      <div>${ratingWidget(coaster.id, rating, { id: "form" })}</div>
      <input type="hidden" name="value" id="review-value" value="${rating || ""}">
    </div>
    <div class="form-group">
      <label class="control-label" for="review-date">${esc(t("reviews.rideDate"))}</label>
      <input type="date" id="review-date" name="riddenAt" class="form-control" max="${new Date().toISOString().slice(0, 10)}" value="${esc(existing?.riddenAt || myRating(coaster.id)?.riddenAt || "")}">
    </div>
    <div class="form-group">
      <label class="control-label" for="review-pros">${esc(t("reviews.pros"))}</label>
      <select id="review-pros" name="pros" class="form-control" multiple size="8">${options(PROS, existing?.pros)}</select>
    </div>
    <div class="form-group">
      <label class="control-label" for="review-cons">${esc(t("reviews.cons"))}</label>
      <select id="review-cons" name="cons" class="form-control" multiple size="8">${options(CONS, existing?.cons)}</select>
    </div>
    <div class="form-group">
      <label class="control-label" for="review-text">${esc(t("reviews.text"))}</label>
      <textarea id="review-text" name="text" rows="6" class="form-control">${esc(existing?.text || "")}</textarea>
    </div>
    <div class="text-right">
      <button type="submit" class="btn btn-primary">${esc(t("reviews.submit"))}</button>
    </div>
  </form>
</div>`;

  return {
    nav: "",
    title: esc(t("reviews.formTitle", { name: coaster.name })),
    content,
    mount(root) {
      const widget = root.querySelector(".rating-stars");
      widget.dataset.formField = "review-value";
      const form = root.querySelector("[data-review-form]");
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const value = Number(root.querySelector("#review-value").value);
        if (!value) return notify(t("reviews.needRating"), "danger");
        const pick = (id) => Array.from(root.querySelector(id).selectedOptions).map((o) => o.value);
        setReview(coaster.id, {
          value,
          riddenAt: root.querySelector("#review-date").value || null,
          pros: pick("#review-pros"),
          cons: pick("#review-cons"),
          text: root.querySelector("#review-text").value.trim(),
        });
        notify(t("reviews.saved"), "success");
        navigate(`/${ctx.locale}/coasters/${coaster.id}/${coaster.slug}`);
      });
    },
  };
}
