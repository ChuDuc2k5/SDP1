import {
  getProfileData,
  updateProfile as updateProfileFacade,
} from "../facades/user.facade.js";

export const getProfile = async (req, res) => {
  try {
    const { user } = await getProfileData(req.currentUser);
    return res.render("vwUser/profile", { user });
  } catch (err) {
    return res.send("Server error: " + err.message);
  }
};

export const updateProfile = async (req, res) => {
  let user = null;

  try {
    ({ user } = await updateProfileFacade(req.currentUser, req.body));

    return res.render("vwUser/profile", {
      user,
      success: "Profile updated successfully",
    });
  } catch (err) {
    if (!user) {
      ({ user } = await getProfileData(req.currentUser));
    }

    return res.render("vwUser/profile", {
      user,
      error: err.message,
    });
  }
};
