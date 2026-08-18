// Direction 1 — CIRCUIT : chrome partagé et dérivations.
//
// Toute valeur affichée est soit lue dans le jeu de données réel, soit dérivée
// d'une règle explicitée par Captain Coaster lui-même. Rien n'est inventé.

import { getData, avatar as baseAvatar, esc, num, pickPhoto } from "../assets/data.js";

export { getData, esc, num };

/** Avatars désaturés : la couleur reste réservée à l'accent unique. */
const AV = ["#3d434d", "#4a4038", "#38454a", "#453a45", "#3f4a3d", "#4a3f3f"];
export const avatar = (name, size) => baseAvatar(name, size, AV);

// Resolu depuis le module : fonctionne a la racine comme dans un sous-repertoire.
const P = new URL("../assets/img/photos", import.meta.url).href;

export const PHOTOS = {
  hero: [
    `${P}/hero-sunset-silhouette.jpg`,
    `${P}/hero-golden-hour.jpg`,
    `${P}/hero-loop-sky.jpg`,
    `${P}/hero-loop-riders.jpg`,
    `${P}/hero-crest-riders.jpg`,
  ],
  wide: [
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
    `${P}/night-coaster-lights.jpg`,
    `${P}/night-park.jpg`,
    `${P}/night-carnival-aerial.jpg`,
    `${P}/hero-loop-sky.jpg`,
    `${P}/hero-crest-riders.jpg`,
    `${P}/detail-rail.jpg`,
    `${P}/park-crowd.jpg`,
  ],
  tall: [
    `${P}/portrait-lift.jpg`,
    `${P}/portrait-tower.jpg`,
    `${P}/portrait-red-tower.jpg`,
    `${P}/steel-blue-coaster.jpg`,
    `${P}/ride-hands-up.jpg`,
    `${P}/park-ferris-wheel.jpg`,
    `${P}/park-queue.jpg`,
  ],
};

export const photo = (seed) => pickPhoto(seed, PHOTOS.wide);
export const tallPhoto = (seed) => pickPhoto(seed, PHOTOS.tall);

/* Les héros sont choisis, pas tirés : chaque grand format doit avoir une zone
   calme là où le texte tombe, et un sujet lisible en un dixième de seconde. */
export const HERO = {
  home: `${P}/hero-sunset-silhouette.jpg`,
  coaster: `${P}/hero-crest-riders.jpg`,
  profile: `${P}/hero-loop-sky.jpg`,
};
export const heroPhoto = (seed) => pickPhoto(seed, PHOTOS.hero);

/* -------------------------------------------------------------- dérivations */

/**
 * Palmarès en duels.
 * Captain Coaster définit lui-même le score comme la proportion de duels gagnés
 * face à tous les autres coasters classés (page « Comment fonctionne le
 * classement ? »). Le nombre de victoires en découle directement.
 */
export function duelRecord(score, fieldSize) {
  const opponents = fieldSize - 1;
  const won = Math.round((score / 100) * opponents);
  return { won, lost: opponents - won, opponents };
}

/** Issue d'un duel entre deux coasters : celui qui a le meilleur score l'emporte. */
export function duelWinner(a, b) {
  return (a.score || 0) >= (b.score || 0) ? a : b;
}

/**
 * Percentile d'une caractéristique dans un pool comparable.
 * Modèle FBref : « 65 m » ne veut rien dire, « 87e percentile des Intamin » si.
 */
export function percentile(value, pool) {
  const vals = pool.filter((v) => typeof v === "number" && !Number.isNaN(v)).sort((a, b) => a - b);
  if (!vals.length || typeof value !== "number") return null;
  let below = 0;
  for (const v of vals) if (v < value) below++;
  return Math.round((below / vals.length) * 100);
}

export function ordinalFr(n) {
  return n === 1 ? "1er" : `${n}e`;
}

/* ------------------------------------------------------------------ chrome */

const NAV = [
  { key: "home", label: "Accueil", href: "index.html" },
  { key: "ranking", label: "Classement", href: "ranking.html" },
  { key: "map", label: "Carte", href: "map.html" },
  { key: "profile", label: "Riders", href: "profile.html" },
];

export function rail(active) {
  return `
<a class="skip" href="#main">Aller au contenu</a>
<header class="rail">
  <div class="wrap-wide rail-in">
    <a class="brand" href="index.html">
      <span class="brand-mark">Captain<em>Coaster</em></span>
    </a>
    <nav class="nav" aria-label="Navigation principale">
      ${NAV.map(
        (n) =>
          `<a href="${n.href}"${n.key === active ? ' aria-current="page"' : ""}>${n.label}</a>`
      ).join("")}
    </nav>
    <div class="rail-actions">
      <span class="rail-search">Rechercher un coaster<span class="mono" style="margin-left:auto;color:var(--steel-dim)">/</span></span>
      <a class="btn btn-signal btn-sm" href="index.html#duel">Duel</a>
      <span class="who"><img src="${avatar("Denis B", 56)}" alt=""><span>Denis&nbsp;B</span></span>
    </div>
  </div>
</header>`;
}

export function foot(extra = "") {
  return `
<footer class="foot">
  <div class="wrap-wide">
    <div style="display:flex;gap:28px;flex-wrap:wrap;justify-content:space-between">
      <div>
        <div class="label">Direction 1 — Circuit</div>
        <p style="margin-top:8px;max-width:56ch">Maquette de refonte. Données réelles du site, photographies libres de droits,
        aucun appel aux serveurs de Captain Coaster.</p>
      </div>
      <div style="text-align:right">
        <a class="btn btn-ghost btn-sm" href="../index.html">Retour à l'index des directions</a>
      </div>
    </div>
    ${extra ? `<div class="note" style="margin-top:22px">${extra}</div>` : ""}
  </div>
</footer>`;
}

/* ----------------------------------------------------------------- widgets */

export function duelBar(record) {
  const pct = (record.won / record.opponents) * 100;
  return `
<div>
  <div class="duelbar" role="img" aria-label="${record.won} duels gagnés sur ${record.opponents}">
    <i style="width:${pct.toFixed(2)}%"></i><i style="width:${(100 - pct).toFixed(2)}%"></i>
  </div>
  <div class="duel-figures"><span class="w">${num(record.won)} gagnés</span><span class="l">${num(record.lost)} perdus</span></div>
</div>`;
}

export function pctBlock(label, value, unit, p, poolLabel) {
  if (p === null) {
    return `<div class="pct"><div class="label">${label}</div><div class="mono" style="font-size:19px">${value ?? "—"}${unit ? `<span class="muted" style="font-size:12px"> ${unit}</span>` : ""}</div></div>`;
  }
  return `
<div class="pct">
  <div class="label">${label}</div>
  <div class="mono" style="font-size:19px">${value}<span class="muted" style="font-size:12px"> ${unit}</span></div>
  <div class="pct-track"><div class="pct-fill${p >= 70 ? " is-high" : ""}" style="width:${p}%"></div></div>
  <div class="pct-note">${ordinalFr(p)} percentile ${poolLabel}</div>
</div>`;
}

export function mount(html) {
  document.body.insertAdjacentHTML("beforeend", html);
}
