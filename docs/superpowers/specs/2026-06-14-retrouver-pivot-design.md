# Spec — Pivot « Retrouver » (objets / animaux / personnes)

Date : 2026-06-14
Base : repo `lost-and-found` (React+TS+Vite / Express+Prisma+Zod)
Mode workflow : ship-balanced (tests unitaires, TDD back, commits propres)

## 1. Objectif & périmètre

Transformer l'application « Lost & Found » (objets uniquement) en plateforme
**« Retrouver »** : signalement perdu/trouvé pour **objets, animaux et personnes**,
dédiée au contexte africain.

### Directions par type (asymétrique)

| Type        | Directions                       | Réponse associée            |
|-------------|----------------------------------|-----------------------------|
| 📦 Objets   | perdu + trouvé                   | revendication (CLAIM) sur trouvé |
| 🐾 Animaux  | perdu + trouvé/recueilli         | revendication (CLAIM) sur trouvé |
| 🧑 Personnes| disparition + « vu ici »         | signalement localisation (SIGHTING) |

Pour les personnes : pas de fiche « personne trouvée ». On publie un **avis de
disparition** ; les autres rapportent un **signalement « vu ici »** (SIGHTING).

### Décisions transverses

- **Langue** : français seul (pas d'i18n).
- **Contact** : téléphone obligatoire + lien WhatsApp (clic-to-chat), email secondaire.
  Coordonnées visibles **uniquement après connexion** (tous types).
- **Géo** : pays → région/ville en champs texte structurés. Pas de carte.
- **AI search (Gemini)** : retirée du périmètre, code supprimé.
- **Claims + dashboard admin + rôles User/Admin** : conservés, étendus aux 3 types.
- **Marque** : « Retrouver ».
- **Données existantes** : migrées via script vers le nouveau schéma.

### Phasage (front d'abord)

1. **Phase 1 — Frontend** : navbar, routes, pages des 3 types, formulaires,
   composants génériques ; branchement progressif sur l'API.
2. **Phase 2 — Backend** : schéma Prisma, modules, routes, validations, migration
   des données, tests.

Chaque phase aura son propre plan d'implémentation (skill writing-plans).

## 2. Modèle de données (Approche unifiée `Listing`)

Entité polymorphe `Listing` + entité `Response` pour les réponses (claim/sighting).

```
Listing(
  id, type, direction,
  title, description,
  country, region, city,
  date, photoUrl,
  contactPhone, contactWhatsapp,            // visibles si connecté
  category?,                                 // objets (relation Category)
  species?, breed?, color?,                  // animaux
  age?, gender?, lastSeenDetails?,           // personnes
  userId, status, isResolved,
  isDeleted, deletedAt, createdAt, updatedAt
)

Response(
  id, listingId, kind,                       // CLAIM | SIGHTING
  authorId, message,
  distinguishingFeatures?,                    // claim
  sightingLocation?, sightingDate?,           // sighting
  status,                                      // PENDING | APPROVED | REJECTED
  isDeleted, deletedAt, createdAt, updatedAt
)

Category(id, name, createdAt, updatedAt)      // surtout objets
User(... inchangé : username, email, password, role, userImg, activated, isDeleted)

enum ListingType      { OBJECT, ANIMAL, PERSON }
enum ListingDirection { LOST, FOUND, MISSING }
enum ResponseKind     { CLAIM, SIGHTING }
enum status           { PENDING, APPROVED, REJECTED }
enum userRole         { ADMIN, USER }
```

Règles de cohérence (validées côté back) :
- `direction=MISSING` ⇔ `type=PERSON`. `direction ∈ {LOST,FOUND}` ⇔ `type ∈ {OBJECT,ANIMAL}`.
- `kind=CLAIM` cible un `Listing` `direction=FOUND`. `kind=SIGHTING` cible un `Listing` `direction=MISSING`.

## 3. Frontend

### Navbar (structure A — groupé par type)

```
🔎 Retrouver | Accueil | 📦 Objets ▾ | 🐾 Animaux ▾ | 🧑 Personnes ▾ | À propos | [Connexion/Avatar]

Objets ▾     → Parcourir les objets · Signaler un objet perdu · Signaler un objet trouvé
Animaux ▾    → Parcourir les animaux · Signaler un animal perdu · Signaler un animal recueilli
Personnes ▾  → Avis de disparition · Signaler une disparition · Signaler « vu ici »
```

Dropdown avatar (connecté) : Mes annonces · Mes réponses · Paramètres ·
Dashboard (si ADMIN) · Déconnexion.
Sur mobile : dropdowns repliés dans le menu burger (Flowbite `NavbarCollapse`).

### Carte des routes

```
/                                Accueil (hero + récents par type + stats)
/objets         ?direction=lost|found     catalogue + filtres
/objets/:id                      détail + Revendiquer / WhatsApp (si connecté)
/objets/signaler ?direction=lost|found    formulaire
/animaux , /animaux/:id , /animaux/signaler   idem objets
/personnes      ?direction=missing        avis de disparition (liste)
/personnes/:id                   détail + « Je l'ai vu » / WhatsApp (si connecté)
/personnes/signaler              formulaire disparition
/personnes/:id/vu                formulaire signalement « vu ici »
/login  /register  /a-propos
/mon-espace/*                    mes annonces, mes réponses
/dashboard/*                     admin : annonces, réponses, users, catégories, stats, paramètres
(supprimé : /ai-search)
```

### Composants génériques (DRY, alignés sur `Listing`)

- `ListingList` — paramétré par `type`/`direction` ; filtres pays/région/ville/catégorie/date.
- `ListingCard` — vignette annonce.
- `ListingDetail` — détail + bloc réponse (claim/sighting) + contact conditionnel connexion.
- `ListingForm` — champs conditionnels selon `type` (catégorie / espèce-race-couleur / âge-genre-tenue).
- `ResponseForm` — variante CLAIM ou SIGHTING.

### Réutilisation existant

Conservés : Tailwind + Flowbite, Redux Toolkit + RTK Query (`baseApi`),
structure dashboard, auth JWT côté front. Les slices API sont réécrits vers les
nouvelles routes `listings`/`responses`.

## 4. Backend

### Modules

```
modules/listing/    listing.controller|service|validate   CRUD 3 types + filtres
modules/response/   response.controller|service|validate  claims + sightings
modules/category/   (issu de itemCategory, conservé)
modules/user/ + auth/   inchangés (JWT, rôles)
supprimés : modules/aiSearch/, foundItems/, lostItem/, claim/  (fusionnés)
```

### Routes API

```
POST   /listings                 auth        créer (type+direction body, validé)
GET    /listings                 public      ?type=&direction=&country=&region=&city=&category=
GET    /listings/:id             public      (contact masqué si non connecté)
PUT    /listings/:id             auth        owner|admin
DELETE /listings/:id             auth        owner|admin (soft delete)
PUT    /listings/:id/resolve     auth        owner|admin (marquer résolu)

POST   /listings/:id/responses   auth        claim ou sighting selon direction
GET    /responses                auth(admin) tous
GET    /my/responses             auth        les miens
PUT    /responses/:id            auth        owner du listing|admin → statut

GET    /admin/stats              auth(admin) étendu aux 3 types
PUT    /block/user/:id           auth(admin)
PUT    /change-role/:id          auth(admin)
DELETE /delete-user/:id          auth(admin)
POST   /register  POST /login  POST /change-password|email|username   (inchangés)
GET/POST/PUT/DELETE /item-categories   auth(admin pour mutations)
```

### Validation (Zod `superRefine`)

- Cohérence `type`/`direction` (cf. §2).
- Champs requis conditionnels : personne → âge+genre ; animal → espèce ; objet → catégorie.
- `contactPhone` requis ; `contactWhatsapp` optionnel.

### Sécurité

- Toutes les mutations derrière `auth()` (l'actuel `/ai-search` sans auth disparaît).
- Contrôle **owner-or-admin** sur edit/delete/resolve/statut réponse.
- Coordonnées de contact renvoyées **seulement** si requête authentifiée.
- Personnes = données sensibles : contact jamais exposé sans connexion.

### Migration des données

Script Prisma/Node convertissant l'existant :
- `FoundItem` → `Listing(type=OBJECT, direction=FOUND)`
- `LostItem`  → `Listing(type=OBJECT, direction=LOST)`
- `Claim`     → `Response(kind=CLAIM)`
- `ItemCategory` → `Category`
- `User` conservé tel quel.

## 5. Tests & qualité

- Mode ship-balanced : pas de `--no-verify`.
- Back : TDD sur services (validation conditionnelle, filtres, owner-check,
  cohérence type/direction) + tests des routes clés.
- Front : tests unitaires composants génériques (rendu conditionnel par type,
  masquage contact selon auth).
- Serena snapshot avant le refactor backend significatif.

## 6. Hors périmètre (YAGNI)

- Recherche IA / Gemini.
- Carte interactive / géolocalisation GPS.
- Messagerie in-app (contact via tél/WhatsApp).
- i18n / multilingue.
- Notifications push/SMS.
```
