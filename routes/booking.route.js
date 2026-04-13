import express from 'express';
import bookingModel from '../models/booking.model.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const bookings = await bookingModel.findAll();
        res.render('vxBooking/booking', {
            bookings: bookings,
            empty: bookings.length === 0
        });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách đặt phòng:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.get('/detail', (req, res) => {
    res.redirect('/booking/');
});

router.get('/detail/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const booking = await bookingModel.findById(id);
        if (!booking) {
            return res.status(404).send("Booking not found");
        }
        res.render('vxBooking/booking-detail', { booking: booking });
    } catch (error) {
        console.error("Lỗi khi lấy chi tiết đặt phòng:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.post('/create', async (req, res) => {
    const { cabinId, userId, startDate, endDate } = req.body;
    try {
        const newBooking = await bookingModel.create({ cabinId, userId, startDate, endDate });
        res.redirect(`/booking/detail/${newBooking.id}`);
    } catch (error) {
        console.error("Lỗi khi tạo đặt phòng:", error);
        res.status(500).send("Internal Server Error");
    }
});

export default router;