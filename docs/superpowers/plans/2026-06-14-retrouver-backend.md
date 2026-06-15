# Pivot « Retrouver » — Phase 2 Backend — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refondre le backend Express+Prisma+Zod de « Lost & Found » (objets) en « Retrouver » : modèle `Listing` polymorphe + `Response`, modules listing/response/category, sécurité owner-or-admin, migration des données existantes.

**Architecture:** Schéma Prisma unifié `Listing` (type × direction) + `Response` (CLAIM|SIGHTING) + `Category` + `User` (inchangé). Modules par feature suivant le pattern existant (`*.service.ts` / `*.controller.ts` / `*.validate.ts`). Validation Zod conditionnelle (`superRefine`) pour la cohérence type/direction et les champs requis par type. Garde `requireAuth`/`requireAdmin` + helper owner-or-admin. Contact renvoyé seulement aux requêtes authentifiées.

**Tech Stack:** Node, Express 4, Prisma (client v6), PostgreSQL, Zod, jsonwebtoken, bcrypt, http-status-codes. Tests : Vitest.

**Périmètre :** Backend uniquement. Implémente le contrat API consommé par le frontend Phase 1 (`/api/listings`, `/api/responses`). La feature AI search (`@google/generative-ai`) est supprimée.

**Référence spec :** `docs/superpowers/specs/2026-06-14-retrouver-pivot-design.md` (§2, §4).

**Conventions existantes à respecter (lire avant de coder) :**
- `src/app/global/response.ts` — `sendResponse(res, { statusCode, success, message, data, meta? })`.
- `src/app/global/error.ts` — `AppError(statusCode, message)`.
- `src/app/midddlewares/errorHandler.ts` (noter l'orthographe `midddlewares`) gère déjà `ZodError`, `AppError`, erreurs Prisma.
- `src/app/midddlewares/auth.ts` — `auth()` lit `req.headers.authorization`, set `req.user = verifyToken(token)` (JwtPayload avec `id`, `role`, `email`).
- `src/app/midddlewares/validate.ts` — `validateRequest(schema)` parse `{ body }`.
- `src/app/config/prisma.ts` — exporte le client Prisma (default).
- Services prennent les données + `userId`/`user` et appellent `prisma`.

---

## Structure des fichiers

Créés :
- `server/vitest.config.ts`, `server/src/test/setup.ts`
- `server/src/app/modules/listing/listing.validate.ts` (+ `.test.ts`)
- `server/src/app/modules/listing/listing.service.ts`
- `server/src/app/modules/listing/listing.controller.ts`
- `server/src/app/modules/response/response.validate.ts` (+ `.test.ts`)
- `server/src/app/modules/response/response.service.ts`
- `server/src/app/modules/response/response.controller.ts`
- `server/src/app/modules/category/category.service.ts`, `category.controller.ts`, `category.validate.ts`
- `server/src/app/utils/authz.ts` (+ `.test.ts`) — helpers de droits
- `server/src/app/midddlewares/requireAdmin.ts` (+ `.test.ts`)
- `server/prisma/migrations/...` (générées par `prisma migrate`)
- `server/scripts/migrate-data.ts` — conversion des données existantes
- `server/src/app/utils/listingDomain.ts` (+ `.test.ts`) — règles de cohérence type/direction partagées

Modifiés :
- `server/prisma/schema.prisma` — modèles Listing/Response/Category + enums
- `server/src/app/routes/routes.ts` — nouvelles routes
- `server/package.json` — scripts test, retrait `@google/generative-ai`
- `server/src/app/utils/utils.ts` — `calculateMeta` générique (ne plus dépendre de `foundItem`)

Supprimés :
- `server/src/app/modules/aiSearch/`, `foundItems/`, `lostItem/`, `claim/`, `itemCategory/` (remplacés)

---

## Task 1: Infra de test backend (Vitest)

**Files:**
- Modify: `server/package.json`
- Create: `server/vitest.config.ts`
- Create: `server/src/test/setup.ts`
- Create: `server/src/test/sanity.test.ts`

- [ ] **Step 1: Installer Vitest**

Run (depuis `server/`) :
```bash
npm i -D vitest
```

- [ ] **Step 2: Créer `server/vitest.config.ts`**

```ts
/// <reference types="vitest" />
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.ts", "scripts/**/*.test.ts"],
  },
});
```

- [ ] **Step 3: Créer `server/src/test/setup.ts`**

```ts
import dotenv from "dotenv";
dotenv.config();
```

- [ ] **Step 4: Ajouter les scripts dans `server/package.json`**

Remplacer la ligne `"test": "echo \"Error: no test specified\" && exit 1",` par :
```json
"test": "vitest run",
"test:watch": "vitest",
```

- [ ] **Step 5: Sanity test `server/src/test/sanity.test.ts`**

```ts
import { describe, it, expect } from "vitest";
describe("infra", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 6: Lancer**

Run: `npm test`
Expected: 1 test passé.

- [ ] **Step 7: Commit**

```bash
git add server/package.json server/package-lock.json server/vitest.config.ts server/src/test
git commit -m "test: setup Vitest backend"
```

---

## Task 2: Règles de domaine type/direction (TDD, pure)

**Files:**
- Create: `server/src/app/utils/listingDomain.ts`
- Test: `server/src/app/utils/listingDomain.test.ts`

- [ ] **Step 1: Écrire le test**

```ts
import { describe, it, expect } from "vitest";
import {
  isDirectionValidForType,
  responseKindForDirection,
  requiredFieldsForType,
} from "./listingDomain";

describe("listingDomain", () => {
  it("PERSON n'accepte que MISSING", () => {
    expect(isDirectionValidForType("PERSON", "MISSING")).toBe(true);
    expect(isDirectionValidForType("PERSON", "LOST")).toBe(false);
    expect(isDirectionValidForType("PERSON", "FOUND")).toBe(false);
  });
  it("OBJECT/ANIMAL acceptent LOST et FOUND mais pas MISSING", () => {
    expect(isDirectionValidForType("OBJECT", "LOST")).toBe(true);
    expect(isDirectionValidForType("OBJECT", "FOUND")).toBe(true);
    expect(isDirectionValidForType("OBJECT", "MISSING")).toBe(false);
    expect(isDirectionValidForType("ANIMAL", "FOUND")).toBe(true);
    expect(isDirectionValidForType("ANIMAL", "MISSING")).toBe(false);
  });
  it("kind de réponse selon direction", () => {
    expect(responseKindForDirection("MISSING")).toBe("SIGHTING");
    expect(responseKindForDirection("FOUND")).toBe("CLAIM");
    expect(responseKindForDirection("LOST")).toBe("CLAIM");
  });
  it("champs requis par type", () => {
    expect(requiredFieldsForType("OBJECT")).toContain("categoryId");
    expect(requiredFieldsForType("ANIMAL")).toContain("species");
    expect(requiredFieldsForType("PERSON")).toEqual(
      expect.arrayContaining(["age", "gender"])
    );
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run src/app/utils/listingDomain.test.ts`
Expected: FAIL (module introuvable).

- [ ] **Step 3: Implémenter `server/src/app/utils/listingDomain.ts`**

```ts
export type ListingType = "OBJECT" | "ANIMAL" | "PERSON";
export type ListingDirection = "LOST" | "FOUND" | "MISSING";
export type ResponseKind = "CLAIM" | "SIGHTING";

export function isDirectionValidForType(
  type: ListingType,
  direction: ListingDirection
): boolean {
  if (type === "PERSON") return direction === "MISSING";
  return direction === "LOST" || direction === "FOUND";
}

export function responseKindForDirection(
  direction: ListingDirection
): ResponseKind {
  return direction === "MISSING" ? "SIGHTING" : "CLAIM";
}

export function requiredFieldsForType(type: ListingType): string[] {
  switch (type) {
    case "OBJECT":
      return ["categoryId"];
    case "ANIMAL":
      return ["species"];
    case "PERSON":
      return ["age", "gender"];
  }
}
```

- [ ] **Step 4: Vérifier le succès**

Run: `npx vitest run src/app/utils/listingDomain.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add server/src/app/utils/listingDomain.ts server/src/app/utils/listingDomain.test.ts
git commit -m "feat: règles domaine type/direction backend"
```

---

## Task 3: Schéma Prisma Listing/Response/Category

**Files:**
- Modify: `server/prisma/schema.prisma`

- [ ] **Step 1: Réécrire les modèles métier dans `server/prisma/schema.prisma`**

Conserver `generator client` et `datasource db` tels quels. Conserver `model User` mais remplacer ses relations `foundItem`/`claim`/`LostItem` par `listings Listing[]` et `responses Response[]`. Remplacer `ItemCategory`/`FoundItem`/`LostItem`/`Claim` par :
```prisma
model User {
  id        String     @id @default(uuid())
  name      String     @default("")
  username  String     @unique
  email     String     @unique
  activated Boolean    @default(true)
  password  String
  role      userRole   @default(USER)
  userImg   String     @default("")
  isDeleted Boolean    @default(false)
  deletedAt DateTime?
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  listings  Listing[]
  responses Response[]

  @@map("users")
}

model Category {
  id        String    @id @default(uuid())
  name      String
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  listings  Listing[]

  @@map("categories")
}

model Listing {
  id              String           @id @default(uuid())
  type            ListingType
  direction       ListingDirection
  title           String
  description     String           @default("")
  country         String
  region          String           @default("")
  city            String           @default("")
  date            DateTime         @default(now())
  photoUrl        String           @default("")
  contactPhone    String
  contactWhatsapp String           @default("")
  categoryId      String?
  category        Category?        @relation(fields: [categoryId], references: [id])
  species         String?
  breed           String?
  color           String?
  age             Int?
  gender          String?
  lastSeenDetails String?
  userId          String
  user            User             @relation(fields: [userId], references: [id])
  status          status           @default(PENDING)
  isResolved      Boolean          @default(false)
  isDeleted       Boolean          @default(false)
  deletedAt       DateTime?
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  responses       Response[]

  @@map("listings")
}

model Response {
  id                     String       @id @default(uuid())
  listingId              String
  listing                Listing      @relation(fields: [listingId], references: [id])
  kind                   ResponseKind
  authorId               String
  author                 User         @relation(fields: [authorId], references: [id])
  message                String
  distinguishingFeatures String?
  sightingLocation       String?
  sightingDate           DateTime?
  status                 status       @default(PENDING)
  isDeleted              Boolean      @default(false)
  deletedAt              DateTime?
  createdAt              DateTime     @default(now())
  updatedAt              DateTime     @updatedAt

  @@map("responses")
}

enum ListingType {
  OBJECT
  ANIMAL
  PERSON
}

enum ListingDirection {
  LOST
  FOUND
  MISSING
}

enum ResponseKind {
  CLAIM
  SIGHTING
}

enum status {
  PENDING
  APPROVED
  REJECTED
}

enum userRole {
  ADMIN
  USER
}
```
Note : `User.responses` référence `Response.author` — la relation porte sur `authorId`. Si Prisma exige un nom de relation explicite (plusieurs relations vers User), garder une seule relation User↔Response via `author`.

- [ ] **Step 2: Valider et générer le client**

Run: `npx prisma validate`
Expected: "The schema is valid".
Run: `npx prisma generate`
Expected: génération du client sans erreur.

- [ ] **Step 3: Vérifier la compilation TypeScript des types**

Run: `npx tsc --noEmit`
Expected: échouera sur les anciens modules (foundItems/lostItem/claim) qui référencent les modèles supprimés — c'est attendu ; ces modules seront supprimés en Task 9. Noter les erreurs et continuer. (Si tu veux un point de contrôle vert, exécute `npx prisma validate` qui doit passer.)

- [ ] **Step 4: Commit**

```bash
git add server/prisma/schema.prisma
git commit -m "feat: schéma Prisma Listing/Response/Category"
```

---

## Task 4: Helpers d'autorisation owner-or-admin (TDD, pure)

**Files:**
- Create: `server/src/app/utils/authz.ts`
- Test: `server/src/app/utils/authz.test.ts`

- [ ] **Step 1: Écrire le test**

```ts
import { describe, it, expect } from "vitest";
import { canMutate, isAdmin } from "./authz";

describe("authz", () => {
  it("isAdmin", () => {
    expect(isAdmin({ role: "ADMIN" })).toBe(true);
    expect(isAdmin({ role: "USER" })).toBe(false);
    expect(isAdmin(undefined)).toBe(false);
  });
  it("canMutate: owner ou admin", () => {
    expect(canMutate({ id: "u1", role: "USER" }, "u1")).toBe(true);
    expect(canMutate({ id: "u2", role: "USER" }, "u1")).toBe(false);
    expect(canMutate({ id: "u2", role: "ADMIN" }, "u1")).toBe(true);
    expect(canMutate(undefined, "u1")).toBe(false);
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run src/app/utils/authz.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implémenter `server/src/app/utils/authz.ts`**

```ts
type AuthUser = { id?: string; role?: string } | undefined;

export function isAdmin(user: AuthUser): boolean {
  return user?.role === "ADMIN";
}

export function canMutate(user: AuthUser, ownerId: string): boolean {
  if (!user) return false;
  return user.role === "ADMIN" || user.id === ownerId;
}
```

- [ ] **Step 4: Vérifier le succès**

Run: `npx vitest run src/app/utils/authz.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add server/src/app/utils/authz.ts server/src/app/utils/authz.test.ts
git commit -m "feat: helpers authz owner-or-admin"
```

---

## Task 5: Middleware requireAdmin (TDD)

**Files:**
- Create: `server/src/app/midddlewares/requireAdmin.ts`
- Test: `server/src/app/midddlewares/requireAdmin.test.ts`

- [ ] **Step 1: Écrire le test**

```ts
import { describe, it, expect, vi } from "vitest";
import requireAdmin from "./requireAdmin";
import AppError from "../global/error";

function mockReqRes(role?: string) {
  const req: any = { user: role ? { role } : undefined };
  const res: any = {};
  const next = vi.fn();
  return { req, res, next };
}

describe("requireAdmin", () => {
  it("appelle next() sans erreur si ADMIN", () => {
    const { req, res, next } = mockReqRes("ADMIN");
    requireAdmin()(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });
  it("passe une AppError 403 si non admin", () => {
    const { req, res, next } = mockReqRes("USER");
    requireAdmin()(req, res, next);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(403);
  });
  it("passe une AppError si user absent", () => {
    const { req, res, next } = mockReqRes(undefined);
    requireAdmin()(req, res, next);
    expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run src/app/midddlewares/requireAdmin.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implémenter `server/src/app/midddlewares/requireAdmin.ts`**

```ts
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import AppError from "../global/error";
import { isAdmin } from "../utils/authz";

const requireAdmin = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!isAdmin(req.user)) {
      return next(
        new AppError(StatusCodes.FORBIDDEN, "Admin access required")
      );
    }
    next();
  };
};

export default requireAdmin;
```
Note : `req.user` est typé via `src/app/interface/index.d.ts` (déjà présent dans le projet). Si le type ne porte pas `role`, l'étendre dans ce fichier d'interface.

- [ ] **Step 4: Vérifier le succès**

Run: `npx vitest run src/app/midddlewares/requireAdmin.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add server/src/app/midddlewares/requireAdmin.ts server/src/app/midddlewares/requireAdmin.test.ts
git commit -m "feat: middleware requireAdmin"
```

---

## Task 6: Validation Zod du Listing (TDD, conditionnelle)

**Files:**
- Create: `server/src/app/modules/listing/listing.validate.ts`
- Test: `server/src/app/modules/listing/listing.validate.test.ts`

- [ ] **Step 1: Écrire le test**

```ts
import { describe, it, expect } from "vitest";
import { ListingSchema } from "./listing.validate";

const ok = {
  body: {
    type: "OBJECT",
    direction: "LOST",
    title: "Sac",
    country: "Sénégal",
    contactPhone: "+221770000000",
    categoryId: "c1",
  },
};

describe("ListingSchema.create", () => {
  it("accepte un objet valide", () => {
    expect(() => ListingSchema.create.parse(ok)).not.toThrow();
  });
  it("refuse PERSON avec direction LOST", () => {
    expect(() =>
      ListingSchema.create.parse({
        body: { ...ok.body, type: "PERSON", direction: "LOST", age: 10, gender: "F" },
      })
    ).toThrow();
  });
  it("refuse PERSON sans age/gender", () => {
    expect(() =>
      ListingSchema.create.parse({
        body: { type: "PERSON", direction: "MISSING", title: "Awa", country: "Mali", contactPhone: "x" },
      })
    ).toThrow();
  });
  it("refuse ANIMAL sans species", () => {
    expect(() =>
      ListingSchema.create.parse({
        body: { type: "ANIMAL", direction: "LOST", title: "Rex", country: "Mali", contactPhone: "x" },
      })
    ).toThrow();
  });
  it("refuse OBJECT sans categoryId", () => {
    expect(() =>
      ListingSchema.create.parse({
        body: { type: "OBJECT", direction: "LOST", title: "Sac", country: "Mali", contactPhone: "x" },
      })
    ).toThrow();
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run src/app/modules/listing/listing.validate.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implémenter `server/src/app/modules/listing/listing.validate.ts`**

```ts
import { z } from "zod";
import {
  isDirectionValidForType,
  ListingType,
} from "../../utils/listingDomain";

const create = z
  .object({
    body: z.object({
      type: z.enum(["OBJECT", "ANIMAL", "PERSON"]),
      direction: z.enum(["LOST", "FOUND", "MISSING"]),
      title: z.string({ required_error: "title is required" }).min(1),
      description: z.string().optional(),
      country: z.string({ required_error: "country is required" }).min(1),
      region: z.string().optional(),
      city: z.string().optional(),
      date: z.string().optional(),
      photoUrl: z.string().optional(),
      contactPhone: z.string({ required_error: "contactPhone is required" }).min(1),
      contactWhatsapp: z.string().optional(),
      categoryId: z.string().optional(),
      species: z.string().optional(),
      breed: z.string().optional(),
      color: z.string().optional(),
      age: z.number().optional(),
      gender: z.string().optional(),
      lastSeenDetails: z.string().optional(),
    }),
  })
  .superRefine((val, ctx) => {
    const b = val.body;
    if (!isDirectionValidForType(b.type as ListingType, b.direction)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["body", "direction"],
        message: `direction ${b.direction} invalide pour le type ${b.type}`,
      });
    }
    if (b.type === "OBJECT" && !b.categoryId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["body", "categoryId"], message: "categoryId requis pour un objet" });
    }
    if (b.type === "ANIMAL" && !b.species) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["body", "species"], message: "species requis pour un animal" });
    }
    if (b.type === "PERSON") {
      if (b.age === undefined) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["body", "age"], message: "age requis pour une personne" });
      }
      if (!b.gender) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["body", "gender"], message: "gender requis pour une personne" });
      }
    }
  });

const update = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    country: z.string().optional(),
    region: z.string().optional(),
    city: z.string().optional(),
    date: z.string().optional(),
    photoUrl: z.string().optional(),
    contactPhone: z.string().optional(),
    contactWhatsapp: z.string().optional(),
    species: z.string().optional(),
    breed: z.string().optional(),
    color: z.string().optional(),
    age: z.number().optional(),
    gender: z.string().optional(),
    lastSeenDetails: z.string().optional(),
  }),
});

export const ListingSchema = { create, update };
```
Note : `validateRequest` du projet appelle `schema.parseAsync({ body })`. Un schéma `.superRefine` reste un `ZodEffects`, compatible avec `parseAsync`. Le type du paramètre de `validateRequest` est `AnyZodObject` ; si TypeScript se plaint pour le schéma `create` (ZodEffects), élargir le type de `validateRequest` à `ZodTypeAny` dans `src/app/midddlewares/validate.ts` (changement minimal et rétro-compatible).

- [ ] **Step 4: Vérifier le succès**

Run: `npx vitest run src/app/modules/listing/listing.validate.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add server/src/app/modules/listing/listing.validate.ts server/src/app/modules/listing/listing.validate.test.ts server/src/app/midddlewares/validate.ts
git commit -m "feat: validation Zod conditionnelle Listing"
```

---

## Task 7: Service + contrôleur Listing

**Files:**
- Create: `server/src/app/modules/listing/listing.service.ts`
- Create: `server/src/app/modules/listing/listing.controller.ts`

Ce module suit le pattern de `foundItem.service.ts`/`foundItem.controller.ts` (lire ces fichiers avant). Pas de test unitaire DB ici (services Prisma) — la couverture se fait via les tests d'intégration optionnels (Task 12) et la compilation. Le contrôleur masque le contact si non authentifié.

- [ ] **Step 1: Implémenter `server/src/app/modules/listing/listing.service.ts`**

```ts
import { Prisma } from "@prisma/client";
import prisma from "../../config/prisma";

const listingInclude = {
  user: { select: { id: true, username: true, email: true, role: true } },
  category: true,
};

type CreateInput = Record<string, any>;

const createListing = async (data: CreateInput, userId: string) => {
  return prisma.listing.create({
    data: {
      type: data.type,
      direction: data.direction,
      title: data.title,
      description: data.description ?? "",
      country: data.country,
      region: data.region ?? "",
      city: data.city ?? "",
      date: data.date ? new Date(data.date) : new Date(),
      photoUrl: data.photoUrl ?? "",
      contactPhone: data.contactPhone,
      contactWhatsapp: data.contactWhatsapp ?? "",
      categoryId: data.categoryId ?? null,
      species: data.species ?? null,
      breed: data.breed ?? null,
      color: data.color ?? null,
      age: data.age ?? null,
      gender: data.gender ?? null,
      lastSeenDetails: data.lastSeenDetails ?? null,
      userId,
    },
    include: listingInclude,
  });
};

const getListings = async (q: Record<string, any>) => {
  const where: Prisma.ListingWhereInput = { isDeleted: false };
  if (q.type) where.type = q.type;
  if (q.direction) where.direction = q.direction;
  if (q.country) where.country = { contains: q.country, mode: "insensitive" };
  if (q.region) where.region = { contains: q.region, mode: "insensitive" };
  if (q.city) where.city = { contains: q.city, mode: "insensitive" };
  if (q.category) where.categoryId = q.category;
  return prisma.listing.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: listingInclude,
  });
};

const getListing = async (id: string) => {
  return prisma.listing.findFirst({
    where: { id, isDeleted: false },
    include: listingInclude,
  });
};

const getMyListings = async (userId: string) => {
  return prisma.listing.findMany({
    where: { userId, isDeleted: false },
    orderBy: { createdAt: "desc" },
    include: listingInclude,
  });
};

const updateListing = async (id: string, data: Record<string, any>) => {
  const allowed = [
    "title", "description", "country", "region", "city", "date", "photoUrl",
    "contactPhone", "contactWhatsapp", "species", "breed", "color", "age",
    "gender", "lastSeenDetails",
  ];
  const updateData: Record<string, any> = {};
  for (const k of allowed) {
    if (data[k] !== undefined) {
      updateData[k] = k === "date" ? new Date(data[k]) : data[k];
    }
  }
  return prisma.listing.update({ where: { id }, data: updateData, include: listingInclude });
};

const resolveListing = async (id: string) => {
  return prisma.listing.update({ where: { id }, data: { isResolved: true } });
};

const softDeleteListing = async (id: string) => {
  return prisma.listing.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  });
};

export const listingService = {
  createListing,
  getListings,
  getListing,
  getMyListings,
  updateListing,
  resolveListing,
  softDeleteListing,
};
```

- [ ] **Step 2: Implémenter `server/src/app/modules/listing/listing.controller.ts`**

Masquer les champs de contact si la requête n'est pas authentifiée (`req.user` absent).
```ts
import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import sendResponse from "../../global/response";
import AppError from "../../global/error";
import { listingService } from "./listing.service";
import { canMutate } from "../../utils/authz";

function stripContact<T extends Record<string, any>>(listing: T): T {
  const { contactPhone, contactWhatsapp, ...rest } = listing;
  return rest as T;
}

const createListing = async (req: Request, res: Response) => {
  try {
    const result = await listingService.createListing(req.body, req.user.id);
    sendResponse(res, { statusCode: StatusCodes.CREATED, success: true, message: "Annonce créée", data: result });
  } catch (error: any) {
    sendResponse(res, { statusCode: StatusCodes.BAD_REQUEST, success: false, message: error?.message, data: null });
  }
};

const getListings = async (req: Request, res: Response) => {
  try {
    const result = await listingService.getListings(req.query);
    const data = req.user ? result : result.map(stripContact);
    sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Annonces récupérées", data });
  } catch (error: any) {
    sendResponse(res, { statusCode: StatusCodes.BAD_REQUEST, success: false, message: error?.message, data: null });
  }
};

const getListing = async (req: Request, res: Response) => {
  try {
    const result = await listingService.getListing(req.params.id);
    if (!result) throw new AppError(StatusCodes.NOT_FOUND, "Annonce introuvable");
    const data = req.user ? result : stripContact(result);
    sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Annonce récupérée", data });
  } catch (error: any) {
    sendResponse(res, { statusCode: error?.statusCode || StatusCodes.BAD_REQUEST, success: false, message: error?.message, data: null });
  }
};

const getMyListings = async (req: Request, res: Response) => {
  try {
    const result = await listingService.getMyListings(req.user.id);
    sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Mes annonces", data: result });
  } catch (error: any) {
    sendResponse(res, { statusCode: StatusCodes.BAD_REQUEST, success: false, message: error?.message, data: null });
  }
};

async function assertCanMutate(req: Request) {
  const existing = await listingService.getListing(req.params.id);
  if (!existing) throw new AppError(StatusCodes.NOT_FOUND, "Annonce introuvable");
  if (!canMutate(req.user, existing.userId)) {
    throw new AppError(StatusCodes.FORBIDDEN, "Action non autorisée");
  }
  return existing;
}

const updateListing = async (req: Request, res: Response) => {
  try {
    await assertCanMutate(req);
    const result = await listingService.updateListing(req.params.id, req.body);
    sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Annonce mise à jour", data: result });
  } catch (error: any) {
    sendResponse(res, { statusCode: error?.statusCode || StatusCodes.BAD_REQUEST, success: false, message: error?.message, data: null });
  }
};

const resolveListing = async (req: Request, res: Response) => {
  try {
    await assertCanMutate(req);
    await listingService.resolveListing(req.params.id);
    sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Annonce marquée résolue", data: null });
  } catch (error: any) {
    sendResponse(res, { statusCode: error?.statusCode || StatusCodes.BAD_REQUEST, success: false, message: error?.message, data: null });
  }
};

const deleteListing = async (req: Request, res: Response) => {
  try {
    await assertCanMutate(req);
    await listingService.softDeleteListing(req.params.id);
    sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Annonce supprimée", data: null });
  } catch (error: any) {
    sendResponse(res, { statusCode: error?.statusCode || StatusCodes.BAD_REQUEST, success: false, message: error?.message, data: null });
  }
};

export const listingController = {
  createListing,
  getListings,
  getListing,
  getMyListings,
  updateListing,
  resolveListing,
  deleteListing,
};
```

- [ ] **Step 3: Vérifier la compilation du module (isolé)**

Run: `npx tsc --noEmit` (des erreurs subsistent sur les anciens modules non encore supprimés — vérifier qu'il n'y a pas d'erreur dans `modules/listing/*`). 

- [ ] **Step 4: Commit**

```bash
git add server/src/app/modules/listing/listing.service.ts server/src/app/modules/listing/listing.controller.ts
git commit -m "feat: service + contrôleur Listing (contact masqué hors auth)"
```

---

## Task 8: Module Response (validate + service + controller)

**Files:**
- Create: `server/src/app/modules/response/response.validate.ts`
- Test: `server/src/app/modules/response/response.validate.test.ts`
- Create: `server/src/app/modules/response/response.service.ts`
- Create: `server/src/app/modules/response/response.controller.ts`

- [ ] **Step 1: Écrire le test de validation**

```ts
import { describe, it, expect } from "vitest";
import { ResponseSchema } from "./response.validate";

describe("ResponseSchema.create", () => {
  it("accepte un message", () => {
    expect(() =>
      ResponseSchema.create.parse({ body: { message: "Bonjour" } })
    ).not.toThrow();
  });
  it("refuse un message vide", () => {
    expect(() =>
      ResponseSchema.create.parse({ body: { message: "" } })
    ).toThrow();
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run src/app/modules/response/response.validate.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implémenter `server/src/app/modules/response/response.validate.ts`**

```ts
import { z } from "zod";

const create = z.object({
  body: z.object({
    message: z.string({ required_error: "message is required" }).min(1),
    distinguishingFeatures: z.string().optional(),
    sightingLocation: z.string().optional(),
    sightingDate: z.string().optional(),
  }),
});

const updateStatus = z.object({
  body: z.object({
    status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  }),
});

export const ResponseSchema = { create, updateStatus };
```

- [ ] **Step 4: Vérifier le succès**

Run: `npx vitest run src/app/modules/response/response.validate.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Implémenter `server/src/app/modules/response/response.service.ts`**

Le kind est dérivé de la direction du listing cible (règle domaine), pas fourni par le client.
```ts
import prisma from "../../config/prisma";
import { responseKindForDirection } from "../../utils/listingDomain";

const createResponse = async (
  listingId: string,
  authorId: string,
  data: Record<string, any>
) => {
  const listing = await prisma.listing.findFirst({
    where: { id: listingId, isDeleted: false },
  });
  if (!listing) throw new Error("Annonce introuvable");
  const kind = responseKindForDirection(listing.direction as any);
  return prisma.response.create({
    data: {
      listingId,
      authorId,
      kind,
      message: data.message,
      distinguishingFeatures: data.distinguishingFeatures ?? null,
      sightingLocation: data.sightingLocation ?? null,
      sightingDate: data.sightingDate ? new Date(data.sightingDate) : null,
    },
  });
};

const getMyResponses = async (authorId: string) => {
  return prisma.response.findMany({
    where: { authorId, isDeleted: false },
    orderBy: { createdAt: "desc" },
    include: { listing: { select: { id: true, title: true, type: true, direction: true } } },
  });
};

const getAllResponses = async () => {
  return prisma.response.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: "desc" },
    include: {
      listing: { select: { id: true, title: true, type: true, direction: true, userId: true } },
      author: { select: { id: true, username: true, email: true } },
    },
  });
};

const getResponseWithListing = async (id: string) => {
  return prisma.response.findFirst({
    where: { id, isDeleted: false },
    include: { listing: { select: { userId: true } } },
  });
};

const updateStatus = async (id: string, status: string) => {
  return prisma.response.update({
    where: { id },
    data: { status: status as any },
  });
};

export const responseService = {
  createResponse,
  getMyResponses,
  getAllResponses,
  getResponseWithListing,
  updateStatus,
};
```

- [ ] **Step 6: Implémenter `server/src/app/modules/response/response.controller.ts`**

Création : authentifié. Lecture `/responses` : admin. `/my/responses` : authentifié. Update statut : owner du listing ou admin.
```ts
import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import sendResponse from "../../global/response";
import AppError from "../../global/error";
import { responseService } from "./response.service";
import { canMutate } from "../../utils/authz";

const createResponse = async (req: Request, res: Response) => {
  try {
    const result = await responseService.createResponse(req.params.id, req.user.id, req.body);
    sendResponse(res, { statusCode: StatusCodes.CREATED, success: true, message: "Réponse envoyée", data: result });
  } catch (error: any) {
    sendResponse(res, { statusCode: StatusCodes.BAD_REQUEST, success: false, message: error?.message, data: null });
  }
};

const getMyResponses = async (req: Request, res: Response) => {
  try {
    const result = await responseService.getMyResponses(req.user.id);
    sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Mes réponses", data: result });
  } catch (error: any) {
    sendResponse(res, { statusCode: StatusCodes.BAD_REQUEST, success: false, message: error?.message, data: null });
  }
};

const getAllResponses = async (req: Request, res: Response) => {
  try {
    const result = await responseService.getAllResponses();
    sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Réponses", data: result });
  } catch (error: any) {
    sendResponse(res, { statusCode: StatusCodes.BAD_REQUEST, success: false, message: error?.message, data: null });
  }
};

const updateStatus = async (req: Request, res: Response) => {
  try {
    const existing = await responseService.getResponseWithListing(req.params.id);
    if (!existing) throw new AppError(StatusCodes.NOT_FOUND, "Réponse introuvable");
    if (!canMutate(req.user, existing.listing.userId)) {
      throw new AppError(StatusCodes.FORBIDDEN, "Action non autorisée");
    }
    await responseService.updateStatus(req.params.id, req.body.status);
    sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Statut mis à jour", data: null });
  } catch (error: any) {
    sendResponse(res, { statusCode: error?.statusCode || StatusCodes.BAD_REQUEST, success: false, message: error?.message, data: null });
  }
};

export const responseController = {
  createResponse,
  getMyResponses,
  getAllResponses,
  updateStatus,
};
```

- [ ] **Step 7: Vérifier (validation tests + compile module)**

Run: `npx vitest run src/app/modules/response/response.validate.test.ts`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add server/src/app/modules/response
git commit -m "feat: module Response (claim/sighting)"
```

---

## Task 9: Module Category + suppression des anciens modules

**Files:**
- Create: `server/src/app/modules/category/category.service.ts`, `category.controller.ts`, `category.validate.ts`
- Delete: `server/src/app/modules/aiSearch/`, `foundItems/`, `lostItem/`, `claim/`, `itemCategory/`

- [ ] **Step 1: Créer le module category (repris de itemCategory)**

Lire `server/src/app/modules/itemCategory/*` et recréer sous `category/` en pointant sur `prisma.category` au lieu de `prisma.itemCategory`.
`category.validate.ts` :
```ts
import { z } from "zod";
const createCategory = z.object({
  body: z.object({
    name: z.string({ required_error: "name is required" }).min(1),
  }),
});
export const CategorySchema = { createCategory };
```
`category.service.ts` :
```ts
import prisma from "../../config/prisma";

const createCategory = async (data: { name: string }) =>
  prisma.category.create({ data: { name: data.name } });

const getCategories = async () =>
  prisma.category.findMany({ orderBy: { createdAt: "desc" } });

const updateCategory = async (id: string, data: { name: string }) =>
  prisma.category.update({ where: { id }, data: { name: data.name } });

const deleteCategory = async (id: string) =>
  prisma.category.delete({ where: { id } });

export const categoryService = { createCategory, getCategories, updateCategory, deleteCategory };
```
`category.controller.ts` (suivre le pattern `sendResponse` du projet) :
```ts
import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import sendResponse from "../../global/response";
import { categoryService } from "./category.service";

const createCategory = async (req: Request, res: Response) => {
  try {
    const result = await categoryService.createCategory(req.body);
    sendResponse(res, { statusCode: StatusCodes.CREATED, success: true, message: "Catégorie créée", data: result });
  } catch (error: any) {
    sendResponse(res, { statusCode: StatusCodes.BAD_REQUEST, success: false, message: error?.message, data: null });
  }
};
const getCategories = async (_req: Request, res: Response) => {
  try {
    const result = await categoryService.getCategories();
    sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Catégories", data: result });
  } catch (error: any) {
    sendResponse(res, { statusCode: StatusCodes.BAD_REQUEST, success: false, message: error?.message, data: null });
  }
};
const updateCategory = async (req: Request, res: Response) => {
  try {
    const result = await categoryService.updateCategory(req.params.id, req.body);
    sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Catégorie mise à jour", data: result });
  } catch (error: any) {
    sendResponse(res, { statusCode: StatusCodes.BAD_REQUEST, success: false, message: error?.message, data: null });
  }
};
const deleteCategory = async (req: Request, res: Response) => {
  try {
    await categoryService.deleteCategory(req.params.id);
    sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Catégorie supprimée", data: null });
  } catch (error: any) {
    sendResponse(res, { statusCode: StatusCodes.BAD_REQUEST, success: false, message: error?.message, data: null });
  }
};
export const categoryController = { createCategory, getCategories, updateCategory, deleteCategory };
```

- [ ] **Step 2: Supprimer les anciens modules**

```bash
git rm -r server/src/app/modules/aiSearch server/src/app/modules/foundItems server/src/app/modules/lostItem server/src/app/modules/claim server/src/app/modules/itemCategory
```

- [ ] **Step 3: Commit (le build cassera tant que routes.ts n'est pas mis à jour — Task 10)**

```bash
git add server/src/app/modules/category
git commit -m "feat: module category + suppression anciens modules"
```

---

## Task 10: Routes + nettoyage utils + app

**Files:**
- Modify: `server/src/app/routes/routes.ts`
- Modify: `server/src/app/utils/utils.ts` (calculateMeta)
- Modify: `server/package.json` (retrait @google/generative-ai)

- [ ] **Step 1: Réécrire `server/src/app/routes/routes.ts`**

```ts
import express from "express";
import auth from "../midddlewares/auth";
import requireAdmin from "../midddlewares/requireAdmin";
import validateRequest from "../midddlewares/validate";
import { userController } from "../modules/user/user.controllers";
import { authController } from "../auth/auth.controller";
import { UserSchema } from "../modules/user/user.validate";
import { categoryController } from "../modules/category/category.controller";
import { CategorySchema } from "../modules/category/category.validate";
import { listingController } from "../modules/listing/listing.controller";
import { ListingSchema } from "../modules/listing/listing.validate";
import { responseController } from "../modules/response/response.controller";
import { ResponseSchema } from "../modules/response/response.validate";
import { adminStats } from "../utils/adminStats";

const router = express.Router();

// Auth
router.post("/register", userController.registerUser);
router.post("/login", validateRequest(UserSchema.userLoginSchema), authController.login);
router.post("/change-password", auth(), validateRequest(UserSchema.changePasswordSchema), authController.newPasswords);
router.post("/change-email", auth(), validateRequest(UserSchema.changeEmailSchema), authController.changeEmail);
router.post("/change-username", auth(), validateRequest(UserSchema.changeUsernameSchema), authController.changeUsername);

// Categories
router.get("/item-categories", categoryController.getCategories);
router.post("/item-categories", auth(), requireAdmin(), validateRequest(CategorySchema.createCategory), categoryController.createCategory);
router.put("/item-categories/:id", auth(), requireAdmin(), validateRequest(CategorySchema.createCategory), categoryController.updateCategory);
router.delete("/item-categories/:id", auth(), requireAdmin(), categoryController.deleteCategory);

// Listings — lecture publique avec auth optionnelle (contact masqué). On applique auth() "soft":
// auth() exige un token ; pour rendre l'auth optionnelle sur GET, ne pas mettre auth() et lire req.user via un middleware léger.
router.get("/listings", listingController.getListings);
router.get("/listings/:id", listingController.getListing);
router.post("/listings", auth(), validateRequest(ListingSchema.create), listingController.createListing);
router.put("/listings/:id", auth(), validateRequest(ListingSchema.update), listingController.updateListing);
router.delete("/listings/:id", auth(), listingController.deleteListing);
router.put("/listings/:id/resolve", auth(), listingController.resolveListing);
router.get("/my/listings", auth(), listingController.getMyListings);

// Responses
router.post("/listings/:id/responses", auth(), validateRequest(ResponseSchema.create), responseController.createResponse);
router.get("/my/responses", auth(), responseController.getMyResponses);
router.get("/responses", auth(), requireAdmin(), responseController.getAllResponses);
router.put("/responses/:id", auth(), validateRequest(ResponseSchema.updateStatus), responseController.updateStatus);

// Users / admin
router.get("/users", auth(), requireAdmin(), userController.allUsers);
router.get("/admin/stats", auth(), requireAdmin(), adminStats);
router.put("/block/user/:id", auth(), requireAdmin(), userController.blockUser);
router.put("/change-role/:id", auth(), requireAdmin(), userController.changeUserRole);
router.delete("/delete-user/:id", auth(), requireAdmin(), userController.softDeleteUser);

export default router;
```
Note importante sur l'auth optionnelle des GET `/listings` : la lecture est publique mais le contact doit être masqué si non connecté. Le contrôleur teste `req.user`. Pour peupler `req.user` quand un token est présent SANS rejeter les anonymes, ajouter un middleware `optionalAuth` (voir Step 2).

- [ ] **Step 2: Ajouter un middleware `optionalAuth` et l'appliquer aux GET listings**

Create `server/src/app/midddlewares/optionalAuth.ts` :
```ts
import { NextFunction, Request, Response } from "express";
import { utils } from "../utils/utils";

const optionalAuth = () => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const token = req.headers.authorization;
    if (token) {
      try {
        req.user = utils.verifyToken(token);
      } catch {
        // token invalide => traité comme anonyme
      }
    }
    next();
  };
};

export default optionalAuth;
```
Puis dans `routes.ts`, préfixer les GET de lecture :
```ts
import optionalAuth from "../midddlewares/optionalAuth";
router.get("/listings", optionalAuth(), listingController.getListings);
router.get("/listings/:id", optionalAuth(), listingController.getListing);
```

- [ ] **Step 3: Rendre `calculateMeta` indépendant de foundItem**

Dans `server/src/app/utils/utils.ts`, remplacer le corps de `calculateMeta` qui interroge `prisma.foundItem` par une version basée sur `prisma.listing` :
```ts
const calculateMeta = async (data: any) => {
  const { page = 1, limit = 10 } = data;
  const total = await prisma.listing.count({ where: { isDeleted: false } });
  return { total, page: Number(page), limit: Number(limit) };
};
```

- [ ] **Step 4: Retirer la dépendance AI**

Dans `server/package.json`, retirer `"@google/generative-ai": "^0.24.1",` des dependencies.
Run: `npm install`
Expected: lockfile mis à jour, pas d'erreur.

- [ ] **Step 5: Vérifier la compilation complète**

Run: `npx tsc --noEmit`
Expected: aucune erreur (tous les anciens modules supprimés, routes câblées).
Run: `npm test`
Expected: tous les tests unitaires passent.

- [ ] **Step 6: Commit**

```bash
git add server/src/app/routes/routes.ts server/src/app/midddlewares/optionalAuth.ts server/src/app/utils/utils.ts server/package.json server/package-lock.json
git commit -m "feat: routes Retrouver + optionalAuth + retrait AI"
```

---

## Task 11: adminStats étendu aux 3 types

**Files:**
- Modify: `server/src/app/utils/adminStats.ts`

- [ ] **Step 1: Lire l'actuel `adminStats.ts`**

Comprendre la forme de réponse attendue par le front (`useAdminStatsQuery`).

- [ ] **Step 2: Réécrire pour compter Listings/Responses/Users**

```ts
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../global/response";
import prisma from "../config/prisma";

export const adminStats = async (_req: Request, res: Response) => {
  try {
    const [totalListings, objects, animals, persons, totalResponses, pendingResponses, totalUsers] =
      await Promise.all([
        prisma.listing.count({ where: { isDeleted: false } }),
        prisma.listing.count({ where: { isDeleted: false, type: "OBJECT" } }),
        prisma.listing.count({ where: { isDeleted: false, type: "ANIMAL" } }),
        prisma.listing.count({ where: { isDeleted: false, type: "PERSON" } }),
        prisma.response.count({ where: { isDeleted: false } }),
        prisma.response.count({ where: { isDeleted: false, status: "PENDING" } }),
        prisma.user.count({ where: { isDeleted: false } }),
      ]);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Statistiques",
      data: { totalListings, objects, animals, persons, totalResponses, pendingResponses, totalUsers },
    });
  } catch (error: any) {
    sendResponse(res, { statusCode: StatusCodes.BAD_REQUEST, success: false, message: error?.message, data: null });
  }
};
```

- [ ] **Step 3: Compiler**

Run: `npx tsc --noEmit`
Expected: pas d'erreur.

- [ ] **Step 4: Commit**

```bash
git add server/src/app/utils/adminStats.ts
git commit -m "feat: adminStats 3 types"
```

---

## Task 12: Tests d'intégration optionnels (gated DATABASE_URL)

**Files:**
- Create: `server/src/app/modules/listing/listing.service.int.test.ts`

Ces tests s'exécutent seulement si `process.env.DATABASE_URL` est défini (sinon `describe.skip`). Ils valident le service contre une vraie base.

- [ ] **Step 1: Écrire le test gated**

```ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import prisma from "../../config/prisma";
import { listingService } from "./listing.service";

const run = process.env.DATABASE_URL ? describe : describe.skip;

run("listingService (intégration)", () => {
  let userId: string;
  let createdId: string;

  beforeAll(async () => {
    const u = await prisma.user.create({
      data: {
        username: `it_${Date.now()}`,
        email: `it_${Date.now()}@x.io`,
        password: "x",
      },
    });
    userId = u.id;
  });

  afterAll(async () => {
    if (createdId) await prisma.listing.deleteMany({ where: { id: createdId } });
    await prisma.user.deleteMany({ where: { id: userId } });
  });

  it("crée et relit un listing OBJECT", async () => {
    const created = await listingService.createListing(
      { type: "OBJECT", direction: "LOST", title: "Sac test", country: "Sénégal", contactPhone: "+221770000000" },
      userId
    );
    createdId = created.id;
    expect(created.type).toBe("OBJECT");
    const fetched = await listingService.getListing(created.id);
    expect(fetched?.title).toBe("Sac test");
  });

  it("filtre par type", async () => {
    const list = await listingService.getListings({ type: "OBJECT" });
    expect(list.every((l) => l.type === "OBJECT")).toBe(true);
  });
});
```

- [ ] **Step 2: Lancer (sans DB → skip, avec DB → exécute)**

Run: `npm test`
Expected: si `DATABASE_URL` absent, suite "intégration" skipped, le reste passe. Si présent, tests d'intégration passent.

- [ ] **Step 3: Commit**

```bash
git add server/src/app/modules/listing/listing.service.int.test.ts
git commit -m "test: intégration listingService (gated DATABASE_URL)"
```

---

## Task 13: Migration de schéma + script de données

**Files:**
- Create: `server/scripts/migrate-data.ts`
- Create: `server/prisma/migrations/*` (généré)

⚠️ Étape touchant la base de données. À exécuter par l'opérateur avec accès à la base. Si aucune base n'est disponible dans l'environnement d'implémentation, livrer le script + la commande et marquer l'exécution réelle comme manuelle (reporter DONE_WITH_CONCERNS).

- [ ] **Step 1: Écrire le script `server/scripts/migrate-data.ts`**

Convertit les anciennes tables (si elles existent encore) vers les nouvelles. Lecture via SQL brut (les anciens modèles n'existent plus dans le client Prisma) puis insertion via le client.
```ts
import prisma from "../src/app/config/prisma";

/**
 * Migre les données legacy (foundItems/lostItems/claims/itemsCategories)
 * vers le modèle unifié (listings/responses/categories).
 * Idempotent best-effort : à lancer une seule fois sur une base legacy.
 */
async function main() {
  // 1. Catégories
  const oldCategories = await prisma.$queryRawUnsafe<any[]>(
    `SELECT id, name, "createdAt", "updatedAt" FROM "itemsCategories"`
  ).catch(() => []);
  for (const c of oldCategories) {
    await prisma.category.upsert({
      where: { id: c.id },
      update: {},
      create: { id: c.id, name: c.name, createdAt: c.createdAt, updatedAt: c.updatedAt },
    });
  }

  // 2. FoundItems -> Listing OBJECT/FOUND
  const found = await prisma.$queryRawUnsafe<any[]>(
    `SELECT * FROM "foundItems" WHERE "isDeleted" = false`
  ).catch(() => []);
  for (const f of found) {
    await prisma.listing.create({
      data: {
        id: f.id,
        type: "OBJECT",
        direction: "FOUND",
        title: f.foundItemName,
        description: f.description ?? "",
        country: "",
        city: f.location ?? "",
        photoUrl: f.img ?? "",
        contactPhone: "",
        categoryId: f.categoryId ?? null,
        date: f.date ?? new Date(),
        userId: f.userId,
        createdAt: f.createdAt,
        updatedAt: f.updatedAt,
      },
    });
  }

  // 3. LostItems -> Listing OBJECT/LOST
  const lost = await prisma.$queryRawUnsafe<any[]>(
    `SELECT * FROM "lostItems" WHERE "isDeleted" = false`
  ).catch(() => []);
  for (const l of lost) {
    await prisma.listing.create({
      data: {
        id: l.id,
        type: "OBJECT",
        direction: "LOST",
        title: l.lostItemName,
        description: l.description ?? "",
        country: "",
        city: l.location ?? "",
        photoUrl: l.img ?? "",
        contactPhone: "",
        categoryId: l.categoryId ?? null,
        date: l.date ?? new Date(),
        isResolved: l.isFound ?? false,
        userId: l.userId,
        createdAt: l.createdAt,
        updatedAt: l.updatedAt,
      },
    });
  }

  // 4. Claims -> Response CLAIM
  const claims = await prisma.$queryRawUnsafe<any[]>(
    `SELECT * FROM "claims" WHERE "isDeleted" = false`
  ).catch(() => []);
  for (const c of claims) {
    await prisma.response.create({
      data: {
        id: c.id,
        listingId: c.foundItemId,
        authorId: c.userId,
        kind: "CLAIM",
        message: c.distinguishingFeatures ?? "Revendication migrée",
        distinguishingFeatures: c.distinguishingFeatures ?? null,
        status: c.status ?? "PENDING",
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      },
    });
  }

  console.log(
    `Migration OK: ${oldCategories.length} catégories, ${found.length} trouvés, ${lost.length} perdus, ${claims.length} réclamations`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => process.exit(0));
```
Note : les anciens enregistrements n'ont pas de `contactPhone` (champ requis non-null) → on insère `""`. L'opérateur pourra compléter. La requête brute cible les anciennes tables AVANT que `prisma migrate` ne les supprime — voir ordre d'exécution en Step 3.

- [ ] **Step 2: Ajouter le script de lancement dans `server/package.json`**

Dans `scripts`, ajouter :
```json
"migrate:data": "ts-node scripts/migrate-data.ts",
```

- [ ] **Step 3: Documenter et exécuter la migration (opérateur)**

Ordre impératif sur une base legacy (à exécuter par l'opérateur avec `DATABASE_URL` pointant la base) :
1. **Sauvegarde** : `pg_dump` de la base avant toute opération.
2. Lancer le script de données AVANT de supprimer les tables : comme `prisma migrate` va dropper les anciennes tables, exécuter d'abord la migration applicative dans une fenêtre où les deux schémas coexistent n'est pas trivial. **Approche recommandée** : 
   a. `npx prisma migrate dev --name pivot_retrouver --create-only` (génère le SQL sans l'appliquer).
   b. Éditer la migration générée pour **renommer** plutôt que dropper quand c'est possible, OU
   c. Plus simple si volume faible : exporter les anciennes tables (`pg_dump -t foundItems -t lostItems -t claims -t itemsCategories`), appliquer `prisma migrate dev`, restaurer les anciennes tables temporairement, lancer `npm run migrate:data`, puis dropper les tables temporaires.
3. Si la base peut repartir propre (pas de données critiques) : `npx prisma migrate dev --name pivot_retrouver` puis seed manuel.

Marquer cette étape **DONE_WITH_CONCERNS** si l'environnement d'implémentation n'a pas de base : livrer script + doc, exécution manuelle par l'opérateur.

- [ ] **Step 4: Commit**

```bash
git add server/scripts/migrate-data.ts server/package.json
git commit -m "feat: script migration données legacy -> Listing/Response"
```

---

## Task 14: Vérification finale Phase 2

- [ ] **Step 1: Tests unitaires**

Run (depuis `server/`): `npm test`
Expected: tous passent (intégration skipped si pas de DB).

- [ ] **Step 2: Compilation / build**

Run: `npx tsc --noEmit`
Expected: aucune erreur.
Run: `npx prisma validate`
Expected: schéma valide.

- [ ] **Step 3: Grep résidus AI / anciens modèles**

Run: `grep -rn "foundItem\|lostItem\|aiSearch\|generative-ai\|itemCategory\|ItemCategory" server/src` 
Expected: aucune référence active (hors éventuels commentaires de migration).

- [ ] **Step 4: Commit final éventuel**

```bash
git add -A server
git commit -m "chore: vérification finale Phase 2 backend"
```

---

## Self-review (couverture spec §4)

- Modèle `Listing`/`Response`/`Category`/`User` + enums → Task 3.
- Cohérence type/direction + champs requis (superRefine) → Task 2, Task 6.
- Modules listing/response/category → Task 7, Task 8, Task 9.
- Routes API cibles (listings, responses, my/*, admin, item-categories) → Task 10.
- Sécurité : toutes mutations derrière `auth()` ; owner-or-admin (edit/delete/resolve/statut) → Task 4, Task 7, Task 8 ; `requireAdmin` sur users/stats/catégories → Task 5, Task 10.
- Contact masqué hors authentification (GET listings via `optionalAuth` + `stripContact`) → Task 7, Task 10.
- adminStats 3 types → Task 11.
- Suppression AI search (module + dépendance npm) → Task 9, Task 10.
- Migration des données legacy → Task 13.
- Tests (ship-balanced + criticité auth/migration) : unitaires purs (domaine, authz, requireAdmin, validation) + intégration gated → Tasks 2,4,5,6,8,12.

Notes :
- L'auth optionnelle sur GET `/listings` est gérée par un middleware `optionalAuth` dédié (l'`auth()` existant rejette les anonymes). 
- Le `kind` d'une `Response` est dérivé serveur de la direction du listing (jamais fait confiance au client).
- Criticité DB : Task 13 exige sauvegarde + exécution opérateur ; livrable = script + procédure.
