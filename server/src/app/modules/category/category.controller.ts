import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import sendResponse from "../../global/response";
import { categoryService } from "./category.service";

const createCategory = async (req: Request, res: Response) => {
  try {
    const result = await categoryService.createCategory(req.body);
    sendResponse(res, { statusCode: StatusCodes.CREATED, success: true, message: "Catégorie créée", data: result });
  } catch (error: any) {
    sendResponse(res, { statusCode: StatusCodes.BAD_REQUEST, success: false, message: error?.message, data: null });
  }
};
const getCategories = async (_req: Request, res: Response) => {
  try {
    const result = await categoryService.getCategories();
    sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Catégories", data: result });
  } catch (error: any) {
    sendResponse(res, { statusCode: StatusCodes.BAD_REQUEST, success: false, message: error?.message, data: null });
  }
};
const updateCategory = async (req: Request, res: Response) => {
  try {
    const result = await categoryService.updateCategory(req.params.id, req.body);
    sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Catégorie mise à jour", data: result });
  } catch (error: any) {
    sendResponse(res, { statusCode: StatusCodes.BAD_REQUEST, success: false, message: error?.message, data: null });
  }
};
const deleteCategory = async (req: Request, res: Response) => {
  try {
    await categoryService.deleteCategory(req.params.id);
    sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Catégorie supprimée", data: null });
  } catch (error: any) {
    sendResponse(res, { statusCode: StatusCodes.BAD_REQUEST, success: false, message: error?.message, data: null });
  }
};
export const categoryController = { createCategory, getCategories, updateCategory, deleteCategory };
