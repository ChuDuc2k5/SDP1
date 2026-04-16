import express from "express";
import authController from "../controllers/auth.controller.js";
import { requireAuth, requireAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/login", authController.getLoginPage);
router.get("/signup", authController.getSignupPage);
router.get("/forget-password", authController.getForgotPassword);
router.get("/verify-otp", authController.getVerifyOTP);
router.get("/reset-password", authController.getResetPassword);
router.get("/admin", requireAuth, requireAdmin, (req, res) => {
  res.render("vwAdmin/dashboard");
});

router.post("/login", authController.login);
router.post("/signup", authController.signup);
router.post("/forget-password", authController.postForgotPassword);
router.post("/reset-password", authController.postResetPassword);
router.post("/logout", authController.logout);
router.post("/verify-otp", authController.postVerifyOTP);

export default router;
