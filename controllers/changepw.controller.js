import { changePasswordByEmail } from "../services/changepw.service.js";

export const renderChangePassword = (req, res) => {
  res.render("vwUser/change-password");
};

export const changePassword = async (req, res) => {
  try {
    await changePasswordByEmail({
      email: req.currentUser.email,
      currentPassword: req.body.currentPassword,
      newPassword: req.body.newPassword,
      confirmPassword: req.body.confirmPassword,
    });

    return res.render("vwUser/change-password", {
      success: "Password updated successfully",
    });
  } catch (err) {
    return res.render("vwUser/change-password", {
      error: err.message,
    });
  }
};
