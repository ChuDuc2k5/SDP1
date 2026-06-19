import db from "../dbHelper/db.js";

const normalizeEmail = (email) =>
  typeof email === "string" ? email.trim().toLowerCase() : "";

export const deleteOTPByEmail = (email) => {
  return db("otps").where({ email: normalizeEmail(email) }).del();
};

export const createOTP = ({ email, otp, expiresAt, userId }) => {
  return db("otps").insert({
    email: normalizeEmail(email),
    otp: typeof otp === "string" ? otp.trim() : otp,
    expiresAt,
    userId: userId || null,
  });
};

export const getOTPByEmail = (email) => {
  return db("otps")
    .where({ email: normalizeEmail(email) })
    .orderBy("expiresAt", "desc")
    .first();
};

export default {
  deleteOTPByEmail,
  createOTP,
  getOTPByEmail,
};
