# Pivot « Retrouver » — Phase 1 Frontend — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refondre le frontend (React+TS+Vite) de « Lost & Found » objets en « Retrouver » : navbar groupée par type, pages objets/animaux/personnes pilotées par des composants génériques, contre un contrat API `/listings` + `/responses`.

**Architecture:** Modèle `Listing` polymorphe (type × direction) côté front. Composants génériques (`ListingCard`, `ListingList`, `ListingForm`, `ListingDetail`, `ResponseForm`) pilotés par une config par type (`src/domain/listingConfig.ts`). Les pages sont des wrappers minces qui passent type+direction. RTK Query (`baseApi`) étendu avec endpoints `listings`/`responses`. Contact masqué tant que l'utilisateur n'est pas connecté.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind, Flowbite React, Redux Toolkit + RTK Query, React Router DOM, React Hook Form, react-toastify. Tests : Vitest + @testing-library/react + jsdom.

**Périmètre :** Frontend uniquement. Le backend (`/listings`, `/responses`) est livré au plan Phase 2 ; ici les composants sont testés en unitaire avec store/données mockés et le contrat API est figé. La feature AI search est supprimée.

**Référence spec :** `docs/superpowers/specs/2026-06-14-retrouver-pivot-design.md`

---

## Structure des fichiers

Créés :
- `src/domain/listing.types.ts` — types `Listing`, `Response`, enums, helpers.
- `src/domain/listingConfig.ts` — config UI par type (labels, champs, routes, icônes).
- `src/redux/api/listingApi.ts` — endpoints RTK Query listings/responses.
- `src/components/listing/ListingCard.tsx`
- `src/components/listing/ListingList.tsx`
- `src/components/listing/ListingForm.tsx`
- `src/components/listing/ListingDetail.tsx`
- `src/components/listing/ResponseForm.tsx`
- `src/components/listing/ContactBlock.tsx` — contact masqué si non connecté.
- `src/pages/objets/` , `src/pages/animaux/` , `src/pages/personnes/` — wrappers minces.
- `src/test/setup.ts` , `src/test/renderWithProviders.tsx` — infra de test.
- `vitest.config.ts`

Modifiés :
- `src/components/navbar/Navbars.tsx` — structure A.
- `src/main.tsx` — nouvelles routes.
- `src/pages/home/Home.tsx` — récents par type, suppression AI.
- `src/redux/api/baseApi.ts` — nouveaux `tagTypes`.

Supprimés :
- `src/pages/aiSearch/`, ancien lien AI dans navbar/routes.
- Anciennes pages objets : `reportlostItem`, `reportFoundItem`, `lostItems`, `foundItems` (remplacées par génériques) — supprimées en Task 13 après bascule.

---

## Task 1: Mise en place de l'infra de test (Vitest + RTL)

**Files:**
- Modify: `frontend/package.json`
- Create: `frontend/vitest.config.ts`
- Create: `frontend/src/test/setup.ts`
- Create: `frontend/src/test/renderWithProviders.tsx`

- [ ] **Step 1: Installer les dépendances de test**

Run (depuis `frontend/`) :
```bash
npm i -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```
Expected: ajout aux `devDependencies`, pas d'erreur.

- [ ] **Step 2: Créer `vitest.config.ts`**

```ts
/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: false,
  },
});
```

- [ ] **Step 3: Créer `src/test/setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 4: Créer le helper `src/test/renderWithProviders.tsx`**

```tsx
import { ReactElement } from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "../redux/api/baseApi";

export function makeStore() {
  return configureStore({
    reducer: { [baseApi.reducerPath]: baseApi.reducer },
    middleware: (gdm) => gdm().concat(baseApi.middleware),
  });
}

export function renderWithProviders(
  ui: ReactElement,
  { route = "/" }: { route?: string } = {}
) {
  const store = makeStore();
  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </Provider>
    ),
  };
}
```

- [ ] **Step 5: Ajouter le script de test dans `package.json`**

Dans `"scripts"`, ajouter :
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 6: Test sanity**

Create `src/test/sanity.test.tsx` :
```tsx
import { describe, it, expect } from "vitest";
describe("infra", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 7: Lancer**

Run: `npm test`
Expected: 1 test passé.

- [ ] **Step 8: Commit**

```bash
git add frontend/package.json frontend/package-lock.json frontend/vitest.config.ts frontend/src/test
git commit -m "test: setup Vitest + Testing Library frontend"
```

---

## Task 2: Types du domaine `Listing` / `Response`

**Files:**
- Create: `frontend/src/domain/listing.types.ts`
- Test: `frontend/src/domain/listing.types.test.ts`

- [ ] **Step 1: Écrire le test (helpers de cohérence)**

`listing.types.test.ts` :
```ts
import { describe, it, expect } from "vitest";
import { directionsForType, isPerson, ListingType } from "./listing.types";

describe("listing domain", () => {
  it("personnes => direction MISSING uniquement", () => {
    expect(directionsForType("PERSON")).toEqual(["MISSING"]);
  });
  it("objets/animaux => LOST + FOUND", () => {
    expect(directionsForType("OBJECT")).toEqual(["LOST", "FOUND"]);
    expect(directionsForType("ANIMAL")).toEqual(["LOST", "FOUND"]);
  });
  it("isPerson", () => {
    expect(isPerson("PERSON" as ListingType)).toBe(true);
    expect(isPerson("OBJECT" as ListingType)).toBe(false);
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run src/domain/listing.types.test.ts`
Expected: FAIL (module introuvable).

- [ ] **Step 3: Implémenter `listing.types.ts`**

```ts
export type ListingType = "OBJECT" | "ANIMAL" | "PERSON";
export type ListingDirection = "LOST" | "FOUND" | "MISSING";
export type ResponseKind = "CLAIM" | "SIGHTING";
export type ResponseStatus = "PENDING" | "APPROVED" | "REJECTED";

export type Listing = {
  id: string;
  type: ListingType;
  direction: ListingDirection;
  title: string;
  description: string;
  country: string;
  region: string;
  city: string;
  date: string;
  photoUrl: string;
  contactPhone: string;
  contactWhatsapp?: string;
  category?: { id: string; name: string } | null;
  species?: string | null;
  breed?: string | null;
  color?: string | null;
  age?: number | null;
  gender?: string | null;
  lastSeenDetails?: string | null;
  userId: string;
  status: string;
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ListingResponse = {
  id: string;
  listingId: string;
  kind: ResponseKind;
  authorId: string;
  message: string;
  distinguishingFeatures?: string | null;
  sightingLocation?: string | null;
  sightingDate?: string | null;
  status: ResponseStatus;
  createdAt: string;
  updatedAt: string;
};

export function directionsForType(type: ListingType): ListingDirection[] {
  return type === "PERSON" ? ["MISSING"] : ["LOST", "FOUND"];
}

export function isPerson(type: ListingType): boolean {
  return type === "PERSON";
}

export function responseKindForDirection(d: ListingDirection): ResponseKind {
  return d === "MISSING" ? "SIGHTING" : "CLAIM";
}
```

- [ ] **Step 4: Vérifier le succès**

Run: `npx vitest run src/domain/listing.types.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/domain/listing.types.ts frontend/src/domain/listing.types.test.ts
git commit -m "feat: types domaine Listing/Response"
```

---

## Task 3: Config UI par type

**Files:**
- Create: `frontend/src/domain/listingConfig.ts`
- Test: `frontend/src/domain/listingConfig.test.ts`

- [ ] **Step 1: Écrire le test**

```ts
import { describe, it, expect } from "vitest";
import { listingConfig } from "./listingConfig";

describe("listingConfig", () => {
  it("3 types configurés", () => {
    expect(Object.keys(listingConfig).sort()).toEqual(
      ["ANIMAL", "OBJECT", "PERSON"]
    );
  });
  it("objet a un champ catégorie, personne a âge+genre", () => {
    expect(listingConfig.OBJECT.fields).toContain("category");
    expect(listingConfig.PERSON.fields).toContain("age");
    expect(listingConfig.PERSON.fields).toContain("gender");
  });
  it("routes base par type", () => {
    expect(listingConfig.OBJECT.basePath).toBe("/objets");
    expect(listingConfig.ANIMAL.basePath).toBe("/animaux");
    expect(listingConfig.PERSON.basePath).toBe("/personnes");
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run src/domain/listingConfig.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implémenter `listingConfig.ts`**

```ts
import { ListingType } from "./listing.types";

export type TypeConfig = {
  label: string;
  labelSingular: string;
  basePath: string;
  emoji: string;
  fields: string[]; // champs spécifiques affichés/validés
  directionLabels: Record<string, string>;
};

export const listingConfig: Record<ListingType, TypeConfig> = {
  OBJECT: {
    label: "Objets",
    labelSingular: "objet",
    basePath: "/objets",
    emoji: "📦",
    fields: ["category"],
    directionLabels: { LOST: "Objet perdu", FOUND: "Objet trouvé" },
  },
  ANIMAL: {
    label: "Animaux",
    labelSingular: "animal",
    basePath: "/animaux",
    emoji: "🐾",
    fields: ["species", "breed", "color"],
    directionLabels: { LOST: "Animal perdu", FOUND: "Animal recueilli" },
  },
  PERSON: {
    label: "Personnes",
    labelSingular: "personne",
    basePath: "/personnes",
    emoji: "🧑",
    fields: ["age", "gender", "lastSeenDetails"],
    directionLabels: { MISSING: "Avis de disparition" },
  },
};
```

- [ ] **Step 4: Vérifier le succès**

Run: `npx vitest run src/domain/listingConfig.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/domain/listingConfig.ts frontend/src/domain/listingConfig.test.ts
git commit -m "feat: config UI par type de listing"
```

---

## Task 4: Endpoints RTK Query listings/responses

**Files:**
- Modify: `frontend/src/redux/api/baseApi.ts` (tagTypes)
- Create: `frontend/src/redux/api/listingApi.ts`
- Test: `frontend/src/redux/api/listingApi.test.ts`

- [ ] **Step 1: Ajouter les tagTypes dans `baseApi.ts`**

Dans le tableau `tagTypes`, ajouter `"listings"`, `"responses"`, `"myListings"`, `"myResponses"`.

- [ ] **Step 2: Écrire le test (forme des requêtes via store mocké)**

`listingApi.test.ts` :
```ts
import { describe, it, expect } from "vitest";
import { makeStore } from "../../test/renderWithProviders";
import { listingApi } from "./listingApi";

describe("listingApi", () => {
  it("getListings construit l'URL /listings avec params", () => {
    const store = makeStore();
    const promise = store.dispatch(
      listingApi.endpoints.getListings.initiate({ type: "OBJECT", direction: "LOST" })
    );
    const { requestId } = promise;
    expect(requestId).toBeTruthy();
    promise.unsubscribe();
  });
});
```

- [ ] **Step 3: Vérifier l'échec**

Run: `npx vitest run src/redux/api/listingApi.test.ts`
Expected: FAIL (module introuvable).

- [ ] **Step 4: Implémenter `listingApi.ts`**

```ts
import { baseApi } from "./baseApi";
import { Listing, ListingResponse } from "../../domain/listing.types";

type ListingFilters = {
  type?: string;
  direction?: string;
  country?: string;
  region?: string;
  city?: string;
  category?: string;
};

export const listingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getListings: builder.query<{ data: Listing[] }, ListingFilters>({
      query: (params) => ({ url: "/listings", method: "GET", params }),
      providesTags: ["listings"],
    }),
    getListing: builder.query<{ data: Listing }, string>({
      query: (id) => ({ url: `/listings/${id}`, method: "GET" }),
      providesTags: ["listings"],
    }),
    createListing: builder.mutation<{ data: Listing }, Partial<Listing>>({
      query: (body) => ({ url: "/listings", method: "POST", body }),
      invalidatesTags: ["listings", "myListings"],
    }),
    updateListing: builder.mutation<{ data: Listing }, { id: string; body: Partial<Listing> }>({
      query: ({ id, body }) => ({ url: `/listings/${id}`, method: "PUT", body }),
      invalidatesTags: ["listings", "myListings"],
    }),
    deleteListing: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/listings/${id}`, method: "DELETE" }),
      invalidatesTags: ["listings", "myListings"],
    }),
    resolveListing: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/listings/${id}/resolve`, method: "PUT" }),
      invalidatesTags: ["listings", "myListings"],
    }),
    getMyListings: builder.query<{ data: Listing[] }, void>({
      query: () => ({ url: "/my/listings", method: "GET" }),
      providesTags: ["myListings"],
    }),
    createResponse: builder.mutation<
      { data: ListingResponse },
      { listingId: string; body: Partial<ListingResponse> }
    >({
      query: ({ listingId, body }) => ({
        url: `/listings/${listingId}/responses`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["responses", "myResponses"],
    }),
    getMyResponses: builder.query<{ data: ListingResponse[] }, void>({
      query: () => ({ url: "/my/responses", method: "GET" }),
      providesTags: ["myResponses"],
    }),
    getAllResponses: builder.query<{ data: ListingResponse[] }, void>({
      query: () => ({ url: "/responses", method: "GET" }),
      providesTags: ["responses"],
    }),
    updateResponseStatus: builder.mutation<
      unknown,
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/responses/${id}`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["responses"],
    }),
  }),
});

export const {
  useGetListingsQuery,
  useGetListingQuery,
  useCreateListingMutation,
  useUpdateListingMutation,
  useDeleteListingMutation,
  useResolveListingMutation,
  useGetMyListingsQuery,
  useCreateResponseMutation,
  useGetMyResponsesQuery,
  useGetAllResponsesQuery,
  useUpdateResponseStatusMutation,
} = listingApi;
```

- [ ] **Step 5: Vérifier le succès**

Run: `npx vitest run src/redux/api/listingApi.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/redux/api/baseApi.ts frontend/src/redux/api/listingApi.ts frontend/src/redux/api/listingApi.test.ts
git commit -m "feat: endpoints RTK Query listings/responses"
```

---

## Task 5: `ContactBlock` (contact masqué si non connecté)

**Files:**
- Create: `frontend/src/components/listing/ContactBlock.tsx`
- Test: `frontend/src/components/listing/ContactBlock.test.tsx`

- [ ] **Step 1: Écrire le test**

```tsx
import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/renderWithProviders";
import { ContactBlock } from "./ContactBlock";

describe("ContactBlock", () => {
  it("non connecté: masque le numéro et invite à se connecter", () => {
    renderWithProviders(
      <ContactBlock phone="+221770000000" isAuthenticated={false} />
    );
    expect(screen.queryByText("+221770000000")).toBeNull();
    expect(screen.getByText(/connect/i)).toBeInTheDocument();
  });
  it("connecté: affiche le numéro et un lien WhatsApp", () => {
    renderWithProviders(
      <ContactBlock phone="+221770000000" whatsapp="221770000000" isAuthenticated />
    );
    expect(screen.getByText("+221770000000")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /whatsapp/i });
    expect(link).toHaveAttribute("href", expect.stringContaining("wa.me/221770000000"));
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run src/components/listing/ContactBlock.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implémenter `ContactBlock.tsx`**

```tsx
import { Link } from "react-router-dom";

type Props = {
  phone: string;
  whatsapp?: string;
  isAuthenticated: boolean;
};

export function ContactBlock({ phone, whatsapp, isAuthenticated }: Props) {
  if (!isAuthenticated) {
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-800 p-4 text-gray-300">
        <Link to="/login" className="text-cyan-400 underline">
          Connectez-vous
        </Link>{" "}
        pour voir les coordonnées de contact.
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 p-4 space-y-2">
      <a href={`tel:${phone}`} className="block text-white font-medium">
        {phone}
      </a>
      {whatsapp && (
        <a
          href={`https://wa.me/${whatsapp}`}
          target="_blank"
          rel="noreferrer"
          className="inline-block rounded bg-green-600 px-3 py-1.5 text-white"
        >
          WhatsApp
        </a>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Vérifier le succès**

Run: `npx vitest run src/components/listing/ContactBlock.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/listing/ContactBlock.tsx frontend/src/components/listing/ContactBlock.test.tsx
git commit -m "feat: ContactBlock contact masqué hors connexion"
```

---

## Task 6: `ListingCard`

**Files:**
- Create: `frontend/src/components/listing/ListingCard.tsx`
- Test: `frontend/src/components/listing/ListingCard.test.tsx`

- [ ] **Step 1: Écrire le test**

```tsx
import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/renderWithProviders";
import { ListingCard } from "./ListingCard";
import { Listing } from "../../domain/listing.types";

const base: Listing = {
  id: "1", type: "OBJECT", direction: "LOST", title: "Sac noir",
  description: "perdu au marché", country: "Sénégal", region: "Dakar",
  city: "Dakar", date: "2026-06-01", photoUrl: "", contactPhone: "+221770000000",
  userId: "u1", status: "PENDING", isResolved: false,
  createdAt: "", updatedAt: "",
};

describe("ListingCard", () => {
  it("affiche titre, lieu et lien vers le détail", () => {
    renderWithProviders(<ListingCard listing={base} />);
    expect(screen.getByText("Sac noir")).toBeInTheDocument();
    expect(screen.getByText(/Dakar/)).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/objets/1");
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run src/components/listing/ListingCard.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implémenter `ListingCard.tsx`**

```tsx
import { Link } from "react-router-dom";
import { Listing } from "../../domain/listing.types";
import { listingConfig } from "../../domain/listingConfig";

export function ListingCard({ listing }: { listing: Listing }) {
  const cfg = listingConfig[listing.type];
  return (
    <Link
      to={`${cfg.basePath}/${listing.id}`}
      className="block rounded-xl border border-gray-700 bg-gray-800 overflow-hidden hover:border-cyan-400 transition"
    >
      <div className="h-40 bg-gray-700">
        {listing.photoUrl && (
          <img src={listing.photoUrl} alt={listing.title} className="h-40 w-full object-cover" />
        )}
      </div>
      <div className="p-4">
        <span className="text-xs uppercase text-cyan-400">
          {cfg.directionLabels[listing.direction]}
        </span>
        <h3 className="text-white font-semibold">{listing.title}</h3>
        <p className="text-gray-400 text-sm">
          {listing.city}, {listing.region} — {listing.country}
        </p>
      </div>
    </Link>
  );
}
```

- [ ] **Step 4: Vérifier le succès**

Run: `npx vitest run src/components/listing/ListingCard.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/listing/ListingCard.tsx frontend/src/components/listing/ListingCard.test.tsx
git commit -m "feat: ListingCard"
```

---

## Task 7: `ListingList` (catalogue + filtres)

**Files:**
- Create: `frontend/src/components/listing/ListingList.tsx`
- Test: `frontend/src/components/listing/ListingList.test.tsx`

- [ ] **Step 1: Écrire le test (rendu d'une liste injectée)**

```tsx
import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/renderWithProviders";
import { ListingListView } from "./ListingList";
import { Listing } from "../../domain/listing.types";

const items: Listing[] = [
  { id: "1", type: "ANIMAL", direction: "LOST", title: "Chien Rex", description: "",
    country: "Mali", region: "Bamako", city: "Bamako", date: "2026-06-01",
    photoUrl: "", contactPhone: "x", userId: "u", status: "PENDING",
    isResolved: false, createdAt: "", updatedAt: "" },
];

describe("ListingListView", () => {
  it("affiche les cartes et un état vide", () => {
    const { rerender } = renderWithProviders(
      <ListingListView items={items} isLoading={false} />
    );
    expect(screen.getByText("Chien Rex")).toBeInTheDocument();
    rerender(<ListingListView items={[]} isLoading={false} />);
    expect(screen.getByText(/aucun résultat/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run src/components/listing/ListingList.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implémenter `ListingList.tsx`**

`ListingListView` = présentation pure (testable). `ListingList` = conteneur qui lit l'URL + RTK Query.
```tsx
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Listing, ListingType, ListingDirection } from "../../domain/listing.types";
import { useGetListingsQuery } from "../../redux/api/listingApi";
import { ListingCard } from "./ListingCard";

export function ListingListView({
  items,
  isLoading,
}: {
  items: Listing[];
  isLoading: boolean;
}) {
  if (isLoading) return <p className="text-gray-400 p-6">Chargement…</p>;
  if (items.length === 0)
    return <p className="text-gray-400 p-6">Aucun résultat.</p>;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 p-6">
      {items.map((l) => (
        <ListingCard key={l.id} listing={l} />
      ))}
    </div>
  );
}

export function ListingList({ type }: { type: ListingType }) {
  const [params] = useSearchParams();
  const direction = (params.get("direction") || undefined) as
    | ListingDirection
    | undefined;
  const [filters, setFilters] = useState({ country: "", region: "", city: "" });
  const { data, isLoading } = useGetListingsQuery({
    type,
    direction,
    country: filters.country || undefined,
    region: filters.region || undefined,
    city: filters.city || undefined,
  });
  return (
    <section>
      <div className="flex flex-wrap gap-3 p-6">
        {(["country", "region", "city"] as const).map((f) => (
          <input
            key={f}
            className="rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white"
            placeholder={f === "country" ? "Pays" : f === "region" ? "Région" : "Ville"}
            value={filters[f]}
            onChange={(e) => setFilters((s) => ({ ...s, [f]: e.target.value }))}
          />
        ))}
      </div>
      <ListingListView items={data?.data ?? []} isLoading={isLoading} />
    </section>
  );
}
```

- [ ] **Step 4: Vérifier le succès**

Run: `npx vitest run src/components/listing/ListingList.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/listing/ListingList.tsx frontend/src/components/listing/ListingList.test.tsx
git commit -m "feat: ListingList + filtres géo"
```

---

## Task 8: `ListingForm` (champs conditionnels par type)

**Files:**
- Create: `frontend/src/components/listing/ListingForm.tsx`
- Test: `frontend/src/components/listing/ListingForm.test.tsx`

- [ ] **Step 1: Écrire le test**

```tsx
import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/renderWithProviders";
import { ListingForm } from "./ListingForm";

describe("ListingForm", () => {
  it("personne: affiche âge et genre, pas catégorie", () => {
    renderWithProviders(
      <ListingForm type="PERSON" direction="MISSING" onSubmit={vi.fn()} />
    );
    expect(screen.getByLabelText(/âge/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/genre/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/catégorie/i)).toBeNull();
  });
  it("animal: affiche espèce", () => {
    renderWithProviders(
      <ListingForm type="ANIMAL" direction="LOST" onSubmit={vi.fn()} />
    );
    expect(screen.getByLabelText(/espèce/i)).toBeInTheDocument();
  });
  it("soumet les champs communs", async () => {
    const onSubmit = vi.fn();
    renderWithProviders(
      <ListingForm type="OBJECT" direction="LOST" onSubmit={onSubmit} />
    );
    await userEvent.type(screen.getByLabelText(/titre/i), "Sac");
    await userEvent.type(screen.getByLabelText(/téléphone/i), "+221770000000");
    await userEvent.click(screen.getByRole("button", { name: /publier/i }));
    expect(onSubmit).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run src/components/listing/ListingForm.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implémenter `ListingForm.tsx`**

```tsx
import { useForm } from "react-hook-form";
import { ListingType, ListingDirection } from "../../domain/listing.types";
import { listingConfig } from "../../domain/listingConfig";

type Props = {
  type: ListingType;
  direction: ListingDirection;
  onSubmit: (data: Record<string, unknown>) => void;
  defaultValues?: Record<string, unknown>;
};

const field =
  "w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white";

export function ListingForm({ type, direction, onSubmit, defaultValues }: Props) {
  const { register, handleSubmit } = useForm({ defaultValues });
  const cfg = listingConfig[type];
  return (
    <form
      onSubmit={handleSubmit((d) => onSubmit({ ...d, type, direction }))}
      className="max-w-xl mx-auto p-6 space-y-4"
    >
      <div>
        <label htmlFor="title" className="block text-gray-300 mb-1">Titre</label>
        <input id="title" className={field} {...register("title", { required: true })} />
      </div>
      <div>
        <label htmlFor="description" className="block text-gray-300 mb-1">Description</label>
        <textarea id="description" className={field} {...register("description")} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label htmlFor="country" className="block text-gray-300 mb-1">Pays</label>
          <input id="country" className={field} {...register("country", { required: true })} />
        </div>
        <div>
          <label htmlFor="region" className="block text-gray-300 mb-1">Région</label>
          <input id="region" className={field} {...register("region")} />
        </div>
        <div>
          <label htmlFor="city" className="block text-gray-300 mb-1">Ville</label>
          <input id="city" className={field} {...register("city")} />
        </div>
      </div>
      <div>
        <label htmlFor="date" className="block text-gray-300 mb-1">Date</label>
        <input id="date" type="date" className={field} {...register("date")} />
      </div>

      {cfg.fields.includes("category") && (
        <div>
          <label htmlFor="category" className="block text-gray-300 mb-1">Catégorie</label>
          <input id="category" className={field} {...register("categoryId")} />
        </div>
      )}
      {cfg.fields.includes("species") && (
        <div>
          <label htmlFor="species" className="block text-gray-300 mb-1">Espèce</label>
          <input id="species" className={field} {...register("species", { required: true })} />
        </div>
      )}
      {cfg.fields.includes("breed") && (
        <div>
          <label htmlFor="breed" className="block text-gray-300 mb-1">Race</label>
          <input id="breed" className={field} {...register("breed")} />
        </div>
      )}
      {cfg.fields.includes("color") && (
        <div>
          <label htmlFor="color" className="block text-gray-300 mb-1">Couleur</label>
          <input id="color" className={field} {...register("color")} />
        </div>
      )}
      {cfg.fields.includes("age") && (
        <div>
          <label htmlFor="age" className="block text-gray-300 mb-1">Âge</label>
          <input id="age" type="number" className={field} {...register("age", { required: true })} />
        </div>
      )}
      {cfg.fields.includes("gender") && (
        <div>
          <label htmlFor="gender" className="block text-gray-300 mb-1">Genre</label>
          <select id="gender" className={field} {...register("gender", { required: true })}>
            <option value="">—</option>
            <option value="M">Masculin</option>
            <option value="F">Féminin</option>
          </select>
        </div>
      )}
      {cfg.fields.includes("lastSeenDetails") && (
        <div>
          <label htmlFor="lastSeenDetails" className="block text-gray-300 mb-1">Vu pour la dernière fois</label>
          <textarea id="lastSeenDetails" className={field} {...register("lastSeenDetails")} />
        </div>
      )}

      <div>
        <label htmlFor="contactPhone" className="block text-gray-300 mb-1">Téléphone</label>
        <input id="contactPhone" className={field} {...register("contactPhone", { required: true })} />
      </div>
      <div>
        <label htmlFor="contactWhatsapp" className="block text-gray-300 mb-1">WhatsApp (optionnel)</label>
        <input id="contactWhatsapp" className={field} {...register("contactWhatsapp")} />
      </div>

      <button type="submit" className="rounded bg-cyan-600 px-5 py-2.5 text-white font-semibold">
        Publier
      </button>
    </form>
  );
}
```

- [ ] **Step 4: Vérifier le succès**

Run: `npx vitest run src/components/listing/ListingForm.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/listing/ListingForm.tsx frontend/src/components/listing/ListingForm.test.tsx
git commit -m "feat: ListingForm champs conditionnels"
```

---

## Task 9: `ResponseForm` (claim / sighting)

**Files:**
- Create: `frontend/src/components/listing/ResponseForm.tsx`
- Test: `frontend/src/components/listing/ResponseForm.test.tsx`

- [ ] **Step 1: Écrire le test**

```tsx
import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/renderWithProviders";
import { ResponseForm } from "./ResponseForm";

describe("ResponseForm", () => {
  it("CLAIM: champ signes distinctifs", () => {
    renderWithProviders(<ResponseForm kind="CLAIM" onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/signes distinctifs/i)).toBeInTheDocument();
  });
  it("SIGHTING: champ lieu d'observation", () => {
    renderWithProviders(<ResponseForm kind="SIGHTING" onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/lieu/i)).toBeInTheDocument();
  });
  it("soumet le message", async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<ResponseForm kind="SIGHTING" onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText(/message/i), "Vu hier");
    await userEvent.click(screen.getByRole("button", { name: /envoyer/i }));
    expect(onSubmit).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run src/components/listing/ResponseForm.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implémenter `ResponseForm.tsx`**

```tsx
import { useForm } from "react-hook-form";
import { ResponseKind } from "../../domain/listing.types";

const field =
  "w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white";

export function ResponseForm({
  kind,
  onSubmit,
}: {
  kind: ResponseKind;
  onSubmit: (d: Record<string, unknown>) => void;
}) {
  const { register, handleSubmit } = useForm();
  return (
    <form
      onSubmit={handleSubmit((d) => onSubmit({ ...d, kind }))}
      className="space-y-3"
    >
      <div>
        <label htmlFor="message" className="block text-gray-300 mb-1">Message</label>
        <textarea id="message" className={field} {...register("message", { required: true })} />
      </div>
      {kind === "CLAIM" && (
        <div>
          <label htmlFor="features" className="block text-gray-300 mb-1">Signes distinctifs</label>
          <textarea id="features" className={field} {...register("distinguishingFeatures")} />
        </div>
      )}
      {kind === "SIGHTING" && (
        <>
          <div>
            <label htmlFor="loc" className="block text-gray-300 mb-1">Lieu d'observation</label>
            <input id="loc" className={field} {...register("sightingLocation")} />
          </div>
          <div>
            <label htmlFor="sdate" className="block text-gray-300 mb-1">Date d'observation</label>
            <input id="sdate" type="date" className={field} {...register("sightingDate")} />
          </div>
        </>
      )}
      <button type="submit" className="rounded bg-cyan-600 px-5 py-2.5 text-white font-semibold">
        Envoyer
      </button>
    </form>
  );
}
```

- [ ] **Step 4: Vérifier le succès**

Run: `npx vitest run src/components/listing/ResponseForm.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/listing/ResponseForm.tsx frontend/src/components/listing/ResponseForm.test.tsx
git commit -m "feat: ResponseForm claim/sighting"
```

---

## Task 10: `ListingDetail`

**Files:**
- Create: `frontend/src/components/listing/ListingDetail.tsx`
- Test: `frontend/src/components/listing/ListingDetail.test.tsx`

- [ ] **Step 1: Écrire le test (vue de présentation pure)**

```tsx
import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/renderWithProviders";
import { ListingDetailView } from "./ListingDetail";
import { Listing } from "../../domain/listing.types";

const listing: Listing = {
  id: "9", type: "PERSON", direction: "MISSING", title: "Awa Diop",
  description: "disparue", country: "Sénégal", region: "Thiès", city: "Thiès",
  date: "2026-05-01", photoUrl: "", contactPhone: "+221770000000",
  age: 12, gender: "F", userId: "u", status: "PENDING", isResolved: false,
  createdAt: "", updatedAt: "",
};

describe("ListingDetailView", () => {
  it("personne => bouton 'Je l'ai vu' et contact masqué hors connexion", () => {
    renderWithProviders(
      <ListingDetailView listing={listing} isAuthenticated={false} />
    );
    expect(screen.getByText("Awa Diop")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /je l'ai vu/i })).toBeInTheDocument();
    expect(screen.queryByText("+221770000000")).toBeNull();
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run src/components/listing/ListingDetail.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implémenter `ListingDetail.tsx`**

```tsx
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Listing, responseKindForDirection } from "../../domain/listing.types";
import { listingConfig } from "../../domain/listingConfig";
import { ContactBlock } from "./ContactBlock";
import { ResponseForm } from "./ResponseForm";
import {
  useGetListingQuery,
  useCreateResponseMutation,
} from "../../redux/api/listingApi";
import { useUserVerification } from "../../auth/auth";

export function ListingDetailView({
  listing,
  isAuthenticated,
  onRespond,
}: {
  listing: Listing;
  isAuthenticated: boolean;
  onRespond?: (d: Record<string, unknown>) => void;
}) {
  const [open, setOpen] = useState(false);
  const kind = responseKindForDirection(listing.direction);
  const cfg = listingConfig[listing.type];
  const ctaLabel = kind === "SIGHTING" ? "Je l'ai vu" : "Revendiquer";
  return (
    <article className="max-w-3xl mx-auto p-6 space-y-4">
      <span className="text-xs uppercase text-cyan-400">
        {cfg.directionLabels[listing.direction]}
      </span>
      <h1 className="text-2xl font-bold text-white">{listing.title}</h1>
      {listing.photoUrl && (
        <img src={listing.photoUrl} alt={listing.title} className="rounded-lg max-h-80" />
      )}
      <p className="text-gray-300">{listing.description}</p>
      <p className="text-gray-400">
        {listing.city}, {listing.region} — {listing.country}
      </p>
      <ContactBlock
        phone={listing.contactPhone}
        whatsapp={listing.contactWhatsapp}
        isAuthenticated={isAuthenticated}
      />
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded bg-cyan-600 px-5 py-2.5 text-white font-semibold"
      >
        {ctaLabel}
      </button>
      {open && onRespond && <ResponseForm kind={kind} onSubmit={onRespond} />}
    </article>
  );
}

export function ListingDetail() {
  const { id = "" } = useParams();
  const { data } = useGetListingQuery(id);
  const user: any = useUserVerification();
  const [createResponse] = useCreateResponseMutation();
  if (!data?.data) return <p className="text-gray-400 p-6">Chargement…</p>;
  return (
    <ListingDetailView
      listing={data.data}
      isAuthenticated={Boolean(user?.email)}
      onRespond={(body) => createResponse({ listingId: id, body })}
    />
  );
}
```

- [ ] **Step 4: Vérifier le succès**

Run: `npx vitest run src/components/listing/ListingDetail.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/listing/ListingDetail.tsx frontend/src/components/listing/ListingDetail.test.tsx
git commit -m "feat: ListingDetail + CTA réponse contextuel"
```

---

## Task 11: Pages minces par type (objets/animaux/personnes)

**Files:**
- Create: `frontend/src/pages/objets/ObjetsPage.tsx`, `ObjetDetail.tsx`, `ObjetSignaler.tsx`
- Create: `frontend/src/pages/animaux/AnimauxPage.tsx`, `AnimalDetail.tsx`, `AnimalSignaler.tsx`
- Create: `frontend/src/pages/personnes/PersonnesPage.tsx`, `PersonneDetail.tsx`, `PersonneSignaler.tsx`, `PersonneVu.tsx`
- Test: `frontend/src/pages/objets/ObjetSignaler.test.tsx`

Ces pages sont des wrappers minces autour des composants génériques. Le détail réutilise `ListingDetail` (même composant pour les 3 types, via `useParams`).

- [ ] **Step 1: Écrire le test (signaler objet déduit la direction de l'URL)**

```tsx
import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/renderWithProviders";
import { ObjetSignaler } from "./ObjetSignaler";

describe("ObjetSignaler", () => {
  it("direction=found via l'URL => libellé objet trouvé", () => {
    renderWithProviders(<ObjetSignaler />, {
      route: "/objets/signaler?direction=FOUND",
    });
    expect(screen.getByRole("heading", { name: /objet trouvé/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run src/pages/objets/ObjetSignaler.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implémenter un wrapper de signalement réutilisable + pages objets**

Create `frontend/src/components/listing/SignalerPage.tsx` (réutilisé par les 3 types) :
```tsx
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ListingType,
  ListingDirection,
  directionsForType,
} from "../../domain/listing.types";
import { listingConfig } from "../../domain/listingConfig";
import { ListingForm } from "./ListingForm";
import { useCreateListingMutation } from "../../redux/api/listingApi";

export function SignalerPage({ type }: { type: ListingType }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const cfg = listingConfig[type];
  const allowed = directionsForType(type);
  const urlDir = params.get("direction") as ListingDirection | null;
  const direction: ListingDirection =
    urlDir && allowed.includes(urlDir) ? urlDir : allowed[0];
  const [createListing] = useCreateListingMutation();
  return (
    <section>
      <h1 className="text-2xl font-bold text-white text-center pt-6">
        {cfg.directionLabels[direction]}
      </h1>
      <ListingForm
        type={type}
        direction={direction}
        onSubmit={async (data) => {
          await createListing(data).unwrap().catch(() => {});
          navigate(cfg.basePath);
        }}
      />
    </section>
  );
}
```

Create `frontend/src/pages/objets/ObjetsPage.tsx` :
```tsx
import { ListingList } from "../../components/listing/ListingList";
export function ObjetsPage() {
  return <ListingList type="OBJECT" />;
}
```

Create `frontend/src/pages/objets/ObjetSignaler.tsx` :
```tsx
import { SignalerPage } from "../../components/listing/SignalerPage";
export function ObjetSignaler() {
  return <SignalerPage type="OBJECT" />;
}
```

Create `frontend/src/pages/objets/ObjetDetail.tsx` :
```tsx
import { ListingDetail } from "../../components/listing/ListingDetail";
export function ObjetDetail() {
  return <ListingDetail />;
}
```

Create les équivalents animaux (`AnimauxPage` → `type="ANIMAL"`, `AnimalSignaler` → `type="ANIMAL"`, `AnimalDetail` → `ListingDetail`) :
```tsx
// AnimauxPage.tsx
import { ListingList } from "../../components/listing/ListingList";
export function AnimauxPage() {
  return <ListingList type="ANIMAL" />;
}
```
```tsx
// AnimalSignaler.tsx
import { SignalerPage } from "../../components/listing/SignalerPage";
export function AnimalSignaler() {
  return <SignalerPage type="ANIMAL" />;
}
```
```tsx
// AnimalDetail.tsx
import { ListingDetail } from "../../components/listing/ListingDetail";
export function AnimalDetail() {
  return <ListingDetail />;
}
```

Create les pages personnes :
```tsx
// PersonnesPage.tsx
import { ListingList } from "../../components/listing/ListingList";
export function PersonnesPage() {
  return <ListingList type="PERSON" />;
}
```
```tsx
// PersonneSignaler.tsx
import { SignalerPage } from "../../components/listing/SignalerPage";
export function PersonneSignaler() {
  return <SignalerPage type="PERSON" />;
}
```
```tsx
// PersonneDetail.tsx
import { ListingDetail } from "../../components/listing/ListingDetail";
export function PersonneDetail() {
  return <ListingDetail />;
}
```
`PersonneVu` redirige vers le détail (le formulaire sighting est dans `ListingDetail`) :
```tsx
// PersonneVu.tsx
import { Navigate, useParams } from "react-router-dom";
export function PersonneVu() {
  const { id } = useParams();
  return <Navigate to={`/personnes/${id}`} replace />;
}
```

- [ ] **Step 4: Vérifier le succès**

Run: `npx vitest run src/pages/objets/ObjetSignaler.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/objets frontend/src/pages/animaux frontend/src/pages/personnes frontend/src/components/listing/SignalerPage.tsx
git commit -m "feat: pages objets/animaux/personnes (wrappers génériques)"
```

---

## Task 12: Navbar structure A

**Files:**
- Modify: `frontend/src/components/navbar/Navbars.tsx`
- Test: `frontend/src/components/navbar/Navbars.test.tsx`

- [ ] **Step 1: Écrire le test**

```tsx
import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/renderWithProviders";
import { Navbars } from "./Navbars";

describe("Navbars", () => {
  it("affiche la marque Retrouver et les 3 menus de type", () => {
    renderWithProviders(<Navbars />);
    expect(screen.getByText("Retrouver")).toBeInTheDocument();
    expect(screen.getByText("Objets")).toBeInTheDocument();
    expect(screen.getByText("Animaux")).toBeInTheDocument();
    expect(screen.getByText("Personnes")).toBeInTheDocument();
  });
  it("ne contient plus de lien AI Search", () => {
    renderWithProviders(<Navbars />);
    expect(screen.queryByText(/AI Search/i)).toBeNull();
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run src/components/navbar/Navbars.test.tsx`
Expected: FAIL (encore "AI Search", marque "Lost & Found").

- [ ] **Step 3: Réécrire `Navbars.tsx`**

Remplacer la marque par « Retrouver », retirer le lien `/ai-search` et l'import `FaBrain`, remplacer les `NavbarLink` publics par 3 `Dropdown` (un par type) + Accueil + À propos. Conserver le bloc avatar/auth existant (Dashboard/Settings/Mes annonces/Déconnexion), en remplaçant les liens « My lost/found items » par `Mes annonces` (`/mon-espace/annonces`) et `Mes réponses` (`/mon-espace/reponses`). Contenu des `NavbarCollapse` :
```tsx
import { Dropdown, DropdownItem } from "flowbite-react";
import { Link } from "react-router-dom";
import { listingConfig } from "../../domain/listingConfig";
import { directionsForType, ListingType } from "../../domain/listing.types";

function TypeMenu({ type }: { type: ListingType }) {
  const cfg = listingConfig[type];
  return (
    <Dropdown
      inline
      label={
        <span className="text-gray-300 hover:text-white px-4 py-3 font-medium">
          {cfg.emoji} {cfg.label}
        </span>
      }
    >
      <DropdownItem as={Link} to={cfg.basePath}>
        Parcourir
      </DropdownItem>
      {directionsForType(type).map((d) => (
        <DropdownItem
          key={d}
          as={Link}
          to={`${cfg.basePath}/signaler?direction=${d}`}
        >
          {cfg.directionLabels[d]}
        </DropdownItem>
      ))}
    </Dropdown>
  );
}
```
Et dans `NavbarCollapse` :
```tsx
<NavbarLink href="/">Accueil</NavbarLink>
<TypeMenu type="OBJECT" />
<TypeMenu type="ANIMAL" />
<TypeMenu type="PERSON" />
<NavbarLink href="/a-propos">À propos</NavbarLink>
```
Marque (`NavbarBrand`) : remplacer `Lost & Found` / `Find what matters` par `Retrouver` / `Objets · Animaux · Personnes`.

- [ ] **Step 4: Vérifier le succès**

Run: `npx vitest run src/components/navbar/Navbars.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/navbar/Navbars.tsx frontend/src/components/navbar/Navbars.test.tsx
git commit -m "feat: navbar structure A (Retrouver, menus par type)"
```

---

## Task 13: Routes + bascule + suppression de l'ancien

**Files:**
- Modify: `frontend/src/main.tsx`
- Modify: `frontend/src/pages/home/Home.tsx`
- Delete: `frontend/src/pages/aiSearch/`, anciennes pages objets, ancien `api.ts` AI search.
- Test: `frontend/src/routes.test.tsx`

- [ ] **Step 1: Écrire le test de routage**

```tsx
import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { makeStore } from "./test/renderWithProviders";
import { appRoutes } from "./routes";

describe("routes", () => {
  it("/objets rend la page objets", async () => {
    const router = createMemoryRouter(appRoutes, { initialEntries: ["/objets"] });
    const { render } = await import("@testing-library/react");
    render(
      <Provider store={makeStore()}>
        <RouterProvider router={router} />
      </Provider>
    );
    expect(await screen.findByPlaceholderText(/Pays/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run src/routes.test.tsx`
Expected: FAIL (`./routes` introuvable).

- [ ] **Step 3: Extraire les routes dans `src/routes.tsx`**

Créer `src/routes.tsx` exportant `appRoutes` (tableau passé à `createBrowserRouter`), avec App layout + enfants :
```tsx
import App from "./App";
import { Home } from "./pages/home/Home";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import { ObjetsPage } from "./pages/objets/ObjetsPage";
import { ObjetDetail } from "./pages/objets/ObjetDetail";
import { ObjetSignaler } from "./pages/objets/ObjetSignaler";
import { AnimauxPage } from "./pages/animaux/AnimauxPage";
import { AnimalDetail } from "./pages/animaux/AnimalDetail";
import { AnimalSignaler } from "./pages/animaux/AnimalSignaler";
import { PersonnesPage } from "./pages/personnes/PersonnesPage";
import { PersonneDetail } from "./pages/personnes/PersonneDetail";
import { PersonneSignaler } from "./pages/personnes/PersonneSignaler";
import { PersonneVu } from "./pages/personnes/PersonneVu";

export const appRoutes = [
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/objets", element: <ObjetsPage /> },
      { path: "/objets/signaler", element: <ObjetSignaler /> },
      { path: "/objets/:id", element: <ObjetDetail /> },
      { path: "/animaux", element: <AnimauxPage /> },
      { path: "/animaux/signaler", element: <AnimalSignaler /> },
      { path: "/animaux/:id", element: <AnimalDetail /> },
      { path: "/personnes", element: <PersonnesPage /> },
      { path: "/personnes/signaler", element: <PersonneSignaler /> },
      { path: "/personnes/:id", element: <PersonneDetail /> },
      { path: "/personnes/:id/vu", element: <PersonneVu /> },
    ],
  },
];
```
Note : adapter les imports `Login`/`Register`/`Home` aux exports réels (default vs nommé) constatés dans les fichiers.

- [ ] **Step 4: Câbler `main.tsx` sur `appRoutes`**

Remplacer le tableau inline par `createBrowserRouter(appRoutes)` (importer `appRoutes`). Conserver les routes `/dashboard/*` existantes en les déplaçant dans `appRoutes` ou en les concaténant. Supprimer l'import et la route `/ai-search`.

- [ ] **Step 5: Nettoyer Home + supprimer l'AI search**

Dans `Home.tsx` : retirer toute référence à AI search ; remplacer les sections « recent lost/found items » par des aperçus via `useGetListingsQuery` pour les 3 types (réutiliser `ListingCard`). Supprimer le dossier `src/pages/aiSearch/`. Retirer l'endpoint `aiSearch` et `useAiSearchMutation` de `src/redux/api/api.ts`.

Run: `git rm -r frontend/src/pages/aiSearch`

- [ ] **Step 6: Vérifier le succès + build**

Run: `npx vitest run src/routes.test.tsx`
Expected: PASS.
Run: `npm run build`
Expected: build TypeScript OK (corriger toute référence cassée aux anciennes pages).

- [ ] **Step 7: Commit**

```bash
git add -A frontend/src
git commit -m "feat: routes Retrouver + suppression AI search"
```

---

## Task 14: Espace utilisateur + dashboard admin (listings/responses)

**Files:**
- Create: `frontend/src/pages/monEspace/MesAnnonces.tsx`, `MesReponses.tsx`
- Modify: `frontend/src/dashboard/pages/*` — remplacer la gestion items/claims par listings/responses
- Modify: `frontend/src/main.tsx` / `src/routes.tsx` — routes `/mon-espace/*`, dashboard
- Test: `frontend/src/pages/monEspace/MesAnnonces.test.tsx`

- [ ] **Step 1: Écrire le test (état vide « Mes annonces »)**

```tsx
import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/renderWithProviders";
import { MesAnnoncesView } from "./MesAnnonces";

describe("MesAnnoncesView", () => {
  it("liste vide => message", () => {
    renderWithProviders(<MesAnnoncesView items={[]} isLoading={false} />);
    expect(screen.getByText(/aucune annonce/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run src/pages/monEspace/MesAnnonces.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implémenter `MesAnnonces.tsx`**

```tsx
import { Listing } from "../../domain/listing.types";
import { ListingCard } from "../../components/listing/ListingCard";
import { useGetMyListingsQuery } from "../../redux/api/listingApi";

export function MesAnnoncesView({
  items,
  isLoading,
}: {
  items: Listing[];
  isLoading: boolean;
}) {
  if (isLoading) return <p className="text-gray-400 p-6">Chargement…</p>;
  if (items.length === 0)
    return <p className="text-gray-400 p-6">Aucune annonce pour l'instant.</p>;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 p-6">
      {items.map((l) => (
        <ListingCard key={l.id} listing={l} />
      ))}
    </div>
  );
}

export function MesAnnonces() {
  const { data, isLoading } = useGetMyListingsQuery();
  return <MesAnnoncesView items={data?.data ?? []} isLoading={isLoading} />;
}
```

- [ ] **Step 4: Implémenter `MesReponses.tsx`**

```tsx
import { ListingResponse } from "../../domain/listing.types";
import { useGetMyResponsesQuery } from "../../redux/api/listingApi";

export function MesReponsesView({ items }: { items: ListingResponse[] }) {
  if (items.length === 0)
    return <p className="text-gray-400 p-6">Aucune réponse.</p>;
  return (
    <ul className="p-6 space-y-2">
      {items.map((r) => (
        <li key={r.id} className="rounded border border-gray-700 bg-gray-800 p-3 text-gray-200">
          <span className="text-xs uppercase text-cyan-400">{r.kind}</span> — {r.message}{" "}
          <span className="text-gray-500">[{r.status}]</span>
        </li>
      ))}
    </ul>
  );
}

export function MesReponses() {
  const { data } = useGetMyResponsesQuery();
  return <MesReponsesView items={data?.data ?? []} />;
}
```

- [ ] **Step 5: Adapter le dashboard admin**

Dans `src/dashboard/pages/` : renommer/adapter `FoundItemsManagement`+`LostItemsManagement` en `ListingsManagement` (liste filtrable par type/direction via `useGetListingsQuery`, actions delete/resolve via `useDeleteListingMutation`/`useResolveListingMutation`) et `ClaimsManagement` en `ResponsesManagement` (`useGetAllResponsesQuery` + `useUpdateResponseStatusMutation`). `UsersManagement`, `CategoriesManagement`, `Settings` inchangés (endpoints existants conservés). Mettre à jour `DashboardLayout` (menu latéral) en conséquence.

- [ ] **Step 6: Ajouter les routes**

Dans `src/routes.tsx` : ajouter sous le layout `/mon-espace/annonces` → `MesAnnonces`, `/mon-espace/reponses` → `MesReponses`. Mettre à jour les routes `/dashboard/*` vers les composants renommés. Ajouter route `/a-propos`.

- [ ] **Step 7: Vérifier le succès + build**

Run: `npx vitest run src/pages/monEspace/MesAnnonces.test.tsx`
Expected: PASS.
Run: `npm run build`
Expected: OK.

- [ ] **Step 8: Commit**

```bash
git add -A frontend/src
git commit -m "feat: mon-espace + dashboard listings/responses"
```

---

## Task 15: Vérification finale Phase 1

- [ ] **Step 1: Suite de tests complète**

Run (depuis `frontend/`): `npm test`
Expected: tous les tests passent.

- [ ] **Step 2: Build de production**

Run: `npm run build`
Expected: build OK, aucun import cassé, aucune référence résiduelle à `ai-search` / anciennes pages.

- [ ] **Step 3: Lint**

Run: `npx eslint src --max-warnings=0` (ou `npm run lint` si défini)
Expected: pas d'erreur.

- [ ] **Step 4: Commit final éventuel**

```bash
git add -A frontend
git commit -m "chore: vérification finale Phase 1 frontend"
```

---

## Self-review (couverture spec)

- Navbar structure A, marque « Retrouver » → Task 12.
- 3 types × directions, asymétrie personnes → Task 2/3 (`directionsForType`), Task 8/11.
- Contact tél+WhatsApp masqué hors connexion → Task 5, Task 10.
- Géo pays/région/ville → Task 7 (filtres), Task 8 (formulaire).
- AI search supprimée → Task 12 (navbar), Task 13 (page+endpoint).
- Claims/sightings (Response) → Task 4, Task 9, Task 10, Task 14.
- Dashboard admin + mon-espace étendus → Task 14.
- Routes complètes → Task 13/14.
- Tests unitaires (ship-balanced) → toutes les tasks.

Hors périmètre Phase 1 (→ Phase 2 backend) : schéma Prisma, modules `listing`/`response`, validation Zod conditionnelle, sécurité owner/admin serveur, migration des données. Le front consomme un contrat figé ; tant que le backend Phase 2 n'est pas livré, les appels réseau échoueront en exécution réelle mais les tests unitaires (store/données mockés) passent.
