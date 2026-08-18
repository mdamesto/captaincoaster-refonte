# Refonte Captain Coaster — brief de travail

> Fichier de reprise. Écrit pour survivre à un `/compact` : tout ce qu'il faut
> savoir pour exécuter la tâche est ici, sans dépendre de l'historique de la
> conversation.

## Demande

Produire **3 variations de refonte** du site captaincoaster.com, à partir du
clone de référence qui vit dans le dossier parent. Objectif formulé par
Mathieu : dépoussiérer le style vieillot, rendre le site plus actuel, « que ça
en jette », plus fun et plus facile à utiliser — UI **et** UX.

Livrable attendu en plus des 3 versions : **un index de prévisualisation**
permettant de comparer les directions et d'accéder facilement à chaque page
créée.

## Contexte : ce qui existe déjà

Le clone fonctionnel de l'existant est dans `~/captaincoaster-clone/`
(voir son `README.md` et son `decisions.md`). Il sert de **référence « avant »** :
toutes les pages et interactions du site actuel, aux URLs d'origine, en 4
langues, avec 2 906 coasters / 1 857 parcs / 1 756 avis / 293 tops / 180 riders.

Lancement : `python3 serve.py` → http://localhost:8080

Points structurants réutilisables :
- `assets/css/app.css` — tous les tokens (couleurs, largeurs, radius, typo) en
  tête de fichier. C'est le levier principal d'une variation.
- `assets/js/pages/*.js` — un module par route, HTML produit par des fonctions
  de gabarit lisibles. Modifiables sans framework ni build.
- `data/*.json` — le jeu de données, réutilisable tel quel par les maquettes.
- `assets/img/placeholders/` — 12 photos locales. **Aucun appel au CDN de
  Captain Coaster** : contrainte à respecter dans les variations.

## Diagnostic de l'existant (à traiter dans les variations)

| Problème | Conséquence |
|---|---|
| Template d'admin Bootstrap 3 (Limitless), chrome bleu-gris | Look back-office 2016, aucune émotion |
| Photos en vignettes 96 px noyées dans des listes | Le sujet le plus spectaculaire du site est invisible |
| Hiérarchie typographique faible (tout en 13 px) | Impossible de scanner, tout a le même poids |
| Sidebar de filtres administrative à 10 critères | Puissant mais intimidant |
| Le système de duels — l'atout unique du site — n'est expliqué que sur une page dédiée | La proposition de valeur ne se voit nulle part |
| Profil riche en statistiques mais sans récompense visuelle | Peu d'incitation à contribuer |
| Mobile clairement secondaire | Alors que l'usage est dans les parcs, téléphone en main |

## Recherche

Menée en sous-agent, résultat dans `RESEARCH.md` (même dossier) : tendances
2025-2026 réellement en vigueur, références nommées et transposables, patterns
UX à voler, codes visuels du sujet coaster, pièges d'accessibilité et de
performance, et 3 directions candidates argumentées.

## Périmètre proposé

3 directions **nettement distinctes** — pas trois nuances de la même idée. Pour
chacune, les mêmes 5 écrans clés, ceux qui portent la démonstration :

1. **Accueil** — la promesse et l'entrée dans le produit
2. **Classement mondial** — la densité et les filtres, le vrai test d'UX
3. **Fiche coaster** — l'écran le plus riche (score, stats, photos, avis)
4. **Carte / découverte** — le mode exploration
5. **Profil rider** — la contribution et la récompense

Soit 15 maquettes haute fidélité + l'index. Les écrans secondaires (contact,
CGU, paramètres…) ne sont pas redessinés : ils ne portent aucune décision de
design.

Ces maquettes sont **statiques et autonomes** (pas de dépendance au routeur du
clone), mais alimentées par les vraies données de `data/` pour rester crédibles.

## Index de prévisualisation

`redesign/index.html` : galerie comparative. Pour chaque direction, son parti
pris en une phrase, sa palette, et l'accès direct à ses 5 écrans. Plus un accès
au clone de référence pour le « avant / après ».

## Règles de travail

- **Ce document est destiné à un tiers** (Captain Coaster). Donc : panorama
  d'options avec l'intérêt de chacune, jamais un plan acté. La décision leur
  revient.
- Aucun visuel dessiné par script : chercher des images libres de droits ou
  réutiliser les placeholders existants.
- Aucun appel aux serveurs de Captain Coaster.
- Le code va dans les fichiers, pas dans les réponses.

## État d'avancement

- [x] Clone de référence de l'existant, vérifié écran par écran
- [x] Recherche design (`RESEARCH.md`, 5 sections, ~44 sources)
- [x] Banque de 30 photos libres de droits (`assets/img/photos/` + `CREDITS.md`)
- [x] Arbitrage des 3 directions → `DIRECTIONS.md`
- [x] **Direction 1 — Circuit** : accueil, classement, fiche coaster, carte, profil
- [x] **Direction 2 — Carnet de credits** : mon carnet, almanach, fiche, passeport, collection
- [x] **Direction 3 — Sensation** : découvrir, le mur, fiche, carte-planificateur, empreinte
- [x] Index de prévisualisation (`index.html`) avec vignettes des 15 écrans

**Les trois directions sont livrées.** Point d'entrée : `http://localhost:8080/redesign/`

### Ce qui a été corrigé en cours de route

- `data/coasters.json` : 131 hauteurs qui étaient en fait des longueurs, et 39
  `materialType` parasites. Détail et méthode dans `../decisions.md`.
- `serve.py` : un répertoire sert désormais son propre `index.html` au lieu de
  tomber dans le repli SPA.

### Conventions posées par la direction 1, à tenir dans les suivantes

- Couche de données commune : `redesign/assets/data.js` (charge `/data/*.json`,
  expose les vues dérivées). Aucune duplication de jeu de données.
- Coaster héros commun aux trois directions : **Steel Vengeance** (#2, 25 avis,
  8 photos, synthèse). Rider héros : **Denis B** (1 852 credits, 90/100 du top).
- Toute valeur affichée est lue dans les données ou dérivée d'une règle publiée
  par Captain Coaster. Rien de simulé, et les dérivations sont écrites en note
  de bas de page sur l'écran concerné.
- Photos : `assets/img/photos/`, héros choisis à la main (pas tirés au hasard),
  scrim déterministe sous tout texte posé sur une image.
