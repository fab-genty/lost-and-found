import { describe, it, expect } from "vitest";
import { ResponseSchema } from "./response.validate";

describe("ResponseSchema.create", () => {
  it("accepte un message", () => {
    expect(() => ResponseSchema.create.parse({ body: { message: "Bonjour" } })).not.toThrow();
  });
  it("refuse un message vide", () => {
    expect(() => ResponseSchema.create.parse({ body: { message: "" } })).toThrow();
  });
});
