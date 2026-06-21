import * as userService from "../services/user.service.js";

const getCurrentEmail = (currentUser) => {
  const email = currentUser?.email;
  if (!email) {
    throw new Error("Unauthorized");
  }

  return email;
};

export const getPersonalPageData = async (currentUser) => {
  return getProfileData(currentUser);
};

export const getProfileData = async (currentUser) => {
  const user = await userService.getProfileByEmail(getCurrentEmail(currentUser));
  return { user };
};

export const updateProfile = async (currentUser, profileData) => {
  const user = await userService.updateProfileByEmail(
    getCurrentEmail(currentUser),
    profileData,
  );

  return { user };
};

export const changePassword = async (currentUser, passwordData) => {
  return userService.changePasswordByEmail({
    email: getCurrentEmail(currentUser),
    currentPassword: passwordData.currentPassword,
    newPassword: passwordData.newPassword,
    confirmPassword: passwordData.confirmPassword,
  });
};

export default {
  getPersonalPageData,
  getProfileData,
  updateProfile,
  changePassword,
};
