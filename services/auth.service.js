import {findUserByEmail,createUser,updatePassword} from "../models/user.model.js";
import {getOTPByEmail, deleteOTPByEmail} from "../models/otp.model.js";
import { createOTP } from "../models/otp.model.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { generateToken } from "../utils/token.js";
import { sendOTP } from "../utils/mailer.js";
import bcrypt from "bcrypt";
import db from "../dbHelper/db.js";

// fake memory OTP (có thể thay bằng DB)
const otpStore = new Map();

// ===== LOGIN =====
export const loginService = async ({ email, password }) => {
  const user = await findUserByEmail(email);

  if (!user) throw new Error("User not found");

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) throw new Error("Wrong password");

  const token = generateToken(user);

  return { message: "Login success", token,
    user: {
      role: user.role,
      email : user.email,
      name : user.name,
    }
  };
};

// ===== SIGNUP =====
export const signupService = async (data) => {
  const exist = await findUserByEmail(data.email);
  if (exist) throw new Error("Email already exists");

  const hashed = await hashPassword(data.password);

  await createUser({
    ...data,
    password: hashed,
  });

  return { message: "Signup success" };
};

// ===== FORGOT PASSWORD =====
export const identityVerification = async ({ email }) => {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("Email not found");

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

  // xoá OTP cũ
  await deleteOTPByEmail(email);

  // lưu OTP mới
  await createOTP({
    email,
    otp,
    expiresAt,
    userID: user.id,
  });

  await sendOTP(email, otp);

  return true;
};

// ===== VERIFY OTP =====
export const verifyOTPService = async ({ email, otp }) => {
  const record = await db("otps")
    .where({ email })
    .orderBy("expiresAt", "desc") 
    .first();

  if (!record) {
    throw new Error("OTP not found");
  }

  if (record.otp !== otp.trim()) {
    throw new Error("Invalid OTP");
  }

  if (new Date(record.expiresAt) < new Date()) {
    throw new Error("OTP expired");
  }

  return true;
};

export const resetPasswordService = async ({ email, password }) => {
  const cleanEmail = email.trim().toLowerCase(); 
  const user = await db("users")
    .whereRaw('LOWER("email") = ?', [cleanEmail])
    .first();

  if (!user) {
    throw new Error("User not found");
  }

  const hash = await bcrypt.hash(password, 10);

  await db("users")
    .where({ email: user.email })
    .update({ password: hash });

  return true;
};