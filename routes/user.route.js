import express from 'express';
const router = express.Router();

router.get('/profile', (req, res) => {
    // Hiển thị màn hình cho khách vãng lai
    res.render('vwAccount/guest');
});

export default router;