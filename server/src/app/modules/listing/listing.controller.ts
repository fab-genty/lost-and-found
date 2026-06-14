import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import sendResponse from "../../global/response";
import AppError from "../../global/error";
import { listingService } from "./listing.service";
import { canMutate } from "../../utils/authz";

function stripContact<T extends Record<string, any>>(listing: T): T {
  const { contactPhone, contactWhatsapp, ...rest } = listing;
  return rest as T;
}

const createListing = async (req: Request, res: Response) => {
  try {
    const result = await listingService.createListing(req.body, req.user.id);
    sendResponse(res, { statusCode: StatusCodes.CREATED, success: true, message: "Annonce créée", data: result });
  } catch (error: any) {
    sendResponse(res, { statusCode: StatusCodes.BAD_REQUEST, success: false, message: error?.message, data: null });
  }
};

const getListings = async (req: Request, res: Response) => {
  try {
    const result = await listingService.getListings(req.query);
    const data = req.user ? result : result.map(stripContact);
    sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Annonces récupérées", data });
  } catch (error: any) {
    sendResponse(res, { statusCode: StatusCodes.BAD_REQUEST, success: false, message: error?.message, data: null });
  }
};

const getListing = async (req: Request, res: Response) => {
  try {
    const result = await listingService.getListing(req.params.id);
    if (!result) throw new AppError(StatusCodes.NOT_FOUND, "Annonce introuvable");
    const data = req.user ? result : stripContact(result);
    sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Annonce récupérée", data });
  } catch (error: any) {
    sendResponse(res, { statusCode: error?.statusCode || StatusCodes.BAD_REQUEST, success: false, message: error?.message, data: null });
  }
};

const getMyListings = async (req: Request, res: Response) => {
  try {
    const result = await listingService.getMyListings(req.user.id);
    sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Mes annonces", data: result });
  } catch (error: any) {
    sendResponse(res, { statusCode: StatusCodes.BAD_REQUEST, success: false, message: error?.message, data: null });
  }
};

async function assertCanMutate(req: Request) {
  const existing = await listingService.getListing(req.params.id);
  if (!existing) throw new AppError(StatusCodes.NOT_FOUND, "Annonce introuvable");
  if (!canMutate(req.user as { id?: string; role?: string }, existing.userId)) {
    throw new AppError(StatusCodes.FORBIDDEN, "Action non autorisée");
  }
  return existing;
}

const updateListing = async (req: Request, res: Response) => {
  try {
    await assertCanMutate(req);
    const result = await listingService.updateListing(req.params.id, req.body);
    sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Annonce mise à jour", data: result });
  } catch (error: any) {
    sendResponse(res, { statusCode: error?.statusCode || StatusCodes.BAD_REQUEST, success: false, message: error?.message, data: null });
  }
};

const resolveListing = async (req: Request, res: Response) => {
  try {
    await assertCanMutate(req);
    await listingService.resolveListing(req.params.id);
    sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Annonce marquée résolue", data: null });
  } catch (error: any) {
    sendResponse(res, { statusCode: error?.statusCode || StatusCodes.BAD_REQUEST, success: false, message: error?.message, data: null });
  }
};

const deleteListing = async (req: Request, res: Response) => {
  try {
    await assertCanMutate(req);
    await listingService.softDeleteListing(req.params.id);
    sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Annonce supprimée", data: null });
  } catch (error: any) {
    sendResponse(res, { statusCode: error?.statusCode || StatusCodes.BAD_REQUEST, success: false, message: error?.message, data: null });
  }
};

export const listingController = {
  createListing,
  getListings,
  getListing,
  getMyListings,
  updateListing,
  resolveListing,
  deleteListing,
};
