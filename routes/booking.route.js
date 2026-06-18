import express from "express";
import {
  cancelBookingById,
  listBookings,
  redirectDetail,
  renderEditBooking,
  renderNewBooking,
  saveBooking,
  showBookingDetail,
  storeBooking,
} from "../controllers/booking.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", listBookings);
router.get("/detail", redirectDetail);
router.get("/detail/:id", showBookingDetail);
router.get("/new/:cabinId", renderNewBooking);
router.post("/create", storeBooking);
router.get("/edit/:id", renderEditBooking);
router.post("/edit/:id/cancel", cancelBookingById);
router.post("/edit/:id", saveBooking);

export default router;
