import db from '../dbHelper/db.js';

export default {
    // Trả về query builder của Knex để Strategy can thiệp
    findAllQuery() {
        return db('cabins').select('*');
    },

    findAll() {
        return db('cabins').select('*').orderBy('name', 'asc');
    },

    findById(id) {
        return db('cabins').where('_id', id).first();
    }
};