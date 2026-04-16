import express from 'express';
import bookingModel from '../models/booking.model.js';
import cabinModel from '../models/cabin.model.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const currentUser = req.session.user;
        if (!currentUser) {
            return res.redirect('/account/profile');
        }

        const bookings = currentUser.role === 'admin'
            ? await bookingModel.findAll()
            : await bookingModel.findByUserId(currentUser.userId);

        res.render('vxBooking/booking', {
            bookings,
            empty: bookings.length === 0,
            isAdmin: currentUser.role === 'admin',
            success: req.query.success === '1'
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
    const currentUser = req.session.user;
    if (!currentUser) {
        return res.redirect('/account/profile');
    }

    try {
        const booking = await bookingModel.findById(id);
        if (!booking) {
            return res.status(404).send("Booking not found");
        }
        if (currentUser.role !== 'admin' && booking.userId !== currentUser.userId) {
            return res.status(403).send("Forbidden");
        }
        res.render('vxBooking/booking-detail', { booking: booking });
    } catch (error) {
        console.error("Lỗi khi lấy chi tiết đặt phòng:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.get('/new/:cabinId', async (req, res) => {
    try {
        const currentUser = req.session.user;
        if (!currentUser) {
            return res.redirect('/account/profile');
        }

        const cabin = await cabinModel.findById(req.params.cabinId);
        if (!cabin) {
            return res.redirect('/cabins');
        }

        res.render('vxBooking/newbooking', {
            cabin,
            currentUser
        });
    } catch (error) {
        console.error("Lỗi khi mở form đặt phòng:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.post('/create', async (req, res) => {
    const currentUser = req.session.user;
    if (!currentUser) {
        return res.redirect('/account/profile');
    }

    const { cabinId, startDate, endDate, numGuests, observations, type } = req.body;

    try {
        const cabin = await cabinModel.findById(cabinId);
        if (!cabin) {
            return res.redirect('/cabins');
        }

        const bookingData = {
            cabinId,
            userId: currentUser.userId,
            startDate,
            endDate,
            numGuests: Number(numGuests) || 1,
            cabinPrice: cabin.regularPrice,
            observations,
            discount: cabin.discount,
            type: type || 'basic'
        };

        const newBooking = await bookingModel.create(bookingData);
        res.redirect(`/booking/?success=1`);
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
router.post('/edit/:id/cancel', async (req, res) => {
    const id = req.params.id;

    try {
        const cancelledBooking = await bookingModel.update(id, { status: 'cancelled' });
        if (!cancelledBooking) {
            return res.status(404).send("Booking not found");
        }
        res.redirect('/booking/');
    } catch (error) {
        console.error("Lỗi khi hủy đặt phòng:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.post('/edit/:id', async (req, res) => {
    const id = req.params.id;
    const { cabin_id, user_id, check_in, check_out, observations, type } = req.body;

    try {
        const updatedBooking = await bookingModel.update(id, {
            cabin_id,
            user_id,
            check_in,
            check_out,
            observations,
            type
        });
        if (!updatedBooking) {
            return res.status(404).send("Booking not found");
        }
        res.redirect(`/booking/detail/${updatedBooking._id}`);
    } catch (error) {
        console.error("Lỗi khi cập nhật đặt phòng:", error);
        res.status(500).send("Internal Server Error");
    }
});

export default router;