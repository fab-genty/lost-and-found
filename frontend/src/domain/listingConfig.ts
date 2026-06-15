import type { ListingType } from "./listing.types";

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
