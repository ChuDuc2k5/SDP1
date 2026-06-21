import * as authService from "../services/auth.service.js";

export const signIn = async (credentials) => {
  return authService.loginService(credentials);
};

export const signUp = async (registerData) => {
  return authService.signupService(registerData);
};

export const logout = async () => {
  return true;
};

export const requestPasswordReset = async (email) => {
  return authService.identityVerification({ email });
};

export const sendOtp = async (email, purpose = "password-reset") => {
  if (purpose !== "password-reset") {
    throw new Error("Unsupported OTP purpose");
  }

  return requestPasswordReset(email);
};

export const verifyOtp = async (email, otp) => {
  return authService.verifyOTPService({ email, otp });
};

export const resetPassword = async (email, newPassword, confirmPassword) => {
  if (!newPassword || newPassword.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  if (newPassword !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  return authService.resetPasswordService({
    email,
    password: newPassword,
  });
};

export default {
  signIn,
  signUp,
  logout,
  requestPasswordReset,
  sendOtp,
  verifyOtp,
  resetPassword,
};
