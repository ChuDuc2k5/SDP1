import { findUserByEmail, updateUserProfile } from "../models/user.model.js";
import { comparePassword, hashPassword } from "../utils/hash.js";
import { updatePassword } from "../models/user.model.js";

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const email = req.user.email;

    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new Error("All fields are required");
    }

    if (newPassword.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    if (newPassword !== confirmPassword) {
      throw new Error("Passwords do not match");
    }

    const user = await findUserByEmail(email);

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      throw new Error("Current password is incorrect");
    }

    const hashed = await hashPassword(newPassword);

    await updatePassword(email, hashed);

    return res.render("vwUser/change-password", {
      success: "Password updated successfully",
    });
  } catch (err) {
    return res.render("vwUser/change-password", {
      error: err.message,
    });
  }
};
