import express from "express";
import * as adminController from "./admin.controller.js";
import {
  validateCreateService,
  validateServiceId,
  validateUpdateService,
} from "./admin.validation.js";
import { protect } from "./auth.middleware.js";
import { roleMiddleware } from "./role.middleware.js";

const router = express.Router();
const requireAdmin = [protect, roleMiddleware("ADMIN")];

router.get("/users", ...requireAdmin, adminController.getUsers);
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
