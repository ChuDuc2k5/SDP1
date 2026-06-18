import express from "express";
import {
  listRatesByCabin,
  submitRateForm,
  submitRateJson,
} from "../controllers/rate.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/cabin/:cabinId", listRatesByCabin);
router.post("/submit", requireAuth, submitRateForm);
router.post("/", requireAuth, submitRateJson);

export default router;
