import db from "../dbHelper/db.js";

const normalizeEmail = (email) =>
  typeof email === "string" ? email.trim().toLowerCase() : "";

export const deleteOTPByEmail = (email) => {
  return db("otps").where({ email: normalizeEmail(email) }).del();
};

export const deleteByEmail = deleteOTPByEmail;

export const createOTP = async ({ email, otp, expiresAt, userId }) => {
  const inserted = await db("otps").insert({
    email: normalizeEmail(email),
    otp: typeof otp === "string" ? otp.trim() : otp,
    expiresAt,
    userId: userId || null,
  }).returning("*");

  return inserted?.[0] || null;
};

export const create = createOTP;

export const getOTPByEmail = (email) => {
  return db("otps")
    .where({ email: normalizeEmail(email) })
    .orderBy("expiresAt", "desc")
    .first();
};

export const findLatestByEmail = getOTPByEmail;

export const findActiveByEmail = (email) => {
  return db("otps")
    .where({ email: normalizeEmail(email) })
    .where("expiresAt", ">", db.fn.now())
    .orderBy("expiresAt", "desc")
    .first();
};

export const markUsed = (id) => {
  return db("otps").where("_id", id).del();
};

export const deleteExpired = () => {
  return db("otps").where("expiresAt", "<=", db.fn.now()).del();
};

export default {
  deleteOTPByEmail,
  deleteByEmail,
  createOTP,
  create,
  getOTPByEmail,
  findLatestByEmail,
  findActiveByEmail,
  markUsed,
  deleteExpired,
};
