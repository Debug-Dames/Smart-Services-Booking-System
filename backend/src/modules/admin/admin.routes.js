import express from "express";
import * as adminController from "./admin.controller.js";
import {
  validateCreateUser,
  validateUpdateUser,
  validateUserId,
  validateCreateStylist,
  validateUpdateStylist,
  validateStylistId,
  validateCreateService,
  validateServiceId,
  validateUpdateService,
} from "../../middlewares/admin.validation.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";

const router = express.Router();
const requireAdmin = [protect, roleMiddleware("ADMIN")];

router.get("/users", ...requireAdmin, adminController.getUsers);
router.post("/users", ...requireAdmin, validateCreateUser, adminController.createUser);
router.put("/users/:id", ...requireAdmin, validateUserId, validateUpdateUser, adminController.updateUser);
router.delete("/users/:id", ...requireAdmin, validateUserId, adminController.deleteUser);
router.get("/stylists", ...requireAdmin, adminController.getStylists);
router.post("/stylists", ...requireAdmin, validateCreateStylist, adminController.createStylist);
router.put("/stylists/:id", ...requireAdmin, validateStylistId, validateUpdateStylist, adminController.updateStylist);
router.delete("/stylists/:id", ...requireAdmin, validateStylistId, adminController.deleteStylist);
router.get("/services", ...requireAdmin, adminController.getServices);
router.post("/services", ...requireAdmin, validateCreateService, adminController.createService);
router.put(
  "/services/:id",
  ...requireAdmin,
  validateServiceId,
  validateUpdateService,
  adminController.updateService
);
router.delete("/services/:id", ...requireAdmin, validateServiceId, adminController.deleteService);

export default router;
