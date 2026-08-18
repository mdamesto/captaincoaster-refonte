// Direction 3 — SENSATION : chrome partagé, le tracé, le profil de sensation.

import { getData, avatar as baseAvatar, esc, num, pickPhoto } from "../assets/data.js";

export { getData, esc, num };

// Resolu depuis le module : fonctionne a la racine comme dans un sous-repertoire.
const P = new URL("../assets/img/photos", import.meta.url).href;

const WIDE = [
  `${P}/night-coaster-lights.jpg`,
  `${P}/night-park.jpg`,
  `${P}/night-carnival-aerial.jpg`,
  `${P}/hero-sunset-silhouette.jpg`,
  `${P}/hero-golden-hour.jpg`,
  `${P}/hero-loop-sky.jpg`,
  `${P}/hero-loop-riders.jpg`,
  `${P}/hero-crest-riders.jpg`,
  `${P}/ride-crest.jpg`,
  `${P}/ride-steep-drop.jpg`,
  `${P}/ride-red-white-train.jpg`,
  `${P}/ride-sunny-day.jpg`,
  `${P}/ride-riders-laughing.jpg`,
  `${P}/steel-loops-blue.jpg`,
  `${P}/steel-multi-loop.jpg`,
  `${P}/wood-structure-sky.jpg`,
  `${P}/wood-towering.jpg`,
  `${P}/wood-lift-hill.jpg`,
  `${P}/detail-rail.jpg`,
  `${P}/park-crowd.jpg`,
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
  `${P}/steel-red-tower.jpg`,
];

export const photo = (seed) => pickPhoto(seed, WIDE);
export const tallPhoto = (seed) => pickPhoto(seed, TALL);

export const HERO = {
  home: `${P}/night-coaster-lights.jpg`,
  coaster: `${P}/hero-sunset-silhouette.jpg`,
  profile: `${P}/night-carnival-aerial.jpg`,
  map: `${P}/night-park.jpg`,
};

const AV = ["#2c3452", "#4a3f5e", "#3d4a5e", "#513f3a", "#3a5148", "#5e4a3d"];
export const avatar = (name, size) => baseAvatar(name, size, AV);

/* ============================================================== LE TRACÉ ==
 *
 * Une courbe dérivée des caractéristiques publiées : hauteur, vitesse,
 * longueur, inversions. Elle est juste en proportions — le rapport entre la
 * montée, la première chute et les collines suivantes — mais elle n'est PAS
 * la géométrie réelle du parcours, que la base ne contient pas.
 *
 * La vitesse en chaque point vient de la conservation de l'énergie :
 * v(h) = sqrt(vmax² − 2g(h − h_bas)). C'est de la physique, pas du décor.
 */

const G = 9.81;

export function trace(c) {
  const H = c.heightM || 30;
  const L = c.lengthM || H * 18;
  const V = (c.speedKmh || Math.sqrt(2 * G * H) * 3.6) / 3.6; // m/s au point bas
  const inv = c.inversions || 0;

  // Répartition longitudinale : lift, chute, puis un train de collines dont le
  // nombre suit la longueur restante.
  const liftEnd = 0.2;
  const dropEnd = 0.3;
  const hills = Math.max(2, Math.min(7, Math.round((L / H) / 9)));

  const pts = [];
  const push = (x, h) => pts.push({ x, h });

  push(0, H * 0.04);
  push(liftEnd * 0.55, H * 0.55);
  push(liftEnd, H);
  push(dropEnd, H * 0.05);

  const span = 1 - dropEnd;
  for (let i = 0; i < hills; i++) {
    const t0 = dropEnd + (span * i) / hills;
    const t1 = dropEnd + (span * (i + 0.5)) / hills;
    const peak = H * (0.62 - (0.34 * i) / Math.max(1, hills - 1));
    push(t1, peak);
    push(dropEnd + (span * (i + 1)) / hills, H * (0.06 + 0.02 * i));
  }

  const hMin = Math.min(...pts.map((p) => p.h));
  const withSpeed = pts.map((p) => {
    const v2 = V * V - 2 * G * (p.h - hMin);
    return { ...p, v: Math.max(0, Math.sqrt(Math.max(0, v2))) * 3.6, d: p.x * L };
  });

  // Les inversions se placent après la première chute, réparties régulièrement.
  const inversions = [];
  for (let i = 0; i < inv; i++) {
    inversions.push(dropEnd + ((1 - dropEnd) * (i + 0.7)) / (inv + 0.4));
  }

  return { points: withSpeed, inversions, H, L, V: V * 3.6, hills };
}

/** Chemin SVG lissé passant par les points du tracé. */
export function tracePath(t, w = 1000, h = 260, pad = 14) {
  const H = t.H;
  const y = (v) => pad + (h - pad * 2) * (1 - v / H);
  const x = (v) => v * w;
  const p = t.points;
  let dstr = `M ${x(p[0].x).toFixed(1)} ${y(p[0].h).toFixed(1)}`;
  for (let i = 1; i < p.length; i++) {
    const x0 = x(p[i - 1].x), y0 = y(p[i - 1].h);
    const x1 = x(p[i].x), y1 = y(p[i].h);
    const cx = (x1 - x0) * 0.42;
    dstr += ` C ${(x0 + cx).toFixed(1)} ${y0.toFixed(1)}, ${(x1 - cx).toFixed(1)} ${y1.toFixed(1)}, ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  }
  return dstr;
}

/** Position (x, y) et mesures à l'avancement `t` (0 → 1) du parcours. */
export function traceAt(t, ratio, w = 1000, h = 260, pad = 14) {
  const p = t.points;
  const clamped = Math.max(0, Math.min(1, ratio));
  let i = 0;
  while (i < p.length - 2 && p[i + 1].x < clamped) i++;
  const a = p[i], b = p[i + 1] || p[i];
  const span = b.x - a.x || 1;
  const k = (clamped - a.x) / span;
  const ease = k * k * (3 - 2 * k); // même lissage que la courbe
  const hh = a.h + (b.h - a.h) * ease;
  const vv = a.v + (b.v - a.v) * ease;
  return {
    x: clamped * w,
    y: pad + (h - pad * 2) * (1 - hh / t.H),
    height: hh,
    speed: vv,
    distance: clamped * t.L,
  };
}

/** Silhouette compacte du tracé, pour les cartes du mur. */
export function spark(c, w = 190, h = 34) {
  const t = trace(c);
  const d = tracePath(t, w, h, 3);
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true" class="card-spark">
    <path d="${d}" fill="none" stroke="rgba(243,161,84,.85)" stroke-width="1.6" stroke-linecap="round"/>
  </svg>`;
}

/* ------------------------------------------------------ profil de sensation */

/**
 * Le vocabulaire de sensation existe déjà : chaque avis du site est étiqueté.
 * Il n'était agrégé nulle part.
 */
export function sensations(d, coasterId) {
  const reviews = d.reviewsByCoaster.get(coasterId) || [];
  const pos = new Map();
  const neg = new Map();
  for (const r of reviews) {
    for (const p of r.pros || []) pos.set(p, (pos.get(p) || 0) + 1);
    for (const n of r.cons || []) neg.set(n, (neg.get(n) || 0) + 1);
  }
  return {
    reviews: reviews.length,
    pos: [...pos.entries()].sort((a, b) => b[1] - a[1]),
    neg: [...neg.entries()].sort((a, b) => b[1] - a[1]),
  };
}

/** Traduction des étiquettes du site. Les clés sont celles du site, en anglais. */
export const TAG_FR = {
  Airtimes: "Airtime",
  "First Drop": "Première chute",
  Intensity: "Intensité",
  Ejectors: "Éjection",
  Masterpiece: "Chef-d'œuvre",
  Layout: "Parcours",
  Pace: "Rythme",
  Fun: "Fun",
  Launch: "Lancement",
  Inversions: "Inversions",
  Duration: "Durée",
  Smoothness: "Douceur",
  Comfort: "Confort",
  Theming: "Thématisation",
  Location: "Cadre",
  "Lap Bar": "Barre ventrale",
  Hangtime: "Hangtime",
  Capacity: "Débit",
  "Nice surprise!": "Bonne surprise",
  Harness: "Harnais",
  Rattle: "Vibrations",
  "Too short": "Trop court",
  Discomfort: "Inconfort",
  "Dead spots": "Temps morts",
  Reliability: "Fiabilité",
  "Disappointing!": "Décevant",
  Headbanging: "Coups de casque",
  Pointless: "Sans intérêt",
  "Tear it down!": "À démolir",
};
export const tagFr = (t) => TAG_FR[t] || t;

/**
 * Classement des coasters par étiquette de sensation, à partir des avis réels.
 * Ne couvre que les coasters qui ont des avis dans l'extrait — c'est dit à l'écran.
 */
export function bySensation(d, tag, n = 12) {
  const counts = new Map();
  for (const r of d.reviews) {
    if (!(r.pros || []).includes(tag)) continue;
    counts.set(r.coasterId, (counts.get(r.coasterId) || 0) + 1);
  }
  return [...counts.entries()]
    .map(([id, count]) => ({ coaster: d.coasterById.get(id), count, rank: d.rankById.get(id) || null }))
    .filter((x) => x.coaster)
    .sort((a, b) => b.count - a.count || (a.rank || 9e9) - (b.rank || 9e9))
    .slice(0, n);
}

/* ------------------------------------------------------------------ chrome */

const NAV = [
  { key: "home", label: "Découvrir", href: "index.html" },
  { key: "ranking", label: "Le mur", href: "ranking.html" },
  { key: "map", label: "Carte", href: "map.html" },
  { key: "profile", label: "Mon empreinte", href: "profile.html" },
];

export function floatbar(active) {
  return `
<a class="skip" href="#main">Aller au contenu</a>
<div class="float">
  <a class="float-brand" href="index.html">Captain<em>Coaster</em></a>
  <nav class="float-nav" aria-label="Navigation principale">
    ${NAV.map((n) => `<a href="${n.href}"${n.key === active ? ' aria-current="page"' : ""}>${n.label}</a>`).join("")}
  </nav>
  <span class="float-me"><img src="${avatar("Denis B", 60)}" alt=""><span>Denis&nbsp;B</span></span>
</div>`;
}

export function foot(extra = "") {
  return `
<footer class="foot">
  <div class="wrap-wide">
    <div style="display:flex;gap:26px;flex-wrap:wrap;justify-content:space-between;align-items:flex-start">
      <div style="max-width:56ch">
        <div class="eyebrow">Direction 3 — Sensation</div>
        <p style="margin-top:10px">Maquette de refonte. Données réelles du site, photographies libres
        de droits, aucun appel aux serveurs de Captain Coaster.</p>
      </div>
      <a class="btn btn-ghost btn-sm" href="../index.html">Retour à l'index des directions</a>
    </div>
    ${extra ? `<div class="note" style="margin-top:22px">${extra}</div>` : ""}
  </div>
</footer>`;
}

export const TRACE_NOTE = `Le tracé est <b>dérivé</b> des caractéristiques publiées — hauteur, vitesse,
longueur, inversions — et non relevé sur le parcours réel, que la base ne contient pas. Les proportions
et les vitesses sont exactes (conservation de l'énergie), la géométrie est un schéma. En production, il
serait soit alimenté par une saisie communautaire, soit présenté comme tel.`;
