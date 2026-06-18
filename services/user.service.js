import { findByEmail, updateByEmail, updatePassword } from "../models/user.model.js";
import { comparePassword, hashPassword } from "../utils/hash.js";

export const getProfileByEmail = async (email) => {
  const user = await findByEmail(email);
  if (!user) {
    throw new Error("User not found in DB");
  }

  return user;
};

export const updateProfileByEmail = async (email, data) => {
  const currentUser = await getProfileByEmail(email);

  return updateByEmail(email, {
    fullName: data.fullName?.trim() || currentUser.fullName,
    phone: data.phone || currentUser.phone,
    nationalId: data.nationalId || currentUser.nationalId,
    dateOfBirth: data.dateOfBirth || currentUser.dateOfBirth,
    gender: data.gender || currentUser.gender,
    address: data.address || currentUser.address,
    nationality: data.nationality || currentUser.nationality,
  });
};

export const changePasswordByEmail = async ({
  email,
  currentPassword,
  newPassword,
  confirmPassword,
}) => {
  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new Error("All fields are required");
  }

  if (newPassword.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  if (newPassword !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  const user = await getProfileByEmail(email);
  const isMatch = await comparePassword(currentPassword, user.password);

  if (!isMatch) {
    throw new Error("Current password is incorrect");
  }

  const hashed = await hashPassword(newPassword);
  await updatePassword(email, hashed);

  return true;
};
