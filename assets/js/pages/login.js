// Connexion (lien magique) et inscription — le clone connecte immédiatement en local.

import { icon } from "../icons.js";
import { t } from "../i18n.js";
import { esc } from "../util.js";
import { login } from "../store.js";
import { notify } from "../components/widgets.js";
import { localeHref } from "../components/layout.js";
import { navigate } from "../router.js";

export async function render(ctx) {
  const isRegister = ctx.route === "register";

  const loginForm = `
<div class="login-form-container">
  <div class="panel panel-body login-form">
    <div class="text-center mb-3">
      <div class="icon-object border-warning-400 text-warning-400">${icon("key", "w-6 h-6")}</div>
      <h5 class="content-group-lg">${esc(t("login.title"))}
        <small class="display-block">${esc(t("login.subtitle"))}</small>
      </h5>
    </div>
    <form data-login-form>
      <div class="form-group has-feedback has-feedback-left">
        <input type="email" name="email" class="form-control" placeholder="${esc(t("login.email"))}" required>
        <div class="form-control-feedback">${icon("envelopeMuted", "w-6 h-6 text-muted")}</div>
      </div>
      <div class="form-group">
        <button type="submit" class="btn bg-blue btn-block">${esc(t("login.submit"))}</button>
      </div>
      <div class="form-group text-muted">${esc(t("login.newHere"))}
        <a href="${localeHref("/register")}" data-link>${esc(t("login.createAccount"))}</a>
      </div>
    </form>
    <div class="content-divider text-muted form-group"><span>${esc(t("login.or"))}</span></div>
    <ul class="list-inline form-group list-inline-condensed text-center" style="justify-content:center">
      <li>
        <a href="#" class="btn border-danger-800 text-danger-800 btn-flat btn-icon btn-rounded" data-google>
          ${icon("google", "w-6 h-6")} ${esc(t("login.google"))}
        </a>
      </li>
    </ul>
    <span class="help-block text-center">
      ${esc(t("login.terms"))} <a href="${localeHref("/terms-conditions")}" data-link>${esc(t("login.termsLink"))}</a>
    </span>
    <p class="help-block text-center" style="margin-top:15px">${esc(t("login.demoNote"))}</p>
  </div>
</div>`;

  const registerForm = `
<div class="login-form-container">
  <div class="panel panel-body login-form">
    <div class="text-center mb-3">
      <div class="icon-object border-warning-400 text-warning-400">${icon("userCircle", "w-6 h-6")}</div>
      <h5 class="content-group-lg">${esc(t("register.title"))}
        <small class="display-block">${esc(t("register.subtitle"))}</small>
      </h5>
    </div>
    <form data-register-form>
      <div class="form-group"><input type="email" name="email" class="form-control" placeholder="${esc(t("login.email"))}" required></div>
      <div class="form-group"><input type="text" name="firstName" class="form-control" placeholder="${esc(t("register.firstName"))}" required></div>
      <div class="form-group"><input type="text" name="lastName" class="form-control" placeholder="${esc(t("register.lastName"))}" required></div>
      <div class="form-group"><button type="submit" class="bg-blue btn btn-block btn">${esc(t("register.submit"))}</button></div>
    </form>
    <span class="help-block text-center no-margin">
      ${esc(t("login.terms"))} <a href="${localeHref("/terms-conditions")}" data-link>${esc(t("login.termsLink"))}</a>
    </span>
  </div>
</div>`;

  return {
    layout: "auth",
    nav: "login",
    title: isRegister ? esc(t("register.title")) : esc(t("login.title")),
    documentTitle: `${isRegister ? t("register.title") : t("login.title")} • Captain Coaster`,
    content: isRegister ? registerForm : loginForm,
    mount(root) {
      const done = (user) => {
        notify(t("login.welcome", { name: user.firstName }), "success");
        navigate(localeHref("/"));
      };
      root.querySelector("[data-login-form]")?.addEventListener("submit", (e) => {
        e.preventDefault();
        done(login({ email: new FormData(e.target).get("email") }));
      });
      root.querySelector("[data-register-form]")?.addEventListener("submit", (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        done(login({ email: fd.get("email"), firstName: fd.get("firstName"), lastName: fd.get("lastName") }));
      });
      root.querySelector("[data-google]")?.addEventListener("click", (e) => {
        e.preventDefault();
        done(login({ email: "rider@example.com", firstName: "Rider" }));
      });
    },
  };
}
