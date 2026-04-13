import db from  '../dbHelper/db.js';

export default {
    findAll() {
        return db('bookings').select('*').orderBy('startDate', 'desc');
    },
    findById(id) {
        return db('bookings').where('_id', id).first();
    },
    create(booking) {
        return db('bookings').insert(booking).returning('*');
    }
};  