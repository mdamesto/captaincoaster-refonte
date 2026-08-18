// Carte des coasters (Leaflet + tuiles CARTO Voyager, comme l'original).
// Un marqueur par parc, coloré selon le nombre de coasters ; popup au clic.

import { t } from "../i18n.js";
import { esc, scoreText, scoreColor } from "../util.js";
import { data, coasterUrl, parkUrl, isLoggedIn, displayName, riddenCoasterIds, loadUserRatings } from "../store.js";
import { filterSidebar, readFilters, writeFilters, applyFilters } from "../components/filters.js";
import { replaceQuery, navigate } from "../router.js";

let leafletPromise = null;
function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  if (!leafletPromise) {
    leafletPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "assets/js/vendor/leaflet/leaflet.js";
      s.onload = () => resolve(window.L);
      s.onerror = () => reject(new Error("Leaflet not available"));
      document.head.appendChild(s);
    });
  }
  return leafletPromise;
}

function markerColor(n) {
  if (n === 1) return "#22c55e";
  if (n <= 5) return "#f59e0b";
  if (n <= 10) return "#ef4444";
  if (n <= 15) return "#dc2626";
  return "#8b5cf6";
}

export async function render(ctx) {
  const locale = ctx.locale;
  const filters = readFilters(ctx.query);
  if (filters.status === undefined) filters.status = true; // coché par défaut comme sur le site
  const parkSlug = ctx.query.get("parkslug");

  const isUserMap = ctx.route === "userMap" || ctx.route === "profileMap";
  let ownerName = "";
  let ownerRidden = null;
  if (isUserMap) {
    await loadUserRatings();
    if (ctx.route === "profileMap") {
      if (!isLoggedIn()) {
        navigate(`/${locale}/login`, { replace: true });
        return { nav: "map", title: "", content: "" };
      }
      ownerName = displayName();
      ownerRidden = riddenCoasterIds();
    } else {
      const user = data.byUserId.get(Number(ctx.params.userId));
      if (!user) return (await import("./not-found.js")).render(ctx);
      ownerName = user.name;
      ownerRidden = new Set((data.userRatings[ctx.params.userId] || []).map((r) => r.coasterId));
    }
  }

  return {
    nav: "map",
    title: isUserMap ? esc(t("map.userTitle", { name: ownerName })) : esc(t("map.title")),
    header: false,
    bare: true,
    secondarySidebar: filterSidebar("map", filters),
    content: `<div id="map-container" class="map-container"><div id="map"></div></div>`,
    async mount(root) {
      const L = await loadLeaflet().catch(() => null);
      const container = root.querySelector("#map");
      if (!L) {
        container.innerHTML = `<div class="panel panel-body text-center text-muted" style="margin:20px">Leaflet unavailable</div>`;
        return;
      }

      const map = L.map(container, { worldCopyJump: true }).setView([46.5197, 6.6323], 6);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: "© OpenStreetMap contributors © CARTO",
        maxZoom: 15,
        minZoom: 3,
      }).addTo(map);

      let markers = [];

      const parksForFilters = () => {
        const list = applyFilters(data.coasters, filters);
        const byPark = new Map();
        list.forEach((c) => {
          if (!c.parkId) return;
          if (ownerRidden && !ownerRidden.has(c.id)) return;
          byPark.set(c.parkId, (byPark.get(c.parkId) || 0) + 1);
        });
        return [...byPark.entries()]
          .map(([id, nb]) => ({ park: data.byParkId.get(id), nb }))
          .filter((x) => x.park?.lat);
      };

      const popupHtml = (park) => {
        const list = applyFilters(data.coastersByPark.get(park.id) || [], filters).filter(
          (c) => !ownerRidden || ownerRidden.has(c.id)
        );
        return `
<div>
  <h6 class="no-margin text-semibold"><a href="${parkUrl(locale, park)}" data-link>${esc(park.name)}</a></h6>
  <div class="text-muted text-size-small mb-5">${esc(park.country || "")}</div>
  ${list
    .slice(0, 12)
    .map(
      (c) => `<div class="popup-coaster">
        <span class="status-mark border-${/operat/i.test(c.status) ? "success" : "danger"}"></span>
        <a href="${coasterUrl(locale, c)}" data-link>${esc(c.name)}</a>
        ${c.score != null ? `<span style="margin-left:auto;color:${scoreColor(c.score)}">${scoreText(c.score)}</span>` : ""}
      </div>`
    )
    .join("")}
  ${list.length > 12 ? `<div class="text-muted text-size-small mt-5">+${list.length - 12}</div>` : ""}
</div>`;
      };

      const draw = () => {
        markers.forEach((m) => map.removeLayer(m));
        markers = [];
        parksForFilters().forEach(({ park, nb }) => {
          const marker = L.marker([park.lat, park.lng], {
            icon: L.divIcon({
              className: "coaster-marker",
              html: `<div class="coaster-marker-inner" data-count="${nb}" style="background:${markerColor(nb)}">${nb}</div>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
              popupAnchor: [0, -10],
            }),
            zIndexOffset: nb * 100,
          }).addTo(map);
          marker.bindPopup(() => popupHtml(park));
          marker.parkId = park.id;
          markers.push(marker);
        });
        replaceQuery(writeFilters(filters));
      };

      const form = root.querySelector("#form-filter");
      form.addEventListener("change", (e) => {
        const m = /^filters\[(\w+)\]$/.exec(e.target.name || "");
        if (!m) return;
        filters[m[1]] = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        draw();
      });
      form.addEventListener("input", (e) => {
        if (e.target.name === "filters[name]") {
          clearTimeout(form._timer);
          form._timer = setTimeout(() => {
            filters.name = e.target.value;
            draw();
          }, 300);
        }
      });
      root.querySelector("[data-clear-filters]")?.addEventListener("click", () => {
        Object.keys(filters).forEach((k) => delete filters[k]);
        form.reset();
        form.querySelectorAll(".toggle-switch-form-group").forEach((g) => g.classList.remove("checked"));
        draw();
      });

      draw();

      if (parkSlug) {
        const park = data.parks.find((p) => p.slug === parkSlug);
        if (park?.lat) {
          map.setView([park.lat, park.lng], 9);
          markers.find((m) => m.parkId === park.id)?.openPopup();
        }
      } else if (!isUserMap && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) =>
          map.setView([pos.coords.latitude, pos.coords.longitude], 5)
        );
      }

      setTimeout(() => map.invalidateSize(), 100);
    },
  };
}
