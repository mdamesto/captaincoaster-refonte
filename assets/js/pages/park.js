// Fiche parc : compteurs, parcs voisins, liste des coasters notables.

import { icon } from "../icons.js";
import { t } from "../i18n.js";
import { esc, distanceKm } from "../util.js";
import {
  data, countryName, myRating, isLoggedIn, formatDistance, parkUrl,
} from "../store.js";
import { parkCoasterItem } from "../components/widgets.js";
import { localeHref } from "../components/layout.js";

export async function render(ctx) {
  const locale = ctx.locale;
  const park = data.byParkId.get(Number(ctx.params.id));
  if (!park) return (await import("./not-found.js")).render(ctx);

  const coasters = data.coastersByPark.get(park.id) || [];
  const opened = park.openedCoasters ?? coasters.filter((c) => /operat/i.test(c.status || "")).length;
  const kiddie = park.kiddieCoasters ?? coasters.filter((c) => c.kiddie).length;

  const nearby =
    park.nearby?.length
      ? park.nearby.map((n) => ({ park: data.byParkId.get(n.id), km: n.miles * 1.609344 }))
      : park.lat
      ? data.parks
          .filter((p) => p.id !== park.id && p.lat)
          .map((p) => ({ park: p, km: distanceKm({ lat: park.lat, lng: park.lng }, { lat: p.lat, lng: p.lng }) }))
          .sort((a, b) => a.km - b.km)
          .slice(0, 3)
      : [];

  const content = `
<div class="row">
  <div class="col-sm-3">
    <div class="panel panel-body">
      <div class="row text-center">
        <div class="col-xs-6">
          <p>${icon("mapPinStat", "w-8 h-8 display-inline-block text-info")}</p>
          <h5 class="text-semibold no-margin">${opened}</h5>
          <div class="text-muted text-size-small">${esc(t("park.openedCoasters"))}</div>
        </div>
        <div class="col-xs-6">
          <p>${icon("puzzle", "w-8 h-8 display-inline-block text-warning")}</p>
          <h5 class="text-semibold no-margin">${kiddie}</h5>
          <div class="text-muted text-size-small">${esc(t("park.kiddie"))}</div>
        </div>
      </div>
      ${
        isLoggedIn()
          ? ""
          : `<div class="row"><p class="text-muted content-group-sm text-center" style="width:100%">${esc(t("coaster.mustLogIn"))}</p>
             <div class="text-center" style="width:100%"><a href="${localeHref("/login")}" data-link>${esc(t("coaster.logIn"))}</a></div></div>`
      }
    </div>
    ${
      nearby.length
        ? `<div class="panel panel-white">
             <div class="panel-heading"><h6>${esc(t("park.nearby", { name: park.name }))}<br></h6></div>
             <div class="content-group-sm media">
               <ul class="list-feed pl-15 pr-15">
                 ${nearby
                   .filter((n) => n.park)
                   .map((n) => `<li><a href="${parkUrl(locale, n.park)}" data-link>${esc(n.park.name)}</a> - ${esc(formatDistance(n.km))}</li>`)
                   .join("")}
               </ul>
             </div>
             <div class="border-top-grey text-center pt-10 pb-10">
               <a href="${localeHref(`/map/?parkslug=${park.slug}`)}" data-link>${esc(t("park.viewOnMap", { name: park.name }))}</a>
             </div>
           </div>`
        : ""
    }
  </div>
  <div class="col-sm-9">
    ${
      coasters.length
        ? `<ul class="media-list content-group">${coasters.map((c) => parkCoasterItem(c, myRating(c.id)?.value)).join("")}</ul>`
        : `<div class="panel panel-body text-center text-muted">${esc(t("park.noCoaster"))}</div>`
    }
  </div>
</div>`;

  return {
    nav: "",
    title: `${esc(park.name)} • ${esc(countryName(locale, park) || park.country || "")}`,
    documentTitle: `${park.name} • Captain Coaster`,
    content,
  };
}
