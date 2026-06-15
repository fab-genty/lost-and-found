import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../global/response";
import prisma from "../config/prisma";

export const adminStats = async (_req: Request, res: Response) => {
  try {
    const [
      totalListings,
      objects,
      animals,
      persons,
      totalResponses,
      pendingResponses,
      totalUsers,
    ] = await Promise.all([
      prisma.listing.count({ where: { isDeleted: false } }),
      prisma.listing.count({ where: { isDeleted: false, type: "OBJECT" } }),
      prisma.listing.count({ where: { isDeleted: false, type: "ANIMAL" } }),
      prisma.listing.count({ where: { isDeleted: false, type: "PERSON" } }),
      prisma.response.count({ where: { isDeleted: false } }),
      prisma.response.count({ where: { isDeleted: false, status: "PENDING" } }),
      prisma.user.count({ where: { isDeleted: false } }),
    ]);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Statistiques",
      data: {
        totalListings,
        objects,
        animals,
        persons,
        totalResponses,
        pendingResponses,
        totalUsers,
      },
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: StatusCodes.BAD_REQUEST,
      success: false,
      message: error?.message,
      data: null,
    });
  }
};
