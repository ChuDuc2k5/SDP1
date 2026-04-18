import db from '../dbHelper/db.js';

export default {
    findByCabinId(cabinId) {
        return db('rates as r')
            .leftJoin('users as u', 'r.userId', 'u._id')
            .where('r.cabinId', cabinId)
            .select(
                'r.*',
                'u.fullName as userFullName'
            )
            .orderBy('r._id', 'desc');
    },

    findByBookingId(bookingId) {
        return db('rates').where('bookingId', bookingId).first();
    },

    async create(data) {
        const inserted = await db('rates')
            .insert({
                userId: data.userId,
                cabinId: data.cabinId,
                bookingId: data.bookingId,
                rating: data.rating,
                comment: data.comment || null
            })
            .returning('*');

        return inserted?.[0] || null;
    }
};
