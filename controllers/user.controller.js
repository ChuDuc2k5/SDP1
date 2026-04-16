import { findUserByEmail, updateUserProfile } from "../models/user.model.js";

// ===== GET PROFILE =====
export const getProfile = async (req, res) => {
  try {

    if (!req.user) {
      return res.redirect("/auth/login");
    }

    const email = req.user.email;
    const user = await findUserByEmail(email);

    if (!user) {
      return res.send("User not found in DB");
    }

    return res.render("vwUser/profile", { user });

  } catch (err) {
    return res.send("Server error: " + err.message); 
  }
};


// ===== UPDATE PROFILE =====
export const updateProfile = async (req, res) => {
  try {
    const email = req.user.email;
    const { fullName, phone, dateOfBirth } = req.body;

    const oldUser = await findUserByEmail(email);

    await updateUserProfile(email, {
      fullName: fullName?.trim() || oldUser.fullName,
      phone: phone || oldUser.phone,
      dateOfBirth: dateOfBirth || oldUser.dateOfBirth,
    });

    const user = await findUserByEmail(email);

    return res.render("vwUser/profile", {
      user,
      success: "Profile updated successfully"
    });

  } catch (err) {
    const user = await findUserByEmail(req.user.email);

    return res.render("vwUser/profile", {
      user,
      error: err.message
    });
  }
};