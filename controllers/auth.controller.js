import { use } from "react";
import {
  loginService,
  signupService,
  identityVerification,
  verifyOTPService,
  resetPasswordService,
} from "../services/auth.service.js";


const authController = {

  // ===== UI =====
getLoginPage: (req, res) => {
  const { success } = req.query;

  res.render("vwLogin/login", {
    success,
  });
},

  getSignupPage: (req, res) => {
    res.render("vwLogin/signup");
  },

  getForgotPassword: (req, res) => {
    res.render("vwLogin/forget-password", {
      email: "",
      error: null,
    });
  },

  getVerifyOTP: (req, res) => {
    const { email } = req.query;

    res.render("vwLogin/verify-otp", {
      email,
      error: null,
    });
  },

getResetPassword: (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.redirect("/auth/forget-password");
  }

  res.render("vwLogin/reset-password", {
    email,
    error: null,
  });
},
  // ===== LOGIN =====
login: async (req, res) => {
  try {
    const { token, user } = await loginService(req.body);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
    });

    if (user.role === "admin") {
      return res.redirect("/admin");
    }

    return res.redirect("/");
  } catch (err) {
    return res.render("vwLogin/login", {
      error: err.message,
    });
  }
},

  logout: (req, res) => {
    res.clearCookie("token");
    return res.redirect("/");
  },

  // ===== SIGNUP =====
signup: async (req, res) => {
  try {
    await signupService(req.body);

    return res.redirect("/auth/login?success=Signup successful, login now!");

  } catch (err) {
    return res.render("vwLogin/signup", {
      error: err.message,
      oldData: req.body,
    });
  }
},

  // ===== FORGOT PASSWORD =====
  postForgotPassword: async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.render("vwLogin/forget-password", {
        email,
        error: "Email cannot be empty",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.render("vwLogin/forget-password", {
        email,
        error: "Invalid email format",
      });
    }

    try {
      await identityVerification({ email });

      return res.redirect(`/auth/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err) {
      return res.render("vwLogin/forget-password", {
        email,
        error: err.message || "No account found",
      });
    }
  },

  // ===== VERIFY OTP =====
  postVerifyOTP: async (req, res) => {
    const { email, otp } = req.body;

    if (!otp) {
      return res.render("vwLogin/verify-otp", {
        email,
        error: "OTP is required",
      });
    }

    try {
      await verifyOTPService({ email, otp });

      return res.redirect(`/auth/reset-password?email=${encodeURIComponent(email)}`);

    } catch (err) {
      return res.render("vwLogin/verify-otp", {
        email,
        error: err.message,
      });
    }
  },

  // ===== RESET PASSWORD =====
postResetPassword: async (req, res) => {
  const { email, password, confirmPassword } = req.body;
  console.log("EMAIL FROM FORM:", email);
  if (!email) {
    return res.redirect("/auth/forget-password");
  }

  if (!password || password.length < 6) {
    return res.render("vwLogin/reset-password", {
      email,
      error: "Password must be at least 6 characters",
    });
  }

  if (password !== confirmPassword) {
    return res.render("vwLogin/reset-password", {
      email,
      error: "Passwords do not match",
    });
  }

  try {
    await resetPasswordService({ email, password });

    return res.redirect("/auth/login");

  } catch (err) {
    return res.render("vwLogin/reset-password", {
      email,
      error: err.message || "Something went wrong",
    });
  }
},
};

export default authController;