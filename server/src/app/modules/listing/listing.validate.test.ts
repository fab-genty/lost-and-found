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
