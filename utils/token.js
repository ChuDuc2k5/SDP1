import jwt from "jsonwebtoken";

const SECRET = "secret_key";

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,          // ✅ phải đúng
      fullName: user.fullName,   // 🔥 FIX ở đây
      role: user.role,
    },
    SECRET,
    { expiresIn: "1d" }
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, SECRET);
};