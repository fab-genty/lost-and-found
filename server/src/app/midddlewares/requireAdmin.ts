import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import AppError from "../global/error";
import { isAdmin } from "../utils/authz";

const requireAdmin = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!isAdmin(req.user)) {
      return next(new AppError(StatusCodes.FORBIDDEN, "Admin access required"));
    }
    next();
  };
};

export default requireAdmin;
