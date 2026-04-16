import jwt from "jsonwebtoken";

const SECRET = "secret_key";

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      userId: user._id || user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
    SECRET,
    { expiresIn: "1d" }
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, SECRET);
};