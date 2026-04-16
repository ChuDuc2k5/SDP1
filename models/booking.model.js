import db from '../dbHelper/db.js';
import { BookingFactory } from '../patterns/factory/booking/bookingFactory.js';

const attachCabin = (rows) => rows.map(row => ({
    ...row,
    userId: row.userId || row.user_id || row.userid,
    cabin: {
        _id: row.cabinId || row.cabin_id,
        name: row.cabinName,
        image: row.cabinImage,
        maxCapacity: row.cabinMaxCapacity,
        regularPrice: row.cabinRegularPrice,
        discount: row.cabinDiscount
    }
}));

export default {
    findAll() {
        return db('bookings as b')
            .join('cabins as c', 'b.cabinId', 'c._id')
            .select(
                'b.*',
                'c.name as cabinName',
                'c.image as cabinImage',
                'c.maxCapacity as cabinMaxCapacity',
                'c.regularPrice as cabinRegularPrice',
                'c.discount as cabinDiscount'
            )
            .orderBy('b.startDate', 'desc')
            .then(attachCabin);
    },
    findByUserId(userId) {
    if (!userId) {
        throw new Error("userId is required");
    }

    return db('bookings as b')
        .join('cabins as c', 'b.cabinId', 'c._id')
        .select(
            'b.*',
            'c.name as cabinName',
            'c.image as cabinImage',
            'c.maxCapacity as cabinMaxCapacity',
            'c.regularPrice as cabinRegularPrice',
            'c.discount as cabinDiscount'
        )
        .where('b.userId', userId)
        .orderBy('b.startDate', 'desc')
        .then(attachCabin);
    },
    findById(id) {
        return db('bookings as b')
            .join('cabins as c', 'b.cabinId', 'c._id')
            .select(
                'b.*',
                'c.name as cabinName',
                'c.image as cabinImage',
                'c.maxCapacity as cabinMaxCapacity',
                'c.regularPrice as cabinRegularPrice',
                'c.discount as cabinDiscount'
            )
            .where('b._id', id)
            .first()
            .then(row => row ? {
                ...row,
                cabin: {
                    _id: row.cabinId,
                    name: row.cabinName,
                    image: row.cabinImage,
                    maxCapacity: row.cabinMaxCapacity,
                    regularPrice: row.cabinRegularPrice,
                    discount: row.cabinDiscount
                }
            } : undefined);
    },
    create(type, bookingData) {
        // Use Factory Method to create booking with pricing strategy
        const booking = BookingFactory.createBooking(type, bookingData);
        // Remove 'type' from the object before inserting into DB since the column doesn't exist
        const { type: _, ...bookingToInsert } = booking;
        return db('bookings').insert(bookingToInsert).returning('*').then(rows => rows[0]);
    },
    update(id, booking) {
        return db('bookings').where('_id', id).update(booking).returning('*').then(rows => rows[0]);
    }
};  