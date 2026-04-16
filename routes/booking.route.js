import express from 'express';
import bookingModel from '../models/booking.model.js';
import cabinModel from '../models/cabin.model.js';

const router = express.Router();

// GET LIST BOOKINGS
router.get('/', async (req, res) => {
    try {
        const currentUser = req.session.user;

        if (!currentUser) {
            return res.redirect('/account/profile');
        }

        const userId = currentUser._id;

        const bookings = currentUser.role === 'admin'
            ? await bookingModel.findAll()
            : await bookingModel.findByUserId(userId);

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


// REDIRECT DETAIL
router.get('/detail', (req, res) => {
    res.redirect('/booking/');
});


// GET BOOKING DETAIL
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

        const userId = currentUser._id;

        if (currentUser.role !== 'admin' && booking.userId !== userId) {
            return res.status(403).send("Forbidden");
        }

        res.render('vxBooking/booking-detail', { booking });

    } catch (error) {
        console.error("Lỗi khi lấy chi tiết đặt phòng:", error);
        res.status(500).send("Internal Server Error");
    }
});


// OPEN CREATE FORM
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


// CREATE BOOKING
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
            userId: currentUser._id,
            startDate,
            endDate,
            numGuests: Number(numGuests) || 1,
            cabinPrice: cabin.regularPrice,
            observations
        };

        await bookingModel.create(type || 'basic', bookingData);

        res.redirect(`/booking/?success=1`);

    } catch (error) {
        console.error("Lỗi khi tạo đặt phòng:", error);
        res.status(500).send("Internal Server Error");
    }
});


// GET EDIT FORM
router.get('/edit/:id', async (req, res) => {
    try {
        const booking = await bookingModel.findById(req.params.id);

        if (!booking) {
            return res.status(404).send("Booking not found");
        }

        res.render('vxBooking/editbooking', { booking });

    } catch (error) {
        console.error("Lỗi khi lấy chi tiết đặt phòng:", error);
        res.status(500).send("Internal Server Error");
    }
});


// CANCEL BOOKING
router.post('/edit/:id/cancel', async (req, res) => {
    try {
        const cancelledBooking = await bookingModel.update(req.params.id, { status: 'cancelled' });

        if (!cancelledBooking) {
            return res.status(404).send("Booking not found");
        }

        res.redirect('/booking/');

    } catch (error) {
        console.error("Lỗi khi hủy đặt phòng:", error);
        res.status(500).send("Internal Server Error");
    }
});


// UPDATE BOOKING
router.post('/edit/:id', async (req, res) => {
    const currentUser = req.session.user;
    const { startDate, endDate, numGuests, observations, status } = req.body;

    if (!currentUser) {
        return res.redirect('/account/profile');
    }

    try {
        const booking = await bookingModel.findById(req.params.id);

        if (!booking) {
            return res.status(404).send("Booking not found");
        }

        // Check authorization: user can only edit their own bookings, admin can edit any
        if (currentUser.role !== 'admin' && booking.userId !== currentUser._id) {
            return res.status(403).send("Forbidden");
        }

        // Prepare update object
        const updateData = {
            startDate,
            endDate,
            numGuests: Number(numGuests) || 1,
            observations
        };

        // Only admin can update status
        if (currentUser.role === 'admin' && status) {
            updateData.status = status;
        }

        const updatedBooking = await bookingModel.update(req.params.id, updateData);

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