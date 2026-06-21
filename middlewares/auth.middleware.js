import { verifyToken } from "../utils/token.js";
import { normalizeUser, ROLE } from "../utils/sessionUser.js";

export const attachUser = (req, res, next) => {
  const sessionUser = req.session?.user || null;
  let normalizedUser = normalizeUser(sessionUser);

  if (!normalizedUser) {
    const token = req.cookies?.token;

    if (token) {
      try {
        normalizedUser = normalizeUser(verifyToken(token));
      } catch {
        normalizedUser = null;
      }
    }
  }

  req.currentUser = normalizedUser;
  req.user = normalizedUser;

  if (req.session) {
    req.session.user = normalizedUser;
  }

  res.locals.user = normalizedUser;
  res.locals.currentUser = normalizedUser;

  next();
};

export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.redirect("/auth/login");
  }

  next();
};

export const requireCustomer = (req, res, next) => {
  if (!req.user) {
    return res.redirect("/auth/login");
  }

  if (req.user.role !== ROLE.CUSTOMER) {
    return res.status(403).send("Forbidden");
  }

  next();
};

export const requireCabinOwner = (req, res, next) => {
  if (!req.user) {
    return res.redirect("/auth/login");
  }

  if (req.user.role !== ROLE.CABIN_OWNER) {
    return res.status(403).send("Forbidden");
  }

  next();
};
