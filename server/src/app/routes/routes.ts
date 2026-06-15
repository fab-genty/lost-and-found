import express from "express";
import auth from "../midddlewares/auth";
import optionalAuth from "../midddlewares/optionalAuth";
import requireAdmin from "../midddlewares/requireAdmin";
import validateRequest from "../midddlewares/validate";
import { userController } from "../modules/user/user.controllers";
import { authController } from "../auth/auth.controller";
import { UserSchema } from "../modules/user/user.validate";
import { categoryController } from "../modules/category/category.controller";
import { CategorySchema } from "../modules/category/category.validate";
import { listingController } from "../modules/listing/listing.controller";
import { ListingSchema } from "../modules/listing/listing.validate";
import { responseController } from "../modules/response/response.controller";
import { ResponseSchema } from "../modules/response/response.validate";
import { adminStats } from "../utils/adminStats";

const router = express.Router();

// Auth
router.post("/register", userController.registerUser);
router.post(
  "/login",
  validateRequest(UserSchema.userLoginSchema),
  authController.login
);
router.post(
  "/change-password",
  auth(),
  validateRequest(UserSchema.changePasswordSchema),
  authController.newPasswords
);
router.post(
  "/change-email",
  auth(),
  validateRequest(UserSchema.changeEmailSchema),
  authController.changeEmail
);
router.post(
  "/change-username",
  auth(),
  validateRequest(UserSchema.changeUsernameSchema),
  authController.changeUsername
);

// Categories
router.get("/item-categories", categoryController.getCategories);
router.post(
  "/item-categories",
  auth(),
  requireAdmin(),
  validateRequest(CategorySchema.createCategory),
  categoryController.createCategory
);
router.put(
  "/item-categories/:id",
  auth(),
  requireAdmin(),
  validateRequest(CategorySchema.createCategory),
  categoryController.updateCategory
);
router.delete(
  "/item-categories/:id",
  auth(),
  requireAdmin(),
  categoryController.deleteCategory
);

// Listings — lecture publique avec auth optionnelle (contact masqué)
router.get("/listings", optionalAuth(), listingController.getListings);
router.get("/listings/:id", optionalAuth(), listingController.getListing);
router.post(
  "/listings",
  auth(),
  validateRequest(ListingSchema.create),
  listingController.createListing
);
router.put(
  "/listings/:id",
  auth(),
  validateRequest(ListingSchema.update),
  listingController.updateListing
);
router.delete("/listings/:id", auth(), listingController.deleteListing);
router.put("/listings/:id/resolve", auth(), listingController.resolveListing);
router.get("/my/listings", auth(), listingController.getMyListings);

// Responses
router.post(
  "/listings/:id/responses",
  auth(),
  validateRequest(ResponseSchema.create),
  responseController.createResponse
);
router.get("/my/responses", auth(), responseController.getMyResponses);
router.get("/responses", auth(), requireAdmin(), responseController.getAllResponses);
router.put(
  "/responses/:id",
  auth(),
  validateRequest(ResponseSchema.updateStatus),
  responseController.updateStatus
);

// Users / admin
router.get("/users", auth(), requireAdmin(), userController.allUsers);
router.get("/admin/stats", auth(), requireAdmin(), adminStats);
router.put("/block/user/:id", auth(), requireAdmin(), userController.blockUser);
router.put("/change-role/:id", auth(), requireAdmin(), userController.changeUserRole);
router.delete("/delete-user/:id", auth(), requireAdmin(), userController.softDeleteUser);

export default router;
