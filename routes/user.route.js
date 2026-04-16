import express from 'express';
import { getProfile, updateProfile } from "../controllers/user.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { changePassword } from "../controllers/changepw.controller.js";

const router = express.Router();


router.get("/profile", requireAuth, getProfile);
router.get("/change-password", requireAuth, (req, res) => {
  res.render("vwUser/change-password");
});


router.post("/profile", requireAuth, updateProfile);
router.post("/change-password", requireAuth, changePassword);
export default router;