import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import sendResponse from "../../global/response";
import AppError from "../../global/error";
import { responseService } from "./response.service";
import { canMutate } from "../../utils/authz";

const createResponse = async (req: Request, res: Response) => {
  try {
    const result = await responseService.createResponse(req.params.id, req.user.id, req.body);
    sendResponse(res, { statusCode: StatusCodes.CREATED, success: true, message: "Réponse envoyée", data: result });
  } catch (error: any) {
    sendResponse(res, { statusCode: StatusCodes.BAD_REQUEST, success: false, message: error?.message, data: null });
  }
};

const getMyResponses = async (req: Request, res: Response) => {
  try {
    const result = await responseService.getMyResponses(req.user.id);
    sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Mes réponses", data: result });
  } catch (error: any) {
    sendResponse(res, { statusCode: StatusCodes.BAD_REQUEST, success: false, message: error?.message, data: null });
  }
};

const getAllResponses = async (_req: Request, res: Response) => {
  try {
    const result = await responseService.getAllResponses();
    sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Réponses", data: result });
  } catch (error: any) {
    sendResponse(res, { statusCode: StatusCodes.BAD_REQUEST, success: false, message: error?.message, data: null });
  }
};

const updateStatus = async (req: Request, res: Response) => {
  try {
    const existing = await responseService.getResponseWithListing(req.params.id);
    if (!existing) throw new AppError(StatusCodes.NOT_FOUND, "Réponse introuvable");
    if (!canMutate(req.user as { id?: string; role?: string }, existing.listing.userId)) {
      throw new AppError(StatusCodes.FORBIDDEN, "Action non autorisée");
    }
    await responseService.updateStatus(req.params.id, req.body.status);
    sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Statut mis à jour", data: null });
  } catch (error: any) {
    sendResponse(res, { statusCode: error?.statusCode || StatusCodes.BAD_REQUEST, success: false, message: error?.message, data: null });
  }
};

export const responseController = {
  createResponse,
  getMyResponses,
  getAllResponses,
  updateStatus,
};
