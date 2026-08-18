// Direction 2 — CARNET DE CREDITS : chrome partagé et dérivations.

import { getData, avatar as baseAvatar, esc, num, pickPhoto } from "../assets/data.js";

export { getData, esc, num };

// Resolu depuis le module : fonctionne a la racine comme dans un sous-repertoire.
const P = new URL("../assets/img/photos", import.meta.url).href;

const WIDE = [
  `${P}/ride-crest.jpg`,
  `${P}/ride-red-white-train.jpg`,
  `${P}/ride-steep-drop.jpg`,
  `${P}/ride-sunny-day.jpg`,
  `${P}/ride-riders-laughing.jpg`,
  `${P}/wood-structure-sky.jpg`,
  `${P}/wood-lift-hill.jpg`,
  `${P}/wood-towering.jpg`,
  `${P}/wood-blue-sky.jpg`,
  `${P}/steel-loops-blue.jpg`,
  `${P}/steel-multi-loop.jpg`,
  `${P}/hero-loop-sky.jpg`,
  `${P}/hero-crest-riders.jpg`,
  `${P}/hero-golden-hour.jpg`,
  `${P}/park-crowd.jpg`,
  `${P}/detail-rail.jpg`,
  `${P}/night-park.jpg`,
  `${P}/night-carnival-aerial.jpg`,
];

const TALL = [
  `${P}/portrait-lift.jpg`,
  `${P}/portrait-tower.jpg`,
  `${P}/portrait-red-tower.jpg`,
  `${P}/steel-blue-coaster.jpg`,
  `${P}/ride-hands-up.jpg`,
  `${P}/park-ferris-wheel.jpg`,
  `${P}/park-queue.jpg`,
  `${P}/night-coaster-lights.jpg`,
];

export const photo = (seed) => pickPhoto(seed, WIDE);
export const tallPhoto = (seed) => pickPhoto(seed, TALL);

export const HERO = {
  home: `${P}/park-queue.jpg`,
  coaster: `${P}/wood-lift-hill.jpg`,
  profile: `${P}/park-crowd.jpg`,
};

/* Encre de plan de parc pour les avatars : jamais de couleur décorative. */
const AV = ["#2f6b4f", "#8a5a32", "#3c6e8f", "#b08a3e", "#6b5b95", "#c4362b"];
export const avatar = (name, size) => baseAvatar(name, size, AV);

/* ------------------------------------------------------------- dérivations */

/**
 * Famille de coaster : le jeton de couleur qui organise toute la collection.
 * L'axe retenu est le type d'assise — c'est ainsi que les constructeurs
 * organisent eux-mêmes leurs catalogues (B&M : Wing, Dive, Inverted, Launch),
 * et c'est la seule taxonomie réellement renseignée (1 401 des 1 578 classés,
 * contre 437 pour le matériau).
 */
export const FAMILIES = [
  { key: "sitdown", label: "Assis", match: "Sit Down" },
  { key: "inverted", label: "Inversé", match: "Inverted" },
  { key: "spinning", label: "Tournoyant", match: "Spinning" },
  { key: "suspended", label: "Suspendu", match: "Suspended" },
  { key: "floorless", label: "Sans plancher", match: "Floorless" },
  { key: "flying", label: "Volant", match: "Flying" },
  { key: "water", label: "Aquatique", match: "Water Coaster" },
  { key: "dim4", label: "4ᵉ dimension", match: "4th Dimension" },
  { key: "standup", label: "Debout", match: "Stand Up" },
  { key: "moto", label: "Moto", match: "Motorbike" },
  { key: "wing", label: "Wing", match: "Wing" },
  { key: "bobsled", label: "Bobsleigh", match: "Bobsled" },
  { key: "alpine", label: "Alpin", match: "Alpine" },
  { key: "pipeline", label: "Pipeline", match: "Pipeline" },
];

const BY_SEAT = new Map(FAMILIES.map((f) => [f.match, f]));

export function family(c) {
  return BY_SEAT.get(c?.seatingType) || { key: "unknown", label: "Non renseigné" };
}

/** Matériau, gardé comme filtre secondaire : renseigné sur un tiers seulement. */
export function material(c) {
  const m = c?.materialType;
  if (m === "Wood") return "Bois";
  if (m === "Hybrid") return "Hybride";
  if (m === "Steel") return "Acier";
  return null;
}

/** Numéro de série d'un talon : déterministe, lisible, jamais aléatoire. */
export function serial(userId, coasterId, date) {
  const d = String(date || "").replace(/\D/g, "").padStart(6, "0").slice(-6);
  return `${String(userId).padStart(5, "0")}-${d}-${String(coasterId).padStart(5, "0")}`;
}

/** Date « 4/10/25 » → « 4 octobre 2025 ». */
const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
export function longDate(us) {
  const m = String(us || "").match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/);
  if (!m) return us || "";
  return `${Number(m[2])} ${MOIS[Number(m[1]) - 1]} 20${m[3]}`;
}
export function year(us) {
  const m = String(us || "").match(/\/(\d{2})$/);
  return m ? 2000 + Number(m[1]) : null;
}

/* ------------------------------------------------------------------ chrome */

const NAV = [
  { key: "home", label: "Mon carnet", href: "index.html" },
  { key: "ranking", label: "L'almanach", href: "ranking.html" },
  { key: "map", label: "Passeport", href: "map.html" },
  { key: "profile", label: "Ma collection", href: "profile.html" },
];

export function masthead(active) {
  return `
<a class="skip" href="#main">Aller au contenu</a>
<header class="masthead">
  <div class="wrap masthead-in">
    <a class="logo" href="index.html">Captain<em>Coaster</em></a>
    <nav class="nav" aria-label="Navigation principale">
      ${NAV.map((n) => `<a href="${n.href}"${n.key === active ? ' aria-current="page"' : ""}>${n.label}</a>`).join("")}
    </nav>
    <span class="me"><img src="${avatar("Denis B", 60)}" alt=""><span>Denis&nbsp;B</span></span>
  </div>
</header>`;
}

export function foot(extra = "") {
  return `
<footer class="foot">
  <div class="wrap">
    <div style="display:flex;gap:26px;flex-wrap:wrap;justify-content:space-between;align-items:flex-start">
      <div style="max-width:56ch">
        <div class="cap">Direction 2 — Carnet de credits</div>
        <p style="margin-top:8px">Maquette de refonte. Données réelles du site, photographies libres
        de droits, aucun appel aux serveurs de Captain Coaster.</p>
      </div>
      <a class="btn btn-ghost btn-sm" href="../index.html">Retour à l'index des directions</a>
    </div>
    ${extra ? `<div class="note" style="margin-top:20px">${extra}</div>` : ""}
  </div>
</footer>`;
}

/* ----------------------------------------------------------------- widgets */

export function gauge(label, done, total, note, warm = false) {
  const pct = Math.max(0, Math.min(100, (done / total) * 100));
  return `
<div class="gauge">
  <div class="gauge-head">
    <span class="cap">${label}</span>
    <span class="gauge-fig">${num(done)}<span class="dim"> / ${num(total)}</span></span>
  </div>
  <div class="gauge-track"><div class="gauge-fill${warm ? " warm" : ""}" style="width:${pct}%"></div></div>
  <div class="gauge-note">${note}</div>
</div>`;
}

export function stars(v) {
  const full = Math.floor(v);
  return "★".repeat(full) + (v % 1 ? "½" : "");
}
