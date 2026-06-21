import express from "express";
import {
  redirectProfile,
  renderGuestAccount,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", renderGuestAccount);
router.get("/profile", redirectProfile);

export default router;
