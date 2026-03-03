import express from "express";
import {
  createService,
  deleteService,
  getServices,
  getUsers,
  updateService,
} from "./admin.service.js";

const router = express.Router();

router.get("/users", getUsers);
router.get("/services", getServices);
router.post("/services", createService);
router.put("/services/:id", updateService);
router.delete("/services/:id", deleteService);

export default router;
