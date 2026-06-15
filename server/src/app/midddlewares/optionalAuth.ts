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
