import { changePassword as changePasswordFacade } from "../facades/user.facade.js";

export const renderChangePassword = (req, res) => {
  res.render("vwUser/change-password");
};

export const changePassword = async (req, res) => {
  try {
    await changePasswordFacade(req.currentUser, {
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
