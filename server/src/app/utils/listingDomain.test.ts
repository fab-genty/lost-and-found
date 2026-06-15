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
