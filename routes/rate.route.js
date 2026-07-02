import express from "express";
import {
  deleteRateForm,
  listRatesByCabin,
  submitRateForm,
  submitRateJson,
  updateRateForm,
} from "../controllers/rate.controller.js";
import { requireCustomer } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/cabin/:cabinId", listRatesByCabin);
router.post("/submit", requireCustomer, submitRateForm);
router.post("/:ratingId/update", requireCustomer, updateRateForm);
router.post("/:ratingId/delete", requireCustomer, deleteRateForm);
router.post("/", requireCustomer, submitRateJson);

export default router;
