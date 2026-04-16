import { verifyToken } from "../utils/token.js";

export const requireAuth = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.redirect("/auth/login");
    }

    const user = verifyToken(token);
    req.user = user;
    res.locals.user = user;

    next();

  } catch (err) {
    return res.redirect("/auth/login");
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.redirect("/");
  }

  next();
};