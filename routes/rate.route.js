import express from 'express';
import rateModel from '../models/rate.model.js';
import bookingModel from '../models/booking.model.js';

const router = express.Router();

const buildRatePayload = async (req) => {
    const currentUser = req.session.user;

    if (!currentUser) {
        return { status: 401, message: 'Unauthorized' };
    }

    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating) {
        return { status: 400, message: 'bookingId và rating là bắt buộc' };
    }

    const numericRating = Number(rating);
    if (Number.isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
        return { status: 400, message: 'rating phải từ 1 đến 5' };
    }

    const booking = await bookingModel.findById(bookingId);
    if (!booking) {
        return { status: 404, message: 'Booking không tồn tại' };
    }

    if (currentUser.role !== 'admin' && booking.userId !== currentUser._id) {
        return { status: 403, message: 'Forbidden' };
    }

    const existedRate = await rateModel.findByBookingId(bookingId);
    if (existedRate) {
        return { status: 409, message: 'Booking này đã được đánh giá' };
    }

    return {
        status: 201,
        data: {
            userId: currentUser._id,
            cabinId: booking.cabinId,
            bookingId,
            rating: numericRating,
            comment: comment?.trim() || null
        }
    };
};

router.get('/cabin/:cabinId', async (req, res) => {
    try {
        const rates = await rateModel.findByCabinId(req.params.cabinId);

        res.json({
            success: true,
            data: rates
        });
    } catch (error) {
        console.error('Lỗi khi lấy đánh giá theo cabin:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
});

router.post('/submit', async (req, res) => {
    try {
        const result = await buildRatePayload(req);

        if (result.status !== 201) {
            return res.redirect(`/booking/detail/${req.body.bookingId}?rate=error`);
        }

        await rateModel.create(result.data);

        return res.redirect(`/booking/detail/${result.data.bookingId}?rate=success`);
    } catch (error) {
        console.error('Lỗi khi submit đánh giá:', error);
        return res.redirect(`/booking/detail/${req.body.bookingId}?rate=error`);
    }
});

router.post('/', async (req, res) => {
    try {
        const result = await buildRatePayload(req);

        if (result.status !== 201) {
            return res.status(result.status).json({
                success: false,
                message: result.message
            });
        }

        const createdRate = await rateModel.create(result.data);

        res.status(201).json({
            success: true,
            data: createdRate
        });
    } catch (error) {
        console.error('Lỗi khi tạo đánh giá:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
});

export default router;
