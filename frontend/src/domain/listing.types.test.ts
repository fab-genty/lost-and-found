import { describe, it, expect } from "vitest";
import type { ListingType } from "./listing.types";
import { directionsForType, isPerson } from "./listing.types";

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
