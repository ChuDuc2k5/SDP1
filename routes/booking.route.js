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
    const { cabin_id, user_id, check_in, check_out } = req.body;
    try {
        const newBooking = await bookingModel.create({ cabin_id, user_id, check_in, check_out });
        res.redirect(`/booking/detail/${newBooking.id}`);
    } catch (error) {
        console.error("Lỗi khi tạo đặt phòng:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.get('/edit/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const booking = await bookingModel.findById(id);
        if (!booking) {
            return res.status(404).send("Booking not found");
        }
        res.render('vxBooking/editbooking', { booking: booking });
    } catch (error) {
        console.error("Lỗi khi lấy chi tiết đặt phòng:", error);
        res.status(500).send("Internal Server Error");
    }
}); 
router.post('/edit/:id', async (req, res) => {
    const id = req.params.id;
    const { cabin_id, user_id, check_in, check_out } = req.body;

    try {
        const updatedBooking = await bookingModel.update(id, { cabin_id, user_id, check_in, check_out });
        if (!updatedBooking) {
            return res.status(404).send("Booking not found");
        }
        res.redirect(`/booking/detail/${updatedBooking.id}`);
    } catch (error) {
        console.error("Lỗi khi cập nhật đặt phòng:", error);
        res.status(500).send("Internal Server Error");
    }
});

export default router;