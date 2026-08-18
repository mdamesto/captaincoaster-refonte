// Paramètres du profil (mêmes champs et sections que le site).

import { icon } from "../icons.js";
import { t, LOCALES, LOCALE_NAMES } from "../i18n.js";
import { esc, avatarUrl } from "../util.js";
import {
  data, isLoggedIn, currentUser, displayName, getState, updateSettings, login, deleteAccount,
} from "../store.js";
import { notify } from "../components/widgets.js";
import { localeHref } from "../components/layout.js";
import { navigate } from "../router.js";

export async function render(ctx) {
  if (!isLoggedIn()) {
    navigate(localeHref("/login"), { replace: true });
    return { nav: "", title: "", content: "" };
  }
  const user = currentUser();
  const s = getState().settings;
  const full = `${user.firstName} ${user.lastName}`.trim();
  const firstInitial = `${user.firstName} ${user.lastName ? user.lastName[0] + "." : ""}`.trim();

  const sideLink = (href, iconName, label, badge) =>
    `<a href="${href}" class="list-group-item" data-link>${icon(iconName, "w-6 h-6")} ${esc(label)}${
      badge !== undefined ? `<span class="badge bg-teal-400 pull-right">${badge}</span>` : ""
    }</a>`;

  const parkOptions = data.parks
    .filter((p) => p.name)
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((p) => `<option value="${p.id}" ${String(s.homePark) === String(p.id) ? "selected" : ""}>${esc(p.name)}</option>`)
    .join("");

  const content = `
<div class="row">
  <div class="col-sm-3">
    <div class="panel">
      <div class="panel-body text-center">
        <img src="${avatarUrl(displayName())}" class="img-circle" style="width:64px;height:64px" alt="${esc(full)}">
        <h6 class="text-semibold no-margin-bottom mt-10">${esc(full)}</h6>
      </div>
      <div class="list-group no-border no-padding-top">
        ${sideLink(localeHref("/profile"), "userSmall", t("nav.myProfile"))}
        ${sideLink(localeHref("/profile/settings"), "cog", t("settings.title"))}
        ${sideLink(localeHref("/profile/ratings"), "starOutline", t("nav.myRatings"), Object.keys(getState().ratings).length)}
        ${sideLink(localeHref("/profile/reviews"), "megaphone", t("nav.myReviews"))}
        ${sideLink(localeHref("/profile/tops"), "clipboard", t("nav.myTops"))}
        ${sideLink(localeHref("/profile/map"), "mapPin", t("nav.myMap"))}
      </div>
    </div>
  </div>
  <div class="col-sm-9">
    <div class="panel panel-white">
      <div class="panel-heading"><h6 class="panel-title text-semibold">${esc(t("settings.title"))}</h6></div>
      <div class="panel-body">
        <form data-settings-form>
          <h6 class="text-uppercase text-muted text-size-small">${esc(t("settings.nameSettings"))}</h6>
          <div class="form-group">
            <label class="control-label">${esc(t("settings.firstName"))}</label>
            <input type="text" name="firstName" class="form-control" value="${esc(user.firstName || "")}">
            <span class="help-block">${esc(t("settings.nameHint"))}</span>
          </div>
          <div class="form-group">
            <label class="control-label">${esc(t("settings.lastName"))}</label>
            <input type="text" name="lastName" class="form-control" value="${esc(user.lastName || "")}">
            <span class="help-block">${esc(t("settings.nameHint"))}</span>
          </div>
          <div class="form-group">
            <label class="control-label">${esc(t("settings.displayFormat"))}</label>
            <select name="displayNameFormat" class="form-control">
              <option value="full" ${s.displayNameFormat === "full" ? "selected" : ""}>${esc(t("settings.fullName", { name: full }))}</option>
              <option value="firstLast" ${s.displayNameFormat === "firstLast" ? "selected" : ""}>${esc(t("settings.firstLast", { name: firstInitial }))}</option>
              <option value="first" ${s.displayNameFormat === "first" ? "selected" : ""}>${esc(t("settings.firstOnly", { name: user.firstName }))}</option>
            </select>
            <span class="help-block">${esc(t("settings.displayHint"))}</span>
          </div>
          <div class="form-group">
            <label class="control-label">${esc(t("settings.picture"))}</label>
            <input type="file" name="picture" class="form-control" accept="image/*">
          </div>

          <h6 class="text-uppercase text-muted text-size-small mt-20">${esc(t("settings.preferences"))}</h6>
          <div class="form-group">
            <label class="control-label">${esc(t("settings.notifications"))}</label>
            <select name="notifications" class="form-control">
              <option value="web_email" ${s.notifications === "web_email" ? "selected" : ""}>${esc(t("settings.notifWebEmail"))}</option>
              <option value="web" ${s.notifications === "web" ? "selected" : ""}>${esc(t("settings.notifWeb"))}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="control-label">${esc(t("settings.language"))}</label>
            <select name="preferredLocale" class="form-control">
              ${LOCALES.map((l) => `<option value="${l}" ${ctx.locale === l ? "selected" : ""}>${LOCALE_NAMES[l]}</option>`).join("")}
            </select>
          </div>
          <div class="form-group">
            <label class="control-label">${esc(t("settings.units"))}</label>
            <select name="imperial" class="form-control">
              <option value="0" ${!s.imperial ? "selected" : ""}>${esc(t("settings.metric"))}</option>
              <option value="1" ${s.imperial ? "selected" : ""}>${esc(t("settings.imperial"))}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="control-label">${esc(t("settings.homePark"))}</label>
            <select name="homePark" class="form-control">
              <option value="">${esc(t("settings.chooseOne"))}</option>
              ${parkOptions}
            </select>
          </div>
          <div class="form-group toggle-switch-form-group ${s.otherLanguages ? "checked" : ""}">
            <div class="checkbox"><label class="display-block">${esc(t("settings.otherLanguages"))}
              <input type="checkbox" name="otherLanguages" ${s.otherLanguages ? "checked" : ""}></label></div>
          </div>
          <div class="form-group toggle-switch-form-group ${s.autoDate ? "checked" : ""}">
            <div class="checkbox"><label class="display-block">${esc(t("settings.autoDate"))}
              <input type="checkbox" name="autoDate" ${s.autoDate ? "checked" : ""}></label></div>
          </div>
          <div class="text-right"><button type="submit" class="btn btn-primary">${esc(t("settings.save"))}</button></div>
        </form>
      </div>
    </div>

    <div class="panel panel-white">
      <div class="panel-heading"><h6 class="panel-title text-semibold text-danger">${esc(t("settings.deleteAccount"))}</h6></div>
      <div class="panel-body">
        <p>${esc(t("settings.deleteBody"))}</p>
        <ul class="text-muted">
          <li>${esc(t("settings.deleteBullet1"))}</li>
          <li>${esc(t("settings.deleteBullet2"))}</li>
        </ul>
        <button type="button" class="btn btn-danger" data-delete-account>${esc(t("settings.deleteButton"))}</button>
      </div>
    </div>
  </div>
</div>`;

  return {
    nav: "",
    title: esc(t("settings.title")),
    content,
    mount(root) {
      root.querySelector("[data-settings-form]").addEventListener("submit", (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        login({
          email: user.email,
          firstName: fd.get("firstName") || user.firstName,
          lastName: fd.get("lastName") || user.lastName,
        });
        updateSettings({
          displayNameFormat: fd.get("displayNameFormat"),
          notifications: fd.get("notifications"),
          imperial: fd.get("imperial") === "1",
          homePark: fd.get("homePark"),
          otherLanguages: fd.get("otherLanguages") === "on",
          autoDate: fd.get("autoDate") === "on",
        });
        notify(t("settings.saved"), "success");
        const target = fd.get("preferredLocale");
        navigate(`/${target}/profile/settings`);
      });
      root.querySelector("[data-delete-account]").addEventListener("click", () => {
        if (!confirm(t("settings.deleteConfirm"))) return;
        deleteAccount();
        navigate(localeHref("/"));
      });
    },
  };
}
