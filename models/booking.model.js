import db from  '../dbHelper/db.js';

export default {
    findAll() {
        return db('bookings').select('*').orderBy('created_at', 'desc');
    },
    findById(id) {
        return db('bookings').where('id', id).first();
    },
    create(booking) {
        return db('bookings').insert(booking).returning('*');
    },
    update(id, booking) {
        return db('bookings').where('id', id).update(booking).returning('*');
    }
};  