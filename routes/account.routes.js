import express from "express";

const router = express.Router();


router.get("/", (req, res) => {
    res.render("vwAccount/guest");
});

router.get("/profile", (req, res) => {
    if (!req.currentUser) {
        return res.redirect("/auth/login");
    }

    return res.redirect("/user/profile");
});

export default router;
