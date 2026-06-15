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
