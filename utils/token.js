import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { normalizeUser } from "./sessionUser.js";

dotenv.config({ quiet: true });

const SECRET = process.env.JWT_SECRET || "secret_key";

export const generateToken = (user) => {
  const normalizedUser = normalizeUser(user);

  return jwt.sign(
    {
      _id: normalizedUser._id,
      id: normalizedUser.id,
      userId: normalizedUser.userId,
      email: normalizedUser.email,
      fullName: normalizedUser.fullName,
      role: normalizedUser.role,
    },
    SECRET,
    { expiresIn: "1d" }
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, SECRET);
};
