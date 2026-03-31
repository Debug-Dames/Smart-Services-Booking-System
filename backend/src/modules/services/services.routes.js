import express from "express";
import * as servicesController from "../../controllers/servicesController.js";

const router = express.Router();

router.get("/", servicesController.getServices);

export default router;
