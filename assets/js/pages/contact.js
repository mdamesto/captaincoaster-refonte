// Formulaire de contact.

import { icon } from "../icons.js";
import { t } from "../i18n.js";
import { esc } from "../util.js";
import { notify } from "../components/widgets.js";

export async function render() {
  return {
    nav: "contact",
    title: esc(t("contact.title")),
    content: `
<form name="contact" data-contact-form>
  <div class="form-group">
    <label class="control-label required" for="contact_name">${esc(t("contact.name"))}</label>
    <input type="text" id="contact_name" name="contact[name]" required class="form-control">
  </div>
  <div class="form-group">
    <label class="control-label" for="contact_email">${esc(t("contact.email"))}</label>
    <input type="email" id="contact_email" name="contact[email]" class="form-control">
  </div>
  <div class="form-group">
    <label class="control-label required" for="contact_message">${esc(t("contact.message"))}</label>
    <textarea id="contact_message" name="contact[message]" required rows="5" class="form-control"></textarea>
  </div>
  <div class="text-right">
    <button id="contact_btn" type="submit" class="btn btn-primary">
      ${esc(t("contact.submit"))} ${icon("arrowRight", "w-6 h-6 position-right")}
    </button>
  </div>
</form>`,
    mount(root) {
      root.querySelector("[data-contact-form]").addEventListener("submit", (e) => {
        e.preventDefault();
        e.target.reset();
        notify(t("contact.sent"), "success");
      });
    },
  };
}
