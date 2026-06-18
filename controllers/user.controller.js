import {
  getProfileByEmail,
  updateProfileByEmail,
} from "../services/user.service.js";

export const getProfile = async (req, res) => {
  try {
    const user = await getProfileByEmail(req.currentUser.email);
    return res.render("vwUser/profile", { user });
  } catch (err) {
    return res.send("Server error: " + err.message);
  }
};

export const updateProfile = async (req, res) => {
  let user = null;

  try {
    user = await updateProfileByEmail(req.currentUser.email, req.body);

    return res.render("vwUser/profile", {
      user,
      success: "Profile updated successfully",
    });
  } catch (err) {
    if (!user) {
      user = await getProfileByEmail(req.currentUser.email);
    }

    return res.render("vwUser/profile", {
      user,
      error: err.message,
    });
  }
};
