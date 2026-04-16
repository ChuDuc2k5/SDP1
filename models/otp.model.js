import db from "../config/db.js";

// chuẩn hoá email (an toàn)
const normalizeEmail = (email) => {
  if (typeof email !== "string") return "";
  return email.trim().toLowerCase();
};

// xoá OTP cũ
export const deleteOTPByEmail = async (email) => {
  return await db("otps")
    .where({ email: normalizeEmail(email) })
    .del();
};

// tạo OTP mới
export const createOTP = async ({ email, otp, expiresAt, userId }) => {
  return await db("otps").insert({
    email: normalizeEmail(email),
    otp: typeof otp === "string" ? otp.trim() : otp,
    expiresAt,
    userId,
  });
};

// lấy OTP mới nhất
export const getOTPByEmail = async (email) => {
  return await db("otps")
    .where({ email })
    .orderBy("expiresAt", "desc")
    .first();
}