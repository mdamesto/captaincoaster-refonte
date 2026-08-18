# Recherche design — refonte Captain Coaster

Munitions pour produire 3 directions de refonte. 18/08/2026.
Cible : captaincoaster.com — 24 895 membres, 788 501 notes, 96 178 avis, 22 871 photos,
7 361 coasters dont ~2 000 classés, classement mondial par duels.
État de départ : template admin Bootstrap 3 « Limitless », chrome `#37474f`/`#263238`, fond `#f5f5f5`,
Roboto 13px, radius 3px, vignettes 96 px. Le sujet est spectaculaire, l'interface est un back-office.

**Deux constats à poser avant tout le reste.**

1. **Le mécanisme signature du produit est invisible.** Les « duels » ne sont jamais joués : ils sont
   *déduits* des notes (noter A au-dessus de B = une victoire de A ; 50 coasters notés = 1 225 duels).
   Le score est le % de duels gagnés, sans effet de masse.
   <https://blog.captaincoaster.com/blog/understanding-captain-coaster-ranking-system>
2. **L'actif le plus différenciant n'est affiché nulle part comme une synthèse** : les tags qualitatifs
   des avis — *Theming, Airtimes, Ejectors, Launch, Intensity, Capacity, Discomfort, Nice surprise*.
   C'est un vocabulaire de **sensation** que ni RCDB ni Coaster-Count n'ont.

---

## 1. Tendances UI 2025-2026 : ce qui est vrai, ce qui est mort

### 1.1 Le flat d'admin a été remplacé par une bifurcation, pas par un style

- **Camp A — le « Linear look »** : fond sombre, dégradés fins, blur, bento, **un seul accent néon**. Normalisé par Stripe puis Linear ; ~3/4 des sites SaaS design-led suivent ce schéma en 2026 (Linear-purple, Raycast-red, Mercury-lime, Cursor-cyan). <https://www.overpass.studio/blog/why-saas-websites-look-the-same>
- **Camp B — « editorial »** : crème/papier, serif de display, grands blancs, grain, asymétrie. Contre-réaction directe au camp A.
- **Material n'est pas mort, il a muté** : *Material 3 Expressive* (2025), adossé à 46 études et 18 000+ participants. Résultat contre-intuitif à citer : les designs expressifs sont jugés **plus faciles à utiliser**, y compris par les publics à capacités réduites. <https://design.google/library/expressive-material-design-google-research>
- **Méta-constat NN/g (State of UX 2026)** : l'UI cesse d'être un différenciateur — *« surface-level design won't be enough to stay competitive »*. <https://www.nngroup.com/articles/state-of-ux-2026/>

### 1.2 Statut par tendance

| Tendance | Statut | À en faire ici |
|---|---|---|
| Glassmorphism / Liquid Glass | MATURE mais **discrédité** en version forte | Surfaces flottantes courtes sur fond contrôlé. Jamais sous du texte long. Jamais verre sur verre. |
| Bento grid | MATURE, en banalisation | Valable seulement si la **hiérarchie de tailles** porte du sens (le n°1 en 2×2). Sinon c'est une grille de cartes. |
| Dégradés mesh / aurora | **DATÉ** | Le violet→bleu est le marqueur n°1 du site généré par IA. Ne survit que granuleux ou piloté par shader. |
| Typo expressive / variable | Variable = attendu ; display = ÉMERGENT | **Meilleur rapport effort/différenciation de 2026.** C'est là qu'il faut dépenser. |
| Dark mode par défaut | DATÉ comme défaut, MATURE comme option | Les deux modes, `prefers-color-scheme` respecté, jamais `#000`. |
| Néo-brutalisme | MATURE mais institutionnalisé (kits Figma achetables) | Ne signale plus l'indépendance. NN/g : max 2-3 couleurs, marges 24-32 px, ombres **solides**. <https://www.nngroup.com/articles/neobrutalism/> |
| Neumorphism / soft UI | ÉMERGENT-suspect | Contraste insuffisant par construction. Décoratif seulement, jamais les contrôles. |
| Texture / grain | **ÉMERGENT — le vrai signal 2026** | Contre-réaction anti-slop : l'imparfait est difficile à générer par défaut, donc lisible comme intentionnel. |
| Layout éditorial / magazine | ÉMERGENT, fort potentiel | Poids typo asymétrique, blanc structurel, dissonance d'échelle. Faisable en Grid + subgrid. |

Le dossier **Liquid Glass** vaut d'être connu : NN/g documente un texte sur image *« substantially harder to read »*, des icônes qui *« blend into the background »*, des cibles tactiles compressées <https://www.nngroup.com/articles/liquid-glass/>. Apple a cédé (mode « Tinted » en iOS 26.1) et **a perdu des points** au bulletin annuel d'accessibilité visuelle de mars 2026 <https://9to5mac.com/2026/03/18/liquid-glass-and-long-standing-bugs-push-apples-grades-down-in-visual-accessibility-report-card/>. Détail technique : l'approche par filtre SVG casse dans Safari <https://css-tricks.com/getting-clarity-on-apples-liquid-glass/>.

### 1.3 Motion : ce qui est réellement disponible

- **View Transitions same-document** : **Baseline Newly available depuis le 14/10/2025**, prod-ready. Cross-document : pas Baseline (Firefox absent). <https://web.dev/blog/same-document-view-transitions-are-now-baseline-newly-available>
- **Scroll-driven animations** (`animation-timeline: scroll()/view()`) : Chrome 115+, Firefox 132+, Safari 18+, ~84 % de couverture ; **priorité Interop 2026**. Elles tournent sur le compositeur, hors main thread — elles remplacent du JS qui pollue l'INP. <https://web.dev/blog/interop-2026>
- Double garde obligatoire : `@media (prefers-reduced-motion: no-preference)` **et** `@supports (animation-timeline: scroll())`.

### 1.4 Stack 2026 et typographies disponibles

- **Tailwind v4** : palette par défaut passée en **OKLCH**, tokens en variables CSS, config `@theme` dans le CSS. <https://tailwindcss.com/blog/tailwindcss-v4>
- **OKLCH** : `L` = clarté *perçue*, accès au P3, **contraste prévisible en code**. <https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl>
- **Base UI est le défaut de shadcn/ui depuis juillet 2026** (Radix racheté par WorkOS, rythme ralenti). <https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default>
- **CSS acquis** (State of CSS 2026) : `:has()` 83,7 %, `aspect-ratio` 81,3 %, **nesting natif 70,6 %**. **Container queries** Baseline, étude de cas Netflix à l'appui <https://web.dev/case-studies/netflix-cq>.
- **Typos disponibles** : **Archivo** (variable Thin→Black **et** ExtraCondensed→Expanded, 200+ langues — la plus polyvalente pour du sportif/tabulaire) ; **Bricolage Grotesque** + Condensed (poids, optical size, width, grade) ; **Funnel Display** ; **Fraunces** / **Instrument Serif** en serif de display ; **Inclusive Sans** (2025, bâtie sur de la recherche d'accessibilité) ; **Geist**/**Geist Mono** (excellent en chiffres, mais très installé donc peu distinctif seul).
- **Modèle d'architecture typo : F1.** Sa `fonts.css` (<https://www.formula1.com/s/fonts.css>) sert quatre familles : `Formula1` (labeur), **`Formula1Wide`** (titres et gros chiffres), **`Formula1Digits`** (chronométrage), `KH Interference`. Rebrand Wieden+Kennedy, typos de Marc Rouault. <https://www.wk.com/work/formula-1-rebrand/>

> **Pour ce projet** : le clone est en CSS vanilla, tokens en tête de `assets/css/app.css`. Rien n'oblige à passer sur Tailwind — mais **tokens OKLCH**, **container queries** (une carte coaster vit en liste, en grille, en popup de carte et en top) et **view transitions same-document** (liste → fiche) sont applicables sans build.

### 1.5 Ce qui est mort, à éviter frontalement

Le meilleur corpus critique de la période s'est cristallisé autour de **« AI slop design »**. Le kit,
littéralement : dégradé violet→bleu, bordure grise 1 px sur chaque carte, titres en **Inter**, trois
feature cards alignées, dark mode non demandé. Le **bleu Tailwind par défaut atteint ~78 % des sites
marketing indexés en 2026**. <https://vibecodekit.dev/ai-slop-design> · <https://www.925studios.co/blog/ai-slop-web-design-guide>

Le test opérationnel : **si la home d'une fintech peut servir telle quelle à un CRM, le design ne
communique rien.** Appliqué ici : si la home de Captain Coaster peut servir à un site de vin, c'est raté.

| À éviter | Pourquoi |
|---|---|
| Corporate Memphis / blob people | Mort. <https://www.creativebloq.com/news/corporate-memphis-style-is-dead> |
| Glassmorphism généralisé | Apple lui-même a reculé (cf. 1.2) |
| Dark mode `#000` pur | Halation + astigmatisme. Base `#121212`, off-white. Confort mesuré 4.8:1→11.3:1, optimum ~**8.9:1** |
| Dark mode imposé | NN/g : **pas de différence significative de fatigue oculaire** entre polarités. L'argument « ça repose les yeux » est du folklore. <https://www.nngroup.com/articles/dark-mode/> |
| Hero vidéo autoplay | Candidat LCP, jamais lazy, non accessible, et la piste audio d'une vidéo muette = ~20 % de bande passante gaspillée |
| Mesh gradients / blobs 3D / bento uniforme | Absorbés dans le kit slop |
| Y2K, minimalisme paresseux, maximalisme paresseux, motion gratuit | Listés parmi les « 10 trends creatives are so over in 2026 ». <https://www.creativeboom.com/insight/10-trends-creatives-are-so-over-in-2026/> |

**Contre-point** : Awwwards Site of the Year 2025 = *Messenger*, une planète WebGL jouable. Le
« vraiment remarquable » reste du **craft technique lourd**, pas un choix de tendance. Ne pas confondre
le terrain Awwwards (démonstration) et le terrain produit (NN/g).

---

## 2. Références nommables, et ce qui est transposable

### 2.1 Bases communautaires avec notation

| Référence | Ce qu'elle réussit | Transposable ici |
|---|---|---|
| **Letterboxd** | Fiche **poster-first** : l'affiche porte l'identité, le texte s'efface. Demi-étoile. Listes user = objet éditorial de première classe. Page stats qui n'est pas un dashboard (semaine/année, mieux notés par décennie, *milestone lists*, breakdowns pays/genre, mur de posters, carte du monde). 700 M de notes en 2025. | Le poster du coaster n'existe pas : **c'est la photo**. Tout le modèle s'applique en remplaçant « affiche » par « photo verticale ». Les **Tops** de CC sont déjà l'équivalent des listes — visuellement sous-exploités. |
| **Beli** | **La référence n°1.** Notation par comparaison : pré-tri en 3 buckets (*mauvais / correct / super*), puis **recherche binaire par duels** (3-5 questions), puis interpolation → score 0-10. Résultat : un top perso sans ex æquo, et *« tu as toujours une réponse à : c'est quoi ton préféré ? »* <https://hackernoon.com/belis-binary-search-rating-system-explained> | CC dérive déjà des duels des notes. Beli prouve que le duel peut être **l'acte de saisie**, en 3 questions, plus rapide ET plus satisfaisant qu'un formulaire d'étoiles. Limite : un ordre strict interdit l'ex æquo et décale les rangs silencieusement. |
| **Untappd** | Le check-in comme unité sociale | **Contre-exemple** sur la gamification (cf. 4.5) |
| **Goodreads / RateYourMusic** | Profondeur de données, communauté | Tous deux critiqués pour une UI datée (Goodreads : *« congested, outdated, overly complex »* même après sa première refonte en 20 ans). C'est le procès qu'on fait à CC — et la preuve qu'une base aimée survit à une UI moche. La refonte doit **ajouter** sans casser les habitudes. |
| **StoryGraph** | A gagné des parts de Goodreads par les **« moods »** | C'est exactement le rôle que peuvent jouer les tags de sensation de CC |

### 2.2 Classements et comparaisons

- **FBref** <https://fbref.com/en/about/scouting-reports-explained> — chaque stat en **percentile contre un pool comparable**, pas en valeur brute. Transposition : « 87e percentile des Intamin lancés » plutôt que « 65 m ». C'est ce qui transforme une fiche technique en jugement.
- **Rotten Tomatoes / Metacritic** — le score agrégé comme objet graphique fort. **Un seul chiffre doit dominer.** CC affiche score + rang + distribution + nombre de duels au même niveau visuel : personne ne sait où regarder.
- **TierMaker** <https://tiermaker.com/> — S/A/B/C, drag & drop, partage par lien **sans compte**. Le format de classement le plus viral du web. Une vue « tier » alternative des Tops coûterait peu et se partagerait dix fois plus.
- **RCDB** <https://rcdb.com/> — Arial, zéro fioriture, et pourtant dark mode, bascule métrique/impérial, 10 langues. Sa vraie force est sa nav : `New for 2027`, `Census`, `Record Holders`, `World View`, `Inversions`. **Ce sont des angles éditoriaux, pas des filtres. À voler tel quel.**
- **Queue-Times** <https://queue-times.com/> — home réduite à trois chiffres héros + une API publique. Preuve qu'un site de données peut être spectaculaire par la **typographie des nombres** seule.

### 2.3 Sport / tracking gamifié

- **Strava**, refonte Record 2025 : fusion carte/données, métriques en overlay, suppression du toggle MAP/DATA → **+19 % de sessions démarrées** <https://press.strava.com/articles/strava-launches-redesigned-record-experience>. **Athlete Intelligence** traduit la donnée en phrases plutôt qu'en tableaux — version CC : *« Tu es dans les 3 % de riders ayant fait plus de 10 Intamin. »* **Contre-exemple** : donner une demi-page à la carte sur l'écran Activité a été mal reçu, ça déclasse les photos, *« ce qui fait cliquer »* → **sur une fiche coaster, la photo reste au-dessus de la carte**. **Global Heatmap** : découverte par densité, séparée par sport pour que le rare ne soit pas noyé → heatmap communautaire des parcs **+ heatmap personnelle « mon empreinte de rider »**.
- **Komoot Discover** — le meilleur modèle de découverte par la carte (profil d'élévation cliquable). **AllTrails** — le « nearby » traité comme du contenu (photos géolocalisées, waypoints, pins voisins), pas comme un lien de bas de page.
- **Duolingo / Apple Fitness** — prendre la **mécanique de clôture** (Activity Rings), rejeter les streaks et les ligues (cf. 4.5).

### 2.4 Contenu à forte charge visuelle

- **Apple** — la référence de scrollytelling, mais elle tient *parce qu'elle est ingéniérée avec soin ; sans ce soin, ça coûte cher en perf et casse en reduced-motion*. À citer quand on demande « comme Apple ».
- **Airbnb** — barre de filtres horizontale avec 3 critères toujours visibles, « Filtres » ouvre un panneau plein écran par catégorie, **compteur de résultats par filtre**, filtres actifs en **chips supprimables une par une**. Le pattern à copier pour les 10 filtres du classement.
- **Netflix** — étude de cas officielle sur les **container queries** à grande échelle : la même carte s'adapte à son conteneur, pas au viewport. Exactement le besoin de CC.

---

## 3. Patterns UX à voler, et le problème que chacun résout

### 3.1 Un classement de 2 000 items sans écraser

- **Traiter le haut éditorialement, le reste en liste dense.** Top 10 en cartes photo pleine largeur avec un rang énorme ; 11-100 en liste riche (photo 16:9, score, parc, pays) ; au-delà, densité tabulaire assumée + virtualisation.
- **Pagination plutôt qu'infinite scroll** : NN/g montre que les utilisateurs préfèrent la pagination sur de gros jeux de données (contrôle, sentiment de progression), et l'infinite scroll perd la position au retour depuis une fiche. L'infinite scroll est pour la découverte, pas la comparaison. → **pagination + « jump to rank » + restauration de position.**
- **Ancrages personnels** : « ma position », « ceux que j'ai faits », « ceux qu'il me reste ». Un classement de 2 000 items devient supportable dès qu'on peut y atterrir sur soi.
- **Angles éditoriaux plutôt que filtres** (modèle RCDB) : « Nouveautés 2027 », « Records », « Inversions », « Ce qui a le plus grimpé ce mois-ci ».
- **Deltas de rang** (↑3 / ↓5 depuis le mois dernier) : transforme un classement statique en actualité.

### 3.2 Dix filtres sans sidebar administrative

- Pattern Airbnb : **3-4 filtres primaires en chips horizontales sticky** + un bouton « Filtres » ouvrant un drawer complet organisé par catégorie.
- **Compteur par facette** (« Intamin (214) ») : NN/g mesure des tâches complétées **25-50 % plus vite** avec de la navigation à facettes, et les compteurs évitent les culs-de-sac à zéro résultat. <https://www.nngroup.com/reports/ecommerce-ux-search-including-faceted-search/>
- **Chips d'état actif supprimables** + « tout effacer ». L'état doit être visible sans ouvrir le panneau.
- Mobile : **bottom sheet**, pas une page séparée. Compteur live dans le bouton (« Voir 214 coasters »).
- Facettes générales en haut, spécifiques en bas (NN/g). L'URL reste la source de vérité — un classement filtré doit se partager (le clone le fait déjà).

### 3.3 Fiche « objet » riche

1. **Hero photo pleine largeur** avec scrim, nom en display, parc/pays, **un seul chiffre dominant** (le score) — le rang en secondaire.
2. **Bande de stats** en chiffres tabulaires (hauteur, vitesse, longueur, inversions), chacune doublée d'un **percentile contre un pool comparable** (modèle FBref).
3. **Profil de sensation** dérivé des tags d'avis existants (*Airtimes, Ejectors, Intensity, Discomfort, Theming*) en radar ou en barres. **Contenu le plus différenciant du site, aujourd'hui invisible.**
4. **Comparateur** : « vs le n°1 mondial », « vs les autres B&M Invert », « vs les coasters du même parc ». Le système de duels rend cette comparaison légitime et unique.
5. Galerie, avis, puis carte. **Jamais la carte avant les photos.**

### 3.4 Profil qui donne envie de contribuer

- Un **chiffre héros unique** en traitement éditorial, pas quatre tuiles égales. **La collection est le visuel** : mur de photos des coasters faits (équivalent du mur de posters Letterboxd).
- **Jauges de complétion** plutôt que compteurs : « 42/60 du Top 100 », « 18/121 pays », « 9/12 types ». La clôture motive ; un compteur qui monte, non.
- **Phrases plutôt que tableaux** (modèle Strava Athlete Intelligence).
- **Récap annuel « Ma saison »**, gratuit, en cartes séquentielles partageables, publié à la fermeture des parcs européens (fin novembre), + un round-up communautaire. Wrapped 2025 : 200 M d'utilisateurs engagés en 24 h, 500 M de partages. Letterboxd le fait **sans abonnement** et c'est ce qui le rend viral ; Strava l'a passé derrière un paywall en 2025 et s'est fait éreinter. → **monétiser les stats all-time (modèle Letterboxd Pro), jamais le récap.**

### 3.5 Le geste de notation — le point le plus important du document

Le mécanisme signature n'est jamais joué. Le rendre explicite est à la fois la meilleure amélioration UX et le meilleur argument produit.

- **Mode duel** : deux photos plein écran, « lequel préfères-tu ? », clavier ←/→, swipe en mobile. Chaque réponse alimente le classement pairwise existant. Rapide, addictif, et c'est **le seul écran que personne d'autre ne peut copier** (RCDB et Coaster-Count n'ont pas de notes).
- **Insertion par recherche binaire à la Beli** à l'ajout d'un credit : 3 buckets puis 3-5 duels → une place exacte dans le top personnel, sans jamais demander « combien d'étoiles ? ». Garder la demi-étoile en second rail.
- **Le paradoxe de Condorcet (A>B, B>C, C>A) ne doit pas être caché : il doit devenir du contenu.** *« Ces trois coasters forment une boucle — la communauté n'arrive pas à les départager. »* Page d'anthologie qui n'existe sur aucun autre site.
- A11y : boutons explicites + raccourcis clavier d'abord, le swipe en supplément.

### 3.6 Onboarding d'un contributeur (cold start)

- Pattern Netflix/Spotify : une petite saisie qui **débloque immédiatement de la valeur**. Ici : « coche les parcs que tu as visités » → pré-remplit des credits candidats → **10 duels** → un top personnel et un rang mondial personnalisé en moins de 3 minutes.
- Ne jamais montrer un état vide sans action : un profil sans credits affiche le duel, pas un tableau vide.
- Les **listes-jalons** (« les 100 mondiaux », « les 25 d'Europe ») sont le meilleur moteur de contribution long terme : progression réelle sans inventer de points.

---

## 4. Le sujet coaster : quels codes, sans la fête foraine

Palettes et typos ci-dessous **relevées dans le CSS des sites**, pas devinées.

### 4.1 Ce que font réellement les parcs

| Site | Ce qu'on y trouve | Verdict |
|---|---|---|
| **Phantasialand** | Bleu nuit `#262D49` dominant + ambre `#f3a154` en accent unique. Brandon Grotesque + Serenity. **Home 100 % vidéo MP4 en boucle**, 55 sources, 5 crans responsive (240p→1080p) via `<source media>`. | **La meilleure référence du corpus.** « Nuit + une chaleur » = le registre cool-pas-carnaval. |
| **Europa-Park** | Drupal + **Bootstrap 3**, 279 `glyphicon`, dominante `#337ab7` = le `@brand-primary` par défaut de Bootstrap. FontAwesome 4.7, Quicksand. | Le plus gros parc européen est **de la même génération technique que Captain Coaster aujourd'hui**. L'ambition n'est pas de rattraper les parcs. |
| **Efteling** | Next.js. **Tokens de couleur par univers** : `--empire-anderrijk:#006376`, `--fantasierijk:#833b67`, `--marerijk:#235e39`, `--reizenrijk:#cf7712`, `--ruigrijk:#8e191e`, sur neutres chauds (`--eft-linen:#f3efe5`). | **Le pattern le plus copiable** : un token par famille. Transposition CC : un token par **constructeur** ou par **type de coaster**. |
| **Cedar Point / Six Flags** | Même plateforme post-fusion, Next.js + Tailwind, police **Outfit**. Pages d'attraction **rendues côté client** (le HTML ne contient que le shell). | Mauvais LCP, mauvais SEO. À ne pas reproduire. |
| **PortAventura** | Montserrat + Nunito ; orange `#f2662b`, indigo `#323393`, magenta `#b42890`, cyan `#03b9de`. | Registre « famille ». Trois couleurs saturées à parts égales = carnaval. |
| **Energylandia** | Spec dump brut : *« Over 80 metre drop / 77 metres in height / Speed of over 140 km/h / 85 degree drop »* en liste à puces. | Les chiffres sont là mais **ne produisent aucune sensation**. C'est le défaut exact de la fiche coaster actuelle de CC. |

### 4.2 Constructeurs — le registre industriel/technique

- **B&M** <https://www.bolliger-mabillard.com/> — minimalisme radical, un seul rouge `#f50000`, *« We build coasters. We build memories. »*, catalogue **par type** (Wing, Dive, Inverted, Launch, Family).
- **Rocky Mountain Coasters** <https://www.rockymtnconstruction.com/> — *« Choose Your Coaster Style »* → Raptor / Hybrid / I-Box / Family. Neutres froids `#2c2d33` / `#1d2327`. (Piège : `rockymountainconstruction.com` est une entreprise de terrassement du Montana.)
- **Vekoma**, **Gerstlauer** (teal `#0089a0`) — même logique de catalogue par famille.

**Leçon transversale** : les constructeurs organisent le monde par **modèle et sensation**, les parcs par **émotion et public**. Captain Coaster n'exploite ni l'un ni l'autre comme axe de navigation — il n'offre que des filtres tabulaires.

### 4.3 La règle qui sépare « cool » de « carnaval »

Références du registre « cool » : **F1** (architecture typo à quatre étages, cf. 1.4), **Formula E** (`FESans.var.woff2`), **The Athletic** (grotesque + serif éditoriale), **Nike** (Futura + Helvetica Neue), **Red Bull** (`#CC1E4A`, `#004C6C`, `#FFC906` — **le jaune n'est jamais dominant, il est ponctuation**, <https://www.redbull.design/>).

> **La règle, en une phrase** : base sombre désaturée + **un seul** accent chaud + grotesque large +
> **chiffres énormes traités comme de l'information** + mouvement porté par la photo et la vidéo.
> Le carnaval, c'est trois couleurs saturées à parts égales, des italiques penchées et des étincelles.

**Corollaire non négociable** : une police à **chiffres tabulaires** pour vitesse, hauteur, G, rang et score. Sans `font-variant-numeric: tabular-nums`, les compteurs et classements sautillent à chaque mise à jour. C'est le détail qui sépare un site de données d'un site amateur.

### 4.4 Traitement photo

- **Silhouette contre ciel** : baisser l'angle élimine les avant-plans parasites, la négative space d'un coucher de soleil donne l'échelle. C'est LE cadrage signature du coaster.
- **Motion blur** : 1/800 pour figer, ~1/30 pour filer. Alterner plan large (l'ampleur du tracé) et détail (la structure). <https://expertphotography.com/motion-blur>
- **Duotone + grain : le vrai levier pour un site UGC.** Seule technique qui rende cohérentes 22 871 photos prises par 25 000 personnes, et qui garantisse qu'un hero ne concurrence jamais le texte posé dessus. Implémentation : `filter: grayscale()` + `mix-blend-mode`, ou SVG `feColorMatrix`+`feBlend` (plus précis). <https://designmodo.com/duotone-website-design/>
- **Dosage** : duotone réservé aux **surfaces de chrome** (hero de section, cartes de catégorie, en-tête de classement) ; **photo native intacte sur les fiches et les galeries**. Le rider veut voir sa photo telle qu'il l'a prise — la retoucher serait une insulte au contributeur. Tinte **constante** sur tout le site : un traitement variable lit comme un filtre aléatoire.

### 4.5 Gamification : ce qu'il ne faut surtout pas faire

Le contre-exemple est dans le voisinage direct : **Untappd**. Analyse longitudinale ACM 2020-2025 — cinq familles de badges problématiques (ABV, streaks, quantité, heure, lieu), aucun changement structurel en cinq ans <https://arxiv.org/html/2601.04841v1>. Critique métier : les badges *« récompensent le volume »*.

- **Ne jamais récompenser le nombre de credits** — le « credit whoring » est déjà une friction communautaire. Récompenser la **couverture** (pays, constructeurs, types), la **rareté** (coasters disparus, prototypes) et la **contribution** (photos, données).
- **Zéro streak quotidien** (aller dans un parc n'est pas quotidien) et **zéro ligue avec relégation**. Streak anxiety documentée : les utilisateurs finissent par juger le maintien du streak plus important que l'activité. <https://thedecisionlab.com/insights/consumer-insights/streak-creep-the-perils-of-too-much-gamification>
- « Pointsification » ≠ gamification : points et badges seuls exposent à l'effet de surjustification. <https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2023.1212994/full>
- À la place : **jauges de complétion** (clôture Gestalt, modèle Activity Rings), badges auto-narratifs de couverture/rareté, **saisons** annuelles.

### 4.6 Carte : de localisateur à planificateur de trip

- **MapLibre GL JS v5** (la v6 est en pré-release). Le gain décisif face à Leaflet n'est **pas la perf** mais le **styling data-driven** : taille/couleur du pin selon le nombre de coasters, le statut fait/pas-fait, le rang mondial. Leaflet ne sait pas le faire proprement. <https://maplibre.org/maplibre-gl-js/docs/guides/leaflet-migration-guide/>
- **Tuiles** : **OpenFreeMap** tout de suite (aucune limite, aucune clé, aucun cookie — <https://openfreemap.org/>), **Protomaps + PMTiles** en cible (le basemap devient un fichier statique lu en HTTP range requests ; monde entier au zoom 5 = 17 Mo). **Ne jamais mettre 25 000 riders sur un compteur Mapbox** (50 000 map loads gratuits/mois puis 0,50-5 $/1 000). Fond sombre sans clé : **CARTO Dark Matter** (le clone utilise déjà Voyager, même famille).
- **Clustering : non-sujet de perf** (Supercluster gère 400 000 points à 60 fps). Avec ~1 800 parcs, c'est un choix de lisibilité.
- **Piège dataviz en dark** : le biais « sombre = plus » persiste — il faut souvent **inverser la rampe** pour que les valeurs hautes soient les plus claires. <https://link.springer.com/article/10.1007/s42489-024-00171-z>
- Filtres qui transforment la carte en planificateur : « parcs où j'ai des credits / qu'il me reste », « ouverts aujourd'hui », « nouveautés 2026 », « ≥ 1 coaster du top 100 ». Mobile : **bottom sheet non-modale persistante** (pattern Google/Apple Maps).

---

## 5. Accessibilité et performance : les pièges du spectaculaire

Une direction spectaculaire échoue toujours aux mêmes trois endroits : du texte sur photo, du
mouvement non demandé, et 4 Mo d'images.

### 5.1 Contraste sur photo

- **Norme applicable : WCAG 2.2.** APCA n'est **pas** normatif — retiré du draft WCAG 3 en juillet 2023 ; en avril 2026 le W3C écrit encore *« the contrast algorithm used in WCAG 3 is yet to be determined »*, et WCAG 3 n'est pas attendu avant 2030. Si on veut utiliser APCA, choisir des couleurs qui passent **les deux**. <https://adrianroselli.com/2026/04/wcag3-contrast-as-of-april-2026.html>
- Seuils : **4.5:1** texte courant, **3:1** grand texte. Ne pas oublier **1.4.11 Non-text Contrast (3:1)** qui s'applique aux **marqueurs de carte, icônes de notation, contrôles de zoom, indicateurs de focus**.
- Fiabilité décroissante : **bloc de couleur / texte sous la photo** (100 % testable) > **scrim uniforme** (calculé sur le pixel le plus clair) > **gradient** (piège : la dernière ligne dépasse dans la zone transparente) > **`backdrop-filter`** (le flou d'un ciel blanc reste blanc — combiner avec `brightness(.5)`) > **`text-shadow` seul, à proscrire** comme moyen de conformité : aucune méthode normative de mesure (issue w3c/wcag#98 fermée *deferred*). <https://www.smashingmagazine.com/2023/08/designing-accessible-text-over-images-part1/>
- **Contrainte structurante : vous ne contrôlez pas les 22 871 photos.** Ciels blancs, coasters blancs surexposés. **Le scrim doit être dimensionné pour le pire cas** — ≥ 50 % ou bandeau opaque sur tout texte posé sur de l'UGC. Malin : calculer la luminance de la zone de crop à l'upload et stocker un flag `needs_heavy_scrim`.

### 5.2 Motion et mal des transports (ironique, mais réel)

- Déclencheurs nommés : **parallaxe, scroll-jacking, zooms 3D, wipes plein écran, scroll horizontal, carrousels autoplay, toute translation sur grande surface**. On garde : opacité, couleur, blur, micro-mouvements localisés. <https://alistapart.com/article/designing-safer-web-animation-for-motion-sensitivity/>
- Pattern idiomatique MDN : **substituer une animation en opacité, pas `animation: none` partout**. Et `prefers-reduced-motion` est un réglage **système** → **prévoir aussi un interrupteur dans les préférences du site** (la page paramètres existe déjà).
- **2.2.2 Pause Stop Hide est niveau A, donc obligatoire** : tout mouvement auto > 5 s doit avoir pause/stop/hide. **Une vidéo de fond en boucle tombe dessus : bouton pause obligatoire.** **2.3.3 (AAA)** cite le parallax au scroll nommément comme échec sans interrupteur.
- **2.3.1 Three Flashes (A)** : > 3 flashs/s. Directement pertinent pour les **POV de coaster** (stroboscopie de tunnels). Les POV doivent être **click-to-play**, jamais autoplay, jamais en fond.

### 5.3 Images et Core Web Vitals

- **WebP par défaut dans le pipeline d'upload, AVIF réservé aux hero et grandes photos éditoriales.** WebP ~97 % de couverture, AVIF ~93 % et 15-40 % plus léger, mais **5 à 47× plus lent à encoder** — encoder 22 871 photos UGC en AVIF est un piège budgétaire. Pattern `<picture>` AVIF → WebP → JPEG.
- **Piège LCP n°1** : *« Never lazy-load your LCP image »*. **Piège n°2** : utiliser `<img>` et non `background-image` pour le hero, sinon il est invisible au preload scanner. `fetchpriority="high"` sur **une seule** image. `width`/`height` sur chaque `<img>` (levier CLS n°1). <https://web.dev/articles/optimize-lcp>
- Seuils au 75e percentile : **LCP ≤ 2,5 s**, **INP ≤ 200 ms**, **CLS ≤ 0,1**. Décomposition LCP : TTFB ~40 %, load duration ~40 % → **< 250 ms avant le début du fetch du hero**.
- Page médiane 2025 : 2,86 Mo desktop / 2,56 Mo mobile, +8 %/an, images premier poste <https://almanac.httparchive.org/en/2025/page-weight>. **Budget proposé** : hero ≤ 200 Ko (400 Ko max en AVIF grand écran), image de contenu ≤ 150 Ko, home ≤ 1,5 Mo, ≤ 50 requêtes. 1920×1080 suffit.
- **CDN d'images à la volée indispensable pour de l'UGC** (Cloudflare Images / imgproxy / Thumbor) : variantes `srcset` à la demande + négociation de format via `Accept`, plutôt que 8 dérivés stockés par photo. **Placeholders : LQIP inline** (16-32 px, 200-500 octets en data URI), **pas BlurHash** — qui exige un décodage JS et contredit l'objectif INP.
- **INP** : le vrai risque ici, c'est le classement de 2 000 lignes et la carte de 1 786 marqueurs → virtualisation, clustering, filtres débattus, pas de re-render complet à chaque frappe.

### 5.4 Dark mode

- **Pas de `#000` pur.** Base `#121212` (le gris foncé permet d'exprimer l'élévation), texte `rgba(255,255,255,.87)` / `.60`. Élévation **par surfaces** (overlay blanc dont l'opacité croît), pas par ombres. **Désaturer les accents** : l'ambre de marque a besoin d'une variante dark éclaircie. <https://design.google/library/material-design-dark-theme>
- **Point le plus sensible ici : tout le site est photo.** Ne jamais appliquer un `filter: brightness(.8)` global (ça dégrade le contraste du texte en overlay et trahit le contenu) ; préférer une bordure `1px solid rgba(255,255,255,.08)` pour détacher la photo de la surface. Et se rappeler qu'**un hero de ciel bleu plein écran annule le bénéfice du dark mode**.
- Implémentation : `color-scheme: light dark` sur `:root`, `light-dark()` (~95 % de support). **Pattern 3 états** : palette complète sur `:root` nu, redéfinie sous `@media (prefers-color-scheme: dark)` *et* sous `[data-theme="dark"]`, sinon le toggle ne gagne pas dans les deux sens. Appliquer le choix **avant le premier paint** via script inline dans le `<head>`.

### 5.5 Pièges spécifiques aux patterns retenus

| Pattern | Piège | Parade |
|---|---|---|
| Bento grid | Ordre DOM ≠ ordre visuel → lecteurs d'écran perdus | Ordre DOM = ordre de lecture, `grid-area` pour la seule mise en forme |
| Carte plein écran | Keyboard trap (SC 2.1.1) | **Générer l'alternative liste des marqueurs du viewport** — le split map/liste la fournit gratuitement |
| Filtres en chips | État invisible pour lecteur d'écran | `aria-live` sur le compteur, chips supprimables au clavier |
| Score coloré en HSL (existant) | La couleur seule porte l'information | Toujours doubler par le chiffre + un libellé |
| Duel / swipe | Inutilisable au clavier | Boutons explicites + raccourcis ←/→, swipe en supplément |
| Grandes typos display | Illisibles à 200 % de zoom, mauvaises en 4 langues | Tester le display avec « Achterbahn-Weltrangliste » **avant** de le choisir |

---

## 6. Trois directions candidates

Elles ne diffèrent pas par la couleur mais par **ce qu'on décide que Captain Coaster est** :
un spectacle, une autorité, ou un instrument. Tout le reste en découle.

### Direction A — « Nuit & Adrénaline » — *le parti motorsport*

**Parti pris.** Captain Coaster est un **spectacle**. La photo occupe le cadre, la donnée devient
graphique, le duel est l'écran héros. On emprunte le langage du sport mécanique, pas celui du parc.
La home n'est plus un tableau de bord : c'est une silhouette contre le ciel, un rang énorme, et un
bouton « Duel ».

**Palette.** Nuit désaturée `#0E1014` → `#171A21` (jamais `#000`), texte `rgba(255,255,255,.87)`,
**un seul accent chaud** — ambre incandescent `oklch(76% 0.17 62)` — réservé au score et au rang.
Élévation par surfaces claires superposées. Un token de teinte par constructeur (modèle Efteling)
pour colorer les pages de famille sans casser le système.

**Typo.** Trois étages, modèle F1 : **Archivo** en labeur (200+ langues, indispensable pour EN/FR/ES/DE),
**Archivo Expanded** en display pour les noms et les rangs, **chiffres tabulaires partout**. Zéro italique.

**Photos.** Plein cadre, contraste poussé, silhouette contre ciel privilégiée. Scrim ≥ 50 % dès qu'un
texte se pose dessus. **Duotone ambre/nuit sur les surfaces de chrome uniquement** ; photo native
intacte sur les fiches et les galeries.

**Inspiration.** Phantasialand (`#262D49` + `#f3a154`), F1 (Regular/Wide/Digits), B&M (noir + un rouge),
Red Bull (le jaune en ponctuation), Letterboxd pour la structure.

**Pour qui / pour quoi.** C'est la direction qui rend le mieux le **mode duel**, la **fiche coaster** et
le **partage social**. Celle qui recrute : un écran de duel en nuit et ambre se poste.

**Ce qu'on perd.** C'est la plus proche du *Linear look* — dark + un accent est le défaut de 3/4 du SaaS
en 2026 : si l'exécution est molle, ça vieillit en 18 mois. La plus dure à tenir sur les listes denses.
Et un ciel bleu en hero annule le bénéfice du dark mode.

### Direction B — « Le Guide » — *le parti éditorial papier*

**Parti pris.** Captain Coaster est une **autorité** : *le* classement mondial, le Michelin des coasters.
On assume le clair, le papier, la mise en page de magazine sportif. Le classement se lit comme un
palmarès. Les Tops des riders deviennent des articles.

**Palette.** Papier crème `#F6F2EA`, encre `#14120F`, **rouge d'imprimeur** `oklch(53% 0.19 27)` pour
les rangs et les accents, un vert sourd pour les états positifs. Filets fins, pas de cartes flottantes,
pas d'ombres. Grain SVG léger sur les aplats — le signal anti-slop de 2026. Dark mode disponible mais
**secondaire et sépia**, jamais le défaut.

**Typo.** **Fraunces** ou **Instrument Serif** en display (rangs, titres, chapô) contre **Inclusive Sans**
ou **Archivo** en texte courant. Le contraste serif/sans porte 80 % de la différenciation. Numéros de
rang gigantesques, à la Rolling Stone 500.

**Photos.** Traitées comme des photos de magazine : pleine page, cadrages larges alternés avec des
détails de structure, **légendes créditées visibles** (le crédit auteur est déjà dans les données —
l'afficher est un geste éditorial *et* communautaire). Noir et blanc contrasté sur les ouvertures de
section, couleur intacte partout ailleurs.

**Inspiration.** The Athletic, Letterboxd pour la structure des listes, Rolling Stone 500, RCDB pour
les angles éditoriaux, Queue-Times pour la sobriété des chiffres héros.

**Pour qui / pour quoi.** La direction qui donne le plus de **crédibilité au classement** et valorise
le mieux les **avis** et les **Tops**. La plus durable — le papier ne se démode pas. La meilleure en
accessibilité (texte sur fond uni par défaut).

**Ce qu'on perd.** L'adrénaline. Elle exige de la **discipline éditoriale et du contenu** : un guide
sans texte est une coquille. Et elle rend le duel moins spectaculaire — il devient un intermède.

### Direction C — « L'Atlas » — *le parti instrument*

**Parti pris.** Le contre-pied assumé : ni magazine ni show, **l'instrument des riders**. On inverse la
structure — **la carte devient la home**, pas une page de menu. On ne visite pas un classement, on
planifie un voyage. Rapidité, clavier, densité choisie, zéro chrome inutile.

**Palette.** Neutres froids, `#0F1115` en dark et `#FAFAFA` en clair traités à égalité (`light-dark()`,
choix appliqué avant le premier paint). Couleur **strictement fonctionnelle** : une rampe de score,
un vert « fait », un ambre « à faire ». Aucun accent décoratif. Fond CARTO Dark Matter sans labels
superflus, pins data-driven.

**Typo.** **Geist** ou **Inter** en labeur assumé + **Geist Mono** pour tous les chiffres — la mono
comme signature technique, pas comme coquetterie. Hiérarchie par le poids et l'espace, pas par la
taille. Le spectacle vient exclusivement de la photo et de la carte.

**Photos.** Peu nombreuses mais énormes : une photo pleine largeur par écran, jamais de vignettes 96 px.
Aucun traitement, aucune teinte — la photo est une donnée, restituée telle quelle.

**Inspiration.** Linear (lignes de 36 px, clavier d'abord, presque pas de chrome), FBref (percentiles),
Komoot Discover et Strava Heatmap, RCDB pour les angles, MapLibre + PMTiles pour la technique.

**Pour qui / pour quoi.** Les **hardcore riders** — 300 credits, trips à planifier, modèles à comparer.
La plus efficace sur mobile, la plus rapide, de loin la plus facile à faire performer (LCP, INP).
Celle qui exploite le mieux la carte, aujourd'hui la page la plus sous-utilisée du site.

**Ce qu'on perd.** Elle ne règle pas frontalement le procès « c'est terne » — elle le retourne en
« c'est un outil sérieux ». Si l'exécution rate, on a refait un back-office avec une meilleure police.
Et c'est la moins partageable : il n'y a pas d'écran à poster.

### Mon avis, puisqu'il est demandé

**A pour recruter, B pour durer, C pour servir.** Le choix n'est pas esthétique, il est stratégique.
Si l'objectif est la croissance de la communauté : **A** — le duel et le récap annuel sont les deux
seuls écrans partageables du produit, et A est la seule direction qui les traite comme des affiches.
Si l'objectif est de faire du classement une référence citée hors de la communauté : **B**.
**C** est le meilleur produit pour les utilisateurs existants et le pire argument de refonte, parce
que personne ne regarde une capture de C en disant « ah, enfin ».

Le piège serait le compromis mou : dark + serif + carte + un peu de tout. C'est la définition exacte
du slop de 2026 — le défaut statistique qui ne communique rien.
