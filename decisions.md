# Décisions — clone Captain Coaster

Fichier append-only : date + contexte + choix + alternatives rejetées.

---

## 2026-08-17 — Stack du clone : SPA statique sans build

**Contexte.** Le site original est un Symfony rendu côté serveur (Twig +
Stimulus + Webpack Encore). Il faut un clone navigable en local, servant de
base à une proposition de refonte, avec toutes les pages et toutes les
interactions.

**Choix.** SPA vanilla en modules ES, sans build ni dépendance npm, servie par
un petit serveur Python avec repli SPA pour conserver les URLs d'origine.
Données en JSON statique, état utilisateur en `localStorage`.

**Pourquoi.** Zéro installation pour ouvrir le projet, un seul fichier CSS à
retravailler pour la refonte, gabarits lisibles sans couche de framework, et
URLs strictement identiques au site (indispensable pour comparer écran par
écran).

**Alternatives rejetées.**
- *Next.js / React* : meilleure structure de composants mais impose un build et
  un `npm install` pour un livrable qui doit surtout être ouvert et restylé.
- *Pages HTML statiques générées* : duplication du chrome dans ~30 fichiers,
  pénible à faire évoluer pendant la phase de refonte.
- *Clone serveur PHP/Symfony* : le plus fidèle techniquement, mais hors sujet —
  la valeur est dans l'UI, pas dans l'algorithme de duels.

---

## 2026-08-17 — Reproduire le thème plutôt que réutiliser le CSS compilé

**Contexte.** Le site utilise le template commercial Limitless (Bootstrap 3).
On pouvait servir `app.css` tel quel.

**Choix.** Réécriture d'une feuille de style dédiée (~1 000 lignes) qui
reproduit le rendu, avec les tokens regroupés en tête.

**Pourquoi.** Éviter de redistribuer un thème commercial, et surtout livrer une
base restylable : le CSS d'origine fait 312 Ko de règles héritées, inexploitable
pour une refonte.

**Alternative rejetée.** Copier `build/app.6ffe95df.css` : plus rapide, plus
fidèle au pixel, mais inutilisable comme point de départ.

---

## 2026-08-17 — Données réelles extraites plutôt que jeu de test inventé

**Choix.** Collecte des pages publiques (classement, recherche, parcs, fiches,
avis, tops, profils) et reconstruction d'un jeu de données de 2 906 coasters /
1 857 parcs / 1 756 avis / 293 tops / 180 riders.

**Pourquoi.** Les filtres, la pagination, la carte et les classements ne se
jugent qu'avec du volume réel. Un jeu inventé de 50 lignes aurait masqué les
problèmes de densité qui sont justement l'enjeu de la refonte.

**Limite acceptée.** Extrait et non base complète (7 361 coasters en
production) ; le compteur « coasters classés » affiche donc le volume réel de
l'extrait pour rester cohérent avec la pagination.

---

## 2026-08-17 — Images : placeholders locaux, avatars générés

**Choix.** 12 photos téléchargées et réparties de façon déterministe par un
hash de l'identifiant ; avatars et badges générés en SVG côté client.

**Pourquoi.** Le brief demandait quelques placeholders. Générer les avatars
évite en plus de rapatrier des photos de profil d'utilisateurs réels.

---

## 2026-08-17 — Authentification simulée

**Choix.** N'importe quel email connecte immédiatement ; tout l'état
(notes, avis, tops, likes, préférences) est stocké dans le navigateur.

**Pourquoi.** Sans backend, le lien magique et l'OAuth Google ne sont pas
reproductibles. L'important pour la refonte est que **tous les écrans
connectés** soient atteignables et manipulables, ce qui est le cas.

**À vérifier.** L'écran d'édition d'un top a été reconstruit à partir du
JavaScript et du CSS du site : le compte de test n'avait aucun top, l'écran réel
n'a jamais pu être observé. À confronter à la réalité avant de s'en servir comme
référence de refonte.

---

## 2026-08-18 — Correction des hauteurs et des matériaux dans `data/coasters.json`

**Contexte.** Les maquettes de refonte classent les coasters par hauteur. Le
classement faisait remonter des valeurs impossibles : Zokkon à 1 200 m, Red
Falcon à 1 300 m, Batflyer à 147 m pour 35 km/h.

**Cause racine.** Sur les fiches où le site ne publie qu'une seule dimension, le
parseur de collecte rangeait la longueur du parcours dans la colonne hauteur. La
conversion pieds/mètres était juste, c'est l'étiquette qui était fausse. Même
problème sur `materialType`, où des années (« 2018 », « 2016 ») s'étaient
glissées dans la colonne.

**Choix.** Correction du jeu de données, pas de l'affichage. Trois passes :
1. `heightM > 200` → la valeur part en longueur si la longueur est vide.
2. Discriminant physique : la hauteur atteignable est bornée par la vitesse
   (`h = v²/2g`). Toute hauteur dépassant trois fois ce plafond est une longueur.
   Le facteur 3 laisse largement passer les lanceurs — Falcons Flight, 163 m
   pour un plafond calculé à 732 m — et rattrape les familiaux.
3. Reste : pas de vitesse publiée, hauteur > 60 m, aucun classement → longueur.
4. `materialType` restreint à `Steel` / `Wood` / `Hybrid`, le reste passe à `null`.

**Vérification.** Le sommet du classement par hauteur correspond désormais aux
records réels : Kingda Ka 139 m, Top Thrill Dragster 128 m, Superman: Escape
from Krypton 127 m.

**Alternative rejetée.** Filtrer les valeurs aberrantes à l'affichage : le clone
de référence aurait continué à afficher des hauteurs fausses sur les fiches
coaster, et le bug serait revenu à la première nouvelle vue.
