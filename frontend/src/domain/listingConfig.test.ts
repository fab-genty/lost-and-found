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
