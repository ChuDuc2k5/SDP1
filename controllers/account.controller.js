export const renderGuestAccount = (req, res) => {
  res.render("vwAccount/guest");
};

export const redirectProfile = (req, res) => {
  if (!req.currentUser) {
    return res.redirect("/auth/login");
  }

  return res.redirect("/user/profile");
};
