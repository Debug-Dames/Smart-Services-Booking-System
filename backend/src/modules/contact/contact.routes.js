import express from "express";
import { submitContact } from "./contact.service.js";

const router = express.Router();

router.post("/", submitContact);

export default router;