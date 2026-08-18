# Trois directions de refonte — Captain Coaster

Document destiné à Captain Coaster. Ce sont **trois options ouvertes**, pas un plan
acté : chacune répond à une question différente sur ce qu'est le produit, et le choix
appartient à l'équipe. Elles ne sont pas combinables telles quelles — c'est volontaire,
un panorama sert à trancher.

Base de comparaison : le clone de l'existant (`../` — `python3 serve.py`), qui reproduit
le site actuel écran par écran. Munitions et sources : `RESEARCH.md`.

---

## Le constat commun

Trois problèmes ressortent de l'analyse de l'existant, quelle que soit la direction retenue.

1. **Le mécanisme signature du produit est invisible.** Le classement mondial repose sur des
   duels — mais ils sont *déduits* des notes, jamais joués. Aucun écran ne montre le duel.
   C'est le seul actif que ni RCDB ni Coaster-Count ne peuvent copier, et il ne se voit nulle part.
2. **Le vocabulaire de sensation existe déjà et n'est pas exploité.** Les avis sont structurés
   par tags (*Airtimes, Ejectors, Launch, Intensity, Theming, Discomfort*). C'est une matière
   unique, agrégée nulle part.
3. **L'interface est un back-office pour un sujet spectaculaire.** Template d'admin Bootstrap 3,
   tout en 13 px, photos en vignettes de 96 px. La hiérarchie est plate : score, rang,
   distribution et nombre de duels ont le même poids visuel.

Les trois directions attaquent ces trois points, mais en donnant la priorité à des réponses
différentes.

---

## Direction 1 — CIRCUIT

> **La thèse** : Captain Coaster est un championnat du monde arbitré par 25 000 juges.
> Le site doit se comporter comme une propriété sportive, pas comme une base de données.

**Ce qui change en premier.** Le duel devient jouable — deux photos, « lequel préfères-tu ? »,
flèches du clavier — et alimente directement le classement pairwise existant. Chaque fiche
coaster affiche son **palmarès en duels** face à ses rivaux. Chaque statistique est doublée
d'un **percentile contre un pool comparable** (« 87e percentile des Intamin lancés »), ce qui
transforme une fiche technique en jugement.

**Le registre visuel.** Base graphite désaturée, **un seul** accent chaud, chiffres énormes
traités comme de l'information. Modèle de langage : le rebrand F1 (une famille neutre pour le
labeur, un cut extra-large pour les rangs et les scores). La photo est un fond, la typographie
des nombres est le sujet.

| | |
|---|---|
| Palette | `#16181C` graphite · `#23262C` surfaces · `#ECEAE5` craie · `#FF4D1F` signal (accent unique) · `#8A93A0` acier |
| Typographie | **Archivo** variable (axe de chasse ExtraCondensed → Expanded) pour les rangs et les titres · **Geist Mono** pour les chiffres tabulaires |
| Signature | Le **numéro de rang** en chasse extra-étroite, à fond perdu, et la **barre de duel** face à face |
| Le pari UX | Assumer la densité et la rendre navigable : barre de filtres en chips, « aller à mon rang », deltas de rang (↑3 / ↓5), onboarding en 10 duels |

**Pour qui c'est le bon choix** : si Captain Coaster veut être reconnu comme *l'autorité* du
classement mondial, et convertir sa communauté d'experts en contributeurs réguliers.

**Le risque assumé** : c'est la direction la plus froide des trois. Elle parle très bien aux
riders chevronnés, moins au visiteur occasionnel qui cherche juste de belles images.

---

## Direction 2 — CARNET DE CREDITS

> **La thèse** : ce que les riders gardent vraiment, c'est leur log. Le site devrait s'ouvrir
> sur *ta* collection, pas sur un tableau mondial. Letterboxd pour coasters.

**Ce qui change en premier.** Le profil devient la page d'accueil du membre. Chaque credit est
un **ticket d'entrée numéroté** — date, parc, note, numéro de série. La progression se mesure
en **jauges de complétion** (« 42/100 du top mondial », « 18/121 pays », « 9/12 types »)
et jamais en compteur de credits : la recherche est formelle sur ce point, récompenser le
volume produit du *credit whoring* et de la lassitude. Un récap annuel « Ma saison » à la
fermeture des parcs, gratuit et partageable.

**Le registre visuel.** Imprimé, pas éditorial générique : le vocabulaire vient du papier des
parcs — billetterie, plan de parc, tampon de passeport, almanach. Un **jeton de couleur par
famille de coaster** (bois, acier, lancé, inversé, familial) donne à la collection une taxonomie
lisible d'un coup d'œil — le principe des univers d'Efteling, transposé.

| | |
|---|---|
| Palette | `#EDE9DE` papier non couché · `#1C2B26` encre vert-noir · `#2F6B4F` vert de plan · `#C4362B` rouge billet (accent) · `#B08A3E` laiton (tampons) + 5 jetons de famille |
| Typographie | **Bricolage Grotesque** variable en display · **Inclusive Sans** pour le texte courant (les avis méritent une vraie dignité typographique) · **Courier Prime** pour les numéros de série et les dates |
| Signature | Le **ticket perforé** : chaque note est un talon numéroté, le profil est un carnet relié, la carte est un passeport tamponné |
| Le pari UX | L'état « fait / pas fait » partout, les Tops promus en objets partageables de première classe, la complétion comme moteur |

**Pour qui c'est le bon choix** : si l'objectif est la rétention et la contribution — faire
revenir les membres entre deux saisons, et donner envie de tenir son log à jour.

**Le risque assumé** : le vocabulaire imprimé peut basculer dans le pastiche s'il est appliqué
partout. Il doit rester tenu aux objets de collection (talons, tampons, jauges) et ne jamais
contaminer les écrans de données.

---

## Direction 3 — SENSATION

> **La thèse** : le rôle du site est de faire *ressentir* le ride avant de le faire. La photo
> est l'interface, et la donnée que personne ne visualise, c'est le tracé.

**Ce qui change en premier.** La fiche coaster s'ouvre sur son **tracé** — une courbe dessinée
à partir des chiffres réels (hauteur, vitesse, longueur, inversions) que l'on parcourt au
scroll, les statistiques se mettant à jour au point où l'on se trouve. Modèle : le profil
d'élévation de Komoot. Et les tags d'avis existants sont enfin agrégés en un **profil de
sensation** (airtime, intensité, thématisation, inconfort) — le contenu le plus différenciant
du site, aujourd'hui affiché nulle part comme une synthèse.

**Le registre visuel.** Parc de nuit : bleu profond et une chaleur d'ambre, le registre de
Phantasialand — la meilleure référence du corpus étudié. Chrome quasi nul, photos à fond perdu,
interface flottante et minimale. Un traitement duotone léger sur les surfaces de chrome pour
rendre cohérentes des photos prises par 25 000 personnes différentes — mais **photo native
préservée sur les fiches et les galeries** : traiter la photo d'un contributeur serait une
insulte au contributeur.

| | |
|---|---|
| Palette | `#171C2E` nuit · `#232A44` crépuscule · `#E8E6EF` brume · `#F3A154` ambre (accent unique) · `#7C85A3` atténué |
| Typographie | **Funnel Display** pour les titres · **Funnel Sans** pour le texte et les chiffres tabulaires |
| Signature | Le **tracé** : une courbe générée à partir des vraies caractéristiques, utilisée en héros, en fond de carte coaster et en sparkline de classement |
| Le pari UX | La découverte avant la comparaison : mur de photos plutôt que tableau, filtrage par sensation plutôt que par constructeur, carte en planificateur de voyage |

**Pour qui c'est le bon choix** : si l'objectif est l'acquisition et le partage — séduire le
visiteur qui découvre le site, et donner des pages qui se partagent sur les réseaux.

**Le risque assumé** : c'est la direction la plus exigeante à exploiter au quotidien. Elle
dépend de la qualité des photos et demande une discipline de performance (AVIF, scrims
déterministes, `prefers-reduced-motion`) sans laquelle elle devient lente et illisible.

**Honnêteté sur le tracé** : la base ne contient pas la géométrie réelle des parcours. La courbe
est **dérivée** des caractéristiques publiées (hauteur, vitesse, longueur, inversions) — elle est
juste en proportions, pas topographiquement exacte. En production, elle serait soit alimentée par
une saisie communautaire, soit présentée explicitement comme un schéma.

---

## Ce qui les oppose, en une grille

| | CIRCUIT | CARNET | SENSATION |
|---|---|---|---|
| Le site est… | une compétition | une collection | une sensation |
| Écran qui porte le produit | le classement | le profil | la fiche coaster |
| Objet signature | le numéro de rang | le ticket perforé | le tracé |
| Ce qui domine l'écran | les chiffres | le papier et l'état fait/pas-fait | la photo |
| Rapport à la densité | assumée et outillée | organisée en checklist | évitée au profit de l'image |
| Objectif servi | autorité et contribution experte | rétention et régularité | acquisition et partage |
| Public visé en priorité | l'enthousiaste qui compte ses credits | le membre qui tient son log | le visiteur qui découvre |
| Risque principal | froideur | pastiche | coût d'exploitation |

---

## Écrans produits pour chaque direction

Les cinq écrans qui portent les décisions de design. Les écrans secondaires (contact, CGU,
paramètres) ne sont pas redessinés : ils ne tranchent rien.

| | Accueil | Classement | Fiche coaster | Carte | Profil rider |
|---|---|---|---|---|---|
| **Circuit** | le championnat en direct, duel du jour | top 3 éditorial + tableau à percentiles | palmarès en duels, percentiles | où sont les meilleurs | palmarès et rang mondial personnel |
| **Carnet** | ton carnet, jauges de complétion | almanach de l'année, coché / pas coché | fiche de collection et talon | passeport tamponné | le carnet relié, mur de credits |
| **Sensation** | mise en scène plein écran | mur de photos filtré par sensation | tracé parcourable, profil de sensation | planificateur de voyage | empreinte de rider |

Toutes les maquettes tournent sur le **jeu de données réel** (2 906 coasters, 1 857 parcs,
1 756 avis, 180 riders) pour que la densité et le filtrage se jugent en conditions réelles.
Aucune ne contacte les serveurs de Captain Coaster.

---

## Comment lire les maquettes

Ce ne sont pas des images. Les filtres filtrent réellement les 1 578 coasters classés,
la carte affiche les 1 786 parcs géolocalisés, le duel se joue, le tracé se parcourt.
C'est le seul moyen de juger la densité, qui est le vrai sujet de cette refonte.

**Ce qui est réel** : scores, rangs, caractéristiques, avis, étiquettes de sensation,
synthèses, statistiques de profil, coordonnées des parcs.

**Ce qui est dérivé, et dit comme tel sur l'écran concerné** :
- le **palmarès en duels** découle de la définition publiée par Captain Coaster — le score
  est la proportion de duels gagnés, donc le nombre de victoires s'en déduit ;
- le **tracé** de la direction 3 est construit à partir de la hauteur, de la vitesse, de la
  longueur et des inversions. Les proportions et les vitesses sont exactes (conservation de
  l'énergie), la géométrie est un schéma : la base ne contient pas les parcours réels ;
- l'état **« fait / à faire »** s'appuie sur les notes et le top personnel présents dans
  l'extrait, soit une partie seulement des credits du rider affiché.

**Ce qui a été volontairement écarté** : les deltas de rang (↑3 / ↓5). L'idée est bonne et
figure dans les recommandations, mais la base ne contient aucun historique de classement —
les afficher aurait voulu dire inventer des chiffres.

**Photographies** : substituts libres de droits (Unsplash), à la place des photos des
contributeurs. Les crédits affichés sur les fiches restent ceux des vrais auteurs relevés
sur le site. Détail des licences dans `assets/img/CREDITS.md`.

**Polarité** : Circuit et Sensation sont sombres, Carnet est claire. En production, chaque
direction devrait proposer les deux polarités et respecter `prefers-color-scheme` — le mode
sombre est un choix de confort, pas une identité.
