import {
  create as createUser,
  findByEmailInsensitive,
  updatePassword,
} from "../dao/user.dao.js";
import {
  createOtp,
  deleteOtpByEmail,
  getOtpByEmail,
} from "./otp.service.js";
import { User } from "../models/user.model.js";
import { comparePassword, hashPassword } from "../utils/hash.js";
import { generateToken } from "../utils/token.js";
import { sendOtpEmail } from "../utils/mailer.js";
import { normalizeUser, ROLE } from "../utils/sessionUser.js";

const normalizeEmail = (email) =>
  typeof email === "string" ? email.trim().toLowerCase() : "";

const assertEmail = (email) => {
  const cleanEmail = normalizeEmail(email);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    throw new Error("Invalid email format");
  }

  return cleanEmail;
};

export const loginService = async ({ email, password }) => {
  const cleanEmail = assertEmail(email);

  if (!password) {
    throw new Error("Password is required");
  }

  const user = await findByEmailInsensitive(cleanEmail);
  if (!user) throw new Error("User not found");

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) throw new Error("Wrong password");

  const sessionUser = normalizeUser(User.fromRow(user).toSafeJSON());
  const token = generateToken(sessionUser);

  return {
    message: "Login success",
    token,
    user: sessionUser,
  };
};

export const signupService = async (data) => {
  const email = assertEmail(data.email);

  if (!data.fullName?.trim()) {
    throw new Error("Full name is required");
  }

  if (!data.password || data.password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  const exist = await findByEmailInsensitive(email);
  if (exist) throw new Error("Email already exists");

  const hashed = await hashPassword(data.password);

  const created = await createUser({
    fullName: data.fullName.trim(),
    email,
    password: hashed,
    phone: data.phone,
    nationalId: data.nationalId,
    dateOfBirth: data.dateOfBirth,
    gender: data.gender,
    address: data.address,
    nationality: data.nationality,
    role: ROLE.CUSTOMER,
  });

  return {
    message: "Signup success",
    user: normalizeUser(User.fromRow(created).toSafeJSON()),
  };
};

export const identityVerification = async ({ email }) => {
  const cleanEmail = assertEmail(email);
  console.log(`[forgot-password] email received: ${cleanEmail}`);

  const user = await findByEmailInsensitive(cleanEmail);
  if (!user) throw new Error("Email not found");

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  console.log(`[forgot-password] OTP generated for ${cleanEmail}: ${otp}`);

  await deleteOtpByEmail(cleanEmail);
  await createOtp({
    email: cleanEmail,
    otp,
    expiresAt,
    userId: user._id,
  });
  console.log(`[forgot-password] OTP saved to DB for ${cleanEmail}`);

  console.log(`[forgot-password] sending mail to user email: ${cleanEmail}`);
  try {
    const mailResult = await sendOtpEmail(cleanEmail, otp);

    if (mailResult?.sent) {
      console.log(`[forgot-password] mail sent successfully to ${cleanEmail}`);
    } else if (mailResult?.fallback) {
      console.log(`[forgot-password] mail fallback used; OTP logged for ${cleanEmail}`);
    }
  } catch (err) {
    console.error(`[forgot-password] mail error for ${cleanEmail}: ${err.message}`);
    throw err;
  }

  return true;
};

export const verifyOTPService = async ({ email, otp }) => {
  const cleanEmail = assertEmail(email);

  if (!otp) {
    throw new Error("OTP is required");
  }

  const otpRecord = await getOtpByEmail(cleanEmail);

  if (!otpRecord) {
    throw new Error("OTP not found");
  }

  if (!otpRecord.isMatch(otp)) {
    throw new Error("Invalid OTP");
  }

  if (otpRecord.isExpired()) {
    throw new Error("OTP expired");
  }

  return true;
};

export const resetPasswordService = async ({ email, password }) => {
  const cleanEmail = assertEmail(email);

  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  const user = await findByEmailInsensitive(cleanEmail);
  if (!user) {
    throw new Error("User not found");
  }

  const hashed = await hashPassword(password);
  await updatePassword(user.email, hashed);

  return true;
};
