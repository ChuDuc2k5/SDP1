import express from "express";
import {
  deleteRateForm,
  listRatesByCabin,
  submitRateForm,
  submitRateJson,
  updateRateForm,
} from "../controllers/rate.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/cabin/:cabinId", listRatesByCabin);
router.post("/submit", requireAuth, submitRateForm);
router.post("/:ratingId/update", requireAuth, updateRateForm);
router.post("/:ratingId/delete", requireAuth, deleteRateForm);
router.post("/", requireAuth, submitRateJson);

export default router;
