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
